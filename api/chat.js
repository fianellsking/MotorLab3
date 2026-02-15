export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userText } = req.body;
    const apiKey = process.env.GEMINI_KEY; // ดึงจาก Vercel Environment Variables

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured in Vercel' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `คุณคือคนคอยแนะนำและตอบคำถามเกี่ยวกับฟิสิกส์และการทดลองในเว็บไซต์Motor Labเพศของคุณคือเพศชาย ตอบคำถามสั้นๆ และกระชับและจะตอบคำถามเฉพาะเนื้อหาในการเรียนรู้ในเว็บไซต์นี้
            เช่น การทดลองมอเตอร์ไฟฟ้ากระแสตรง เนื้อหาเกี่ยวกับไฟฟ้า/แม่เหล็ก นอกเหนือจากนี้จะไม่ตอบโดยเด็ดขาดถ้าเนื้อหาที่ระบุเข้าข่ายวิชาอื่นๆที่ไม่เกี่ยวข้องโดยตรงไม่ต้องตอบและบอกให้ผู้ใช้ลองหาข้อมูลเพิ่มเติม
            เช่นถามวิชาชีวะ เคมี หรืออื่นๆที่มันไม่ได้เกี่ยวกับเนื้อหาที่ต้องการให้เรียนในเว็บไซต์นี้ และนายจะต้องเข้าใจในการทดลองครั้งนี้จริงๆเพราะอาจมีนักเรียนที่เกิดปัญหาระหว่างการทดลองถ้านักเรียนบอกปัญหา
            นายต้องลิสต์วิธีแก้ให้กระชับ น่าอ่าน และแก้ไขได้จริงในการทดลอง เช่นทำไมลวดไม่หมุน เนื่องจากเป็นลวดทองแดงนายอาจจะบอกให้ลองดูว่ามีการขูดสารเคลือบออกรึยังเพราะเป็นฉนวนไรงี้
            การทดลองนี้คือการทดลองมอเตอร์ไฟฟ้ากระแสตรง ซึ่งจะเป็นการทดลองที่นำคลิปหนีบกระดาษปักไว้ซ้ายขวา และนำลวดทองแดงที่ขดแล้วมาพาดไว้แล้วน้ำไฟขั้วบวก ขั้วลบมาหนีบที่คลิปคนละฝั่ง
            และเปิดกระแสไฟฟ้า และจะมีแม่เหล็กเป็นฐานอันนี้คือการทดลองคร่าวๆ: ${userText}`
                    }]
                }]
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to connect to Gemini API' });
    }
}
