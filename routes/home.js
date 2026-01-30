const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home");

// Home page route
router.get("/", homeController.renderHome);

module.exports = router;
