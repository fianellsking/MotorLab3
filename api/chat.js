export default async function handler(req, res) {
  // รับข้อความจากหน้าเว็บ
  const { userText } = req.body;
  
  // ดึง API Key จากระบบของ Vercel (Environment Variable)
  const apiKey = process.env.GEMINI_KEY; 
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `คุณคือคนคอยแนะนำเกี่ยวกับฟิสิกส์... (ใส่ Prompt เดิมของคุณตรงนี้): ${userText}`
          }]
        }]
      })
    });

    const data = await response.json();
    res.status(200).json(data); // ส่งคำตอบกลับไปที่หน้าเว็บ
  } catch (error) {
    res.status(500).json({ error: "เชื่อมต่อ Gemini ไม่สำเร็จ" });
  }
}
