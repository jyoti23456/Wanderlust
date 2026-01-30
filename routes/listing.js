const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const Listing = require("../models/listing");
const upload = multer({ storage });



// FIX: convert listing.image to object BEFORE JOI validation
const formatImage = (req, res, next) => {
  if (req.body.listing) {
    let img = req.body.listing.image;

    if (typeof img === "string" && img.trim() !== "") {
      req.body.listing.image = {
        filename: "listingimage",
        url: img,
      };
    }
  }
  next();
};


// search route
  router.get("/search", async (req, res) => {
    const { q } = req.query;

    if (!q) return res.json([]);

    const listings = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    }).limit(6);

    res.json(listings);
  });



// INDEX + CREATE
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
  isLoggedIn,
  upload.single("image"),
  formatImage,
  validateListing,
  wrapAsync(listingController.createListing)
);


// NEW LISTING FORM
router.get("/new", isLoggedIn, listingController.renderNewForm);

// category
router.get(
  "/category/:categoryName",
  wrapAsync(listingController.categoryListings)
);


// SHOW / UPDATE / DELETE
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );


// EDIT FORM
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// Show booking page
// Show booking page
router.get("/:id/book", async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.redirect("/listings"); // fallback
    res.render("bookings/booking", { listing });
});


module.exports = router;


