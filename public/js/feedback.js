
"use strict";

/* =========================================================
   VIVIN'S PORTFOLIO — CUSTOMER FEEDBACK
   Feedback submission, star ratings and display
========================================================= */

/* =========================
   1. ELEMENT REFERENCES
========================= */

const feedbackFormContainer = document.getElementById(
  "feedback-form-container"
);

const feedbackList = document.getElementById("feedback-list");

/* =========================
   2. HTML SECURITY
========================= */

function escapeFeedbackHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

/* =========================
   3. FEEDBACK API
========================= */

async function feedbackRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || "Unable to process your feedback."
    );
  }

  return result;
}

/* =========================
   4. FEEDBACK FORM
========================= */

function renderFeedbackForm() {
  if (!feedbackFormContainer) return;

  feedbackFormContainer.innerHTML = `
    <form id="feedback-form" class="form-card">

      <div class="form-heading">
        <span class="form-kicker">YOUR OPINION MATTERS</span>
        <h3>Share Your Experience</h3>
        <p>Your feedback helps make this portfolio better.</p>
      </div>

      <div class="form-grid">

        <div class="form-group">
          <label for="visitorName">Your Name *</label>
          <input
            type="text"
            id="visitorName"
            name="visitorName"
            placeholder="Enter your name"
            maxlength="100"
            required
          >
        </div>

        <div class="form-group">
          <label for="visitorEmail">Email Address *</label>
          <input
            type="email"
            id="visitorEmail"
            name="visitorEmail"
            placeholder="Enter your email"
            maxlength="150"
            required
          >
        </div>

        <div class="form-group">
          <label for="gender">Gender</label>
          <select id="gender" name="gender">
            <option value="Other">Prefer not to say</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label for="category">Feedback Category *</label>
          <select id="category" name="category" required>
            <option value="">Choose a category</option>
            <option value="General Feedback">General Feedback</option>
            <option value="Design">Design</option>
            <option value="Functionality">Functionality</option>
            <option value="Suggestion">Suggestion</option>
          </select>
        </div>

        <div class="form-group full-width">
          <label>Rate Your Experience *</label>

          <div class="rating-input" id="rating-input">
            ${[1, 2, 3, 4, 5].map((number) => `
              <button
                type="button"
                class="rating-star"
                data-rating="${number}"
                aria-label="${number} star${number > 1 ? "s" : ""}"
                aria-pressed="false"
              >★</button>
            `).join("")}
          </div>

          <input
            type="hidden"
            id="rating"
            name="rating"
            value=""
            required
          >

          <small id="rating-label">Select your rating.</small>
        </div>

        <div class="form-group full-width">
          <label for="message">Your Feedback *</label>
          <textarea
            id="message"
            name="message"
            placeholder="Write your experience or suggestions..."
            rows="5"
            minlength="3"
            maxlength="2000"
            required
          ></textarea>
        </div>

      </div>

      <div class="form-actions">
        <button type="submit" class="primary-button">
          Submit Feedback <span>↗</span>
        </button>
      </div>

      <div
        id="feedback-form-message"
        class="form-message"
        role="status"
        aria-live="polite"
      ></div>

    </form>
  `;

  initializeStarRating();

  document
    .getElementById("feedback-form")
    .addEventListener("submit", handleFeedbackSubmit);
}

/* =========================
   5. STAR RATING
========================= */

function initializeStarRating() {
  const ratingInput = document.getElementById("rating");
  const ratingLabel = document.getElementById("rating-label");
  const stars = document.querySelectorAll(".rating-star");

  if (!ratingInput || !ratingLabel) return;

  const descriptions = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent"
  };

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const selectedRating = Number(star.dataset.rating);

      ratingInput.value = selectedRating;

      ratingLabel.textContent =
        `${selectedRating}/5 — ${descriptions[selectedRating]}`;

      stars.forEach((item) => {
        const active =
          Number(item.dataset.rating) <= selectedRating;

        item.classList.toggle("selected", active);

        item.setAttribute(
          "aria-pressed",
          String(Number(item.dataset.rating) === selectedRating)
        );
      });
    });
  });
}

/* =========================
   6. SUBMIT FEEDBACK
========================= */

