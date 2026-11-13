
"use strict";

/* =========================================================
   MARIA PORTFOLIO — FEEDBACK API ROUTES
   Submit feedback and display approved feedback
========================================================= */

const express = require("express");
const rateLimit = require("express-rate-limit");
const Feedback = require("../models/Feedback");

const router = express.Router();

/* =========================
   1. RATE LIMITING
========================= */

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions. Please try again later."
  }
});

/* =========================
   2. VALIDATION HELPERS
========================= */

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateFeedback(body) {
  const feedback = {
    visitorName: cleanText(body.visitorName),
    visitorEmail: cleanText(body.visitorEmail).toLowerCase(),
    gender: cleanText(body.gender) || "Other",
    category: cleanText(body.category),
    rating: Number(body.rating),
    message: cleanText(body.message)
  };

  if (
    !feedback.visitorName ||
    !feedback.visitorEmail ||
    !feedback.category ||
    !feedback.message
  ) {
    return {
      valid: false,
      message: "Please complete all required feedback fields."
    };
  }

  if (
    feedback.visitorName.length > 100 ||
    feedback.visitorEmail.length > 150 ||
    feedback.message.length < 3 ||
    feedback.message.length > 2000
  ) {
    return {
      valid: false,
      message: "Please check the length of your entered information."
    };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(feedback.visitorEmail)) {
    return {
      valid: false,
      message: "Please enter a valid email address."
    };
  }

  if (!["Male", "Female", "Other"].includes(feedback.gender)) {
    return {
      valid: false,
      message: "Invalid gender selection."
    };
  }

  if (
    ![
      "General Feedback",
      "Design",
      "Functionality",
      "Suggestion"
    ].includes(feedback.category)
  ) {
    return {
      valid: false,
      message: "Please select a valid feedback category."
    };
  }

  if (
    !Number.isInteger(feedback.rating) ||
    feedback.rating < 1 ||
    feedback.rating > 5
  ) {
    return {
      valid: false,
      message: "Please select a rating between 1 and 5."
    };
  }

  return {
    valid: true,
    data: feedback
  };
}

/* =========================
   3. GET APPROVED FEEDBACK
========================= */

router.get("/", async (req, res) => {
  try {
    const feedback = await Feedback.find({
      approved: true
    })
      .select("visitorName category rating message createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      data: feedback,
      message: "Approved feedback retrieved successfully."
    });

  } catch (error) {
    console.error("Feedback fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve feedback."
    });
  }
});

/* =========================
   4. SUBMIT FEEDBACK
========================= */

router.post("/", feedbackLimiter, async (req, res) => {
  try {
    const validation = validateFeedback(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const feedback = await Feedback.create({
      ...validation.data,
      approved: false
    });

    return res.status(201).json({
      success: true,
      message: "Thank you! Your feedback has been submitted for approval.",
      data: {
        id: feedback._id,
        approved: feedback.approved
      }
    });

  } catch (error) {
    console.error("Feedback submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit feedback. Please try again."
    });
  }
});

/* =========================
   5. EXPORT ROUTER
========================= */

module.exports = router;
