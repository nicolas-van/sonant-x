    //--------------------------------------------------------------------------
    // Description:
    // This is the song used in the 4k synth demo (synth.bitsnbites.eu)
    //--------------------------------------------------------------------------

    // Song length in seconds (how much data to generate)
    var songLen = 125;

    // Song data
    var song = {
        songData: [
	        { // 0
		        // Oscillator 1
		        osc1_oct: 9, // Octave knob
		        osc1_det: 0, // Detune knob
		        osc1_detune: 0, // Actual detune knob
		        osc1_xenv: 0, // Multiply freq by envelope
		        osc1_vol: 161, // Volume knob
		        osc1_waveform: 0, // Wave form
		        // Oscillator 2
		        osc2_oct: 9, // Octave knob
		        osc2_det: 0, // Detune knob
		        osc2_detune: 4, // Actual detune knob
		        osc2_xenv: 0, // Multiply freq by envelope
		        osc2_vol: 182, // Volume knob
		        osc2_waveform: 0, // Wave form
		        // Noise oscillator
		        noise_fader: 0, // Amount of noise to add
		        // Envelope
		        env_attack: 100, // Attack
		        env_sustain: 1818, // Sustain
		        env_release: 18181, // Release
		        env_master: 192, // Master volume knob
		        // Effects
		        fx_filter: 0, // Hi/lo/bandpass or notch toggle
		        fx_freq: 0, // FX Frequency
		        fx_resonance: 254, // FX Resonance
		        fx_delay_time: 6, // Delay time
		        fx_delay_amt: 108, // Delay amount
		        fx_pan_freq: 3, // Panning frequency
		        fx_pan_amt: 61, // Panning amount
		        // LFO
		        lfo_osc1_freq: 0, // Modify osc1 freq (FM) toggle
		        lfo_fx_freq: 0, // Modify fx freq toggle
		        lfo_freq: 3, // LFO freq
		        lfo_amt: 94, // LFO amount
		        lfo_waveform: 2, // LFO waveform
		        // Patterns
		        p: [1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,0,2,3,4,1,2,3,4,5,6,7,8,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Pattern order
		        //{0}, // Mute
		        c: [ // Columns
			        {n: [142,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,140,  0,  0,  0,  0,  0,  0,  0,138,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [135,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,135,  0,  0,  0,138,  0,  0,  0]},
			        {n: [140,  0,138,  0,135,  0,  0,  0,  0,  0,  0,  0,  0,  0,130,  0,142,  0,140,  0,135,  0,  0,  0,  0,  0,  0,  0,138,  0,  0,  0]},
			        {n: [135,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,130,  0,142,  0,  0,  0,  0,  0,  0,  0,135,  0,  0,  0,138,  0,  0,  0]},
			        {n: [123,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [130,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [128,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [119,131,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,126,114,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]}
		        ]
	        },
	        { // 1
		        // Oscillator 1
		        osc1_oct: 8, // Octave knob
		        osc1_det: 0, // Detune knob
		        osc1_detune: 0, // Actual detune knob
		        osc1_xenv: 0, // Multiply freq by envelope
		        osc1_vol: 0, // Volume knob
		        osc1_waveform: 0, // Wave form
		        // Oscillator 2
		        osc2_oct: 8, // Octave knob
		        osc2_det: 0, // Detune knob
		        osc2_detune: 0, // Actual detune knob
		        osc2_xenv: 0, // Multiply freq by envelope
		        osc2_vol: 0, // Volume knob
		        osc2_waveform: 0, // Wave form
		        // Noise oscillator
		        noise_fader: 19, // Amount of noise to add
		        // Envelope
		        env_attack: 100, // Attack
		        env_sustain: 0, // Sustain
		        env_release: 3636, // Release
		        env_master: 192, // Master volume knob
		        // Effects
		        fx_filter: 1, // Hi/lo/bandpass or notch toggle
		        fx_freq: 8100, // FX Frequency
		        fx_resonance: 156, // FX Resonance
		        fx_delay_time: 2, // Delay time
		        fx_delay_amt: 22, // Delay amount
		        fx_pan_freq: 3, // Panning frequency
		        fx_pan_amt: 43, // Panning amount
		        // LFO
		        lfo_osc1_freq: 0, // Modify osc1 freq (FM) toggle
		        lfo_fx_freq: 0, // Modify fx freq toggle
		        lfo_freq: 0, // LFO freq
		        lfo_amt: 0, // LFO amount
		        lfo_waveform: 0, // LFO waveform
		        // Patterns
		        p: [0,0,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Pattern order
		        //{0}, // Mute
		        c: [ // Columns
			        {n: [135,  0,135,  0,  0,135,  0,135,135,  0,135,  0,  0,135,  0,135,135,  0,135,  0,  0,135,  0,135,135,  0,135,  0,  0,135,  0,135]},
			        {n: [135,  0,135,  0,  0,135,  0,135,135,  0,135,  0,  0,135,  0,135,135,  0,135,  0,  0,135,  0,135,135,  0,135,  0,135,  0,135,135]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]}
		        ]
	        },
	        { // 2
		        // Oscillator 1
		        osc1_oct: 6, // Octave knob
		        osc1_det: 0, // Detune knob
		        osc1_detune: 0, // Actual detune knob
		        osc1_xenv: 0, // Multiply freq by envelope
		        osc1_vol: 192, // Volume knob
		        osc1_waveform: 1, // Wave form
		        // Oscillator 2
		        osc2_oct: 8, // Octave knob
		        osc2_det: 0, // Detune knob
		        osc2_detune: 8, // Actual detune knob
		        osc2_xenv: 0, // Multiply freq by envelope
		        osc2_vol: 82, // Volume knob
		        osc2_waveform: 2, // Wave form
		        // Noise oscillator
		        noise_fader: 0, // Amount of noise to add
		        // Envelope
		        env_attack: 100, // Attack
		        env_sustain: 4545, // Sustain
		        env_release: 2727, // Release
		        env_master: 192, // Master volume knob
		        // Effects
		        fx_filter: 3, // Hi/lo/bandpass or notch toggle
		        fx_freq: 2700, // FX Frequency
		        fx_resonance: 85, // FX Resonance
		        fx_delay_time: 6, // Delay time
		        fx_delay_amt: 60, // Delay amount
		        fx_pan_freq: 6, // Panning frequency
		        fx_pan_amt: 86, // Panning amount
		        // LFO
		        lfo_osc1_freq: 0, // Modify osc1 freq (FM) toggle
		        lfo_fx_freq: 1, // Modify fx freq toggle
		        lfo_freq: 7, // LFO freq
		        lfo_amt: 106, // LFO amount
		        lfo_waveform: 0, // LFO waveform
		        // Patterns
		        p: [0,0,0,0,1,1,2,3,1,1,2,3,1,1,2,3,1,1,2,3,1,1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Pattern order
		        //{0}, // Mute
		        c: [ // Columns
			        {n: [135,135,147,135,  0,135,147,135,135,135,147,135,  0,135,147,135,135,135,147,135,  0,135,147,135,135,135,147,135,  0,135,147,135]},
			        {n: [140,140,152,140,  0,140,152,140,140,140,152,140,  0,140,152,140,140,140,152,140,  0,140,152,140,140,140,152,140,  0,140,152,142]},
			        {n: [131,131,143,131,  0,131,143,131,131,131,143,131,  0,131,143,131,138,138,150,138,  0,138,150,138,138,138,150,138,  0,138,150,137]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]}
		        ]
	        },
	        { // 3
		        // Oscillator 1
		        osc1_oct: 7, // Octave knob
		        osc1_det: 0, // Detune knob
		        osc1_detune: 0, // Actual detune knob
		        osc1_xenv: 0, // Multiply freq by envelope
		        osc1_vol: 187, // Volume knob
		        osc1_waveform: 2, // Wave form
		        // Oscillator 2
		        osc2_oct: 5, // Octave knob
		        osc2_det: 0, // Detune knob
		        osc2_detune: 2, // Actual detune knob
		        osc2_xenv: 1, // Multiply freq by envelope
		        osc2_vol: 161, // Volume knob
		        osc2_waveform: 2, // Wave form
		        // Noise oscillator
		        noise_fader: 0, // Amount of noise to add
		        // Envelope
		        env_attack: 100, // Attack
		        env_sustain: 1818, // Sustain
		        env_release: 2727, // Release
		        env_master: 123, // Master volume knob
		        // Effects
		        fx_filter: 1, // Hi/lo/bandpass or notch toggle
		        fx_freq: 1900, // FX Frequency
		        fx_resonance: 162, // FX Resonance
		        fx_delay_time: 2, // Delay time
		        fx_delay_amt: 153, // Delay amount
		        fx_pan_freq: 6, // Panning frequency
		        fx_pan_amt: 61, // Panning amount
		        // LFO
		        lfo_osc1_freq: 0, // Modify osc1 freq (FM) toggle
		        lfo_fx_freq: 1, // Modify fx freq toggle
		        lfo_freq: 2, // LFO freq
		        lfo_amt: 196, // LFO amount
		        lfo_waveform: 3, // LFO waveform
		        // Patterns
		        p: [0,0,0,0,0,0,0,0,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Pattern order
		        //{0}, // Mute
		        c: [ // Columns
			        {n: [135,135,138,135,142,135,140,138,135,135,138,135,142,135,140,138,135,135,138,135,142,135,140,138,135,135,138,135,142,135,140,138]},
			        {n: [143,143,155,143,  0,143,155,143,143,143,150,143,147,143,140,143,138,138,143,138,143,140,138,140,138,138,143,138,142,140,138,140]},
			        {n: [135,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]}
		        ]
	        },
	        { // 4
		        // Oscillator 1
		        osc1_oct: 8, // Octave knob
		        osc1_det: 0, // Detune knob
		        osc1_detune: 0, // Actual detune knob
		        osc1_xenv: 1, // Multiply freq by envelope
		        osc1_vol: 192, // Volume knob
		        osc1_waveform: 0, // Wave form
		        // Oscillator 2
		        osc2_oct: 7, // Octave knob
		        osc2_det: 0, // Detune knob
		        osc2_detune: 0, // Actual detune knob
		        osc2_xenv: 1, // Multiply freq by envelope
		        osc2_vol: 70, // Volume knob
		        osc2_waveform: 2, // Wave form
		        // Noise oscillator
		        noise_fader: 8, // Amount of noise to add
		        // Envelope
		        env_attack: 100, // Attack
		        env_sustain: 0, // Sustain
		        env_release: 9090, // Release
		        env_master: 164, // Master volume knob
		        // Effects
		        fx_filter: 2, // Hi/lo/bandpass or notch toggle
		        fx_freq: 5500, // FX Frequency
		        fx_resonance: 240, // FX Resonance
		        fx_delay_time: 6, // Delay time
		        fx_delay_amt: 51, // Delay amount
		        fx_pan_freq: 3, // Panning frequency
		        fx_pan_amt: 66, // Panning amount
		        // LFO
		        lfo_osc1_freq: 0, // Modify osc1 freq (FM) toggle
		        lfo_fx_freq: 0, // Modify fx freq toggle
		        lfo_freq: 0, // LFO freq
		        lfo_amt: 0, // LFO amount
		        lfo_waveform: 0, // LFO waveform
		        // Patterns
		        p: [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Pattern order
		        //{0}, // Mute
		        c: [ // Columns
			        {n: [135,  0,  0,  0,  0,  0,135,  0,  0,  0,135,  0,  0,  0,  0,  0,135,  0,  0,  0,  0,  0,135,  0,  0,  0,135,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]}
		        ]
	        },
	        { // 5
		        // Oscillator 1
		        osc1_oct: 7, // Octave knob
		        osc1_det: 0, // Detune knob
		        osc1_detune: 0, // Actual detune knob
		        osc1_xenv: 0, // Multiply freq by envelope
		        osc1_vol: 192, // Volume knob
		        osc1_waveform: 2, // Wave form
		        // Oscillator 2
		        osc2_oct: 8, // Octave knob
		        osc2_det: 0, // Detune knob
		        osc2_detune: 6, // Actual detune knob
		        osc2_xenv: 0, // Multiply freq by envelope
		        osc2_vol: 184, // Volume knob
		        osc2_waveform: 2, // Wave form
		        // Noise oscillator
		        noise_fader: 21, // Amount of noise to add
		        // Envelope
		        env_attack: 40000, // Attack
		        env_sustain: 25454, // Sustain
		        env_release: 90909, // Release
		        env_master: 77, // Master volume knob
		        // Effects
		        fx_filter: 2, // Hi/lo/bandpass or notch toggle
		        fx_freq: 7100, // FX Frequency
		        fx_resonance: 188, // FX Resonance
		        fx_delay_time: 8, // Delay time
		        fx_delay_amt: 147, // Delay amount
		        fx_pan_freq: 4, // Panning frequency
		        fx_pan_amt: 69, // Panning amount
		        // LFO
		        lfo_osc1_freq: 0, // Modify osc1 freq (FM) toggle
		        lfo_fx_freq: 1, // Modify fx freq toggle
		        lfo_freq: 7, // LFO freq
		        lfo_amt: 176, // LFO amount
		        lfo_waveform: 1, // LFO waveform
		        // Patterns
		        p: [0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Pattern order
		        //{0}, // Mute
		        c: [ // Columns
			        {n: [135,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [142,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [128,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [143,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,138,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [135,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]}
		        ]
	        },
	        { // 6
		        // Oscillator 1
		        osc1_oct: 8, // Octave knob
		        osc1_det: 0, // Detune knob
		        osc1_detune: 0, // Actual detune knob
		        osc1_xenv: 0, // Multiply freq by envelope
		        osc1_vol: 0, // Volume knob
		        osc1_waveform: 0, // Wave form
		        // Oscillator 2
		        osc2_oct: 8, // Octave knob
		        osc2_det: 0, // Detune knob
		        osc2_detune: 0, // Actual detune knob
		        osc2_xenv: 0, // Multiply freq by envelope
		        osc2_vol: 0, // Volume knob
		        osc2_waveform: 0, // Wave form
		        // Noise oscillator
		        noise_fader: 148, // Amount of noise to add
		        // Envelope
		        env_attack: 3636, // Attack
		        env_sustain: 4545, // Sustain
		        env_release: 39090, // Release
		        env_master: 136, // Master volume knob
		        // Effects
		        fx_filter: 2, // Hi/lo/bandpass or notch toggle
		        fx_freq: 3100, // FX Frequency
		        fx_resonance: 122, // FX Resonance
		        fx_delay_time: 5, // Delay time
		        fx_delay_amt: 132, // Delay amount
		        fx_pan_freq: 0, // Panning frequency
		        fx_pan_amt: 0, // Panning amount
		        // LFO
		        lfo_osc1_freq: 0, // Modify osc1 freq (FM) toggle
		        lfo_fx_freq: 1, // Modify fx freq toggle
		        lfo_freq: 5, // LFO freq
		        lfo_amt: 147, // LFO amount
		        lfo_waveform: 0, // LFO waveform
		        // Patterns
		        p: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,3,1,2,1,3,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Pattern order
		        //{0}, // Mute
		        c: [ // Columns
			        {n: [  0,  0,  0,  0,  0,  0,135,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,135,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,135,  0,  0,  0,  0,  0,  0,  0,162,  0,135,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,135,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,151,  0,  0,  0,  0,  0,135,  0,135,  0,  0,  0,  0,  0]},
			        {n: [135,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]},
			        {n: [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]}
		        ]
	        }
        ],

        rowLen: 5605,   // In sample lengths
        endPattern: 30  // End pattern
    };

