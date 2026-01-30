const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");

// CREATE BOOKING
router.post("/bookings", async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();

        res.json({
            success: true,
            bookingId: newBooking._id
        });
    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            message: "Booking failed"
        });
    }
});

module.exports = router;
