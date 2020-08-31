
const WAVE_SPS = 44100 // Samples per second

// Oscillators
function osc_sin (value) {
  return Math.sin(value * 6.283184)
}

function osc_square (value) {
  if (osc_sin(value) < 0) return -1
  return 1
}

function osc_saw (value) {
  return (value % 1) - 0.5
}

function osc_tri (value) {
  const v2 = (value % 1) * 4
  if (v2 < 2) return v2 - 1
  return 3 - v2
}

// Array of oscillator functions
const oscillators =
[
  osc_sin,
  osc_square,
  osc_saw,
  osc_tri
]

function getnotefreq (n) {
  return 0.00390625 * Math.pow(1.059463094, n - 128)
}

class SoundWriter {
  constructor (instr, n, rowLen) {
    this.instr = instr
    this.n = n
    this.rowLen = rowLen

    this.c1 = 0
    this.c2 = 0
    this.low = 0
    this.band = 0
    this.j = 0
  }

  write (lchan, rchan, from) {
    const instr = this.instr
    const n = this.n
    const rowLen = this.rowLen
    let c = from

    const osc_lfo = oscillators[instr.lfo_waveform]
    const osc1 = oscillators[instr.osc1_waveform]
    const osc2 = oscillators[instr.osc2_waveform]
    const panFreq = Math.pow(2, instr.fx_pan_freq - 8) / rowLen
    const lfoFreq = Math.pow(2, instr.lfo_freq - 8) / rowLen

    // Precalculate frequencues
    const o1t = getnotefreq(n + (instr.osc1_oct - 8) * 12 + instr.osc1_det) * (1 + 0.0008 * instr.osc1_detune)
    const o2t = getnotefreq(n + (instr.osc2_oct - 8) * 12 + instr.osc2_det) * (1 + 0.0008 * instr.osc2_detune)

    // State variable init
    const q = instr.fx_resonance / 255

    while (this.j < instr.env_attack + instr.env_sustain + instr.env_release && c < lchan.length) {
      // LFO
      const lfor = osc_lfo(this.j * lfoFreq) * instr.lfo_amt / 512 + 0.5

      // Envelope
      let e = 1
      if (this.j < instr.env_attack) {
        e = this.j / instr.env_attack
      } else if (this.j >= instr.env_attack + instr.env_sustain) {
        e -= (this.j - instr.env_attack - instr.env_sustain) / instr.env_release
      }

      // Oscillator 1
      let t = o1t
      if (instr.lfo_osc1_freq) {
        t += lfor
      }
      if (instr.osc1_xenv) {
        t *= e * e
      }
      this.c1 += t
      let rsample = osc1(this.c1) * instr.osc1_vol

      // Oscillator 2
      t = o2t
      if (instr.osc2_xenv) {
        t *= e * e
      }
      this.c2 += t
      rsample += osc2(this.c2) * instr.osc2_vol

      // Noise oscillator
      if (instr.noise_fader) {
        rsample += (2 * Math.random() - 1) * instr.noise_fader * e
      }

      rsample *= e / 255

      // State variable filter
      let f = instr.fx_freq
      if (instr.lfo_fx_freq) {
        f *= lfor
      }
      f = 1.5 * Math.sin(f * 3.141592 / WAVE_SPS)
      this.low += f * this.band
      const high = q * (rsample - this.band) - this.low
      this.band += f * high
      switch (instr.fx_filter) {
        case 1: // Hipass
          rsample = high
          break
        case 2: // Lopass
          rsample = this.low
          break
        case 3: // Bandpass
          rsample = this.band
          break
        case 4: // Notch
          rsample = this.low + high
          break
        default:
      }

      // Panning & master volume
      t = osc_sin(this.j * panFreq) * instr.fx_pan_amt / 512 + 0.5
      rsample *= 39 * instr.env_master

      let x = 32768 + rsample * (1 - t)
      let x1 = x & 255
      let x2 = (x >> 8) & 255
      let y = 4 * (x1 + (x2 << 8) - 32768)
      y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y)
      lchan[c] = lchan[c] + (y / 32768)

      x = 32768 + rsample * (t)
      x1 = x & 255
      x2 = (x >> 8) & 255
      y = 4 * (x1 + (x2 << 8) - 32768)
      y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y)
      rchan[c] = rchan[c] + (y / 32768)

