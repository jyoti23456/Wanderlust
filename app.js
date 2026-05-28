
require("dotenv").config();

// DEBUG
const dbUrl = process.env.ATLASDB_URL;
const sessionSecret = process.env.SESSION_SECRET;

console.log("ATLASDB_URL:", dbUrl);
console.log("SESSION_SECRET:", sessionSecret);

if (!dbUrl) throw new Error("ATLASDB_URL is not defined in .env");
if (!sessionSecret) throw new Error("SESSION_SECRET is not defined in .env");

// IMPORTS
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// ROUTES
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const wishlistRouter = require("./routes/wishlist");
const bookingRoutes = require("./routes/booking");
const homeRouter = require("./routes/home");

// DATABASE CONNECTION
async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB");
}

main().catch((err) => console.log("MongoDB Error:", err));

// APP CONFIG
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ✅ SIMPLE SESSION 
app.use(session({
  secret: sessionSecret || "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
}));

app.use(flash());

// PASSPORT CONFIG
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ✅ GLOBAL MIDDLEWARE (FIXED)
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null; // FIX
  next();
});

// ROUTES
app.use("/", homeRouter);
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/wishlist", wishlistRouter);
app.use("/bookings", bookingRoutes);

// ERROR HANDLING
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// SERVER
const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});