const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const statusDiv = document.getElementById('status');
const progressBar = document.getElementById('progress-bar');

let stats = {
    squat: { counter: 0, correct: 0 },
    lateral_raises: { counter: 0, correct: 0 },
    bicep_curls: { counter: 0, correct: 0 },
    pushups: { counter: 0, correct: 0 } 
};

let stageL = "up";
let stageR = "up";
let counter = 0;
let lastSpeechTime = 0;
let correctReps = 0;
let currentRepHasError = false; 
let currentExercise = "squat";
let cameraStarted = false;

// Konfiguracja plików wideo dla ćwiczeń
const exerciseVideos = {
    'squat': '../video/przysiady.mp4',
    'lateral_raises': '../video/wznosy.mp4',
    'bicep_curls': '../video/biceps.mp4',
    'pushups': '../video/pompki.mp4'
};

// Funkcja obsługująca zmianę wideo instruktażowego
function updateInstructionVideo() {
    const videoElem = document.getElementById('instruction-video');
    const container = document.getElementById('instruction-container');
    const videoSrc = exerciseVideos[currentExercise];

    if (videoSrc) {
        videoElem.src = videoSrc;
        videoElem.onloadeddata = () => {
            container.style.display = 'flex';
            videoElem.play();
        };
        videoElem.onerror = () => {
            console.warn(`Nie znaleziono pliku wideo: ${videoSrc}`);
            container.style.display = 'none';
        };
    } else {
        container.style.display = 'none';
    }
}

function changeExercise() {
    stats[currentExercise].counter = counter;
    stats[currentExercise].correct = correctReps;

    currentExercise = document.getElementById('exercise-select').value;

    counter = stats[currentExercise].counter;
    correctReps = stats[currentExercise].correct;
    
    stageL = "up";
    stageR = "up";
    currentRepHasError = false;

    document.getElementById('rep-count').innerText = counter;
    document.getElementById('correct-count').innerText = correctReps;
    statusDiv.innerText = cameraStarted ? "Zmień pozycję..." : "Gotowy do uruchomienia kamery.";
    statusDiv.style.color = cameraStarted ? "#00ff88" : "";
    
    if (cameraStarted) {
        speak(`Zmieniamy na ${currentExercise === 'squat' ? 'przysiady' : currentExercise === 'bicep_curls' ? 'biceps' : currentExercise === 'pushups' ? 'pompki' : 'wznosy ramion'}`);
    }
    
    // Zaktualizuj wideo po zmianie ćwiczenia
    updateInstructionVideo();
}

// Inicjalizacja wideo na starcie
updateInstructionVideo();

function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
}

function speak(text) {
    if (!window.speechSynthesis.speaking) {
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'pl-PL';
        msg.rate = 1.2; 
        window.speechSynthesis.speak(msg);
    }
}

function triggerWarning(msg) {
    const now = Date.now();
    const alertOverlay = document.getElementById('alert-overlay');

    if (now - lastSpeechTime > 3000) { 
        speak(msg);
        lastSpeechTime = now;
        
        // Klasyczny tekst pod spodem
        statusDiv.style.color = "#ff3333";
        statusDiv.innerText = msg;
        
        // Duży, czytelny alert na środku ekranu (wymóg 2 metrów)
        alertOverlay.innerText = msg;
        alertOverlay.style.display = 'block';
        setTimeout(() => {
            alertOverlay.style.display = 'none';
        }, 2000);
    }
    canvasElement.style.borderColor = "#ff3333";
    setTimeout(() => { 
        if (!currentRepHasError) canvasElement.style.borderColor = "#00ff88"; 
    }, 500);
}

function handleSideRepetition(side, angle, restThreshold, peakThreshold, hasError, direction = 'decreasing', errorMsg = "Popraw technikę!") {
    let currentStage = side === 'left' ? stageL : stageR;

    if (currentStage === "down" && hasError) {
        currentRepHasError = true;
        triggerWarning(errorMsg);
    }

    if (direction === 'decreasing') {
        if (angle > restThreshold) {
            if (currentStage === "down") completeRep();
            if (side === 'left') stageL = "up"; else stageR = "up";
        }
        if (angle < peakThreshold) {
            if (side === 'left') stageL = "down"; else stageR = "down";
        }
    } else {
        if (angle < restThreshold) {
            if (currentStage === "down") completeRep();
            if (side === 'left') stageL = "up"; else stageR = "up";
        }
        if (angle > peakThreshold) {
            if (side === 'left') stageL = "down"; else stageR = "down";
        }
    }
}

