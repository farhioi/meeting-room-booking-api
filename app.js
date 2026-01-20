const express = require("express");

const app = express();
app.use(express.json());

// In-memory storage
let bookings = [];
let nextId = 1;

// --- Helpers ---
function errorResponse(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseIsoDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Health endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

// Parse and validate times
function parseTimes(startTime, endTime) {
  const start = parseIsoDate(startTime);
  const end = parseIsoDate(endTime);

  if (!start || !end) {
    return {
      error: {
        code: "INVALID_TIME_FORMAT",
        message: "startTime and endTime must be valid date-time values",
      },
    };
  }
  if (start >= end) {
    return {
      error: {
        code: "INVALID_TIME_RANGE",
        message: "startTime must be before endTime",
      },
    };
  }
  if (start < new Date()) {
    return {
      error: {
        code: "TIME_IN_PAST",
        message: "Bookings must not be created in the past",
      },
    };
  }
  return { start, end };
}

// Overlap check
function hasOverlap(roomId, start, end) {
  return bookings.some((b) => {
    if (b.roomId !== roomId) return false;

    const existingStart = new Date(b.startTime);
    const existingEnd = new Date(b.endTime);

    const noOverlap = end <= existingStart || start >= existingEnd;
    return !noOverlap;
  });
}

// Booking service functions
function createBooking({ roomId, startTime, endTime }) {
  if (!isNonEmptyString(roomId)) {
    return {
      error: {
        status: 400,
        code: "ROOM_ID_REQUIRED",
        message: "roomId is required and must be a non-empty string",
      },
    };
  }
  if (!isNonEmptyString(startTime) || !isNonEmptyString(endTime)) {
    return {
      error: {
        status: 400,
        code: "TIME_REQUIRED",
        message: "startTime and endTime are required",
      },
    };
  }

  const { start, end, error } = parseTimes(startTime, endTime);
  if (error) {
    return { error: { status: 400, code: error.code, message: error.message } };
  }

  const normalizedRoomId = roomId.trim();
  if (hasOverlap(normalizedRoomId, start, end)) {
    return {
      error: {
        status: 409,
        code: "OVERLAP",
        message: "Booking overlaps with an existing booking",
      },
    };
  }

  const booking = {
    id: nextId++,
    roomId: normalizedRoomId,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  };

  bookings.push(booking);
  return { booking };
}

function deleteBookingById(id) {
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) {
    return {
      error: { status: 404, code: "NOT_FOUND", message: "Booking not found" },
    };
  }
  bookings.splice(index, 1);
  return { deleted: true };
}

// --- Routes ---
app.post("/bookings", (req, res) => {
  const result = createBooking(req.body);

  if (result.error) {
    return errorResponse(res, result.error.status, result.error.code, result.error.message);
  }

  return res.status(201).json(result.booking);
});

app.delete("/bookings/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return errorResponse(res, 400, "INVALID_ID", "Booking id must be a number");
  }

  const result = deleteBookingById(id);
  if (result.error) {
    return errorResponse(res, result.error.status, result.error.code, result.error.message);
  }

  return res.status(204).send();
});

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
