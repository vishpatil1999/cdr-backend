const express = require('express');
const cors = require('cors');
const cdrRoutes = require('./routes/cdrRoutes');
const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const app = express();

app.use(cors());
app.use(express.json());

//  test
app.get('/', (req, res) => {
  res.json({ message: 'CDR Analytics API is running' });
});
app.use('/api/cdr', cdrRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
module.exports = app;