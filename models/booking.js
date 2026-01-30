const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    listingId: String,
    checkin: Date,
    checkout: Date,
    adults: Number,
    children: Number,
    infants: Number,
    name: String,
    email: String,
    phone: String,
    requests: String,
    paymentMethod: String,
    totalPrice: Number,
    discountCode: String,
    discountAmount: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);
