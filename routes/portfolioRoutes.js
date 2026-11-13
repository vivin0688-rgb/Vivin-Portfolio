
"use strict";

/* =========================================================
   MARIA PORTFOLIO — PORTFOLIO API ROUTES
   Create, read, update, delete and search profiles
========================================================= */

const express = require("express");
const mongoose = require("mongoose");
const Portfolio = require("../models/Portfolio");

const router = express.Router();

/* =========================
   1. VALIDATION HELPERS
========================= */

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanList(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 50);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 50);
  }

  return [];
}

function validatePortfolio(body) {
  const portfolio = {
    name: cleanText(body.name),
    age: Number(body.age),
    location: cleanText(body.location),
    email: cleanText(body.email).toLowerCase(),
    about: cleanText(body.about),
    course: cleanText(body.course),
    institution: cleanText(body.institution),
    year: cleanText(body.year),
    skills: cleanList(body.skills),
    hobbies: cleanList(body.hobbies)
  };

  if (
    !portfolio.name ||
    !portfolio.location ||
    !portfolio.email ||
    !portfolio.about ||
    !portfolio.course ||
    !portfolio.institution ||
    !portfolio.year ||
    !Number.isInteger(portfolio.age) ||
    portfolio.age < 1 ||
    portfolio.age > 120
  ) {
    return {
      valid: false,
      message: "Please provide all required fields with valid values."
    };
  }

  if (
    portfolio.name.length > 100 ||
    portfolio.location.length > 150 ||
    portfolio.email.length > 150 ||
    portfolio.about.length > 2000 ||
    portfolio.course.length > 150 ||
    portfolio.institution.length > 200 ||
    portfolio.year.length > 50
  ) {
    return {
      valid: false,
      message: "One or more fields exceed the allowed length."
    };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(portfolio.email)) {
    return {
      valid: false,
      message: "Please enter a valid email address."
    };
  }

  return {
    valid: true,
    data: portfolio
  };
}

/* =========================
   2. SEARCH PROFILES
========================= */

router.get("/", async (req, res) => {
  try {
    const search = cleanText(req.query.search);

    const filter = {};

    if (search) {
      const safeSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(safeSearch, "i");

      filter.$or = [
        { name: searchRegex },
        { location: searchRegex },
        { email: searchRegex },
        { about: searchRegex },
        { course: searchRegex },
        { institution: searchRegex },
        { year: searchRegex },
        { skills: searchRegex },
        { hobbies: searchRegex }
      ];
    }

    const portfolios = await Portfolio.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      data: portfolios,
      message: "Portfolios retrieved successfully."
    });

  } catch (error) {
    console.error("Portfolio fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve portfolios."
    });
  }
});

/* =========================
   3. CREATE PROFILE
========================= */

router.post("/", async (req, res) => {
  try {
    const validation = validatePortfolio(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const portfolio = await Portfolio.create(
      validation.data
    );

    return res.status(201).json({
      success: true,
      message: "Portfolio created successfully!",
      data: portfolio
    });

  } catch (error) {
    console.error("Portfolio creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create portfolio."
    });
  }
});

/* =========================
   4. UPDATE PROFILE
========================= */

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid portfolio ID."
      });
    }

    const validation = validatePortfolio(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const portfolio = await Portfolio.findByIdAndUpdate(
      id,
      validation.data,
      {
        new: true,
        runValidators: true
      }
    );

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Portfolio updated successfully!",
      data: portfolio
    });

  } catch (error) {
    console.error("Portfolio update error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update portfolio."
    });
  }
});

/* =========================
   5. DELETE PROFILE
========================= */

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid portfolio ID."
      });
    }

    const portfolio = await Portfolio.findByIdAndDelete(id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Portfolio deleted successfully!"
    });

  } catch (error) {
    console.error("Portfolio deletion error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete portfolio."
    });
  }
});

/* =========================
   6. EXPORT ROUTER
========================= */

module.exports = router;
