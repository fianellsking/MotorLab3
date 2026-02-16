// --- ดึง Elements มาให้ครบ ---
const vSlider = document.getElementById('v-slider');
const nSlider = document.getElementById('n-slider');
const bSlider = document.getElementById('b-slider'); // ดึง B
const aSlider = document.getElementById('a-slider'); // ดึง A

const vDisp = document.getElementById('v-disp');
const nDisp = document.getElementById('n-disp');
const bDisp = document.getElementById('b-disp');
const aDisp = document.getElementById('a-disp');

const speedVal = document.getElementById('speed-val');
const torqueVal = document.getElementById('torque-val');
const inputVal = document.getElementById('input-val');
const currentVal = document.getElementById('current-val'); // ดึง I
const coilVal = document.getElementById('coil-val');

const coilOnly = document.getElementById('coil-only');
const coilVisual = document.getElementById('coil-visual');
const forceVectors = document.getElementById('force-vectors');
const alertBox = document.getElementById('overheat-alert');
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
function updateSimulation() {
    const v = parseFloat(vSlider.value);
    const n = parseInt(nSlider.value);
    const b = parseFloat(bSlider.value);
    const aInput = parseFloat(aSlider.value); // ค่าที่ได้จาก slider (5-30)

    // แปลงหน่วยจาก cm² เป็น m² สำหรับใช้ในสูตรฟิสิกส์
    // 1 m² = 10,000 cm²
    const a = aInput / 10000; 

    // อัปเดตข้อความบน UI ให้โชว์หน่วย cm² ตามที่ผู้ใช้ปรับ
    if(aDisp) aDisp.innerText = `${aInput} cm²`;
    
    // ... ส่วนการคำนวณอื่นๆ (i, torque, rpm) ใช้ตัวแปร 'a' ที่แปลงแล้วได้เลย ...
    const r = 2.0; 
    const i = v / r;
    const torque = (n * i * a * b).toFixed(5); // ค่าจะน้อยลงตามความจริงของมอเตอร์จิ๋ว
    const rpm = Math.floor(v * n * b * aInput * 5); // ใช้ aInput คูณเพื่อให้เลข RPM ยังดูเยอะอยู่

    // --- ปรับการขยายขนาดขดลวด (Visual Scaling) ---
    if(coilVisual) {
        // ปรับสูตร scale ใหม่เพื่อให้ขนาดบนจอไม่ใหญ่จนล้น (หารด้วย 10 เพื่อให้พอดีกรอบ)
        const visualScale = Math.sqrt(aInput / 10); 
        coilVisual.setAttribute('width', 160 * visualScale);
        coilVisual.setAttribute('height', 60 * visualScale);
        coilVisual.setAttribute('x', -80 * visualScale);
        coilVisual.setAttribute('y', -30 * visualScale);
    }
    
    // อัปเดตตัวเลขอื่นๆ ตามปกติ...
    if(currentVal) currentVal.innerText = i.toFixed(2);
    if(torqueVal) torqueVal.innerText = torque;
    if(speedVal) speedVal.innerText = rpm;
}
    
    // ลูกศรแรง (Force Vector) ยาวขึ้นตาม Torque
    const forceScale = torque * 20; 
    if(forceVectors) {
        forceVectors.setAttribute('transform', `scale(1, ${0.5 + forceScale})`);
        forceVectors.style.opacity = (v > 0 && b > 0) ? 0.9 : 0.2;
    }

    // --- ระบบความร้อน (Overheat ตามกระแสไฟฟ้า I) ---
    if (i > 3) { // ถ้าร้อนเกิน 3.5 แอมป์ (V > 7)
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

    if (audioCtx && !isMuted && isRunning && v > 0) {
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
    const b = parseFloat(bSlider.value);
    const a = parseFloat(aSlider.value);

    if (v > 0) {
        // ความเร็วการหมุนบนหน้าจอ สัมพันธ์กับตัวแปรทั้งหมด
        angle += (v * n * b * a * 15) / 60; 
        if(coilOnly) {
            coilOnly.style.transform = `rotateX(${angle}deg)`;
        }
    }
    animationId = requestAnimationFrame(animate);
}

// --- ปุ่มกดและ Event ---
vSlider?.addEventListener('input', updateSimulation);
nSlider?.addEventListener('input', updateSimulation);
bSlider?.addEventListener('input', updateSimulation);
aSlider?.addEventListener('input', updateSimulation);

stopBtn?.addEventListener('click', () => {
    isRunning = !isRunning;
    if (isRunning) {
        stopBtn.innerHTML = '<span class="material-icons-round">pause</span> STOP';
        stopBtn.classList.remove('stopped');
        animate();
        if(gainNode && !isMuted) gainNode.gain.setTargetAtTime(0.1, audioCtx.currentTime, 0.1);
    } else {
        stopBtn.innerHTML = '<span class="material-icons-round">play_arrow</span> START';
        stopBtn.classList.add('stopped');
        cancelAnimationFrame(animationId);
        
        angle = 0; 
        if(coilOnly) {
            coilOnly.style.transition = 'transform 0.3s ease-out'; 
            coilOnly.style.transform = `rotateX(0deg)`;
            setTimeout(() => { coilOnly.style.transition = 'none'; }, 300);
        }
        if(gainNode) gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    }
});

// รันครั้งแรก
updateSimulation();
animate();


