
"use strict";

/* =========================================================
   VIVIN'S PORTFOLIO — EXPRESS SERVER
   Frontend, API routes and MongoDB connection
========================================================= */

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const portfolioRoutes = require("./routes/portfolioRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();

/* =========================
   1. SERVER CONFIGURATION
========================= */

const PORT = process.env.PORT || 3025;

app.disable("x-powered-by");

/* =========================
   2. SECURITY MIDDLEWARE
========================= */

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:"
        ],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"]
      }
    }
  })
);

app.use(cors());

app.use(express.json({ limit: "20kb" }));

app.use(express.urlencoded({
  extended: true,
  limit: "20kb"
}));

/* =========================
   3. STATIC FRONTEND
========================= */

const publicDirectory = path.join(__dirname, "public");

app.use(express.static(publicDirectory));

/* =========================
   4. API ROUTES
========================= */

app.use("/api/portfolios", portfolioRoutes);
app.use("/api/feedback", feedbackRoutes);

/* =========================
   5. HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vivin Portfolio API is running.",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected"
  });
});

/* =========================
   6. FRONTEND FALLBACK
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDirectory, "index.html"));
});

/* =========================
   7. UNKNOWN API ROUTES
========================= */

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found."
  });
});

/* =========================
   8. GLOBAL ERROR HANDLER
========================= */

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected server error occurred."
        : error.message || "Internal server error."
  });
});

/* =========================
   9. DATABASE AND SERVER START
========================= */

async function startServer() {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        "MONGODB_URI is missing from the .env file."
      );
    }

    await mongoose.connect(mongoURI);

    console.log("Successfully connected to Vivin's MongoDB database!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Vivin Portfolio running at http://localhost:${PORT}`
      );

      console.log("Server is ready.");
    });

  } catch (error) {
    console.error(
      "Unable to start Vivin Portfolio:",
      error.message
    );

    process.exit(1);
  }
}

startServer();
