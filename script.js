window.addEventListener('load', () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator;
    let convolver = audioCtx.createConvolver();

    // Function to create a simple reverb impulse response
    function createReverb() {
        const sampleRate = audioCtx.sampleRate;
        const length = sampleRate * 2; // 2 seconds of reverb
        const impulse = audioCtx.createBuffer(2, length, sampleRate);
        const impulseL = impulse.getChannelData(0);
        const impulseR = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = length - i;
            impulseL[i] = (Math.random() * 2 - 1) * Math.pow(n, -0.002);
            impulseR[i] = (Math.random() * 2 - 1) * Math.pow(n, -0.002);
        }

        convolver.buffer = impulse;
    }

    createReverb();



    const startButton = document.createElement('button');
    startButton.textContent = 'Start';
    document.body.appendChild(startButton);

    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop';
    stopButton.disabled = true; // Disable stop button until oscillator starts
    document.body.appendChild(stopButton);

    const frequencyControl = document.getElementById('frequencyControl');
    frequencyControl.disabled = true; // Start with the frequency control disabled

    function setupOscillator() {
        oscillator = audioCtx.createOscillator();
        oscillator.type = 'triangle'; // Change type as needed
        oscillator.frequency.setValueAtTime(frequencyControl.value, audioCtx.currentTime); // Use initial slider value
        oscillator.connect(convolver); // Connect oscillator to the convolver
        convolver.connect(audioCtx.destination); // Connect convolver to output
        oscillator.start();

        frequencyControl.addEventListener('input', function() {
            if (oscillator) {
                const frequency = this.value;
                oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
            }
        });
    }

    startButton.addEventListener('click', () => {
        if (!oscillator) {
            setupOscillator();
            frequencyControl.disabled = false; // Enable frequency control when synthesizer starts
            stopButton.disabled = false; // Enable stop button when synthesizer starts
            startButton.disabled = true;
        }
    });

    stopButton.addEventListener('click', () => {
        if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
            convolver.disconnect();
            oscillator = null; // Clear the oscillator
            frequencyControl.disabled = true; // Disable frequency control when synthesizer stops
            stopButton.disabled = true; // Disable stop button after stopping
            startButton.disabled = false;
        }
    });

    // Ensure the oscillator and convolver are stopped and disconnected when navigating away from the page
    window.addEventListener('beforeunload', () => {
        if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
            convolver.disconnect();
        }
    });
});
