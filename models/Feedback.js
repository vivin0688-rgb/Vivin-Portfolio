
"use strict";

/* =========================================================
   MARIA PORTFOLIO — MONGODB FEEDBACK MODEL
========================================================= */

const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: [true, "Visitor name is required"],
      trim: true,
      maxlength: 100
    },

    visitorEmail: {
      type: String,
      required: [true, "Visitor email is required"],
      trim: true,
      lowercase: true,
      maxlength: 150,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address"
      ]
    },

    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"]
    },

    category: {
      type: String,
      required: true,
      enum: [
        "General Feedback",
        "Design",
        "Functionality",
        "Suggestion"
      ]
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number."
      }
    },

    message: {
      type: String,
      required: [true, "Feedback message is required"],
      trim: true,
      minlength: 3,
      maxlength: 2000
    },

    approved: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model(
  "Feedback",
  feedbackSchema
);
