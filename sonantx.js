//
// Sonant-X
//
// Copyright (c) 2014 Nicolas Vanhoren
//
// Sonant-X is a fork of js-sonant by Marcus Geelnard and Jake Taylor. It is
// still published using the same license (zlib license, see below).
//
// Copyright (c) 2011 Marcus Geelnard
// Copyright (c) 2008-2009 Jake Taylor
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//    claim that you wrote the original software. If you use this software
//    in a product, an acknowledgment in the product documentation would be
//    appreciated but is not required.
//
// 2. Altered source versions must be plainly marked as such, and must not be
//    misrepresented as being the original software.
//
// 3. This notice may not be removed or altered from any source
//    distribution.

var sonantx;
(function() {
"use strict";
sonantx = {};

var WAVE_SPS = 44100;

var audioCtx = new AudioContext();
sonantx.audioCtx = audioCtx;

// Oscillators
function osc_sin(value)
{
    return Math.sin(value * 6.283184);
}

function osc_square(value)
{
    if(osc_sin(value) < 0) return -1;
    return 1;
}

function osc_saw(value)
{
    return (value % 1) - 0.5;
}

function osc_tri(value)
{
    var v2 = (value % 1) * 4;
    if(v2 < 2) return v2 - 1;
    return 3 - v2;
}

// Array of oscillator functions
var oscillators =
[
    osc_sin,
    osc_square,
    osc_saw,
    osc_tri
];

function getnotefreq(n)
{
    return 0.00390625 * Math.pow(1.059463094, n - 128);
}

function SoundWriter(instr, n, rowLen) {
    var osc_lfo = oscillators[instr.lfo_waveform];
    var osc1 = oscillators[instr.osc1_waveform];
    var osc2 = oscillators[instr.osc2_waveform];
    var panFreq = Math.pow(2, instr.fx_pan_freq - 8) / rowLen;
    var lfoFreq = Math.pow(2, instr.lfo_freq - 8) / rowLen;

    var c1 = 0;
    var c2 = 0;

    // Precalculate frequencues
    var o1t = getnotefreq(n + (instr.osc1_oct - 8) * 12 + instr.osc1_det) * (1 + 0.0008 * instr.osc1_detune);
    var o2t = getnotefreq(n + (instr.osc2_oct - 8) * 12 + instr.osc2_det) * (1 + 0.0008 * instr.osc2_detune);

    // State variable init
    var q = instr.fx_resonance / 255;
    var low = 0;
    var band = 0;

    var j = 0;

    this.write = function(lchan, rchan, from) {

        var c = from;

        while (j < instr.env_attack + instr.env_sustain + instr.env_release && c < lchan.length)
        {
            // LFO
            var lfor = osc_lfo(j * lfoFreq) * instr.lfo_amt / 512 + 0.5;

            // Envelope
            var e = 1;
            if(j < instr.env_attack)
                e = j / instr.env_attack;
            else if(j >= instr.env_attack + instr.env_sustain)
                e -= (j - instr.env_attack - instr.env_sustain) / instr.env_release;

            // Oscillator 1
            var t = o1t;
            if(instr.lfo_osc1_freq) t += lfor;
            if(instr.osc1_xenv) t *= e * e;
            c1 += t;
            var rsample = osc1(c1) * instr.osc1_vol;

            // Oscillator 2
            t = o2t;
            if(instr.osc2_xenv) t *= e * e;
            c2 += t;
            rsample += osc2(c2) * instr.osc2_vol;

            // Noise oscillator
            if(instr.noise_fader) rsample += (2*Math.random()-1) * instr.noise_fader * e;

            rsample *= e / 255;

            // State variable filter
            var f = instr.fx_freq;
            if(instr.lfo_fx_freq) f *= lfor;
            f = 1.5 * Math.sin(f * 3.141592 / WAVE_SPS);
            low += f * band;
            var high = q * (rsample - band) - low;
            band += f * high;
            switch(instr.fx_filter)
            {
                case 1: // Hipass
                    rsample = high;
                    break;
                case 2: // Lopass
                    rsample = low;
                    break;
                case 3: // Bandpass
                    rsample = band;
                    break;
                case 4: // Notch
                    rsample = low + high;
                    break;
                default:
            }

            // Panning & master volume
            t = osc_sin(j * panFreq) * instr.fx_pan_amt / 512 + 0.5;
            rsample *= 39 * instr.env_master;

            var x = 32768 + rsample * (1 - t);
            var x1 = x & 255;
            var x2 = (x >> 8) & 255;
            var y = 4 * (x1 + (x2 << 8) - 32768);
            y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
            lchan[c] = lchan[c] + (y / 32768);

            x = 32768 + rsample * (t);
            x1 = x & 255;
            x2 = (x >> 8) & 255;
            y = 4 * (x1 + (x2 << 8) - 32768);
            y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
            rchan[c] = rchan[c] + (y / 32768);

            j++;
            c++;
        }

        // returns true if the sound finished
        if (c < lchan.length)
            return true;
        return false;
    };
};

sonantx.TrackGenerator = function(instr, rowLen, endPattern) {
    rowLen = rowLen || 5605;
    endPattern = endPattern || instr.p.length - 1;
    
    this.instr = instr;
    this.rowLen = rowLen;
    this.endPattern = endPattern;

    var scriptNode = audioCtx.createScriptProcessor(4096, 2, 2);
    var currentSample = 0;
    var nextNote = 0;
    var sounds = [];
    scriptNode.onaudioprocess = function(audioProcessingEvent) {
        var inputData = audioProcessingEvent.inputBuffer;
        var outputData = audioProcessingEvent.outputBuffer;
        var lchan = outputData.getChannelData(0);
        var rchan = outputData.getChannelData(1);
        lchan.set(inputData.getChannelData(0));
        rchan.set(inputData.getChannelData(1));

        sounds.slice().forEach(function(el) {
            var finished = el.write(lchan, rchan, 0);
            if (finished) {
                sounds = sounds.filter(function(el2) { return el2 !== el; });
            }
        });

        var nextNoteSample = nextNote * rowLen;
        while (nextNoteSample >= currentSample &&
            nextNoteSample < currentSample + inputData.length) {
            var pattern = instr.p[Math.round(nextNote / 32) % (this.endPattern + 1)] || 0;
            var note = pattern == 0 ? 0 : (instr.c[pattern - 1] || {n: []}).n[nextNote % 32] || 0;
            if (note !== 0) {
                var sw = new SoundWriter(instr, note, rowLen);
                sw.write(lchan, rchan, nextNoteSample - currentSample);
                sounds.push(sw);
            }
            nextNote += 1;
            nextNoteSample = nextNote * rowLen;
        }

        currentSample += inputData.length;
    }.bind(this);

    var delayTime = (instr.fx_delay_time * rowLen) / WAVE_SPS / 2;
    var delayAmount = instr.fx_delay_amt / 255;

    var delayGain = audioCtx.createGain();
    delayGain.gain.value = delayAmount;
    scriptNode.connect(delayGain);

    var delay = audioCtx.createDelay();
    delay.delayTime.value = delayTime;
    delayGain.connect(delay);
    delay.connect(delayGain);

    var mixer = audioCtx.createGain();
    mixer.gain.value = 1;
    scriptNode.connect(mixer);
    delay.connect(mixer);

    this.chain = [scriptNode, delayGain, delay, mixer];
};

sonantx.MusicGenerator = function(song) {
    this.song = song;

    var source = audioCtx.createOscillator();
    var nullGain = audioCtx.createGain();
    nullGain.gain.value = 0;
    source.connect(nullGain);

    var mixer = audioCtx.createGain();
    mixer.gain.value = 1;

    this.tracks = [];

    this.song.songData.forEach(function(el) {
        var track = new sonantx.TrackGenerator(el, this.song.rowLen, this.song.endPattern);
        nullGain.connect(track.chain[0]);
        track.chain[track.chain.length - 1].connect(mixer);
        this.tracks.push(track);
    }.bind(this));

    this.chain = [source, nullGain, mixer];
};
sonantx.MusicGenerator.prototype.start = function(when) {
    this.chain[0].start(when);
};
sonantx.MusicGenerator.prototype.connect = function(target) {
    this.chain[this.chain.length - 1].connect(target);
};

})();