function completeRep() {
    counter++;
    if (!currentRepHasError) {
        correctReps++;
        statusDiv.style.color = "#00ff88";
        statusDiv.innerText = "Dobrze!";
    }
    
    speak(`${counter}`);
    document.getElementById('rep-count').innerText = counter;
    document.getElementById('correct-count').innerText = correctReps;
    currentRepHasError = false; 
    canvasElement.style.borderColor = "#00ff88";
}

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.poseLandmarks) {
        let errorNow = false;
        
        const rShoulder = results.poseLandmarks[12];
        const rHip = results.poseLandmarks[24];
        const rElbow = results.poseLandmarks[14];
        const rWrist = results.poseLandmarks[16];
        const rKnee = results.poseLandmarks[26];
        const rAnkle = results.poseLandmarks[28];

        const lShoulder = results.poseLandmarks[11];
        const lHip = results.poseLandmarks[23];
        const lElbow = results.poseLandmarks[13];
        const lWrist = results.poseLandmarks[15];
        const lKnee = results.poseLandmarks[25];
        const lAnkle = results.poseLandmarks[27];

        let angle = 0, angleR = 0, angleL = 0; 
        let progress = 0;

        switch (currentExercise) {
            case "squat":
                angleR = calculateAngle(rHip, rKnee, rAnkle);
                angleL = calculateAngle(lHip, lKnee, lAnkle);
                angle = (angleR + angleL) / 2;
                
                const backAngle = calculateAngle({x: (rShoulder.x + lShoulder.x)/2, y: rShoulder.y - 0.5}, rShoulder, rHip);
                errorNow = Math.abs(180 - backAngle) > 40;
                
                handleSideRepetition('right', angle, 160, 100, errorNow, 'decreasing', "Proste plecy!");
                progress = (160 - angle) / (160 - 100) * 100;
                break;

            case "bicep_curls":
                angleR = calculateAngle(rShoulder, rElbow, rWrist);
                angleL = calculateAngle(lShoulder, lElbow, lWrist);
                
                handleSideRepetition('right', angleR, 150, 50, false, 'decreasing');
                handleSideRepetition('left', angleL, 150, 50, false, 'decreasing');
                
                let maxBend = Math.max(150 - angleR, 150 - angleL);
                progress = (maxBend) / (150 - 50) * 100;
                break;

            case "lateral_raises":
                angleR = calculateAngle(rHip, rShoulder, rElbow);
                angleL = calculateAngle(lHip, lShoulder, lElbow);
                angle = (angleR + angleL) / 2;
                errorNow = angleR > 110 || angleL > 110;
                handleSideRepetition('right', angle, 35, 85, errorNow, 'increasing', "Nie unoś za wysoko!");
                progress = (angle - 35) / (85 - 35) * 100;
                break;

            case "pushups":
                angleR = calculateAngle(rShoulder, rElbow, rWrist);
                angleL = calculateAngle(lShoulder, lElbow, lWrist);
                angle = (angleR + angleL) / 2;
                
                const hipAngleR = calculateAngle(rShoulder, rHip, rAnkle);
                const hipAngleL = calculateAngle(lShoulder, lHip, lAnkle);
                const hipAngle = (hipAngleR + hipAngleL) / 2;
                
                const armpitAngleR = calculateAngle(rHip, rShoulder, rElbow);
                const armpitAngleL = calculateAngle(lHip, lShoulder, lElbow);
                const armpitAngle = (armpitAngleR + armpitAngleL) / 2;

                const hipsError = hipAngle < 150; 
                const elbowsError = armpitAngle > 80; 
                
                errorNow = hipsError || elbowsError;

                let pushupErrorMsg = "Popraw technikę!";
                if (hipsError) pushupErrorMsg = "Trzymaj ciało prosto!";
                else if (elbowsError) pushupErrorMsg = "Łokcie bliżej ciała!";

                handleSideRepetition('right', angle, 160, 90, errorNow, 'decreasing', pushupErrorMsg);
                progress = (160 - angle) / (160 - 90) * 100;
                break;
        }

        const skeletonColor = (errorNow || currentRepHasError) ? '#ff3333' : '#00FF00';
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: skeletonColor, lineWidth: 6});
        drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#FFFFFF', lineWidth: 3});

        if (progressBar) {
            progressBar.style.height = Math.min(100, Math.max(0, progress)) + "%";
            progressBar.style.background = (errorNow || currentRepHasError) ? "#ff3333" : "linear-gradient(to top, #00ff88, #00bd65)";
        }

        canvasCtx.fillStyle = "white";
        canvasCtx.font = "24px Arial";
        canvasCtx.fillText(`Kąt: ${Math.round(angle)}°`, 20, 40);

        const balance = Math.round(angleR - angleL);
        canvasCtx.fillStyle = Math.abs(balance) > 15 ? "#ff3333" : "#00ff88";
        canvasCtx.fillText(`Balans (P-L): ${balance}°`, canvasElement.width / 2 - 80, 40);
        
        if (statusDiv.innerText === "Trwa łączenie z kamerą...") statusDiv.innerText = "Gotowy!";
    }
    canvasCtx.restore();
}

