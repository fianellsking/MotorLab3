
let audioCtx = null;
let osc = null;
let isAudioOn = false;

document.getElementById('sound-btn')?.addEventListener('click', function() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        gain.gain.value = 0.05;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        audioCtx.suspend(); 
    }

    if (!isAudioOn) {
        audioCtx.resume();
        this.innerText = "🔈 ปิดเสียงมอเตอร์";
        isAudioOn = true;
    } else {
        audioCtx.suspend();
        this.innerText = "🔊 เปิดเสียงมอเตอร์";
        isAudioOn = false;
    }
});

// --- 2. Simulation Logic ---
function updateSimulation() {
    const v = parseFloat(document.getElementById('v-slider')?.value || 0);
    const n = parseInt(document.getElementById('n-slider')?.value || 1);
    
    // อัปเดต UI ตัวเลข
    if(document.getElementById('v-val')) document.getElementById('v-val').innerText = v.toFixed(1);
    if(document.getElementById('n-val')) document.getElementById('n-val').innerText = n;

    // คำนวณค่าทางฟิสิกส์ (จำลอง)
    const rpm = v * n * 50;
    const torque = (v * n * 0.015).toFixed(3);
    
    if(document.getElementById('rpm-txt')) document.getElementById('rpm-txt').innerText = Math.floor(rpm);
    if(document.getElementById('tq-txt')) document.getElementById('tq-txt').innerText = torque;

    // ระบบแจ้งเตือนความร้อน (Overheat)
    const alertBox = document.getElementById('overheat-alert');
    const simScreen = document.getElementById('sim-screen');
    const coil = document.getElementById('coil-visual');

    if (v > 6) {
        if(alertBox) alertBox.className = "alert-visible";
        if(simScreen) simScreen.style.borderColor = "#ef4444";
        if(coil) coil.setAttribute('stroke', '#ef4444');
    } else {
        if(alertBox) alertBox.className = "alert-hidden";
        if(simScreen) simScreen.style.borderColor = "#e2e8f0";
        if(coil) coil.setAttribute('stroke', '#f59e0b');
    }

    // ปรับความหนาขดลวดตามจำนวนรอบ N
    if(coil) coil.setAttribute('stroke-width', 2 + (n * 1.5));

    // ปรับระดับเสียงตามความเร็ว (Pitch)
    if (isAudioOn && osc) {
        const freq = 80 + (rpm / 10);
        osc.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.1);
    }
}

// ผูกฟังก์ชันกับ Slider
document.getElementById('v-slider')?.addEventListener('input', updateSimulation);
document.getElementById('n-slider')?.addEventListener('input', updateSimulation);

let angle = 0;
function animate() {
    const v = parseFloat(document.getElementById('v-slider')?.value || 0);
    const n = parseInt(document.getElementById('n-slider')?.value || 1);
    const rotor = document.getElementById('rotor-group');
    
    if (rotor && v > 0) {
        angle += (v * n) / 10;
        rotor.setAttribute('transform', `rotate(${angle}, 200, 120)`);
    }
    requestAnimationFrame(animate);
}
animate();

// --- 3. Gemini Chatbot (Vercel API Version) ---
function toggleChat() { document.getElementById('chat-window').classList.toggle('active'); }

async function askAI() {
    const input = document.getElementById('chat-input');
    const logs = document.getElementById('chat-logs');
    if (!input.value.trim()) return;

    const userText = input.value;
    logs.innerHTML += `<div class="user-msg"><b>คุณ:</b> ${userText}</div>`;
    input.value = "";
    logs.scrollTop = logs.scrollHeight;

    try {
        // เรียกไปที่ Backend Proxy (Vercel Function) แทนการเรียก Google โดยตรง
        const res = await fetch('/api/chat', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userText: userText }) 
        });
        
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        const reply = data.candidates[0].content.parts[0].text;
        logs.innerHTML += `<div class="ai-msg" style="color:blue;"><b>K.POP2:</b> ${reply}</div>`;
    } catch (e) {
        console.error(e);
        logs.innerHTML += `<div style="color:red;"><b>ระบบ:</b> ไม่สามารถติดต่อ AI ได้ (ตรวจสอบการตั้งค่า Environment Variables ใน Vercel)</div>`;
    }
    logs.scrollTop = logs.scrollHeight;
}

