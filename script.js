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
        const res = await fetch('/api/chat', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userText: userText }) 
        });
        
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        // --- แก้ไขจุดนี้ ---
        // เปลี่ยนจาก data.candidates[0].content.parts[0].text 
        // เป็น data.reply ตามที่ส่งมาจากหลังบ้าน
        const reply = data.reply || "ขออภัยครับ ผมไม่สามารถประมวลผลคำตอบได้";
        
        logs.innerHTML += `<div class="ai-msg" style="color:blue;"><b>K.POP2:</b> ${reply}</div>`;
    } catch (e) {
        console.error(e);
        // แสดง Error จริงๆ ที่เกิดขึ้นใน Console เพื่อช่วยให้เรา debug ง่ายขึ้น
        logs.innerHTML += `<div style="color:red;"><b>ระบบ:</b> ${e.message || 'ไม่สามารถติดต่อ AI ได้'}</div>`;
    }
    logs.scrollTop = logs.scrollHeight;
}

document.getElementById('chat-input')?.addEventListener('keypress', (e) => { if(e.key === 'Enter') askAI(); });

// --- 4. Quiz System (4 Choices & Higher Difficulty) ---
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
