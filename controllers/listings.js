const Listing = require("../models/listing");
const User = require("../models/user"); // ✅ for wishlist

// ✅ INDEX (ALL LISTINGS + CATEGORY FILTER + WISHLIST)
module.exports.index = async (req, res) => {
  const { category } = req.query;

 let listings;

if (category) {
  listings = await Listing.find({ category }).populate("reviews");
} else {
  listings = await Listing.find({}).populate("reviews");
}

const allListings = listings.map(listing => {
  const reviewCount = listing.reviews.length;
  let rating = 0;

  if (reviewCount > 0) {
    const total = listing.reviews.reduce((sum, r) => sum + r.rating, 0);
    rating = total / reviewCount;
  }

  return {
    ...listing.toObject(),
    reviewCount,
    rating
  };
});


  // 🔹 Prepare wishlist for logged-in user
  let wishlist = [];
  if (req.user && req.user.wishlist) {
    wishlist = req.user.wishlist.map(id => id.toString()); // convert ObjectId to string
  }

  res.render("listings/index", { allListings, wishlist });
};


// ✅ CATEGORY LISTINGS ( /listings/category/:categoryName )
module.exports.categoryListings = async (req, res) => {
  const { categoryName } = req.params;

  const allowedCategories = [
    "Trending",
    "Rooms",
    "Iconic Cities",
    "Mountains",
    "Castles",
    "Amazing Pools",
    "Camping",
    "Farms",
    "Arctic",
    "Domes",
    "Boats",
  ];

  if (!allowedCategories.includes(categoryName)) {
    req.flash("error", "Invalid category!");
    return res.redirect("/listings");
  }

  const allListings = await Listing.find({ category: categoryName });

  let wishlist = [];
  if (req.user && req.user.wishlist) {
    wishlist = req.user.wishlist.map(id => id.toString());
  }

  res.render("listings/index", { allListings, wishlist });
};

// NEW LISTING FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// SHOW SINGLE LISTING
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

// CREATE LISTING
module.exports.createListing = async (req, res) => {
  const listing = new Listing(req.body.listing);

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  listing.owner = req.user._id;
  await listing.save();

  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit", { listing, originalImageUrl });
};

// UPDATE LISTING
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// DELETE LISTING
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
