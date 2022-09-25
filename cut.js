//just cut
async function readAndDecodeAudio() {
	arrBuffer = null;
	audioBuffer = null;

	await readAudio(audioFile)
			.then((results) => {
				arrBuffer = results.result;
			})
			.catch((error) => {
				window.alert("Some Error occured");
				return;
			}); 

	await new AudioContext().decodeAudioData(arrBuffer)
				.then((res) => {
					audioBuffer = res;
				})
				.catch((err) => {
					window.alert("Can't decode Audio");
					return;
				});
}

async function trimAudio(region) {
	// var regionDuration = region.end - region.start;
	var startPoint = Math.floor((region.start*audioBuffer.length)/totalAudioDuration);
	var endPoint = Math.ceil((region.end*audioBuffer.length)/totalAudioDuration);
	var audioLength = endPoint - startPoint;

	var trimmedAudio = new AudioContext().createBuffer(
		audioBuffer.numberOfChannels,
		audioLength,
		audioBuffer.sampleRate
	);

	for(var i=0;i<audioBuffer.numberOfChannels;i++){
		trimmedAudio.copyToChannel(audioBuffer.getChannelData(i).slice(startPoint,endPoint),i);
	}

	var audioData = {
		channels: Array.apply(null,{length: trimmedAudio.numberOfChannels})
					.map(function(currentElement, index) {
						return trimmedAudio.getChannelData(index);
					}),
		sampleRate: trimmedAudio.sampleRate,
    	length: trimmedAudio.length,
	}
	
	var temp = null;
	await encodeAudioBufferLame(audioData)
		.then((res) => {
			console.log(res);
			downloadAudio();
		})
		.catch((c) => {
			console.log(c);
		});
	console.log(audioData);
}

function encodeAudioBufferLame( audioData ) {
	return new Promise( (resolve, reject) => {
		var worker = new Worker('./worker/worker.js');
		
		worker.onmessage = (event) => {
			console.log(event.data);
			if(event.data != null){
				resolve(event.data);
			}
			else{
				reject("Error");
			}
			var blob = new Blob(event.data.res, {type: 'audio/mp3'});
      		processedAudio = new window.Audio();
      		processedAudio.src = URL.createObjectURL(blob);
      		console.log(blob);
		};

		worker.postMessage({'audioData': audioData});
	});		
}

function readAudio(file) {	
	return new Promise((resolve, reject) => {
					var reader = new FileReader();
					reader.readAsArrayBuffer(file);

					reader.onload = function() {
						console.log("Audio Loaded");
						resolve(reader);
					}

					reader.onerror = function(error){
						console.log("Error while reading audio");
						reject(error);
					}

					reader.onabort = function(abort){
						console.log("Aborted");
						console.log(abort);
						reject(abort);
					}

				})
}

function createAudioRow(arr) {
	var a = document.getElementById("audio-tracks").rows.length;
	var tableRow = document.createElement("tr");
	tableRow.setAttribute("id", arr[0]);
	for(var i in arr){
		var tableData;
		if(i==0) {
			// tableData = document.createElement("input");
			// tableData.setAttribute("type", "checkbox");
			tableData = document.createElement("td");
			tableData.innerText = a;
		 } else {
			tableData = document.createElement("td");
			// tableData.innerText = arr[i].toFixed(4);
		}
		tableData.setAttribute("id",arr[0]+i);
		tableRow.appendChild(tableData);
	}

	var actionsArray = new Array(
		{"action":"play", "iconClass":"fa-solid fa-play"}, 
		{"action":"download", "iconClass":"fa-solid fa-arrow-down"}, 
		{"action":"delete", "iconClass":"fa-solid fa-xmark"});
	for(var i=0; i<actionsArray.length; i++) {
		var tableData = document.createElement("td");
		tableData.setAttribute("id", arr[0]+"-"+actionsArray[i].action);
		var dataIcon = document.createElement("button");
		dataIcon.setAttribute("title", actionsArray[i].action);
		dataIcon.setAttribute("class", actionsArray[i].iconClass);
		dataIcon.setAttribute("id", arr[0]+"-"+actionsArray[i].iconClass);
		dataIcon.setAttribute("onClick", actionsArray[i].action+"Track('"+arr[0].toString()+"')"); 	
		tableData.appendChild(dataIcon);
		tableRow.appendChild(tableData);
	}
	return tableRow;
}

