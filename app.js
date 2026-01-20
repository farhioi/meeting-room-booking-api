const express = require("express");

const app = express();
app.use(express.json());

// In-memory storage
let bookings = [];
let nextId = 1;


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
});


// Helper: parse and validate times
function parseTimes(startTime, endTime) {
  const start = parseIsoDate(startTime);
  const end = parseIsoDate(endTime);

  if (!start || !end) {
    return { error: { code: "INVALID_TIME_FORMAT", message: "startTime and endTime must be valid date-time values" } };
  }
  if (start >= end) {
    return { error: { code: "INVALID_TIME_RANGE", message: "startTime must be before endTime" } };
  }
  if (start < new Date()) {
    return { error: { code: "TIME_IN_PAST", message: "Bookings must not be created in the past" } };
  }
  return { start, end };
}

// Helper: overlap check for a room
function hasOverlap(roomId, start, end) {
  return bookings.some((b) => {
    if (b.roomId !== roomId) return false;

    const existingStart = new Date(b.startTime);
    const existingEnd = new Date(b.endTime);

    // No overlap if the new booking ends before the existing starts,
    // or starts after the existing ends.
    const noOverlap = end <= existingStart || start >= existingEnd;
    return !noOverlap;
  });
}

// Create a booking
app.post("/bookings", (req, res) => {
   const { roomId, startTime, endTime } = req.body;

  if (!isNonEmptyString(roomId)) {
    return errorResponse(res, 400, "ROOM_ID_REQUIRED", "roomId is required and must be a non-empty string");
  }
  if (!isNonEmptyString(startTime) || !isNonEmptyString(endTime)) {
    return errorResponse(res, 400, "TIME_REQUIRED", "startTime and endTime are required");
  }

  const { start, end, error } = parseTimes(startTime, endTime);
  if (error) return errorResponse(res, 400, error.code, error.message);


   if (hasOverlap(roomId, start, end)) {
    return errorResponse(res, 409, "OVERLAP", "Booking overlaps with an existing booking");
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
    return errorResponse(res, 404, "NOT_FOUND", "Booking not found");
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
