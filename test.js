
import * as sonantx from './sonantx'
import song from './example-songs/4k-synth'
import 'regenerator-runtime/runtime'
import audioBufferToWav from 'audiobuffer-to-wav'
import { base64 } from 'rfc4648'

console.log('initing app')

let cachedAudioCtx

const audioCtx = () => {
  if (!cachedAudioCtx) {
    cachedAudioCtx = new AudioContext({
      sampleRate: 96000
    })
  }
  return cachedAudioCtx
}

let audioBufferSource = null

document.querySelector('button.btna').addEventListener('click', () => {
  if (audioBufferSource) {
    audioBufferSource.stop()
    audioBufferSource = null
  }
  console.log('generating music')
  sonantx.generateSong(song, audioCtx().sampleRate).then((buf) => {
    console.log('finished generating music')
    audioBufferSource = audioCtx().createBufferSource()
    audioBufferSource.buffer = buf
    audioBufferSource.connect(audioCtx().destination)
    audioBufferSource.start()
  })
})
document.querySelector('button.btnb').addEventListener('click', () => {
  if (audioBufferSource) {
    audioBufferSource.stop()
    audioBufferSource = null
  }
})

document.querySelector('button.ting').addEventListener('click', () => {
  console.log('ting')
  const instr = {
    osc1_oct: 9,
    osc1_det: 0,
    osc1_detune: 0,
    osc1_xenv: 0,
    osc1_vol: 161,
    osc1_waveform: 0,
    osc2_oct: 9,
    osc2_det: 0,
    osc2_detune: 4,
    osc2_xenv: 0,
    osc2_vol: 182,
    osc2_waveform: 0,
    noise_fader: 0,
    env_attack: 100,
    env_sustain: 1818,
    env_release: 18181,
    env_master: 192,
    fx_filter: 0,
    fx_freq: 0,
    fx_resonance: 254,
    fx_delay_time: 6,
    fx_delay_amt: 108,
    fx_pan_freq: 3,
    fx_pan_amt: 61,
    lfo_osc1_freq: 0,
    lfo_fx_freq: 0,
    lfo_freq: 3,
    lfo_amt: 94,
    lfo_waveform: 2
  }
  sonantx.generateSound(instr, 67, audioCtx().sampleRate, 118).then((buf) => {
    const audioBufferSource = audioCtx().createBufferSource()
    audioBufferSource.buffer = buf
    audioBufferSource.connect(audioCtx().destination)
    audioBufferSource.start()
  })
})

document.querySelector('button.audioting').addEventListener('click', () => {
  console.log('audioting')
  const instr = {
    osc1_oct: 9,
    osc1_det: 0,
    osc1_detune: 0,
    osc1_xenv: 0,
    osc1_vol: 161,
    osc1_waveform: 0,
    osc2_oct: 9,
    osc2_det: 0,
    osc2_detune: 4,
    osc2_xenv: 0,
    osc2_vol: 182,
    osc2_waveform: 0,
    noise_fader: 0,
    env_attack: 100,
    env_sustain: 1818,
    env_release: 18181,
    env_master: 192,
    fx_filter: 0,
    fx_freq: 0,
    fx_resonance: 254,
    fx_delay_time: 6,
    fx_delay_amt: 108,
    fx_pan_freq: 3,
    fx_pan_amt: 61,
    lfo_osc1_freq: 0,
    lfo_fx_freq: 0,
    lfo_freq: 3,
    lfo_amt: 94,
    lfo_waveform: 2
  }
  sonantx.generateSound(instr, 67, audioCtx().sampleRate, 118).then((buf) => {
    console.log('finished buffer generation')
    const wavBuffer = audioBufferToWav(buf)
    const array = new Uint8Array(wavBuffer)
    const uri = 'data:audio/wav;base64,' + base64.stringify(array)
    const audio = new Audio(uri)
    console.log(uri)
    console.log('finished audio generation', { wavBuffer, array, uri })
    audio.play()
  })
})
