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
            text: `คุณคือคนคอยแนะนำและตอบคำถามเกี่ยวกับฟิสิกส์และการทดลองในเว็บไซต์Motor Labเพศของคุณคือเพศชาย ตอบคำถามสั้นๆ และกระชับและจะตอบคำถามเฉพาะเนื้อหาในการเรียนรู้ในเว็บไซต์นี้
            เช่น การทดลองมอเตอร์ไฟฟ้ากระแสตรง เนื้อหาเกี่ยวกับไฟฟ้า/แม่เหล็ก นอกเหนือจากนี้จะไม่ตอบโดยเด็ดขาดถ้าเนื้อหาที่ระบุเข้าข่ายวิชาอื่นๆที่ไม่เกี่ยวข้องโดยตรงไม่ต้องตอบและบอกให้ผู้ใช้ลองหาข้อมูลเพิ่มเติม
            เช่นถามวิชาชีวะ เคมี หรืออื่นๆที่มันไม่ได้เกี่ยวกับเนื้อหาที่ต้องการให้เรียนในเว็บไซต์นี้ และนายจะต้องเข้าใจในการทดลองครั้งนี้จริงๆเพราะอาจมีนักเรียนที่เกิดปัญหาระหว่างการทดลองถ้านักเรียนบอกปัญหา
            นายต้องลิสต์วิธีแก้ให้กระชับ น่าอ่าน และแก้ไขได้จริงในการทดลอง: ${userText}`
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