      this.j++
      c++
    }

    // returns true if the sound finished
    if (c < lchan.length) {
      return true
    }
    return false
  }
}

export class TrackGenerator {
  constructor (audioCtx, instr, rowLen, endPattern) {
    this.audioCtx = audioCtx
    rowLen = rowLen || 5605
    endPattern = endPattern || instr.p.length - 1

    this.instr = instr
    this.rowLen = rowLen
    this.endPattern = endPattern

    const scriptNode = this.audioCtx.createScriptProcessor(4096, 2, 2)
    let currentSample = 0
    let nextNote = 0
    let sounds = []
    scriptNode.onaudioprocess = function (audioProcessingEvent) {
      const inputData = audioProcessingEvent.inputBuffer
      const outputData = audioProcessingEvent.outputBuffer
      const lchan = outputData.getChannelData(0)
      const rchan = outputData.getChannelData(1)
      lchan.set(inputData.getChannelData(0))
      rchan.set(inputData.getChannelData(1))

      sounds.slice().forEach(function (el) {
        const finished = el.write(lchan, rchan, 0)
        if (finished) {
          sounds = sounds.filter(function (el2) { return el2 !== el })
        }
      })

      let nextNoteSample = nextNote * rowLen
      while (nextNoteSample >= currentSample &&
            nextNoteSample < currentSample + inputData.length) {
        const pattern = instr.p[Math.floor(nextNote / 32) % (this.endPattern + 1)] || 0
        const note = pattern === 0 ? 0 : (instr.c[pattern - 1] || { n: [] }).n[nextNote % 32] || 0
        if (note !== 0) {
          const sw = new SoundWriter(instr, note, rowLen)
          sw.write(lchan, rchan, nextNoteSample - currentSample)
          sounds.push(sw)
        }
        nextNote += 1
        nextNoteSample = nextNote * rowLen
      }

      currentSample += inputData.length
    }.bind(this)

    const delayTime = (instr.fx_delay_time * rowLen) / WAVE_SPS / 2
    const delayAmount = instr.fx_delay_amt / 255

    const delayGain = this.audioCtx.createGain()
    delayGain.gain.value = delayAmount
    scriptNode.connect(delayGain)

    const delay = this.audioCtx.createDelay()
    delay.delayTime.value = delayTime
    delayGain.connect(delay)
    delay.connect(delayGain)

    const mixer = this.audioCtx.createGain()
    mixer.gain.value = 1
    scriptNode.connect(mixer)
    delay.connect(mixer)

    this.chain = [scriptNode, delayGain, delay, mixer]
  }
}

export class MusicGenerator {
  constructor (audioCtx, song) {
    this.audioCtx = audioCtx
    this.song = song

    const source = this.audioCtx.createOscillator()
    const nullGain = this.audioCtx.createGain()
    nullGain.gain.value = 0
    source.connect(nullGain)

    const mixer = this.audioCtx.createGain()
    mixer.gain.value = 1

    this.tracks = []

    this.song.songData.forEach(function (el) {
      const track = new TrackGenerator(this.audioCtx, el, this.song.rowLen, this.song.endPattern)
      nullGain.connect(track.chain[0])
      track.chain[track.chain.length - 1].connect(mixer)
      this.tracks.push(track)
    }.bind(this))

    this.chain = [source, nullGain, mixer]
  }

  start (when) {
    if (when === undefined) {
      this.chain[0].start()
    } else {
      this.chain[0].start(when)
    }
  }

  connect (target) {
    this.chain[this.chain.length - 1].connect(target)
  }
}
