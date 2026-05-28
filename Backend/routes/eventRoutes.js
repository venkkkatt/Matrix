const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Event = require("../models/Event");

router.get("/", protect, async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "userName fullName profilePic")
      
      .sort({ date: 1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error(error);
  res.status(500).json({
    success: false,
    message: error.message,
  });
  }
});

router.post("/create", protect, async (req, res) => {
  try {
    const { title, description, date, location, category } = req.body;
    const event = await Event.create({
      title, description, date, location, category,
      organizer: req.user._id,
    });
    await event.populate("organizer", "userName fullName profilePic");
    res.status(201).json({ success: true, event });
  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.put("/:id/rsvp", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    const hasRsvp = event.rsvp.includes(req.user._id);
    if (hasRsvp) {
      event.rsvp = event.rsvp.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      event.rsvp.push(req.user._id);
    }
    await event.save();
    res.status(200).json({ success: true, going: !hasRsvp, count: event.rsvp.length });
  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;