//all audio effects 
var distortion = new Pizzicato.Effects.Distortion({
	gain: 0.4
});
var flanger = new Pizzicato.Effects.Flanger();
var reverb = new Pizzicato.Effects.Reverb();
var tremolo = new Pizzicato.Effects.Tremolo({
	speed: 7,
	mix: 0.8,
	depth: 0.8
});
var stereoPanner = new Pizzicato.Effects.StereoPanner();
var compressor = new Pizzicato.Effects.Compressor({
	threshold: -24,
	ratio: 12
});

var pluckDist = new Pz.Sound({ 
	source: 'file', 
	options: { 
		path: './pluck1.wav', 
		loop: true 
	}
}, function() { pluckDist.addEffect(distortion); });
var pluckFlanger = new Pz.Sound({ 
	source: 'file', 
	options: { 
		path: './pluck1.wav', 
		loop: true 
	}
}, function() { pluckFlanger.addEffect(flanger); });
var pluckReverb = new Pz.Sound({ 
	source: 'file', 
	options: { 
		path: './pluck1.wav', 
		loop: true 
	}
}, function() { pluckReverb.addEffect(reverb); });
var pluckTremolo = new Pz.Sound({ 
	source: 'file', 
	options: { 
		path: './pluck1.wav', 
		loop: true
	}
}, function() { pluckTremolo.addEffect(tremolo); });
var pluckPanner = new Pz.Sound({ 
	source: 'file', 
	options: { 
		path: './pluck1.wav', 
		loop: true 
	}
}, function() { pluckPanner.addEffect(stereoPanner); });
var pluckCompressor = new Pz.Sound({ 
	source: 'file', 
	options: { 
		path: './pluck1.wav', 
		loop: true 
	}
}, function() { pluckCompressor.addEffect(compressor); });

var segments = [
{
    audio: pluckDist,
    playButton: document.getElementById('play-dist'),
    stopButton: document.getElementById('stop-dist'),
    volumeSlider: document.getElementById('volume-dist'),
    effects: [
        {
            instance: distortion,
            parameters: {
                gain: document.getElementById('distortion-gain')
            }
        }
    ]     
},
{
    audio: pluckFlanger,
    playButton: document.getElementById('play-flanger'),
    stopButton: document.getElementById('stop-flanger'),
    volumeSlider: document.getElementById('volume-flanger'),
    effects: [
        {
            instance: flanger,
            parameters: {
                time: document.getElementById('flanger-time'),
                depth: document.getElementById('flanger-depth'),
                speed: document.getElementById('flanger-speed'),
                mix: document.getElementById('flanger-mix'),
                feedback: document.getElementById('flanger-feedback')
            }
        }
    ]
},
{
    audio: pluckReverb,
    playButton: document.getElementById('play-reverb'),
    stopButton: document.getElementById('stop-reverb'),
    volumeSlider: document.getElementById('volume-reverb'),
    effects: [
        {
            instance: reverb,
            parameters: {
                time: document.getElementById('reverb-time'),
                decay: document.getElementById('reverb-decay'),
                mix: document.getElementById('reverb-mix')
            }
        }
    ]
},
{
    audio: pluckTremolo,
    playButton: document.getElementById('play-tremolo'),
    stopButton: document.getElementById('stop-tremolo'),
    volumeSlider: document.getElementById('volume-tremolo'),
    effects: [
        {
            instance: tremolo,
            parameters: {
                speed: document.getElementById('tremolo-speed'),
                mix: document.getElementById('tremolo-mix'),
                depth: document.getElementById('tremolo-depth')
            }
        }
    ]
},
{
    audio: pluckPanner,
    playButton: document.getElementById('play-panner'),
    stopButton: document.getElementById('stop-panner'),
    volumeSlider: document.getElementById('volume-panner'),
    effects: [
        {
            instance: stereoPanner,
            parameters: {
                pan: document.getElementById('stereo-panner-pan')
            }
        }
    ]
},
{
	audio: pluckCompressor,
	playButton: document.getElementById('play-compressor'),
	stopButton: document.getElementById('stop-compressor'),
	volumeSlider: document.getElementById('volume-compressor'),
	effects: [
		{
			instance: compressor,
			parameters: {
				threshold: document.getElementById('compressor-threshold'),
				knee: document.getElementById('compressor-knee'),
				attack: document.getElementById('compressor-attack'),
				release: document.getElementById('compressor-release'),
				ratio: document.getElementById('compressor-ratio')
			}
		}
	]
},

    
]
for (var i = 0; i < segments.length; i++) {
	(function(segment) {

		segment.audio.on('play', function() {
			segment.playButton.classList.add('pause');
		});

		segment.audio.on('stop', function() {
			segment.playButton.classList.remove('pause');
		});

		segment.audio.on('pause', function() {
			segment.playButton.classList.remove('pause');
		});

		segment.playButton.addEventListener('click', function(e) {
			if (segment.playButton.classList.contains('pause'))
				segment.audio.pause();
			else
				segment.audio.play();
		});

		segment.stopButton.addEventListener('click', function(e) {
			segment.audio.stop();
		});

		segment.volumeSlider.addEventListener('input', function(e) {
			var volumeDisplay = segment.volumeSlider.parentNode.getElementsByClassName('slider-value')[0];
			volumeDisplay.innerHTML = segment.audio.volume = e.target.valueAsNumber;
		});

		if (segment.releaseSlider) {
			segment.releaseSlider.addEventListener('input', function(e) {
				var releaseDisplay = segment.releaseSlider.parentNode.getElementsByClassName('slider-value')[0];
				releaseDisplay.innerHTML = segment.audio.release = e.target.valueAsNumber;
			});
		}

		if (segment.attackSlider) {
			segment.attackSlider.addEventListener('input', function(e) {
				var attackDisplay = segment.attackSlider.parentNode.getElementsByClassName('slider-value')[0];
				attackDisplay.innerHTML = segment.audio.attack = e.target.valueAsNumber;
			});
		}

		if (!segment.effects || !segment.effects.length)
			return;

		for (var i = 0; i < segment.effects.length; i++) {
			var effect = segment.effects[i];

			for (var key in effect.parameters) {
				(function(key, slider, instance){

					var display = slider.parentNode.getElementsByClassName('slider-value')[0];

					slider.addEventListener('input', function(e) {
						display.innerHTML = instance[key] = e.target.valueAsNumber;
					});

				})(key, effect.parameters[key], effect.instance);	
			}
		}

	})(segments[i]);
}
