const { Router } = require("express");
const router = Router();

// pagesController
const pagesController = require("../controllers/pagesController");

// Pages
router.get("/auth/register", pagesController.register);
router.get("/auth/login", pagesController.login);

module.exports = router;