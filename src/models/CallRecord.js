const mongoose = require('mongoose');

const callRecordSchema = new mongoose.Schema({
  recordId: { type: Number, required: true, unique: true }, // original 'id' from source data
  callerName: { type: String, required: true },
  callerNumber: { type: String, required: true },
  receiverNumber: { type: String, required: true },
  city: { type: String, required: true },
  // callDirection: true = inbound (incoming), false = outbound (outgoing)
  callDirection: { type: String, enum: ['incoming', 'outgoing'], required: true },
  // callStatus: true = answered/completed, false = missed/failed
  callStatus: { type: String, enum: ['answered', 'missed'], required: true },
  callDuration: { type: Number, required: true }, // seconds
  callCost: { type: Number, required: true },
  callStartTime: { type: Date, required: true },
  callEndTime: { type: Date, required: true }
});

module.exports = mongoose.model('CallRecord', callRecordSchema);