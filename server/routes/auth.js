const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const validateEmail = require("deep-email-validator").validate;
const User = require("../models/User");

const router = express.Router();

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, email, password, captchaToken } = req.body;

  try {
    // 1. Verify CAPTCHA
    if (!captchaToken) {
      return res.status(400).json({ message: "Please complete the CAPTCHA" });
    }

    console.log("Verifying CAPTCHA...");
    const captchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        },
      }
    );

    console.log("CAPTCHA Response:", captchaResponse.data);

    if (!captchaResponse.data.success) {
      return res.status(400).json({ 
        message: "CAPTCHA verification failed", 
        error: captchaResponse.data["error-codes"] 
      });
    }

    // 2. Strict Email Validation
    console.log("Validating email:", email);
    const emailRes = await validateEmail({
      email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false,
    });

    if (!emailRes.valid) {
      console.log("Email validation failed:", emailRes.reason);
      return res.status(400).json({ 
        message: "Please provide a valid, active email address",
        reason: emailRes.reason 
      });
    }

    // 3. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// @route POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;