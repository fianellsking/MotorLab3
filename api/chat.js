export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userText } = req.body;
    // ตรวจสอบชื่อตัวแปรใน Vercel Settings อีกครั้งว่าใช้ GEMINI_KEY หรือ GEMINI_API_KEY
    const apiKey = process.env.GEMINI_KEY; 

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured in Vercel' });
    }

    // แก้ไขชื่อ Model เป็น gemini-1.5-flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `คุณคือคนคอยแนะนำและตอบคำถามเกี่ยวกับฟิสิกส์และการทดลองในเว็บไซต์ Motor Lab เพศของคุณคือเพศชาย ตอบคำถามสั้นๆ และกระชับ และจะตอบคำถามเฉพาะเนื้อหาในการเรียนรู้ในเว็บไซต์นี้เท่านั้น นอกเหนือจากนี้จะไม่ตอบโดยเด็ดขาด ถ้าเนื้อหาไม่เกี่ยวข้องให้บอกให้ผู้ใช้ลองหาข้อมูลเพิ่มเติม ตัวอย่างปัญหา: ทำไมลวดไม่หมุน (เช็คการขูดน้ำยาเคลือบ), แรงดันไฟไม่พอ เป็นต้น คำถามจากผู้ใช้: ${userText}`
                    }]
                }]
            })
        });

        const data = await response.json();

        // ตรวจสอบว่า API ส่ง Error กลับมาหรือไม่
        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        // ส่งเฉพาะข้อความคำตอบกลับไปเพื่อให้หน้าบ้านใช้งานง่ายขึ้น
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "ขออภัยครับ ผมไม่สามารถประมวลผลคำตอบได้";
        res.status(200).json({ reply: aiResponse });

    } catch (error) {
        res.status(500).json({ error: 'Failed to connect to Gemini API' });
    }
}
