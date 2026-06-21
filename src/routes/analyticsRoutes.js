const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  getKPIs,
  getDurationStats,
  getCostByCity,
  getCallsPerHour,
  getCallsPerDay,
  getCallsByCity,
} = require("../controllers/analyticsController");

router.get('/kpis', protect, getKPIs);
router.get('/duration-stats', protect, getDurationStats);
router.get('/cost-by-city', protect, getCostByCity);
router.get('/calls-per-hour', protect, getCallsPerHour);
router.get('/calls-per-day', protect, getCallsPerDay);
router.get('/calls-by-city', protect, getCallsByCity);
module.exports = router;
