
"use strict";

/* =========================================================
   MARIA PORTFOLIO — MONGODB PORTFOLIO MODEL
========================================================= */

const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: 100
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
      min: 1,
      max: 120
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: 150
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 150,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address"
      ]
    },

    about: {
      type: String,
      required: [true, "About information is required"],
      trim: true,
      maxlength: 2000
    },

    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
      maxlength: 150
    },

    institution: {
      type: String,
      required: [true, "Institution is required"],
      trim: true,
      maxlength: 200
    },

    year: {
      type: String,
      required: [true, "Year is required"],
      trim: true,
      maxlength: 50
    },

    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (items) =>
          items.length <= 50 &&
          items.every(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0 &&
              item.trim().length <= 100
          ),
        message: "Please enter valid skills (maximum 50)."
      }
    },

    hobbies: {
      type: [String],
      default: [],
      validate: {
        validator: (items) =>
          items.length <= 50 &&
          items.every(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0 &&
              item.trim().length <= 100
          ),
        message: "Please enter valid hobbies (maximum 50)."
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model(
  "Portfolio",
  portfolioSchema
);
  