async function handleFeedbackSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;

  const message = document.getElementById(
    "feedback-form-message"
  );

  const submitButton = form.querySelector(
    'button[type="submit"]'
  );

  const formData = new FormData(form);

  const rating = Number(formData.get("rating"));

  const feedbackData = {
    visitorName: String(formData.get("visitorName") || "").trim(),
    visitorEmail: String(formData.get("visitorEmail") || "").trim(),
    gender: String(formData.get("gender") || "Other"),
    category: String(formData.get("category") || ""),
    rating,
    message: String(formData.get("message") || "").trim()
  };

  if (!form.reportValidity()) return;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    window.showMessage?.(
      message,
      "Please select a star rating before submitting.",
      "error"
    );
    return;
  }

  if (
    feedbackData.message.length < 3 ||
    feedbackData.message.length > 2000
  ) {
    window.showMessage?.(
      message,
      "Feedback must contain between 3 and 2000 characters.",
      "error"
    );
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    const result = await feedbackRequest("/api/feedback", {
      method: "POST",
      body: JSON.stringify(feedbackData)
    });

    window.showNotification?.(
      result.message ||
        "Thank you! Your feedback was submitted successfully.",
      "success"
    );

    form.reset();

    document.querySelectorAll(".rating-star").forEach((star) => {
      star.classList.remove("selected");
      star.setAttribute("aria-pressed", "false");
    });

    document.getElementById("rating-label").textContent =
      "Select your rating.";

    await loadFeedback();

  } catch (error) {
    window.showMessage?.(
      message,
      error.message,
      "error"
    );

  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = "Submit Feedback <span>↗</span>";
  }
}

/* =========================
   7. LOAD APPROVED FEEDBACK
========================= */

async function loadFeedback() {
  if (!feedbackList) return;

  feedbackList.innerHTML = `
    <div class="loading-state">
      <span class="loading-spinner"></span>
      <p>Loading feedback...</p>
    </div>
  `;

  try {
    const result = await feedbackRequest("/api/feedback");

    const feedbackItems = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result.feedback)
        ? result.feedback
        : [];

    renderFeedbackList(feedbackItems);

  } catch (error) {
    feedbackList.innerHTML = `
      <div class="empty-state">
        <h3>Feedback is temporarily unavailable</h3>
        <p>${escapeFeedbackHTML(error.message)}</p>

        <button
          type="button"
          class="secondary-button"
          id="retry-feedback"
        >
          Try Again
        </button>
      </div>
    `;

    document
      .getElementById("retry-feedback")
      ?.addEventListener("click", loadFeedback);
  }
}

/* =========================
   8. DISPLAY FEEDBACK CARDS
========================= */

function renderFeedbackList(feedbackItems) {
  if (!feedbackList) return;

  if (!feedbackItems.length) {
    feedbackList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✦</div>
        <h3>No published feedback yet</h3>
        <p>Be the first to share your experience.</p>
      </div>
    `;
    return;
  }

  feedbackList.innerHTML = feedbackItems.map((item) => {
    const rating = Math.min(
      5,
      Math.max(0, Number(item.rating) || 0)
    );

    const stars = "★".repeat(rating) +
      "☆".repeat(5 - rating);

    return `
      <article class="feedback-card">

        <div class="feedback-card-top">

          <div class="feedback-avatar">
            ${escapeFeedbackHTML(
              (item.visitorName || "V").charAt(0).toUpperCase()
            )}
          </div>

          <div class="feedback-person">
            <h4>${escapeFeedbackHTML(item.visitorName)}</h4>
            <span>${escapeFeedbackHTML(item.category)}</span>
          </div>

        </div>

        <div
          class="feedback-rating"
          aria-label="${rating} out of 5 stars"
        >${stars}</div>

        <p class="feedback-message">
          ${escapeFeedbackHTML(item.message)}
        </p>

      </article>
    `;
  }).join("");
}

/* =========================
   9. INITIALIZE FEEDBACK
========================= */

function initializeFeedback() {
  if (!feedbackFormContainer || !feedbackList) {
    console.error(
      "Feedback containers are missing from index.html."
    );
    return;
  }

  renderFeedbackForm();
  loadFeedback();

  console.log("Vivin Feedback management initialized.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFeedback);
} else {
  initializeFeedback();
}