document.getElementById('chat-input')?.addEventListener('keypress', (e) => { if(e.key === 'Enter') askAI(); });

// --- 4. Quiz System (4 Choices & Higher Difficulty) ---
const questions = [
    { 
        q: "ตามกฎของโอห์ม ($V=IR$) ถ้าความต้านทาน (R) ของขดลวดคงที่ แต่เราเพิ่มแรงดันไฟฟ้า (V) กระแสไฟฟ้า (I) จะเป็นอย่างไร?", 
        a: ["ลดลง", "เพิ่มขึ้น", "เท่าเดิม", "ไม่สามารถสรุปได้"], 
        correct: 1 
    },
    { 
        q: "เมื่อใช้กฎมือซ้ายของเฟลมมิ่ง หากนิ้วชี้ชี้ไปทางทิศเหนือ (สนามแม่เหล็ก) และนิ้วกลางชี้ไปทางขวา (กระแส) นิ้วโป้งจะชี้ไปทางใด?", 
        a: ["ชี้ขึ้นข้างบน", "ชี้ลงข้างล่าง", "ชี้ไปทางซ้าย", "ชี้เข้าหาตัว"], 
        correct: 0 
    },
    { 
        q: "การเพิ่มจำนวนรอบขดลวด (N) ในการทดลองนี้ส่งผลโดยตรงต่อค่าใดมากที่สุด?", 
        a: ["แรงดันไฟฟ้า", "ความเข้มสนามแม่เหล็ก", "แรงบิดหรือทอร์กในการหมุน", "ความต้านทานอากาศ"], 
        correct: 2 
    },
    { 
        q: "ทำไมเมื่อปรับแรงดันไฟฟ้าเกิน 6V ระบบถึงแจ้งเตือนความร้อน?", 
        a: ["เพราะสนามแม่เหล็กแรงเกินไป", "เพราะกระแสไฟฟ้าไหลผ่านขดลวดมากเกินไปทำให้เกิดความร้อนสะสม", "เพราะมอเตอร์หมุนจนเกิดแรงเสียดทาน", "เพราะแบตเตอรี่จะระเบิด"], 
        correct: 1 
    },
    { 
        q: "หากต้องการให้มอเตอร์หมุนกลับด้าน (Reverse) ต้องทำอย่างไร?", 
        a: ["เพิ่มจำนวนรอบขดลวด", "ลดแรงดันไฟฟ้า", "สลับขั้วไฟฟ้าหรือสลับขั้วแม่เหล็ก", "เปลี่ยนขนาดของขดลวด"], 
        correct: 2 
    }
];

const qContainer = document.getElementById('quiz-container');
if (qContainer) {
    questions.forEach((item, index) => {
        let html = `<div class="quiz-item"><p>${index + 1}. ${item.q}</p>`;
        item.a.forEach((ans, i) => {
            html += `<label><input type="radio" name="q${index}" value="${i}"> ${ans}</label>`;
        });
        html += `<div id="ans-${index}" class="feedback"></div></div>`;
        qContainer.innerHTML += html;
    });
    qContainer.innerHTML += `<button onclick="checkQuiz()" class="chat-btn" style="position:static; width:100%; margin-top:20px;">ส่งคำตอบและดูคะแนน</button>`;
}

function checkQuiz() {
    let score = 0;
    questions.forEach((item, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        const feedback = document.getElementById(`ans-${index}`);
        if (selected && parseInt(selected.value) === item.correct) {
            score++;
            feedback.innerHTML = `<span class="correct">✅ ถูกต้อง!</span>`;
        } else {
            feedback.innerHTML = `<span class="wrong">❌ ผิด! คำตอบที่ถูกคือ: ${item.a[item.correct]}</span>`;
        }
    });
    document.getElementById('result-box').style.display = 'block';
    document.getElementById('score-val').innerText = score;
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

}
