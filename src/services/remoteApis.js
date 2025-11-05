const axios = require('axios');

const DRONE_CONFIG_SERVER = process.env.DRONE_CONFIG_SERVER;
const DRONE_LOGS_URL = process.env.DRONE_LOGS_URL;
const DRONE_LOGS_API_TOKEN = process.env.DRONE_LOGS_API_TOKEN;

async function fetchDroneConfigs() {
  const res = await axios.get(DRONE_CONFIG_SERVER);
  return res.data;
}

async function fetchLogsForDrone(droneId, { limit = 12, page = 1 } = {}) {
  const res = await axios.get(DRONE_LOGS_URL, {
    params: { filter: `drone_id=${droneId}`, sort: '-created', perPage: limit, page },
    headers: { Authorization: `Bearer ${DRONE_LOGS_API_TOKEN}` }
  });
  return res.data;
}

async function createLogRecord(payload) {
  const res = await axios.post(DRONE_LOGS_URL, payload, {
    headers: { Authorization: `Bearer ${DRONE_LOGS_API_TOKEN}`, 'Content-Type': 'application/json' }
  });
  return res.data;
}

module.exports = { fetchDroneConfigs, fetchLogsForDrone, createLogRecord };
