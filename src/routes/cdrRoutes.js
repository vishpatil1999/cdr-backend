const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getCallRecords, getCallRecordById } = require('../controllers/cdrController');

router.get('/', protect, getCallRecords);
router.get('/:id', protect, getCallRecordById);

module.exports = router;