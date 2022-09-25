//good delay
const context = new(window.AudioContext || window.webkitAudioContext)();
const master = context.createGain();
master.gain.value = 0.8;
master.connect(context.destination);

const delay = context.createDelay();
delay.delayTime.value = 0.4;
// delay.connect(master);
const feedback = context.createGain();
feedback.gain.value = 0.3;
delay.connect(feedback);
feedback.connect(delay);
delay.connect(master);

const C_Maj = [
    { name: "C4", value: 261.63 },
    { name: "D4", value: 293.66 },
    { name: "E4", value: 329.63 },
    { name: "F4", value: 349.23 },
    { name: "G4", value: 392.0 },
    { name: "A4", value: 440.0 },
    { name: "B4", value: 493.88 },
    { name: "C5", value: 523.25 },
    { name: "D5", value: 587.33 },
    { name: "E5", value: 659.26 },
    { name: "F5", value: 698.46 },
    { name: "G5", value: 783.99 }
];

const button = document.querySelector("#delay-btn");
button.addEventListener("click", () => {
    const note = {
        vco: context.createOscillator(),
        vca: context.createGain(),
        // vco2: context.createOscillator(),
        // vca2: context.createGain() 
    };
    const getRandomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

    const noteNumber = getRandomInt(0, C_Maj.length - 1);
    note.vco.frequency.value = C_Maj[noteNumber].value;
    note.vco.connect(note.vca);
    note.vca.connect(master);

    // const transpose = (freq, steps) => freq * Math.pow(2, steps / 12);
    // const startingPitch = note.vco.frequency.value;
    // note.vco2.frequency.value = transpose(startingPitch, 7);
    // note.vco2.connect(note.vca2);
    // note.vca2.connect(master);

    note.vca.connect(delay);
    // note.vca2.connect(delay);
    delay.connect(master);

    note.vco.start();
    // note.vco2.start();
    note.vca.gain.exponentialRampToValueAtTime(1, context.currentTime + 0.2)
    note.vca.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + 0.5
    );
    // note.vca2.gain.exponentialRampToValueAtTime(1, context.currentTime + 0.2)
    // note.vca2.gain.exponentialRampToValueAtTime(
    //     0.0001,
    //     context.currentTime + 0.5
    // );
    
});
    


