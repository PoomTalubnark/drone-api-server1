// 1. Import Library ที่จำเป็น
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); 

// 2. สร้าง Express App
const app = express();
app.use(cors());
app.use(express.json());

// 3. ดึงค่าจาก .env
const PORT = process.env.PORT || 3001;
const CONFIG_SERVER_URL = process.env.CONFIG_SERVER_URL;
const LOG_SERVER_URL = process.env.LOG_SERVER_URL;
const LOG_API_TOKEN = process.env.LOG_API_TOKEN;

// 4. สร้าง Route ทดสอบ
app.get('/', (req, res) => {
  res.send('Drone API Server is running!');
});

// === Endpoint 1: GET /configs/:droneId ===
// (ส่วนนี้ถูกต้องแล้วจากรอบที่แล้ว - image_348eaa.png)
app.get('/configs/:droneId', async (req, res) => {
  try {
    const { droneId } = req.params;
    const response = await axios.get(CONFIG_SERVER_URL);
    const configs = response.data.data; // [FIX 1]
    const config = configs.find(c => c.drone_id == droneId);

    if (!config) {
      return res.status(404).json({ error: 'Drone config not found' });
    }
    res.json({
      drone_id: config.drone_id,
      drone_name: config.drone_name,
      light: config.light,
      country: config.country,
      weight: config.weight, 
    });
  } catch (error) {
    console.error('Error fetching config:', error.message);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// === Endpoint 2: GET /status/:droneId ===
// (ส่วนนี้ถูกต้องแล้ว)
app.get('/status/:droneId', async (req, res) => {
  try {
    const { droneId } = req.params;
    const response = await axios.get(CONFIG_SERVER_URL);
    const configs = response.data.data; // [FIX 1]
    const config = configs.find(c => c.drone_id == droneId);

    if (!config) {
      return res.status(404).json({ error: 'Drone status not found' });
    }
    res.json({
      condition: config.condition,
    });
  } catch (error) {
    console.error('Error fetching status:', error.message);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// === Endpoint 3: GET /logs/:droneId ===
app.get('/logs/:droneId', async (req, res) => {
  try {
    const { droneId } = req.params;
    const headers = { 'Authorization': `Bearer ${LOG_API_TOKEN}` };
    
    // --- 💡 FIX 2: แก้ไขตรงนี้ ---
    // ลบวงเล็บ ( ) ที่ครอบ filter ออก
    const params = {
      filter: `drone_id='${droneId}'`, // <-- ไม่มีวงเล็บแล้ว
      sort: '-created', 
      perPage: 12,
    };
    // -------------------------

    const response = await axios.get(LOG_SERVER_URL, { headers, params });
    const logs = response.data.items; 

    const formattedLogs = logs.map(log => ({
      drone_id: log.drone_id,
      drone_name: log.drone_name,
      created: log.created,
      country: log.country,
      celsius: log.celsius,
    }));
    res.json(formattedLogs);

  } catch (error) {
    console.error('Error fetching logs:', error.message);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// === Endpoint 4: POST /logs ===
app.post('/logs', async (req, res) => { 
  try {
    const body = req.body; 
    const payload = {
      drone_id: body.drone_id,
      drone_name: body.drone_name,
      country: body.country,
      celsius: body.celsius,
    };
    const headers = {
      'Authorization': `Bearer ${LOG_API_TOKEN}`, 
      'Content-Type': 'application/json',
    };

    await axios.post(LOG_SERVER_URL, payload, { headers }); 
    res.status(201).json({ message: 'Log created successfully' });

  } catch (error) {
    console.error('Error creating log:', error.message);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// 5. สั่งให้ Server เริ่มทำงาน
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});