const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

/* ======================
   AUTHENTICATION
====================== */

// Normal page auth
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {

    // ✅ Save redirect URL ONLY for GET requests
    if (req.method === "GET") {
      req.session.redirectUrl = req.originalUrl;
    }

    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
  }
  next();
};

// ✅ Used AFTER login
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl; // ✅ prevent redirect loop
  }
  next();
};

/* ======================
   AUTHORIZATION
====================== */

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // ✅ SAFE CHECK
  if (!req.user || !listing.owner.equals(req.user._id)) {
    req.flash(
      "error",
      "Sorry, only the creator of this listing can make changes"
    );
    return res.redirect(`/listings/${id}`);
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }

  // ✅ SAFE CHECK
  if (!req.user || !review.author.equals(req.user._id)) {
    req.flash(
      "error",
      "Sorry, only the author of this review can make changes"
    );
    return res.redirect(`/listings/${id}`);
  }

  next();
};

/* ======================
   VALIDATION
====================== */

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  next();
};

/* ======================
   AJAX AUTH (WISHLIST)
====================== */

module.exports.isLoggedInAjax = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      redirect: "/login"
    });
  }
  next();
};



