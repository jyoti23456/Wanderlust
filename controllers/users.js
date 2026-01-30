const User = require("../models/user");
const Listing = require("../models/listing");



//  SIGNUP
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};


//  LOGIN
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome to Wanderlust!");

  // redirect after login
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};



// ================= ACCOUNT PAGE =================
module.exports.renderAccount = async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error", "You must be logged in.");
      return res.redirect("/login");
    }

    const user = req.user;
    const userListings = await Listing.find({ owner: user._id });

    res.render("users/account", { user, userListings });
  } catch (err) {
    console.error(err);
    req.flash("error", "Cannot load account page");
    res.redirect("/");
  }
};

// ================= UPDATE ACCOUNT INFO =================
module.exports.updateAccount = async (req, res) => {
  try {
    const { legalName, username, phone, residentialAddress, bio } = req.body;

    const user = await User.findById(req.user._id);

    // Update fields
    if (legalName) user.legalName = legalName;
    if (username) user.username = username;
    if (phone) user.phone = phone;
    if (residentialAddress) user.residentialAddress = residentialAddress;
    if (bio) user.bio = bio;

    await user.save();

    req.flash("success", "Account updated successfully");
    res.redirect("/account");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update account");
    res.redirect("/account/edit");
  }
};

// ================= UPDATE PASSWORD =================
module.exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Validate old password
    const isValid = await user.authenticate(oldPassword);
    if (!isValid.user) {
      req.flash("error", "Old password is incorrect");
      return res.redirect("/account/password");
    }

    // Set new password using passport-local-mongoose method
    await user.setPassword(newPassword);
    await user.save();

    req.flash("success", "Password updated successfully");
    res.redirect("/account");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update password");
    res.redirect("/account/password");
  }
};



// Render profile by ID (public view)
module.exports.renderProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/");
    }

    const userListings = await Listing.find({ owner: user._id });
    const currUser = req.user || null;

    // You can add userReviews if you have a Review model
    const userReviews = []; // placeholder for now

    res.render("users/profile", { user, userListings, userReviews, currUser });
  } catch (err) {
    console.error(err);
    req.flash("error", "Cannot load profile page");
    res.redirect("/");
  }
};

// Render logged-in user's own profile
module.exports.profile = async (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be logged in to view profile");
    return res.redirect("/login");
  }

  try {
    const user = req.user;
    const userListings = await Listing.find({ owner: user._id });
    const userReviews = []; // placeholder

    res.render("users/profile", { user, userListings, userReviews });
  } catch (err) {
    console.error(err);
    req.flash("error", "Cannot load your profile");
    res.redirect("/");
  }
};
  


//  LOGOUT
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
