//just player
function loadAudio2() {
    var wavesurfer = WaveSurfer.create({
    container: '.audio',
    waveColor: 'violet',
    progressColor: 'purple',
    height: 200,
    responsive: true,
    plugins: [
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

var element = document.getElementById("audio_input");
wavesurfer.load(URL.createObjectURL(element.files[0]));

wavesurfer.on("ready", function() {
    totalAudioDuration = wavesurfer.getDuration();
    document.getElementById('time-total').innerText = Math.floor(totalAudioDuration/60)+':'+('0'+ Math.floor(totalAudioDuration%60)).slice(-2);
});

wavesurfer.on('audioprocess', function() {
    if(wavesurfer.isPlaying()) {
        var currentTime = wavesurfer.getCurrentTime();
        document.getElementById('time-current').innerText = Math.floor(currentTime/60)+':'+('0'+ Math.floor(currentTime%60)).slice(-2);
    }
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