function finishWorkout() {
    if (!cameraStarted) return;

    stats[currentExercise].counter = counter;
    stats[currentExercise].correct = correctReps;

    let totalReps = 0;
    let totalCorrect = 0;
    let summaryHTML = "<ul style='list-style:none; padding:0; margin: 0;'>";

    for (let ex in stats) {
        if (stats[ex].counter > 0) {
            totalReps += stats[ex].counter;
            totalCorrect += stats[ex].correct;
            let exName = ex === 'squat' ? 'Przysiady' : ex === 'bicep_curls' ? 'Biceps' : ex === 'pushups' ? 'Pompki' : 'Wznosy ramion';
            summaryHTML += `<li class="summary-rep-item"><strong>${exName}:</strong> <span class="summary-correct-count">${stats[ex].correct}</span> / ${stats[ex].counter} poprawnych</li>`;
        }
    }
    summaryHTML += "</ul>";

    const accuracy = totalReps > 0 ? Math.round((totalCorrect / totalReps) * 100) : 0;
    
    document.getElementById('summary-modal').style.display = 'block';
    document.getElementById('total-stats').innerHTML = summaryHTML;
    document.getElementById('accuracy-score').innerText = `Skuteczność: ${accuracy}%`;
    
    speak(`Trening zakończony. Łącznie wykonano ${totalReps} powtórzeń z czego ${totalCorrect} poprawnie.`);
}

const pose = new Pose({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`});
pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
pose.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => { await pose.send({image: videoElement}); },
    width: 1280, height: 720
});

const startCameraButton = document.getElementById('camera-start-button');
const startCameraOverlay = document.getElementById('camera-start-overlay');
const finishWorkoutButton = document.getElementById('finish-workout');

startCameraButton.addEventListener('click', async () => {
    startCameraButton.disabled = true;
    startCameraButton.textContent = 'URUCHAMIANIE...';
    statusDiv.innerText = "Trwa łączenie z kamerą...";
    statusDiv.style.color = "";

    try {
        await camera.start();
        cameraStarted = true;
        finishWorkoutButton.disabled = false;
        startCameraOverlay.hidden = true;
    } catch (err) {
        console.error('Nie udało się uruchomić kamery.', err);
        statusDiv.innerText = "Nie udało się uruchomić kamery. Sprawdź uprawnienia i spróbuj ponownie.";
        statusDiv.style.color = "#ff3333";
        startCameraButton.disabled = false;
        startCameraButton.textContent = '▶ SPRÓBUJ PONOWNIE';
    }
});

document.getElementById('exercise-select').addEventListener('change', changeExercise);
finishWorkoutButton.addEventListener('click', finishWorkout);
document.getElementById('new-session').addEventListener('click', () => location.reload());