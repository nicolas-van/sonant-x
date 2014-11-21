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

var WAVE_SPS = 44100;                    // Samples per second
var WAVE_CHAN = 2;                       // Channels
var MAX_TIME = 33; // maximum time, in millis, that the generator can use consecutively

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

function genBuffer(waveSize) {
    // Create the channel work buffer
    var buf = new Uint8Array(waveSize * WAVE_CHAN * 2);
    var b = buf.length - 2;
    while(b >= 0)
    {
        buf[b] = 0;
        buf[b + 1] = 128;
        b -= 2;
    }
    return buf;
}

function applyDelay(chnBuf, waveSamples, instr, rowLen) {
    var p1 = (instr.fx_delay_time * rowLen) >> 1;
    var t1 = instr.fx_delay_amt / 255;

    var n1 = 0;
    while(n1 < waveSamples - p1)
    {
        var b1 = 4 * n1;
        var l = 4 * (n1 + p1);

        // Left channel = left + right[-p1] * t1
        var x1 = chnBuf[l] + (chnBuf[l+1] << 8) +
            (chnBuf[b1+2] + (chnBuf[b1+3] << 8) - 32768) * t1;
        chnBuf[l] = x1 & 255;
        chnBuf[l+1] = (x1 >> 8) & 255;

        // Right channel = right + left[-p1] * t1
        x1 = chnBuf[l+2] + (chnBuf[l+3] << 8) +
            (chnBuf[b1] + (chnBuf[b1+1] << 8) - 32768) * t1;
        chnBuf[l+2] = x1 & 255;
        chnBuf[l+3] = (x1 >> 8) & 255;
        ++n1;
    }
}

sonantx.AudioGenerator = function(mixBuf) {
    this.mixBuf = mixBuf;
    this.waveSize = mixBuf.length / WAVE_CHAN / 2;
};
sonantx.AudioGenerator.prototype.getAudioBuffer = function() {
    var mixBuf = this.mixBuf;
    var waveSize = this.waveSize;

    var buffer = audioCtx.createBuffer(WAVE_CHAN, this.waveSize, WAVE_SPS); // Create Mono Source Buffer from Raw Binary

    var lchan = buffer.getChannelData(0);
    var rchan = buffer.getChannelData(1);
    var b = 0;
    while (b < waveSize) {
        var y = 4 * (mixBuf[b * 4] + (mixBuf[(b * 4) + 1] << 8) - 32768);
        y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
        lchan[b] = y / 32768;
        y = 4 * (mixBuf[(b * 4) + 2] + (mixBuf[(b * 4) + 3] << 8) - 32768);
        y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
        rchan[b] = y / 32768;
        b += 1;
    }
    return buffer;
};

