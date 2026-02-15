// simulation.js

// --- ดึง Elements มาให้ครบ ---
const vSlider = document.getElementById('v-slider');
const nSlider = document.getElementById('n-slider');
const vDisp = document.getElementById('v-disp');
const nDisp = document.getElementById('n-disp');

// กล่องตัวเลขด้านล่าง 4 กล่อง
const speedVal = document.getElementById('speed-val');
const torqueVal = document.getElementById('torque-val');
const inputVal = document.getElementById('input-val');
const coilVal = document.getElementById('coil-val');

// ชิ้นส่วนในภาพ Simulation
const coilOnly = document.getElementById('coil-only');
const coilVisual = document.getElementById('coil-visual');
const forceVectors = document.getElementById('force-vectors');
const alertBox = document.getElementById('overheat-alert');

// ปุ่มควบคุม
const stopBtn = document.getElementById('stop-btn');
const soundBtn = document.getElementById('sound-btn');

let isRunning = true;
let angle = 0;
let animationId = null;

// --- ระบบเสียง ---
let audioCtx = null; let osc = null; let gainNode = null; let isMuted = true;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        osc = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        gainNode.gain.value = 0.1;
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        if(isMuted) gainNode.gain.value = 0;
    }
}
soundBtn?.addEventListener('click', () => {
    initAudio();
    isMuted = !isMuted;
    soundBtn.innerHTML = isMuted ? '<span class="material-icons-round">volume_off</span>' : '<span class="material-icons-round">volume_up</span>';
    if (gainNode) gainNode.gain.setTargetAtTime(isMuted ? 0 : 0.1, audioCtx.currentTime, 0.1);
});

// --- ฟังก์ชันอัปเดตตัวเลขและภาพ ---
// --- ฟังก์ชันอัปเดตตัวเลขและภาพ ---
function updateSimulation() {
    const v = parseFloat(vSlider.value);
    const n = parseInt(nSlider.value);

    if(vDisp) vDisp.innerText = `${v.toFixed(1)} V`;
    if(nDisp) nDisp.innerText = n;
    if(inputVal) inputVal.innerText = v.toFixed(1);
    if(coilVal) coilVal.innerText = n;

    // --- สูตรคำนวณใหม่ให้สมจริง ---
    // เป้าหมาย: 2.5V, 10 Turns -> 1000 RPM 
    // สูตร: RPM = V * N * 40 
    const rpm = Math.floor(v * n * 40); 
    
    // แรงบิด (Nm) ปรับสเกลให้ดูเป็นหน่วยนิวตันเมตร (สมมติสเกลมอเตอร์เล็ก)
    const torque = (v * n * 0.005).toFixed(3); 
    
    if(speedVal) speedVal.innerText = rpm;
    if(torqueVal) torqueVal.innerText = torque;

    // --- เอฟเฟกต์ภาพ ---
    if(coilVisual) coilVisual.setAttribute('stroke-width', 2 + (n * 0.5));
    
    const forceScale = (v * n) / 20; 
    if(forceVectors) {
        forceVectors.setAttribute('transform', `scale(1, ${0.5 + forceScale})`);
        forceVectors.style.opacity = v > 0 ? 0.9 : 0.2;
    }

    // --- ระบบความร้อน (Overheat) ---
    if (v > 7.5) { // ปรับให้ร้อนยากขึ้นนิดนึงที่ 7.5V
        if(alertBox) alertBox.className = "alert-visible";
        if(coilVisual) {
            coilVisual.setAttribute('stroke', '#ef4444');
            coilVisual.setAttribute('fill', 'rgba(239, 68, 68, 0.3)');
        }
    } else {
        if(alertBox) alertBox.className = "alert-hidden";
        if(coilVisual) {
            coilVisual.setAttribute('stroke', '#f59e0b');
            coilVisual.setAttribute('fill', 'rgba(245, 158, 11, 0.1)');
        }
    }

    // --- ระบบเสียง (แปรผันตาม RPM) ---
    if (audioCtx && !isMuted && isRunning && v > 0) {
        // ให้เสียงเริ่มต้นที่ 100Hz และเพิ่มขึ้นตามความเร็วรอบ
        // ยิ่ง RPM สูง เสียงยิ่งแหลม (High Pitch)
        const baseFreq = 100;
        const pitchShift = rpm / 5; 
        osc.frequency.setTargetAtTime(baseFreq + pitchShift, audioCtx.currentTime, 0.1);
    }
}

// --- ฟังก์ชันหมุนอนิเมชัน ---
function animate() {
    if (!isRunning) return;

    const v = parseFloat(vSlider.value);
    const n = parseInt(nSlider.value);

    if (v > 0) {
        // ปรับความเร็วการหมุนในจอให้สัมพันธ์กับ RPM
        // หารด้วยค่าคงที่เพื่อให้ภาพไม่หมุนเร็วจนมองไม่ทัน
        angle += (v * n * 40) / 60; 
        
        if(coilOnly) {
            coilOnly.style.transform = `rotateX(${angle}deg)`;
        }
    }
    
    animationId = requestAnimationFrame(animate);
}

// --- ปุ่มกดและ Event ---
vSlider?.addEventListener('input', updateSimulation);
nSlider?.addEventListener('input', updateSimulation);

stopBtn?.addEventListener('click', () => {
    isRunning = !isRunning;
    if (isRunning) {
        // เล่นต่อ
        stopBtn.innerHTML = '<span class="material-icons-round">pause</span> STOP';
        stopBtn.classList.remove('stopped');
        animate();
        if(gainNode && !isMuted) gainNode.gain.setTargetAtTime(0.1, audioCtx.currentTime, 0.1);
    } else {
        // หยุดและดีดกลับมาที่ 0 องศา (ตั้งต้น)
        stopBtn.innerHTML = '<span class="material-icons-round">play_arrow</span> START';
        stopBtn.classList.add('stopped');
        cancelAnimationFrame(animationId);
        
        angle = 0; // รีเซ็ตมุม
        if(coilOnly) {
            coilOnly.style.transition = 'transform 0.3s ease-out'; // ใส่ลูกเล่นให้มันค่อยๆ ดีดกลับ
            coilOnly.style.transform = `rotateX(0deg)`;
            
            // เอา transition ออกหลังจากดีดกลับเสร็จ จะได้ไม่กวนตอนเริ่มหมุนใหม่
            setTimeout(() => { coilOnly.style.transition = 'none'; }, 300);
        }
        
        if(gainNode) gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    }
});

// รันครั้งแรก
updateSimulation();
animate();