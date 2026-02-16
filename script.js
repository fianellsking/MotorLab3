// --- 1. Chat System UI Control ---
function toggleChat() { 
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.classList.toggle('active'); 
    }
}

// --- 2. AI Chat Logic (K.POP2) ---
let isAILoading = false; // ตัวแปรล็อคสถานะป้องกันการส่ง Request ซ้ำรัวๆ

async function askAI() {
    const input = document.getElementById('chat-input');
    const logs = document.getElementById('chat-logs');
    
    // ตรวจสอบ: ถ้ากำลังโหลดอยู่ หรือไม่มีข้อความ ให้หยุดการทำงาน
    if (isAILoading || !input.value.trim()) return;

    const userText = input.value.trim();
    
    // แสดงข้อความของผู้ใช้บนหน้าจอ
    logs.innerHTML += `<div class="user-msg"><b>คุณ:</b> ${userText}</div>`;
    input.value = ""; // ล้างช่อง Input
    logs.scrollTop = logs.scrollHeight; // เลื่อน Log ลงล่างสุด

    isAILoading = true; // เริ่มสถานะโหลด (ล็อคการส่งซ้ำ)

    try {
        // ส่งข้อมูลไปที่ Backend Proxy (Vercel Function)
        const res = await fetch('/api/chat', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userText: userText }) 
        });
        
        const data = await res.json();
        
        // ถ้าหลังบ้านส่ง Error กลับมา (เช่น Quota เต็ม หรือ Key ผิด)
        if (data.error) {
            throw new Error(data.error);
        }

        // ดึงคำตอบจาก data.reply ตามที่ตั้งไว้ใน chat.js
        const reply = data.reply || "ขออภัยครับ K.POP2 ไม่สามารถประมวลผลคำตอบได้ในขณะนี้";
        
        // แสดงคำตอบของ AI
        logs.innerHTML += `<div class="ai-msg" style="color:blue;"><b>K.POP2:</b> ${reply}</div>`;

    } catch (e) {
        console.error("Chat Error:", e);
        // แสดง Error จริงๆ ให้ผู้ใช้เห็นเพื่อการตรวจสอบ (Debug)
        logs.innerHTML += `<div style="color:red;"><b>ระบบ:</b> ${e.message || 'ไม่สามารถติดต่อ AI ได้'}</div>`;
    } finally {
        isAILoading = false; // ปลดล็อคสถานะโหลด
        logs.scrollTop = logs.scrollHeight; // เลื่อน Log ลงล่างสุดอีกครั้ง
    }
}

// ฟังการกด Enter ในช่องแชท
document.getElementById('chat-input')?.addEventListener('keypress', (e) => { 
    if(e.key === 'Enter') askAI(); 
});

// --- 3. Quiz System (4 Choices & Physics Content) ---
const questions = [
    { 
        q: "ตามกฎของโอห์ม (V=IR) ถ้าความต้านทาน (R) ของขดลวดคงที่ แต่เราเพิ่มแรงดันไฟฟ้า (V) กระแสไฟฟ้า (I) จะเป็นอย่างไร?", 
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

// ฟังก์ชันสร้าง UI ของ Quiz
const qContainer = document.getElementById('quiz-container');
if (qContainer) {
    questions.forEach((item, index) => {
        let html = `<div class="quiz-item"><p><b>${index + 1}. ${item.q}</b></p>`;
        item.a.forEach((ans, i) => {
            html += `<label style="display:block; margin-bottom:5px;">
                        <input type="radio" name="q${index}" value="${i}"> ${ans}
                     </label>`;
        });
        html += `<div id="ans-${index}" class="feedback" style="margin-top:5px; font-weight:bold;"></div></div><hr style="opacity:0.2; margin:15px 0;">`;
        qContainer.innerHTML += html;
    });
    // เพิ่มปุ่มส่งคำตอบท้าย Quiz
    qContainer.innerHTML += `<button onclick="checkQuiz()" class="chat-btn" style="position:static; width:100%; margin-top:10px;">ส่งคำตอบและดูคะแนน</button>`;
}

// ฟังก์ชันตรวจคำตอบ Quiz
function checkQuiz() {
    let score = 0;
    questions.forEach((item, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        const feedback = document.getElementById(`ans-${index}`);
        
        if (selected) {
            const answerIdx = parseInt(selected.value);
            if (answerIdx === item.correct) {
                score++;
                feedback.innerHTML = `<span style="color:green;">✅ ถูกต้อง!</span>`;
            } else {
                feedback.innerHTML = `<span style="color:red;">❌ ผิด! คำตอบที่ถูกคือ: ${item.a[item.correct]}</span>`;
            }
        } else {
            feedback.innerHTML = `<span style="color:orange;">⚠️ โปรดเลือกคำตอบ</span>`;
        }
    });

    // แสดงผลลัพธ์คะแนนรวม
    const resultBox = document.getElementById('result-box');
    const scoreVal = document.getElementById('score-val');
    if (resultBox && scoreVal) {
        resultBox.style.display = 'block';
        scoreVal.innerText = score;
        // Scroll ลงไปที่กล่องคะแนน
        resultBox.scrollIntoView({ behavior: 'smooth' });
    }
}
