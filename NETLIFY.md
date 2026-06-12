# 🐻 คู่มือการอัปโหลดขึ้น GitHub และการ Deploy ไปยัง Netlify 💖

ตารางเวรคุณพยาบาลข้าวฟ่างพร้อมสำหรับการเชื่อมต่อกับ **GitHub** และนำไปประดิษฐานใช้งานบนระบบคลาวด์ของ **Netlify** เต็มรูปแบบเรียบร้อยแล้วฮะ! น้าหมีทำการฝังฟังก์ชั่น **Netlify Serverless Functions** เพื่อให้ฟีเจอร์ AI และ Chat ทำงานได้ทรงพลัง ลื่นไหล มีเสถียรภาพ และรวดเร็วเหมือนเดิมแม้ไม่มีเซิร์ฟเวอร์ถาวร!

---

## 📌 ขั้นตอนที่ 1: การนำโค้ดขึ้น GitHub 🚀
1. **ดาวน์โหลดโค้ดชิ้นนี้เป็น .zip** ผ่านทางเมนูการควบคุมขวาบน/ซ้ายบนของ AI Studio (Export) หรือทำการ Push โค้ดผ่าน Git เข้า Repository ใหม่ของคุณ
2. แตกไฟล์ .zip และเปิดโฟลเดอร์ขึ้นมาบนโปรแกรมแก้ไขโค้ดของคุณ (เช่น VS Code)
3. ดำเนินการเริ่มใช้งาน Git และอัปโหลดขึ้น GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: setup ready for netlify spa and functions"
   git branch -M main
   # นำลิ้งก์ Repository บน GitHub ของคุณมาใส่แทน URL นี้
   git remote add origin https://github.com/USERNAME/YOUR-REPO-NAME.git
   git push -u origin main
   ```

---

## 📌 ขั้นตอนที่ 2: การ Deploy ขึ้น Netlify ⚡
หลังจากคุณข้าวฟ่างอัปเกรดฐานข้อมูลขึ้น GitHub แล้ว ให้เข้าไปที่เว็บ [Netlify](https://www.netlify.com/) แล้วล็อกอินด้วย GitHub:

1. กดปุ่ม **"Add new site"** ➔ เลือก **"Import an existing project"**
2. เลือกผู้ให้บริการ **GitHub** และระบุ Repository ของตารางเวรนี้
3. **การตั้งค่า Build Settings (ระบบจะดึงอัตโนมัติจาก `netlify.toml` ที่น้าหมีตั้งไว้ให้แต่กรอกซ้ำตรวจสอบเพื่อความชัวร์ได้):**
   - **Base directory:** `(ปล่อยว่างไว้ไม่ต้องกรอก)`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. กดปุ่ม **"Deploy <project-name>"** ได้ทันที!

---

## 📌 ขั้นตอนที่ 3: ตั้งค่าคีย์วิญญาณน้องหมี (GEMINI_API_KEY) 🐻🔑
เพื่อให้แชทคุยเล่นและนำเข้าร่ายเวทย์มนตร์ผ่านทาง AI ทำงานได้อย่างชาญฉลาดที่สุด ให้เพิ่มคีย์ในหน้าแดชบอร์ดของ Netlify:

1. ไปที่เมนู **Site configuration** หรือ **Site settings** ของเว็บไซต์คุณบน Netlify
2. ไปที่แถบหัวข้อ **Environment variables** ➔ คลิก **"Add a variable"**
3. ป้อนข้อมูลดังต่อไปนี้:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** *(ใส่คีย์ Gemini API Key ของคุณข้าวฟ่าง โดยหาได้จาก Google AI Studio)*
4. กด **Save** จากนั้นเลื่อนไปที่หัวข้อการ Deploy แล้วกด **Trigger deploy** เพื่อทำการต้มซ้ำอัปเดตระบบตารางเวรให้ใช้งานคีย์ตัวเทพได้ทันใจ!

---

### 🍰 ของวิเศษเสริมประโยชน์ที่มีใน Netlify Setup:
* **`netlify.toml`**: ได้จัดการเส้นทางและเปลี่ยนโครงข่ายการเรียก API ไปยัง Functions โดยอัตโนมัติ ช่วยลดปัญหา CORS และเพิ่มความปลอดภัยให้กับ API Key
* **Serverless Functions**: รันตามรอบการคลิกใช้งาน กินพลังงานน้อยสุดๆ ออฟไลน์ฟอลแบ็กชั้นยอดเมื่อไม่ได้ใส่คีย์เพื่อให้คุณข้าวฟ่างใช้งานตารางเวรได้ตลอดกาลหายห่วงน้าฮะ! 🐻🌸✨
