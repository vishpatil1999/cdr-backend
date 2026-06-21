require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const CallRecord = require('../models/CallRecord');

const FILE_PATH = path.join(__dirname, '../../data/mock_call_records_10000.xlsx');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const workbook = xlsx.readFile(FILE_PATH);
  const sheetName = workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  console.log(`Read ${rows.length} rows from Excel`);

  const records = rows.map(row => ({
    recordId: row.id,
    callerName: row.callerName,
    callerNumber: String(row.callerNumber),
    receiverNumber: String(row.receiverNumber),
    city: row.city,
    callDirection: row.callDirection === true ? 'incoming' : 'outgoing',
    callStatus: row.callStatus === true ? 'answered' : 'missed',
    callDuration: row.callDuration,
    callCost: row.callCost,
    callStartTime: new Date(row.callStartTime),
    callEndTime: new Date(row.callEndTime)
  }));

  await CallRecord.deleteMany({}); // clear existing records before inserting new ones
  await CallRecord.insertMany(records);

  console.log(`Inserted ${records.length} call records`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});