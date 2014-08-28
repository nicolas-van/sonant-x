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

(function() {
var WAVE_SPS = 44100;                    // Samples per second
var WAVE_CHAN = 2;                       // Channels
var MAX_TIME = 33; // maximum time, in millis, that the generator can use consecutively

var audioCtx = null;

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

function genBuffer(mb, callBack) {
    setTimeout(function() {
        // Create the channel work buffer
        var buf = new Uint8Array(mb * WAVE_CHAN * 2);
        var b = buf.length - 2;
        var iterate = function() {
            var begin = new Date();
            var count = 0;
            while(b >= 0)
            {
                buf[b] = 0;
                buf[b + 1] = 128;
                b -= 2;
                count += 1;
                if (count % 1000 === 0 && (new Date() - begin) > MAX_TIME) {
                    setTimeout(iterate, 0);
                    return;
                }
            }
            setTimeout(function() {callBack(buf);}, 0);
        };
        setTimeout(iterate, 0);
    }, 0);
}

function applyDelay(chnBuf, waveSamples, mc, sE, callBack) {
    var p1 = (mc.ft * sE) >> 1;
    var t1 = mc.fa / 255;

    var n1 = 0;
    var iterate = function() {
        var beginning = new Date();
        var count = 0;
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
            count += 1;
            if (count % 1000 === 0 && (new Date() - beginning) > MAX_TIME) {
                setTimeout(iterate, 0);
                return;
            }
        }
        setTimeout(callBack, 0);
    };
    setTimeout(iterate, 0);
}

var AG = function(ma) {
    this.ma = ma;
    this.mb = ma.length / WAVE_CHAN / 2;
};
AG.prototype.ca = function() {
    var ma = this.ma;
    var mb = this.mb;
    // Local variables
    var b, k, x, wave, l1, l2, s, y;

    // Turn critical object properties into local variables (performance)
    var waveBytes = mb * WAVE_CHAN * 2;

    // Convert to a WAVE file (in a binary string)
    l1 = waveBytes - 8;
    l2 = l1 - 36;
    wave = String.fromCharCode(82,73,70,70,
                               l1 & 255,(l1 >> 8) & 255,(l1 >> 16) & 255,(l1 >> 24) & 255,
                               87,65,86,69,102,109,116,32,16,0,0,0,1,0,2,0,
                               68,172,0,0,16,177,2,0,4,0,16,0,100,97,116,97,
                               l2 & 255,(l2 >> 8) & 255,(l2 >> 16) & 255,(l2 >> 24) & 255);
    b = 0;
    while(b < waveBytes)
    {
        // This is a GC & speed trick: don't add one char at a time - batch up
        // larger partial strings
        x = "";
        for (k = 0; k < 256 && b < waveBytes; ++k, b += 2)
        {
            // Note: We amplify and clamp here
            y = 4 * (ma[b] + (ma[b+1] << 8) - 32768);
            y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
            x += String.fromCharCode(y & 255, (y >> 8) & 255);
        }
        wave += x;
    }
    return wave;
};
AG.prototype.cb = function() {
    var wave = this.ca();
    var a = new Audio("data:audio/wav;base64," + btoa(wave));
    a.preload = "none";
    a.load();
    return a;
};
AG.prototype.cc = function(callBack) {
    if (audioCtx === null)
        audioCtx = new AudioContext();
    var ma = this.ma;
    var mb = this.mb;

    var waveBytes = mb * WAVE_CHAN * 2;
    var buffer = audioCtx.createBuffer(WAVE_CHAN, this.mb, WAVE_SPS); // Create Mono Source Buffer from Raw Binary
    var lchan = buffer.getChannelData(0);
    var rchan = buffer.getChannelData(1);
    var b = 0;
    var iterate = function() {
        var beginning = new Date();
        var count = 0;
        while (b < (waveBytes / 2)) {
            var y = 4 * (ma[b * 4] + (ma[(b * 4) + 1] << 8) - 32768);
            y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
            lchan[b] = y / 32768;
            y = 4 * (ma[(b * 4) + 2] + (ma[(b * 4) + 3] << 8) - 32768);
            y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
            rchan[b] = y / 32768;
            b += 1;
            count += 1;
            if (count % 1000 === 0 && new Date() - beginning > MAX_TIME) {
                setTimeout(iterate, 0);
                return;
            }
        }
        setTimeout(function() {callBack(buffer);}, 0);
    };
    setTimeout(iterate, 0);
};

var SG = function(mc, sE) {
    this.mc = mc;
    this.sE = sE || 5605;

    this.md = oscillators[mc.lw];
    this.me = oscillators[mc.ow];
    this.mf = oscillators[mc.Ow];
    this.mg = mc.ea;
    this.mh = mc.es;
    this.mi = mc.er;
    this.mj = Math.pow(2, mc.fp - 8) / this.sE;
    this.mk = Math.pow(2, mc.lq - 8) / this.sE;
};
SG.prototype.cd = function(n, chnBuf, currentpos) {
    var marker = new Date();
    var c1 = 0;
    var c2 = 0;

    // Precalculate frequencues
    var o1t = getnotefreq(n + (this.mc.oo - 8) * 12 + this.mc.od) * (1 + 0.0008 * this.mc.oe);
    var o2t = getnotefreq(n + (this.mc.Oo - 8) * 12 + this.mc.Od) * (1 + 0.0008 * this.mc.Oe);

    // State variable init
    var q = this.mc.fr / 255;
    var low = 0;
    var band = 0;
    for (var j = this.mg + this.mh + this.mi - 1; j >= 0; --j)
    {
        var k = j + currentpos;

        // LFO
        var lfor = this.md(k * this.mk) * this.mc.la / 512 + 0.5;

        // Envelope
        var e = 1;
        if(j < this.mg)
            e = j / this.mg;
        else if(j >= this.mg + this.mh)
            e -= (j - this.mg - this.mh) / this.mi;

        // Oscillator 1
        var t = o1t;
        if(this.mc.lo) t += lfor;
        if(this.mc.ox) t *= e * e;
        c1 += t;
        var rsample = this.me(c1) * this.mc.ov;

        // Oscillator 2
        t = o2t;
        if(this.mc.Ox) t *= e * e;
        c2 += t;
        rsample += this.mf(c2) * this.mc.Ov;

        // Noise oscillator
        if(this.mc.nf) rsample += (2*Math.random()-1) * this.mc.nf * e;

        rsample *= e / 255;

        // State variable filter
        var f = this.mc.fq;
        if(this.mc.lf) f *= lfor;
        f = 1.5 * Math.sin(f * 3.141592 / WAVE_SPS);
        low += f * band;
        var high = q * (rsample - band) - low;
        band += f * high;
        switch(this.mc.ff)
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
        t = osc_sin(k * this.mj) * this.mc.fn / 512 + 0.5;
        rsample *= 39 * this.mc.em;

        // Add to 16-bit channel buffer
        k = k * 4;
        if (k + 3 < chnBuf.length) {
            var x = chnBuf[k] + (chnBuf[k+1] << 8) + rsample * (1 - t);
            chnBuf[k] = x & 255;
            chnBuf[k+1] = (x >> 8) & 255;
            x = chnBuf[k+2] + (chnBuf[k+3] << 8) + rsample * t;
            chnBuf[k+2] = x & 255;
            chnBuf[k+3] = (x >> 8) & 255;
        }
    }
};
SG.prototype.ce = function(n, callBack) {
    var bufferSize = (this.mg + this.mh + this.mi - 1) + (32 * this.sE);
    var self = this;
    genBuffer(bufferSize, function(buffer) {
        self.cd(n, buffer, 0);
        applyDelay(buffer, bufferSize, self.mc, self.sE, function() {
            callBack(new AG(buffer));
        });
    });
};
SG.prototype.cf = function(n, callBack) {
    this.ce(n, function(ag) {
        callBack(ag.cb());
    });
};
SG.prototype.cg = function(n, callBack) {
    this.ce(n, function(ag) {
        ag.cc(callBack);
    });
};

var MG = function(sg) {
    this.sg = sg;
    // Wave data configuration
    this.mb = WAVE_SPS * sg.sL; // Total sg size (in samples)
};
MG.prototype.ch = function (mc, ma, callBack) {
    var self = this;
    genBuffer(this.mb, function(chnBuf) {
        // Preload/precalc some properties/expressions (for improved performance)
        var waveSamples = self.mb,
            waveBytes = self.mb * WAVE_CHAN * 2,
            sE = self.sg.sE,
            sF = self.sg.sF,
            soundGen = new SG(mc, sE);

        var currentpos = 0;
        var p = 0;
        var row = 0;
        var recordSounds = function() {
            var beginning = new Date();
            while (true) {
                if (row === 32) {
                    row = 0;
                    p += 1;
                    continue;
                }
                if (p === sF - 1) {
                    setTimeout(delay, 0);
                    return;
                }
                var cp = mc.p[p];
                if (cp) {
                    var n = mc.c[cp - 1].n[row];
                    if (n) {
                        soundGen.cd(n, chnBuf, currentpos);
                    }
                }
                currentpos += sE;
                row += 1;
                if (new Date() - beginning > MAX_TIME) {
                    setTimeout(recordSounds, 0);
                    return;
                }
            }
        };

        var delay = function() {
            applyDelay(chnBuf, waveSamples, mc, sE, finalize);
        };

        var b2 = 0;
        var finalize = function() {
            var beginning = new Date();
            var count = 0;
            // Add to mix buffer
            while(b2 < waveBytes)
            {
                var x2 = ma[b2] + (ma[b2+1] << 8) + chnBuf[b2] + (chnBuf[b2+1] << 8) - 32768;
                ma[b2] = x2 & 255;
                ma[b2+1] = (x2 >> 8) & 255;
                b2 += 2;
                count += 1;
                if (count % 1000 === 0 && (new Date() - beginning) > MAX_TIME) {
                    setTimeout(finalize, 0);
                    return;
                }
            }
            setTimeout(callBack, 0);
        };
        setTimeout(recordSounds, 0);
    });
};
MG.prototype.ce = function(callBack) {
    var self = this;
    genBuffer(this.mb, function(ma) {
        var t = 0;
        var recu = function() {
            if (t < self.sg.sD.length) {
                t += 1;
                self.ch(self.sg.sD[t - 1], ma, recu);
            } else {
                callBack(new AG(ma));
            }
        };
        recu();
    });
};
MG.prototype.cf = function(callBack) {
    this.ce(function(ag) {
        callBack(ag.cb());
    });
};
MG.prototype.cg = function(callBack) {
    this.ce(function(ag) {
        ag.cc(callBack);
    });
};

var sg = {
    sL: 123,
    sD: [
        {
            oo: 9,
            od: 0,
            oe: 0,
            ox: 0,
            ov: 161,
            ow: 0,
            Oo: 9,
            Od: 0,
            Oe: 4,
            Ox: 0,
            Ov: 182,
            Ow: 0,
            nf: 0,
            ea: 100,
            es: 1818,
            er: 18181,
            em: 192,
            ff: 0,
            fq: 0,
            fr: 254,
            ft: 6,
            fa: 108,
            fp: 3,
            fn: 61,
            lo: 0,
            lf: 0,
            lq: 3,
            la: 94,
            lw: 2,
            p: [
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                0,
                2,
                3,
                4,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                5
            ],
            c: [
                {
                    n: [
                        142,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        140,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        138,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        138,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        140,
                        0,
                        138,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        130,
                        0,
                        142,
                        0,
                        140,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        138,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        130,
                        0,
                        142,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        138,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        123,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        130,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        128,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        119,
                        131,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        126,
                        114,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            ]
        },
        {
            oo: 8,
            od: 0,
            oe: 0,
            ox: 0,
            ov: 0,
            ow: 0,
            Oo: 8,
            Od: 0,
            Oe: 0,
            Ox: 0,
            Ov: 0,
            Ow: 0,
            nf: 19,
            ea: 100,
            es: 0,
            er: 3636,
            em: 192,
            ff: 1,
            fq: 8100,
            fr: 156,
            ft: 2,
            fa: 22,
            fp: 3,
            fn: 43,
            lo: 0,
            lf: 0,
            lq: 0,
            la: 0,
            lw: 0,
            p: [
                0,
                0,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2,
                1,
                2
            ],
            c: [
                {
                    n: [
                        135,
                        0,
                        135,
                        0,
                        0,
                        135,
                        0,
                        135,
                        135,
                        0,
                        135,
                        0,
                        0,
                        135,
                        0,
                        135,
                        135,
                        0,
                        135,
                        0,
                        0,
                        135,
                        0,
                        135,
                        135,
                        0,
                        135,
                        0,
                        0,
                        135,
                        0,
                        135
                    ]
                },
                {
                    n: [
                        135,
                        0,
                        135,
                        0,
                        0,
                        135,
                        0,
                        135,
                        135,
                        0,
                        135,
                        0,
                        0,
                        135,
                        0,
                        135,
                        135,
                        0,
                        135,
                        0,
                        0,
                        135,
                        0,
                        135,
                        135,
                        0,
                        135,
                        0,
                        135,
                        0,
                        135,
                        135
                    ]
                }
            ]
        },
        {
            oo: 6,
            od: 0,
            oe: 0,
            ox: 0,
            ov: 192,
            ow: 1,
            Oo: 8,
            Od: 0,
            Oe: 8,
            Ox: 0,
            Ov: 82,
            Ow: 2,
            nf: 0,
            ea: 100,
            es: 4545,
            er: 2727,
            em: 192,
            ff: 3,
            fq: 2700,
            fr: 85,
            ft: 6,
            fa: 60,
            fp: 6,
            fn: 86,
            lo: 0,
            lf: 1,
            lq: 7,
            la: 106,
            lw: 0,
            p: [
                0,
                0,
                0,
                0,
                1,
                1,
                2,
                3,
                1,
                1,
                2,
                3,
                1,
                1,
                2,
                3,
                1,
                1,
                2,
                3,
                1,
                1,
                2,
                3
            ],
            c: [
                {
                    n: [
                        135,
                        135,
                        147,
                        135,
                        0,
                        135,
                        147,
                        135,
                        135,
                        135,
                        147,
                        135,
                        0,
                        135,
                        147,
                        135,
                        135,
                        135,
                        147,
                        135,
                        0,
                        135,
                        147,
                        135,
                        135,
                        135,
                        147,
                        135,
                        0,
                        135,
                        147,
                        135
                    ]
                },
                {
                    n: [
                        140,
                        140,
                        152,
                        140,
                        0,
                        140,
                        152,
                        140,
                        140,
                        140,
                        152,
                        140,
                        0,
                        140,
                        152,
                        140,
                        140,
                        140,
                        152,
                        140,
                        0,
                        140,
                        152,
                        140,
                        140,
                        140,
                        152,
                        140,
                        0,
                        140,
                        152,
                        142
                    ]
                },
                {
                    n: [
                        131,
                        131,
                        143,
                        131,
                        0,
                        131,
                        143,
                        131,
                        131,
                        131,
                        143,
                        131,
                        0,
                        131,
                        143,
                        131,
                        138,
                        138,
                        150,
                        138,
                        0,
                        138,
                        150,
                        138,
                        138,
                        138,
                        150,
                        138,
                        0,
                        138,
                        150,
                        137
                    ]
                }
            ]
        },
        {
            oo: 7,
            od: 0,
            oe: 0,
            ox: 0,
            ov: 187,
            ow: 2,
            Oo: 5,
            Od: 0,
            Oe: 2,
            Ox: 1,
            Ov: 161,
            Ow: 2,
            nf: 0,
            ea: 100,
            es: 1818,
            er: 2727,
            em: 123,
            ff: 1,
            fq: 1900,
            fr: 162,
            ft: 2,
            fa: 153,
            fp: 6,
            fn: 61,
            lo: 0,
            lf: 1,
            lq: 2,
            la: 196,
            lw: 3,
            p: [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                1,
                1,
                1,
                2,
                1,
                1,
                1,
                2,
                1,
                1,
                1,
                2,
                1,
                1,
                1,
                2,
                1,
                1,
                1,
                2,
                3
            ],
            c: [
                {
                    n: [
                        135,
                        135,
                        138,
                        135,
                        142,
                        135,
                        140,
                        138,
                        135,
                        135,
                        138,
                        135,
                        142,
                        135,
                        140,
                        138,
                        135,
                        135,
                        138,
                        135,
                        142,
                        135,
                        140,
                        138,
                        135,
                        135,
                        138,
                        135,
                        142,
                        135,
                        140,
                        138
                    ]
                },
                {
                    n: [
                        143,
                        143,
                        155,
                        143,
                        0,
                        143,
                        155,
                        143,
                        143,
                        143,
                        150,
                        143,
                        147,
                        143,
                        140,
                        143,
                        138,
                        138,
                        143,
                        138,
                        143,
                        140,
                        138,
                        140,
                        138,
                        138,
                        143,
                        138,
                        142,
                        140,
                        138,
                        140
                    ]
                },
                {
                    n: [
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            ]
        },
        {
            oo: 8,
            od: 0,
            oe: 0,
            ox: 1,
            ov: 192,
            ow: 0,
            Oo: 7,
            Od: 0,
            Oe: 0,
            Ox: 1,
            Ov: 70,
            Ow: 2,
            nf: 8,
            ea: 100,
            es: 0,
            er: 9090,
            em: 164,
            ff: 2,
            fq: 5500,
            fr: 240,
            ft: 6,
            fa: 51,
            fp: 3,
            fn: 66,
            lo: 0,
            lf: 0,
            lq: 0,
            la: 0,
            lw: 0,
            p: [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1
            ],
            c: [
                {
                    n: [
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            ]
        },
        {
            oo: 7,
            od: 0,
            oe: 0,
            ox: 0,
            ov: 192,
            ow: 2,
            Oo: 8,
            Od: 0,
            Oe: 6,
            Ox: 0,
            Ov: 184,
            Ow: 2,
            nf: 21,
            ea: 40000,
            es: 25454,
            er: 90909,
            em: 77,
            ff: 2,
            fq: 7100,
            fr: 188,
            ft: 8,
            fa: 147,
            fp: 4,
            fn: 69,
            lo: 0,
            lf: 1,
            lq: 7,
            la: 176,
            lw: 1,
            p: [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                1,
                2,
                3,
                4,
                1,
                2,
                3,
                4,
                1,
                2,
                3,
                4,
                1,
                2,
                3,
                4,
                5
            ],
            c: [
                {
                    n: [
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        142,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        128,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        143,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        138,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            ]
        },
        {
            oo: 8,
            od: 0,
            oe: 0,
            ox: 0,
            ov: 0,
            ow: 0,
            Oo: 8,
            Od: 0,
            Oe: 0,
            Ox: 0,
            Ov: 0,
            Ow: 0,
            nf: 148,
            ea: 3636,
            es: 4545,
            er: 39090,
            em: 136,
            ff: 2,
            fq: 3100,
            fr: 122,
            ft: 5,
            fa: 132,
            fp: 0,
            fn: 0,
            lo: 0,
            lf: 1,
            lq: 5,
            la: 147,
            lw: 0,
            p: [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                1,
                2,
                1,
                3,
                1,
                2,
                1,
                3,
                4
            ],
            c: [
                {
                    n: [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        162,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        151,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                {
                    n: [
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            ]
        }
    ],
    sE: 5606,
    sF: 30
};
var audioCtx=new AudioContext,songGen=new MG(sg);
songGen.cg(function(u){
  var s=audioCtx.createBufferSource();
  s.buffer=u;
  s.connect(audioCtx.destination);
  s.start();
  document.getElementsByTagName("body")[0].innerText="playing sg"
});
})();