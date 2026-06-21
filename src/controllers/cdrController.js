const CallRecord = require('../models/CallRecord');

// GET /api/cdr?page=1&limit=20&from=2025-01-01&to=2025-12-31&caller=7387416172&city=Zoefort
exports.getCallRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.city) {
      filter.city = req.query.city;
    }
    if (req.query.caller) {
      filter.callerNumber = req.query.caller;
    }
    if (req.query.receiver) {
      filter.receiverNumber = req.query.receiver;
    }
    if (req.query.from || req.query.to) {
      filter.callStartTime = {};
      if (req.query.from) filter.callStartTime.$gte = new Date(req.query.from);
      if (req.query.to) filter.callStartTime.$lte = new Date(req.query.to);
    }

    const [records, total] = await Promise.all([
      CallRecord.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ callStartTime: -1 }),
      CallRecord.countDocuments(filter)
    ]);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: records
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/cdr/:id
exports.getCallRecordById = async (req, res) => {
  try {
    const record = await CallRecord.findOne({ recordId: req.params.id });
    if (!record) {
      return res.status(404).json({ error: 'Call record not found' });
    }
    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};