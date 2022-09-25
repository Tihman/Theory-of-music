//Load Audio -> Apply a lowbass filter -> Find peaks -> Count intervals between peaks -> Group them
  function getPeaks(data) {
	var partSize = 22050,
		parts = data[0].length / partSize,
		peaks = [];
	for (var i = 0; i < parts; i++) {
	  var max = 0;
	  for (var j = i * partSize; j < (i + 1) * partSize; j++) {
		var volume = Math.max(Math.abs(data[0][j]), Math.abs(data[1][j]));
		if (!max || (volume > max.volume)) {
		  max = {
			position: j,
			volume: volume
		  };
		}
	  }
	  peaks.push(max);
	}
	peaks.sort(function(a, b) {
	  return b.volume - a.volume;
	});
	peaks = peaks.splice(0, peaks.length * 0.5);
	peaks.sort(function(a, b) {
	  return a.position - b.position;
	});
  
	return peaks;
  }
  
  function getIntervals(peaks) {
	var groups = [];
	peaks.forEach(function(peak, index) {
	  for (var i = 1; (index + i) < peaks.length && i < 10; i++) {
		var group = {
		  tempo: (60 * 44100) / (peaks[index + i].position - peak.position),
		  count: 1
		};
		while (group.tempo < 90) {
		  group.tempo *= 2;
		}
		while (group.tempo > 180) {
		  group.tempo /= 2;
		}
		group.tempo = Math.round(group.tempo);
		if (!(groups.some(function(interval) {
		  return (interval.tempo === group.tempo ? interval.count++ : 0);
		}))) {
		  groups.push(group);
		}
	  }
	});
	return groups;
  }
  
	function createBuffers(url) {
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
  
		  		var OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
		  		var offlineContext = new OfflineContext(2, 30 * 44100, 44100);
		 	 	offlineContext.decodeAudioData(request.response, function(buffer) {
				var source = offlineContext.createBufferSource();
				source.buffer = buffer;
				var lowpass = offlineContext.createBiquadFilter();
				lowpass.type = "lowpass";
				lowpass.frequency.value = 150;
				lowpass.Q.value = 1;
				source.connect(lowpass);
				var highpass = offlineContext.createBiquadFilter();
				highpass.type = "highpass";
				highpass.frequency.value = 100;
				highpass.Q.value = 1;
				lowpass.connect(highpass);
				highpass.connect(offlineContext.destination);
				source.start(0);
				offlineContext.startRendering();
		  		});
  
		  		offlineContext.oncomplete = function(e) {
				var buffer = e.renderedBuffer;
				var peaks = getPeaks([buffer.getChannelData(0), buffer.getChannelData(1)]);
				var groups = getIntervals(peaks);
  
				var top = groups.sort(function(intA, intB) {
			  	return intB.count - intA.count;
				}).splice(0, 5);

				console.log(Math.round(top[0].tempo));
				output.innerHTML=Math.round(top[0].tempo);
  
		  		};
		};
		request.send();
	}

	function loadAudio() {
	var element = document.getElementById("audio_input");
	createBuffers(URL.createObjectURL(element.files[0]));
	}