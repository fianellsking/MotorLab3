export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { userText } = req.body;
    const apiKey = process.env.GEMINI_KEY; 

    if (!apiKey) return res.status(500).json({ error: 'API Key not configured' });

    // ใช้ v1beta และรุ่น 2.0-flash (ตรวจสอบตัวสะกด gemini-2.0-flash ให้เป๊ะ)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `คุณคือคนคอยแนะนำเรื่องฟิสิกส์และการทดลองมอเตอร์ไฟฟ้าในเว็บไซต์ Motor Lab ตอบสั้นๆ กระชับ และเป็นเพศชาย โดยจะตอบเฉพาะเนื้อหาฟิสิกส์และการทดลองเท่านั้นนอกเหนือจากนี้จะไม่ตอบ และต้องคอยช่วยแก้ปัญหา แนะนำในการทดลองมอเตอร์ไฟฟ้ากระแสตรง: ${userText}`
                    }]
                }]
            })
        });

        const data = await response.json();

        // ตรวจสอบ Error จาก Google
        if (data.error) {
            // ส่งข้อความ Error จริงๆ ออกไปให้เราเห็นบนหน้าเว็บเลยเพื่อ Debug
            return res.status(400).json({ error: `Google API: ${data.error.message}` });
        }

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "ขออภัยครับ ระบบไม่สามารถประมวลผลคำตอบได้";
        res.status(200).json({ reply: aiResponse });

    } catch (error) {
        res.status(500).json({ error: 'Failed to connect to Gemini API' });
    }
}
