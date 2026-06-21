const CallRecord = require('../models/CallRecord');
// GET /api/analytics/kpis
exports.getKPIs = async (req, res) => {
  try {
    const result = await CallRecord.aggregate([
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          totalCost: { $sum: '$callCost' },
          totalDuration: { $sum: '$callDuration' },
          successfulCalls: {
            $sum: { $cond: [{ $eq: ['$callStatus', 'answered'] }, 1, 0] }
          },
          failedCalls: {
            $sum: { $cond: [{ $eq: ['$callStatus', 'missed'] }, 1, 0] }
          }
        }
      }
    ]);

    const kpis = result[0] || {
      totalCalls: 0,
      totalCost: 0,
      totalDuration: 0,
      successfulCalls: 0,
      failedCalls: 0
    };

    const avgDuration = kpis.totalCalls > 0
      ? kpis.totalDuration / kpis.totalCalls
      : 0;

    res.status(200).json({
      totalCalls: kpis.totalCalls,
      totalCost: Math.round(kpis.totalCost * 100) / 100,
      avgDurationSeconds: Math.round(avgDuration * 100) / 100,
      successfulCalls: kpis.successfulCalls,
      failedCalls: kpis.failedCalls
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET /api/analytics/duration-stats
exports.getDurationStats = async (req, res) => {
  try {
    const statsResult = await CallRecord.aggregate([
      {
        $group: {
          _id: null,
          longest: { $max: '$callDuration' },
          shortest: { $min: '$callDuration' },
          average: { $avg: '$callDuration' }
        }
      }
    ]);

    const stats = statsResult[0] || { longest: 0, shortest: 0, average: 0 };

    const topRecords = await CallRecord.find()
      .sort({ callDuration: -1 })
      .limit(10)
      .select('callerName callDuration');

    const chartData = topRecords.map(r => ({
      name: r.callerName.split(' ')[0],
      duration: r.callDuration
    }));

    res.status(200).json({
      longest: stats.longest,
      shortest: stats.shortest,
      average: Math.round(stats.average),
      chartData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/cost-by-city?limit=8
exports.getCostByCity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const result = await CallRecord.aggregate([
      {
        $group: {
          _id: '$city',
          cost: { $sum: '$callCost' }
        }
      },
      { $sort: { cost: -1 } },
      { $limit: limit }
    ]);

    const costByCity = result.map(row => ({
      city: row._id,
      cost: Math.round(row.cost * 100) / 100
    }));

    res.status(200).json(costByCity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/calls-per-hour
exports.getCallsPerHour = async (req, res) => {
  try {
    const result = await CallRecord.aggregate([
      {
        $group: {
          _id: { $hour: '$callStartTime' },
          calls: { $sum: 1 }
        }
      }
    ]);

    // build a full 0-23 hour array, filling in zeros for hours with no calls
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      calls: 0
    }));

    result.forEach(row => {
      hours[row._id].calls = row.calls;
    });

    res.status(200).json(hours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/calls-per-day
exports.getCallsPerDay = async (req, res) => {
  try {
    const result = await CallRecord.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$callStartTime' }
          },
          calls: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const callsPerDay = result.map(row => ({
      date: row._id,
      calls: row.calls
    }));

    res.status(200).json(callsPerDay);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/calls-by-city?limit=8
exports.getCallsByCity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const result = await CallRecord.aggregate([
      {
        $group: {
          _id: '$city',
          calls: { $sum: 1 }
        }
      },
      { $sort: { calls: -1 } },
      { $limit: limit }
    ]);

    const callsByCity = result.map(row => ({
      city: row._id,
      calls: row.calls
    }));

    res.status(200).json(callsByCity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};