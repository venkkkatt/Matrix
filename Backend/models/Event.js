const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    default: "" 
  },
  date: { 
    type: Date, 
    required: true 
  },
  location: { 
    type: String, 
    default: "" 
  },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", required: true 
  },
  rsvp: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  category: {
    type: String,
    enum: ["technical", "cultural", "sports", "social", "other"],
    default: "other"
  },
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);