sonantx.SoundGenerator = function(instr, n, rowLen) {
    this.instr = instr;
    this.rowLen = rowLen || 5605;

    this.osc_lfo = oscillators[instr.lfo_waveform];
    this.osc1 = oscillators[instr.osc1_waveform];
    this.osc2 = oscillators[instr.osc2_waveform];
    this.attack = instr.env_attack;
    this.sustain = instr.env_sustain;
    this.release = instr.env_release;
    this.panFreq = Math.pow(2, instr.fx_pan_freq - 8) / this.rowLen;
    this.lfoFreq = Math.pow(2, instr.lfo_freq - 8) / this.rowLen;

    var c1 = 0;
    var c2 = 0;

    // Precalculate frequencues
    var o1t = getnotefreq(n + (this.instr.osc1_oct - 8) * 12 + this.instr.osc1_det) * (1 + 0.0008 * this.instr.osc1_detune);
    var o2t = getnotefreq(n + (this.instr.osc2_oct - 8) * 12 + this.instr.osc2_det) * (1 + 0.0008 * this.instr.osc2_detune);

    // State variable init
    var q = this.instr.fx_resonance / 255;
    var low = 0;
    var band = 0;

    var source = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    gain.gain.value = 0;
    source.connect(gain);

    var scriptNode = audioCtx.createScriptProcessor(1024, 2, 2);
    var j = 0;
    scriptNode.onaudioprocess = function(audioProcessingEvent) {

        var inputData = audioProcessingEvent.inputBuffer;
        var outputData = audioProcessingEvent.outputBuffer;

        var ilchan = inputData.getChannelData(0);
        var irchan = inputData.getChannelData(1)

        var lchan = outputData.getChannelData(0);
        var rchan = outputData.getChannelData(1);

        var c = 0;

        while (j < this.attack + this.sustain + this.release && c < lchan.length)
        {
            // LFO
            var lfor = this.osc_lfo(j * this.lfoFreq) * this.instr.lfo_amt / 512 + 0.5;

            // Envelope
            var e = 1;
            if(j < this.attack)
                e = j / this.attack;
            else if(j >= this.attack + this.sustain)
                e -= (j - this.attack - this.sustain) / this.release;

            // Oscillator 1
            var t = o1t;
            if(this.instr.lfo_osc1_freq) t += lfor;
            if(this.instr.osc1_xenv) t *= e * e;
            c1 += t;
            var rsample = this.osc1(c1) * this.instr.osc1_vol;

            // Oscillator 2
            t = o2t;
            if(this.instr.osc2_xenv) t *= e * e;
            c2 += t;
            rsample += this.osc2(c2) * this.instr.osc2_vol;

            // Noise oscillator
            if(this.instr.noise_fader) rsample += (2*Math.random()-1) * this.instr.noise_fader * e;

            rsample *= e / 255;

            // State variable filter
            var f = this.instr.fx_freq;
            if(this.instr.lfo_fx_freq) f *= lfor;
            f = 1.5 * Math.sin(f * 3.141592 / WAVE_SPS);
            low += f * band;
            var high = q * (rsample - band) - low;
            band += f * high;
            switch(this.instr.fx_filter)
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
            t = osc_sin(j * this.panFreq) * this.instr.fx_pan_amt / 512 + 0.5;
            rsample *= 39 * this.instr.env_master;

            var x = 32768 + rsample * (1 - t);
            var x1 = x & 255;
            var x2 = (x >> 8) & 255;
            var y = 4 * (x1 + (x2 << 8) - 32768);
            y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
            lchan[c] = ilchan[c] + y / 32768;

            x = 32768 + rsample * (t);
            x1 = x & 255;
            x2 = (x >> 8) & 255;
            y = 4 * (x1 + (x2 << 8) - 32768);
            y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
            rchan[c] = irchan[c] + y / 32768;

            j++;
            c++;
        }
        while (c < lchan.length) {
            lchan[c] = ilchan[c];
            rchan[c] = irchan[c];
            c++;
        }
    }.bind(this);

    gain.connect(scriptNode);
    this.chain = [source, gain, scriptNode];
};
sonantx.SoundGenerator.prototype.start = function(when) {
    var when = when || 0;

    var bufferSize = (this.attack + this.sustain + this.release) + (32 * this.rowLen);
    var duration = bufferSize / WAVE_SPS;

    this.chain[0].start(when);
    this.chain[0].stop(when + duration);
};
sonantx.SoundGenerator.prototype.connect = function() {
    var last = this.chain[this.chain.length - 1];
    last.connect.apply(last, arguments);
};
sonantx.SoundGenerator.prototype.disconnect = function() {
    var last = this.chain[this.chain.length - 1];
    last.disconnect.apply(last, arguments);
};

sonantx.MusicGenerator = function(song) {
    this.song = song;
    // Wave data configuration
    this.waveSize = WAVE_SPS * song.songLen; // Total song size (in samples)
};
sonantx.MusicGenerator.prototype.generateTrack = function (instr, mixBuf) {
    var self = this;
    var chnBuf = genBuffer(this.waveSize);
    // Preload/precalc some properties/expressions (for improved performance)
    var waveSamples = self.waveSize,
        waveBytes = self.waveSize * WAVE_CHAN * 2,
        rowLen = self.song.rowLen,
        endPattern = self.song.endPattern,
        soundGen = new sonantx.SoundGenerator(instr, rowLen);

    var currentpos = 0;
    var p = 0;
    var row = 0;
    while (true) {
        if (row === 32) {
            row = 0;
            p += 1;
            continue;
        }
        if (p === endPattern - 1) {
            break;
        }
        var cp = instr.p[p];
        if (cp) {
            var n = instr.c[cp - 1].n[row];
            if (n) {
                soundGen.genSound(n, chnBuf, currentpos);
            }
        }
        currentpos += rowLen;
        row += 1;
    }

    applyDelay(chnBuf, waveSamples, instr, rowLen);

    var b2 = 0;
    // Add to mix buffer
    while(b2 < waveBytes)
    {
        var x2 = mixBuf[b2] + (mixBuf[b2+1] << 8) + chnBuf[b2] + (chnBuf[b2+1] << 8) - 32768;
        mixBuf[b2] = x2 & 255;
        mixBuf[b2+1] = (x2 >> 8) & 255;
        b2 += 2;
    }
};
sonantx.MusicGenerator.prototype.getAudioGenerator = function() {
    var self = this;
    var mixBuf = genBuffer(this.waveSize);
    var t = 0;
    for (var t = 0; t < self.song.songData.length; t++) {
        self.generateTrack(self.song.songData[t], mixBuf);
    };
    return new sonantx.AudioGenerator(mixBuf);
};
sonantx.MusicGenerator.prototype.createAudioBuffer = function() {
    return this.getAudioGenerator().getAudioBuffer();
};

})();

