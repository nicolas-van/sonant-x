//------------------------------------------------------------------------------
// -*- mode: javascript; tab-width: 4; indent-tabs-mode: nil; -*-
//------------------------------------------------------------------------------
// Sonant for JavaScript, v1.0
//   A sound synth system targeted for tiny demos.
//
// This is a port of the Sonant player routine, originally written in C by
// Jake Taylor (Ferris / Youth Uprising).
//------------------------------------------------------------------------------
// Copyright (c) 2008-2009 Jake Taylor
// Copyright (c) 2011 Marcus Geelnard
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
//------------------------------------------------------------------------------
//
// Example usage:
//
//   var songGen = new sonant();
//   for (var t = 0; t < songGen.tracks; t++)
//       songGen.generate(t);
//   var audio = songGen.createAudio();
//   audio.loop = true;
//   audio.play();
//
//------------------------------------------------------------------------------

var sonant = function()
{
    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    //**************************************************************************
    // Music
    //**************************************************************************

    // *** INSERT MUSIC HERE ***
    // var songLen = ???;
    // var song = ???;

    //**************************************************************************
    // End of Music
    //**************************************************************************

    // Wave data configuration
    var WAVE_SPS = 44100;               // Samples per second
    var WAVE_CHAN = 2;                  // Channels
    var WAVE_SIZE = WAVE_SPS * songLen; // Total song size (in samples)
 
    // Work buffers
    var chnBufWork, mixBufWork;


    //--------------------------------------------------------------------------
    // Private methods
    //--------------------------------------------------------------------------

    // Initialize buffers etc. (constructor)
    (function ()
    {
        // Note 1: We use a CanvasPixelArray instead of a traditional ECMAScript
        // array of numbers, since that gives us a typed byte array (much more
        // compact, and quite fast).
        //
        // Note 2: We would LIKE to create an (N x 1) bitmap buffer, but some
        // browsers (hrrr-o-mme...) have an upper bitmap size limit of
        // 32767 x 32767, so we create a square bitmap buffer (with some
        // trailing bytes that we don't care too much about)
        var size = Math.ceil(Math.sqrt(WAVE_SIZE * WAVE_CHAN / 2));

        // Create the channel work buffer
        chnBufWork = document.createElement('canvas').getContext('2d').createImageData(size, size).data;

        // Create & clear the channel mix buffer
        var b, mixBuf = document.createElement('canvas').getContext('2d').createImageData(size, size).data;
        for(b = size * size * 4 - 2; b >= 0 ; b -= 2)
        {
            mixBuf[b] = 0;
            mixBuf[b + 1] = 128;
        }
        mixBufWork = mixBuf;
    })();

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
        var v2 = (osc_saw(value) + 0.5) * 4;
        if(v2 < 2) return v2 - 1;
        return 3 - v2;
    }

    // Power functions (x^n etc) - actually faster than Math.pow() in many browsers
    function pow(x, n)
    {
        if(n < 0)
        {
            n = -n;
            x = 1 / x;
        }

        for(var y = 1;n > 0;--n)
            y *= x;

        return y;
    }

    function pow2(n)
    {
        if(n >= 0)
            return 1 << n;
        else
            return 1 / (1 << -n);
    }

    function getnotefreq(n)
    {
        return 0.00390625 * pow(1.059463094, n - 128);
    }


    //--------------------------------------------------------------------------
    // Public members
    //--------------------------------------------------------------------------

    // Number of tracks in the song
    this.tracks = song.songData.length;

    // Number of lines per second (song speed)
    this.lps = WAVE_SPS / song.rowLen;


    //--------------------------------------------------------------------------
    // Public methods
    //--------------------------------------------------------------------------

    // Generate audio data for a single track
    this.generate = function (track)
    {
        // Local variables
        var i, b, p, row, n, instr, currentpos, cp,
            attack, sustain, release, c1, c2, q, low, band, high,
            k, t, lfor, e, x, rsample, f, da, osc_lfo, osc1, osc2,
            rowLen;

        // Turn critical object properties into local variables (performance)
        var chnBuf = chnBufWork,
            mixBuf = mixBufWork,
            waveSamples = WAVE_SIZE,
            waveBytes = WAVE_SIZE * WAVE_CHAN * 2;

        // Array of oscillator functions
        var oscillators =
        [
            osc_sin,
            osc_square,
            osc_saw,
            osc_tri
        ];

        // Parse note data
        rowLen = song.rowLen;

        instr = song.songData[track];
        for(b = 0; b < waveBytes; b += 2)
        {
            chnBuf[b] = 0;
            chnBuf[b+1] = 128;
        }

        osc_lfo = oscillators[instr.lfo_waveform];
        osc1 = oscillators[instr.osc1_waveform];
        osc2 = oscillators[instr.osc2_waveform];

        currentpos = 0;
        for(p = 0; p < song.endPattern - 1; ++p) // Patterns
        {
            cp = instr.p[p];
            for(row = 0;row < 32; ++row) // Rows
            {
                if(cp)
                {
                    n = instr.c[cp - 1].n[row];
                    if(n)
                    {
                        attack = instr.env_attack;
                        sustain = instr.env_sustain;
                        release = instr.env_release;
                        c1 = c2 = 0;

                        // State variable init
                        q = instr.fx_resonance / 255;
                        low = band = 0;
                        for (j = attack + sustain + release - 1; j >= 0; --j)
                        {
                            k = j + currentpos;

                            // LFO
                            t = pow2(instr.lfo_freq - 8) * k / rowLen;
                            lfor = osc_lfo(t) * instr.lfo_amt / 512 + 0.5;

                            // Envelope
                            e = 1;
                            if(j < attack)
                                e = j / attack;
                            else if(j >= attack + sustain)
                                e -= (j - attack - sustain) / release;

                            // Oscillator 1
                            t = getnotefreq(n + (instr.osc1_oct - 8) * 12 + instr.osc1_det) * (1 + 0.2 * instr.osc1_detune / 255);
                            if(instr.lfo_osc1_freq) t += lfor;
                            if(instr.osc1_xenv) t *= e * e;
                            c1 += t;
                            x = osc1(c1);
                            rsample = x * instr.osc1_vol / 255;

                            // Oscillator 2
                            t = getnotefreq(n + (instr.osc2_oct - 8) * 12 + instr.osc2_det) * (1 + 0.2 * instr.osc2_detune / 255);
                            if(instr.osc2_xenv) t *= e * e;
                            c2 += t;
                            x = osc2(c2);
                            rsample += x * instr.osc2_vol / 255

                            // Noise oscillator
                                + osc_sin(Math.random()) * instr.noise_fader / 255 * e;
                            rsample *= e;

                            // State variable filter
                            f = instr.fx_freq;
                            if(instr.lfo_fx_freq) f *= lfor;
                            f = 1.5 * Math.sin(f * 3.141592 / WAVE_SPS);
                            low += f * band;
                            high = q * (rsample - band) - low;
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
                                default:
                            }

                            // Panning & master volume
                            t = osc_sin(pow2(instr.fx_pan_freq - 8) * k / rowLen) * instr.fx_pan_amt / 512 + 0.5;
                            rsample *= 150 * instr.env_master;

                            // Add to 16-bit channel buffer
                            x = chnBuf[k*4] + (chnBuf[k*4+1] << 8) + rsample * (1 - t);
                            chnBuf[k*4] = x & 255;
                            chnBuf[k*4+1] = (x >> 8) & 255;
                            x = chnBuf[k*4+2] + (chnBuf[k*4+3] << 8) + rsample * t;
                            chnBuf[k*4+2] = x & 255;
                            chnBuf[k*4+3] = (x >> 8) & 255;
                        }
                    }
                }
                currentpos += rowLen;
            }
        }

        // Delay
        p = (instr.fx_delay_time * rowLen) >> 1;
        t = instr.fx_delay_amt / 255;

        for(n = 0; n < waveSamples - p; ++n)
        {
            b = 4 * n;
            k = 4 * (n + p);

            // Left channel = left + right[-p] * t
            x = chnBuf[k] + (chnBuf[k+1] << 8) +
                (chnBuf[b+2] + (chnBuf[b+3] << 8) - 32768) * t;
            chnBuf[k] = x & 255;
            chnBuf[k+1] = (x >> 8) & 255;

            // Right channel = right + left[-p] * t
            x = chnBuf[k+2] + (chnBuf[k+3] << 8) +
                (chnBuf[b] + (chnBuf[b+1] << 8) - 32768) * t;
            chnBuf[k+2] = x & 255;
            chnBuf[k+3] = (x >> 8) & 255;
        }

        // Add to mix buffer
        for(b = 0; b < waveBytes; b += 2)
        {
            x = mixBuf[b] + (mixBuf[b+1] << 8) + chnBuf[b] + (chnBuf[b+1] << 8) - 32768;
            x = x > 65535 ? 65535 : (x < 0 ? 0 : x);
            mixBuf[b] = x & 255;
            mixBuf[b+1] = (x >> 8) & 255;
        }
    };

    // Create an HTML audio element from the generated audio data
    this.createAudio = function()
    {
        // Local variables
        var b, k, x, wave, l1, l2, s;

        // Turn critical object properties into local variables (performance)
        var mixBuf = mixBufWork,
            waveBytes = WAVE_SIZE * WAVE_CHAN * 2;

        // We no longer need the channel working buffer
        chnBufWork = null;

        // Convert to a WAVE file (in a binary string)
        l1 = waveBytes - 8;
        l2 = l1 - 36;
        wave = String.fromCharCode(82,73,70,70,
                                   l1 & 255,(l1 >> 8) & 255,(l1 >> 16) & 255,(l1 >> 24) & 255,
                                   87,65,86,69,102,109,116,32,16,0,0,0,1,0,2,0,
                                   68,172,0,0,16,177,2,0,4,0,16,0,100,97,116,97,
                                   l2 & 255,(l2 >> 8) & 255,(l2 >> 16) & 255,(l2 >> 24) & 255);
        for (b = 0; b < waveBytes;)
        {
            // This is a GC & speed trick: don't add one char at a time - batch up
            // larger partial strings
            x = "";
            for (k = 0; k < 128 && b < waveBytes; ++k, b += 4)
                x += String.fromCharCode(mixBuf[b], (mixBuf[b+1] - 128) & 255, mixBuf[b+2], (mixBuf[b+3] - 128) & 255);
            wave += x;
        }

        // Convert the string buffer to a base64 data uri
        s = "data:audio/wav;base64," + window.btoa(wave);
        wave = null;

        // Return the music as an audio element
        return new Audio(s);
    };
};

