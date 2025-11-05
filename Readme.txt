
1. วัตถุประสงค์
Abstraction: ซ่อนความซับซ้อนในการเรียกใช้ API ปลายทาง (Server 1 และ Server 2)

Security: ปกป้อง API Token และ URL ปลายทาง โดยจัดเก็บไว้ใน Environment Variables (.env) ของ Server

Data Formatting: จัดรูปแบบข้อมูล JSON ที่ตอบกลับ (Response) ให้เป็นไปตามข้อกำหนดของโจทย์

Filtering & Sorting: จัดการการกรอง (Filter) และเรียงลำดับ (Sort) ข้อมูลที่ Server ปลายทาง

2. การติดตั้ง (Installation)
Clone Repository นี้ลงบนเครื่อง Local

ติดตั้ง Dependencies ที่จำเป็นทั้งหมดผ่าน npm:

Bash
npm install

3. การตั้งค่า (Configuration)
โครงการนี้จำเป็นต้องใช้ Environment Variables เพื่อทำงาน

สร้างไฟล์ .env ที่ Root ของโครงการ (ระดับเดียวกับ package.json)

กำหนดค่าตัวแปรดังต่อไปนี้ในไฟล์ .env:

Code snippet

# Port สำหรับรันเซิร์ฟเวอร์
PORT=3001

# Server 1: Drone Config Server
CONFIG_SERVER_URL=https://script.google.com/macros/s/AKfycbzwclqJRodyVjzYyY-NTQDb9cWG6Hoc5vGAABVtr5-jPA_ET_2lasrAJK4aeo5XoONiaA/exec

# Server 2: Drone Log Server
LOG_SERVER_URL=https://app-tracking.pockethost.io/api/collections/drone_logs/records
LOG_API_TOKEN=20250901efx
4. การรันโครงการ (Running the Project)
หลังจากติดตั้งและตั้งค่า .env เรียบร้อยแล้ว สามารถรันเซิร์ฟเวอร์ในโหมด Development (ใช้ nodemon เพื่อ Auto-Restart) ได้ด้วยคำสั่ง:

Bash

npm run dev
เซิร์ฟเวอร์จะเริ่มทำงานที่ http://localhost:3001 (หรือ Port ที่กำหนดใน .env)

5. API Endpoints
เซิร์ฟเวอร์นี้มี Endpoints ทั้งหมด 4 รายการตามข้อกำหนด:

GET /configs/:droneId
คำอธิบาย: ดึงข้อมูล Config ของโดรนตาม droneId ที่ระบุ

การทำงาน: เรียก GET ไปยัง CONFIG_SERVER_URL, ค้นหา Drone ID ที่ตรงกัน และจัดรูปแบบ JSON เฉพาะ field ที่กำหนด

ตัวอย่าง: http://localhost:3001/configs/3001

GET /status/:droneId
คำอธิบาย: ดึงข้อมูลสถานะ (condition) ของโดรน

การทำงาน: เรียก GET ไปยัง CONFIG_SERVER_URL และตอบกลับเฉพาะ field condition

ตัวอย่าง: http://localhost:3001/status/3001

GET /logs/:droneId
คำอธิบาย: ดึงข้อมูล Log การบินของโดรน 12 รายการล่าสุด

การทำงาน: เรียก GET ไปยัง LOG_SERVER_URL โดยใช้ LOG_API_TOKEN ใน Header พร้อมส่ง Query Parameters สำหรับ filter (ตาม droneId), sort (เรียง created ล่าสุด) และ perPage=12

ตัวอย่าง: http://localhost:3001/logs/3001

POST /logs
คำอธิบาย: สร้าง Log อุณหภูมิใหม่

การทำงาน: รับ JSON body จาก Client และส่ง POST ไปยัง LOG_SERVER_URL พร้อม LOG_API_TOKEN โดยส่งข้อมูลเฉพาะ field ที่กำหนด (drone_id, drone_name, country, celsius)

URL: http://localhost:3001/logs

Body (JSON):

JSON

{
  "drone_id": 3001,
  "drone_name": "Dot Dot So",
  "country": "Bharat",
  "celsius": 42.5
}
