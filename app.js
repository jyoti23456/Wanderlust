
require("dotenv").config();  

// DEBUG: Check environment variables
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
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const bookingRoutes = require("./routes/booking");


// Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const wishlistRouter = require("./routes/wishlist");



// DATABASE CONNECTION
async function main() {
  await mongoose.connect(dbUrl);
  // console.log("Connected to MongoDB");
}

main().catch((err) => console.log("MongoDB Connection Error:", err));




// APP CONFIG
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);



app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));



// SESSION STORE FIX
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: sessionSecret, 
  },
  touchAfter: 24 * 3600, // 24 hours
});

store.on("error", (err) => {
  console.log("Mongo Store Error:", err);
});

// SESSION CONFIGURATION
const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET || "thisshouldbeabettersecret", 
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, 
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions)); 
app.use(flash());

// PASSPORT CONFIG
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// GLOBAL MIDDLEWARE
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; 
  next();
});

// home
const homeRouter = require("./routes/home");

app.use("/", homeRouter);

// ROUTES booking
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/listings", listingRouter);
// only for POST /bookings


// ROUTES
app.use("/", userRouter);
app.use("/wishlist", wishlistRouter); 
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);


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
  console.log(`Server is listening on port ${port}`);
});



