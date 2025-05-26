const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Model = mongoose.model;

const MeetingSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  meeting_code: {
    type: String,
    required: true,
  },
  participants: [
    {
      username: { type: String },
      role: { type: String, enum: ["host", "participant"] },
    },
  ],
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  status: {
    type: String,
    required: true,
    enum: ["live", "ended"],
    default: "live",
  },
});

const Meeting = new Model("Meeting", MeetingSchema);
module.exports = Meeting;
