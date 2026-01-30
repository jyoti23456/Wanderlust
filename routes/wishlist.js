const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { isLoggedIn, isLoggedInAjax } = require("../middleware");

// TOGGLE WISHLIST
router.post("/:listingId", isLoggedInAjax, async (req, res) => {
  const { listingId } = req.params;
  const user = await User.findById(req.user._id);

  const index = user.wishlist.findIndex(
    id => id.toString() === listingId
  );

  let action;
  if (index === -1) {
    user.wishlist.push(listingId);
    action = "added";
  } else {
    user.wishlist.splice(index, 1);
    action = "removed";
  }

  await user.save();

  res.json({ success: true, action });
});

// SHOW ALL WISHLIST ITEMS
router.get("/", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.render("wishlists/index", { listings: user.wishlist });
});


// REMOVE FROM WISHLIST
router.delete("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { wishlist: id }
  });

  res.redirect("/wishlist");
});


module.exports = router;