function loadAudio() {
    var element = document.getElementById("audio-input");
	audioFile = element.files[0];

    // if (wavesurfer!==undefined)
    //     wavesurfer.destroy;
		wavesurfer = WaveSurfer.create({
        container: '.audio',
        waveColor: 'violet',
        progressColor: 'purple',
        plugins: [
            WaveSurfer.regions.create({
                dragSelection: {
                    slop: 3
                }
            }),
            WaveSurfer.cursor.create({
                showTime: true,
                opacity: 1,
                customShowTimeStyle: {
                    'background-color': '#004',
                    color: '#ffa',
                    padding: '2px',
                    'font-size': '12px'
                }
            })
        ]
    });
    
    wavesurfer.on("ready", function() {
        readAndDecodeAudio();
        preTrimUIChanges()
        totalAudioDuration = wavesurfer.getDuration();
        document.getElementById('time-total').innerText = Math.floor(totalAudioDuration/60)+':'+('0'+ Math.floor(totalAudioDuration%60)).slice(-2);
    	wavesurfer.enableDragSelection({});
    });

    wavesurfer.load(URL.createObjectURL(element.files[0]));

    wavesurfer.on('audioprocess', function() {
	    if(wavesurfer.isPlaying()) {
	        var currentTime = wavesurfer.getCurrentTime();
            document.getElementById('time-current').innerText = Math.floor(currentTime/60)+':'+('0'+ Math.floor(currentTime%60)).slice(-2);
	    }
	});

    wavesurfer.on('region-created', function(newRegion) {
		var audioTracks = document.getElementById("audio-tracks").tBodies[0];
		var tableRow = createAudioRow(new Array(newRegion.id, newRegion.start, newRegion.end));
		audioTracks.appendChild(tableRow);
	});

    wavesurfer.on("region-update-end", function(newRegion) {
		document.getElementById(newRegion.id+1).innerText = Math.floor(newRegion.start/60)+':'+('0'+ Math.floor(newRegion.start%60)).slice(-2);
		document.getElementById(newRegion.id+2).innerText = Math.floor(newRegion.end/60)+':'+('0'+ Math.floor(newRegion.end%60)).slice(-2)
	});

    const playBtn = document.querySelector(".play-btn");
    const stopBtn = document.querySelector(".stop-btn");
    const muteBtn = document.querySelector(".mute-btn");
    const volumeSlider = document.querySelector(".volume-slider");
	const zoomSlider = document.querySelector('.zoom');

    playBtn.addEventListener("click", () => {
        wavesurfer.playPause();

        if (wavesurfer.isPlaying()) {
            playBtn.classList.add("playing");
        } else {
            playBtn.classList.remove("playing");
        }
})
    stopBtn.addEventListener("click", () => {
        wavesurfer.stop();
        playBtn.classList.remove("playing");
})
    volumeSlider.addEventListener("mouseup", () => {
        changeVolume(volumeSlider.value);
})
    const changeVolume=(volume) => {
        wavesurfer.setVolume(volume);
}
	zoomSlider.addEventListener("mouseup", () => {
		changeZoom(zoomSlider.value);
	})
	const changeZoom=(zoomvalue) => {
		wavesurfer.zoom(zoomvalue)
	}
}

function playTrack(regionId) {
	wavesurfer.regions.list[regionId].play();
}

function downloadTrack(regionId) {
	trimAudio(wavesurfer.regions.list[regionId]);
}

function deleteTrack(regionId) {
	var track = document.getElementById(regionId);
	track.parentNode.removeChild(track);
	wavesurfer.regions.list[regionId].remove();
}

function downloadAudio() {
	var anchorAudio = document.createElement("a");
    anchorAudio.href = processedAudio.src;
	anchorAudio.download = "output.mp3";
	anchorAudio.click();
	console.log(anchorAudio);
}

function preTrimUIChanges() {
	var audioTracks = document.getElementById("audio-tracks");
	var tbody = document.createElement("tbody");
	audioTracks.tBodies[0].remove();
	audioTracks.insertBefore(tbody, audioTracks.tFoot[0]);
}