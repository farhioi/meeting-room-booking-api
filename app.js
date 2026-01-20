const express = require("express");

const app = express();
app.use(express.json());

// In-memory storage
let bookings = [];
let nextId = 1;

// Helper: parse and validate times
function parseTimes(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Invalid startTime or endTime" };
  }
  if (start >= end) {
    return { error: "startTime must be before endTime" };
  }
  if (start < new Date()) {
    return { error: "Bookings must not be created in the past" };
  }
  return { start, end };
}

// Helper: overlap check for a room
function hasOverlap(roomId, start, end) {
  return bookings.some((b) => {
    if (b.roomId !== roomId) return false;
    const existingStart = new Date(b.startTime);
    const existingEnd = new Date(b.endTime);
    return start < existingEnd && end > existingStart;
  });
}

// Create a booking
app.post("/bookings", (req, res) => {
  const { roomId, startTime, endTime } = req.body;

  if (!roomId || !startTime || !endTime) {
    return res.status(400).json({ error: "roomId, startTime and endTime are required" });
  }

  const { start, end, error } = parseTimes(startTime, endTime);
  if (error) return res.status(400).json({ error });

  if (hasOverlap(roomId, start, end)) {
    return res.status(400).json({ error: "Booking overlaps with an existing booking" });
  }

  const booking = {
    id: nextId++,
    roomId,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  };

  bookings.push(booking);
  return res.status(201).json(booking);
});

// Cancel a booking
app.delete("/bookings/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = bookings.findIndex((b) => b.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Booking not found" });
  }

  bookings.splice(index, 1);
  return res.status(204).send();
});

// List bookings for a meeting room
app.get("/rooms/:roomId/bookings", (req, res) => {
  const { roomId } = req.params;
  const roomBookings = bookings
    .filter((b) => b.roomId === roomId)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return res.json(roomBookings);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Meeting room booking API running on port ${PORT}`);
});
