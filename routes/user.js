const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/users.js");
const User = require("../models/user");



// ================= SIGNUP ROUTES =================
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

// ================= LOGIN ROUTES =================
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );



// ================= ACCOUNT ROUTES =================
router.get("/account", isLoggedIn, userController.renderAccount);

router.get("/account/edit", isLoggedIn, (req, res) => {
  res.render("users/edit", { user: req.user });
});

router.post("/account/edit", isLoggedIn, wrapAsync(userController.updateAccount));

router.get("/account/password", isLoggedIn, (req, res) => {
  res.render("users/password", { user: req.user });
});

router.post("/account/password", isLoggedIn, wrapAsync(userController.updatePassword));


// Logged-in user's profile
router.get("/profile", isLoggedIn, userController.profile);

// Public profile by ID (login optional)
router.get("/profile/:id", userController.renderProfileById);



// ================= LOGOUT =================
router.get("/logout", userController.logout);

module.exports = router;

