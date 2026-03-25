const express = require("express");
const { body } = require("express-validator");
const passport = require("passport");

const router = express.Router();

const authController = require("../controllers/authController");
const { validateRegister } = require("../middleware/validateRegister");

/* ================= REGISTER ================= */
router.post(
  "/register",
  validateRegister,
  authController.register
);

/* ================= LOGIN ================= */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  authController.login
);

/* ================= GOOGLE LOGIN (REDIRECT) ================= */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/* ================= GOOGLE CALLBACK ================= */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleCallback
);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
module.exports = router;