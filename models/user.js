const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    legalName: String,
    preferredFirstName: String,
    phone: String,
    address: String,

    bio: {
      type: String,
      default: "Traveler | Explorer | WanderLust Member",
    },

    // ===== WISHLIST =====
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
  },
  { timestamps: true }
);

// 🔐 Passport plugin
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);







