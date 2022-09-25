//Oscillator1
let start_button  = document.getElementById('start'),
    radios        = document.querySelectorAll('input[name="radio-selection"]'),
    radios_length = radios.length,
    audioContext,
    masterGain;

function audioSetup() {
    let source;
  
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
  
    for(var i = 0, max = radios_length; i < max; i++) {
      if(radios[i].checked === true) {
        source = radios[i].value;
      }
    }
  
    let song        = new Audio(source),
        songSource  = audioContext.createMediaElementSource(song),
        songPlaying = false;
  
    song.crossOrigin = 'anonymous';
    songSource.connect(masterGain);
  
    for(var i = 0, max = radios_length; i < max; i++) {
      radios[i].addEventListener('change', function() {
        if(songPlaying) {
          song.pause();
          start_button.innerHTML = 'Start Audio';
          songPlaying = !songPlaying;
        }
  
        song = new Audio(this.value);
        songSource  = audioContext.createMediaElementSource(song),
        song.crossOrigin = 'anonymous';
        songSource.connect(masterGain);
      });
    }
  
    start_button.addEventListener('click', function() {
      audioContext.resume().then(() => {
        console.log('Playback resumed successfully');
      });
      if(songPlaying) {
        song.pause();
        start_button.innerHTML = 'Start Audio';
      } else {
          console.log(song);
        song.play();
        drawOscilloscope();
        updateWaveForm();
        start_button.innerHTML = 'Stop Audio';
      }
  
      songPlaying = !songPlaying;
    });
  }
  
  audioSetup();
  
  const analyser1 = audioContext.createAnalyser();
  masterGain.connect(analyser1);
  
  const waveform = new Float32Array(analyser1.frequencyBinCount);
  analyser1.getFloatTimeDomainData(waveform);
  
  function updateWaveForm() {
    requestAnimationFrame(updateWaveForm);
    analyser1.getFloatTimeDomainData(waveform);
  }
  
  function drawOscilloscope() {
    requestAnimationFrame(drawOscilloscope);
  
    const scopeCanvas = document.getElementById('oscilloscope');
    const scopeContext = scopeCanvas.getContext('2d');
  
    scopeCanvas.width = waveform.length;
    scopeCanvas.height = 200;
  
    scopeContext.clearRect(0, 0, scopeCanvas.width, scopeCanvas.height);
    scopeContext.beginPath();
  
    for(let i = 0; i < waveform.length; i++) {
      const x = i;
      const y = ( 0.5 + (waveform[i] / 2) ) * scopeCanvas.height;
      
  
      if(i == 0) {
        scopeContext.moveTo(x, y);
      } else {
        scopeContext.lineTo(x, y);
      }
    }
    scopeContext.fillStyle="white";
    scopeContext.fillRect(0,0,scopeCanvas.width, scopeCanvas.height);
    scopeContext.strokeStyle= '#5661FA';
    scopeContext.lineWidth = 2;
    scopeContext.stroke();
  }