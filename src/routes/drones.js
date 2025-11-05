const express = require('express');
const router = express.Router();
const { fetchDroneConfigs, fetchLogsForDrone, createLogRecord } = require('../services/remoteApis');

function pickConfig(rawData, droneId) {
  if (!Array.isArray(rawData)) return null;
  const record = rawData.find(item => String(item.drone_id) === String(droneId));
  if (!record) return null;
  return {
    drone_id: record.drone_id,
    drone_name: record.drone_name,
    light: record.light,
    country: record.country,
    weight: record.weight,
    condition: record.condition || 'unknown'
  };
}

router.get('/configs/:droneId', async (req, res) => {
  try {
    const data = await fetchDroneConfigs();
    const config = pickConfig(data, req.params.droneId);
    if (!config) return res.status(404).json({ error: 'Config not found' });
    res.json(config);
  } catch (err) {
    console.error('Config error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/status/:droneId', async (req, res) => {
  try {
    const data = await fetchDroneConfigs();
    const config = pickConfig(data, req.params.droneId);
    if (!config) return res.status(404).json({ error: 'Config not found' });
    res.json({ condition: config.condition });
  } catch (err) {
    console.error('Status error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/logs/:droneId', async (req, res) => {
  try {
    const logsResponse = await fetchLogsForDrone(req.params.droneId, { limit: 12, page: 1 });
    const items = logsResponse.items || logsResponse.data || [];
    const mapped = items.map(item => ({
      drone_id: item.drone_id,
      drone_name: item.drone_name,
      country: item.country,
      celsius: item.celsius,
      created: item.created
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Logs error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logs', async (req, res) => {
  try {
    const { drone_id, drone_name, country, celsius } = req.body;
    if (!drone_id || !drone_name || !country || typeof celsius === 'undefined') {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const newRecord = await createLogRecord({ drone_id, drone_name, country, celsius });
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('Create log error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
