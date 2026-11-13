
"use strict";

/* =========================================================
   VIVIN'S PORTFOLIO — PROFILE MANAGEMENT
   Create, edit, delete, search and display profiles
========================================================= */

/* =========================
   1. ELEMENT REFERENCES
========================= */

const portfolioFormContainer = document.getElementById(
  "portfolio-form-container"
);

const portfolioList = document.getElementById("portfolio-list");

let editingPortfolioId = null;
let allPortfolios = [];

/* =========================
   2. HTML SECURITY
========================= */

function escapePortfolioHTML(value) {
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
   3. API REQUEST HANDLER
========================= */

async function portfolioRequest(url, options = {}) {
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
      result.message || "Something went wrong. Please try again."
    );
  }

  return result;
}

/* Skills available in the profile form dropdown. */
const SKILL_OPTIONS = [
  "HTML", "CSS", "JavaScript", "Python", "C", "C++", "Java",
  "Node.js", "Express.js", "MongoDB", "SQL", "React",
  "Data Analysis", "Statistics", "Machine Learning",
  "UI/UX Design", "Graphic Design", "Figma",
  "Git", "GitHub", "Microsoft Excel",
  "Communication", "Problem Solving", "Teamwork"
];

/* =========================
   4. PORTFOLIO FORM
========================= */

function renderPortfolioForm(portfolio = null) {
  if (!portfolioFormContainer) return;

  const isEditing = Boolean(portfolio);

  const selectedSkills = Array.isArray(portfolio?.skills)
    ? portfolio.skills
    : String(portfolio?.skills || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

  const availableSkills = [
    ...SKILL_OPTIONS,
    ...selectedSkills.filter(
      (skill) => !SKILL_OPTIONS.some(
        (option) => option.toLowerCase() === skill.toLowerCase()
      )
    )
  ];

  editingPortfolioId = isEditing
    ? portfolio._id
    : null;

  portfolioFormContainer.innerHTML = `
    <form id="portfolio-form" class="form-card">

      <div class="form-heading">
        <span class="form-kicker">PERSONAL INFORMATION</span>
        <h3>${isEditing ? "Update Your Profile" : "Create Your Profile"}</h3>
        <p>Share your details and let people discover your journey.</p>
      </div>

      <div class="form-grid">

        <div class="form-group">
          <label for="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your full name"
            value="${escapePortfolioHTML(portfolio?.name)}"
            maxlength="100"
            required
          >
        </div>

        <div class="form-group">
          <label for="age">Age *</label>
          <input
            type="number"
            id="age"
            name="age"
            placeholder="Enter your age"
            value="${escapePortfolioHTML(portfolio?.age)}"
            min="1"
            max="120"
            required
          >
        </div>

        <div class="form-group">
          <label for="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="City, Country"
            value="${escapePortfolioHTML(portfolio?.location)}"
            maxlength="150"
            required
          >
        </div>

        <div class="form-group">
          <label for="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="example@email.com"
            value="${escapePortfolioHTML(portfolio?.email)}"
            maxlength="150"
            required
          >
        </div>

        <div class="form-group full-width">
          <label for="profile-about">About Me *</label>
          <textarea
            id="profile-about"
            name="about"
            placeholder="Tell us about yourself..."
            rows="4"
            maxlength="2000"
            required
          >${escapePortfolioHTML(portfolio?.about)}</textarea>
        </div>

        <div class="form-group">
          <label for="course">Course / Qualification *</label>
          <input
            type="text"
            id="course"
            name="course"
            placeholder="Your course or qualification"
            value="${escapePortfolioHTML(portfolio?.course)}"
            maxlength="150"
            required
          >
        </div>

        <div class="form-group">
          <label for="institution">Institution *</label>
          <input
            type="text"
            id="institution"
            name="institution"
            placeholder="College or institution"
            value="${escapePortfolioHTML(portfolio?.institution)}"
            maxlength="200"
            required
          >
        </div>

        <div class="form-group">
          <label for="year">Year *</label>
          <input
            type="text"
            id="year"
            name="year"
            placeholder="e.g. 2026"
            value="${escapePortfolioHTML(portfolio?.year)}"
            maxlength="50"
            required
          >
        </div>

        <div class="form-group">
          <label for="skills-dropdown-button">Skills</label>

          <div class="skills-dropdown" id="skills-dropdown">
            <details>
              <summary
                class="skills-dropdown-button"
                id="skills-dropdown-button"
                aria-label="Choose skills"
              >
                <span id="skills-selected-label">
                  ${selectedSkills.length
                    ? `${selectedSkills.length} skill${selectedSkills.length === 1 ? "" : "s"} selected`
                    : "Select your skills"}
                </span>
                <span class="skills-dropdown-arrow" aria-hidden="true">⌄</span>
              </summary>

              <div class="skills-dropdown-menu">
                <div class="skills-options">
                  ${availableSkills.map((skill) => `
                    <label class="skill-option">
                      <input
                        type="checkbox"
                        class="skill-checkbox"
                        value="${escapePortfolioHTML(skill)}"
                        ${selectedSkills.some(
                          (selected) => selected.toLowerCase() === skill.toLowerCase()
                        ) ? "checked" : ""}
                      >
                      <span>${escapePortfolioHTML(skill)}</span>
                    </label>
                  `).join("")}
                </div>

                <div class="add-custom-skill">
                  <input
                    type="text"
                    id="custom-skill-input"
                    placeholder="Add another skill"
                    maxlength="50"
                    aria-label="Add another skill"
                  >
                  <button type="button" id="add-custom-skill">Add</button>
                </div>
              </div>
            </details>

            <input
              type="hidden"
              id="skills"
              name="skills"
              value="${escapePortfolioHTML(selectedSkills.join(", "))}"
            >
          </div>

          <small>Select one or more skills, or add your own.</small>
        </div>

        <div class="form-group">
          <label for="hobbies">Hobbies</label>
          <input
            type="text"
            id="hobbies"
            name="hobbies"
            placeholder="Reading, Music, Photography"
            value="${escapePortfolioHTML(
              Array.isArray(portfolio?.hobbies)
                ? portfolio.hobbies.join(", ")
                : portfolio?.hobbies
            )}"
          >
          <small>Enter any hobbies, separated by commas.</small>
        </div>

      </div>

      <div class="form-actions">
        <button type="submit" class="primary-button">
          ${isEditing ? "Save Changes" : "Create Profile"}
          <span>↗</span>
        </button>

        ${
          isEditing
            ? `<button type="button" id="cancel-edit" class="secondary-button">
                Cancel
              </button>`
            : ""
        }
      </div>

      <div
        id="portfolio-form-message"
        class="form-message"
        role="status"
        aria-live="polite"
      ></div>

    </form>
  `;

  const form = document.getElementById("portfolio-form");

  form.addEventListener("submit", handlePortfolioSubmit);

  const skillsDropdown = document.getElementById("skills-dropdown");
  const skillsHiddenInput = document.getElementById("skills");
  const skillsSelectedLabel = document.getElementById("skills-selected-label");
  const customSkillInput = document.getElementById("custom-skill-input");
  const addCustomSkillButton = document.getElementById("add-custom-skill");

  function syncSelectedSkills() {
    const checkedSkills = Array.from(
      skillsDropdown.querySelectorAll(".skill-checkbox:checked")
    ).map((checkbox) => checkbox.value);

    skillsHiddenInput.value = checkedSkills.join(", ");
    skillsSelectedLabel.textContent = checkedSkills.length
      ? `${checkedSkills.length} skill${checkedSkills.length === 1 ? "" : "s"} selected`
      : "Select your skills";
  }

  skillsDropdown.addEventListener("change", (event) => {
    if (event.target.classList.contains("skill-checkbox")) {
      syncSelectedSkills();
    }
  });

  function addCustomSkill() {
    const skill = customSkillInput.value.trim();

    if (!skill) {
      customSkillInput.focus();
      return;
    }

    const existingCheckbox = Array.from(
      skillsDropdown.querySelectorAll(".skill-checkbox")
    ).find((checkbox) => checkbox.value.toLowerCase() === skill.toLowerCase());

    if (existingCheckbox) {
      existingCheckbox.checked = true;
    } else {
      const option = document.createElement("label");
      option.className = "skill-option";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "skill-checkbox";
      checkbox.value = skill;
      checkbox.checked = true;

      const label = document.createElement("span");
      label.textContent = skill;

      option.append(checkbox, label);
      skillsDropdown.querySelector(".skills-options").appendChild(option);
    }

    customSkillInput.value = "";
    syncSelectedSkills();
    customSkillInput.focus();
  }

  addCustomSkillButton.addEventListener("click", addCustomSkill);

  customSkillInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomSkill();
    }
  });

  const cancelButton = document.getElementById("cancel-edit");

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      editingPortfolioId = null;
      renderPortfolioForm();
    });
  }
}

/* =========================
   5. FORM DATA
========================= */

function getPortfolioFormData(form) {
  const formData = new FormData(form);

  function getText(field) {
    return String(formData.get(field) || "").trim();
  }

  function getList(field) {
    return getText(field)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return {
    name: getText("name"),
    age: Number(getText("age")),
    location: getText("location"),
    email: getText("email"),
    about: getText("about"),
    course: getText("course"),
    institution: getText("institution"),
    year: getText("year"),
    skills: getList("skills"),
    hobbies: getList("hobbies")
  };
}

/* =========================
   6. CREATE AND UPDATE
========================= */

async function handlePortfolioSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;

  const message = document.getElementById(
    "portfolio-form-message"
  );

  const submitButton = form.querySelector(
    'button[type="submit"]'
  );

  const portfolioData = getPortfolioFormData(form);

  if (!form.reportValidity()) return;

  if (
    !Number.isInteger(portfolioData.age) ||
    portfolioData.age < 1 ||
    portfolioData.age > 120
  ) {
    window.showMessage?.(
      message,
      "Please enter a valid age.",
      "error"
    );
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(portfolioData.email)) {
    window.showMessage?.(
      message,
      "Please enter a valid email address.",
      "error"
    );
    return;
  }

  const isEditing = Boolean(editingPortfolioId);

  const url = isEditing
    ? `/api/portfolios/${encodeURIComponent(editingPortfolioId)}`
    : "/api/portfolios";

  const method = isEditing ? "PUT" : "POST";

  submitButton.disabled = true;
  submitButton.textContent = "Please wait...";

  try {
    const result = await portfolioRequest(url, {
      method,
      body: JSON.stringify(portfolioData)
    });

    window.showNotification?.(
      result.message ||
        (isEditing
          ? "Profile updated successfully!"
          : "Profile created successfully!"),
      "success"
    );

    editingPortfolioId = null;

    renderPortfolioForm();
    await loadPortfolios();

  } catch (error) {
    window.showMessage?.(
      message,
      error.message,
      "error"
    );

    submitButton.disabled = false;
    submitButton.textContent = isEditing
      ? "Save Changes"
      : "Create Profile";
  }
}

/* =========================
   7. PORTFOLIO SEARCH
========================= */

function initializePortfolioSearch() {
  if (!portfolioList) return;

  let searchContainer = document.getElementById(
    "portfolio-search-container"
  );

  if (!searchContainer) {
    searchContainer = document.createElement("div");
    searchContainer.id = "portfolio-search-container";
    searchContainer.className = "portfolio-search";

    portfolioList.parentElement.insertBefore(
      searchContainer,
      portfolioList
    );
  }

  searchContainer.innerHTML = `
    <div class="search-box">
      <span class="search-icon" aria-hidden="true">⌕</span>
      <input
        type="search"
        id="portfolio-search"
        placeholder="Search profiles by name, course or skills..."
        aria-label="Search portfolio profiles"
      >
    </div>
  `;

  const searchInput = document.getElementById(
    "portfolio-search"
  );

  let searchTimer;

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
      loadPortfolios(searchInput.value.trim());
    }, 350);
  });
}

/* =========================
   8. LOAD PORTFOLIOS
========================= */

async function loadPortfolios(search = "") {
  if (!portfolioList) return;

  portfolioList.innerHTML = `
    <div class="loading-state">
      <span class="loading-spinner"></span>
      <p>Loading portfolios...</p>
    </div>
  `;

  try {
    const url = search
      ? `/api/portfolios?search=${encodeURIComponent(search)}`
      : "/api/portfolios";

    const result = await portfolioRequest(url);

    allPortfolios = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result.portfolios)
        ? result.portfolios
        : [];

    renderPortfolioList(allPortfolios);

  } catch (error) {
    portfolioList.innerHTML = `
      <div class="empty-state">
        <h3>Unable to load profiles</h3>
        <p>${escapePortfolioHTML(error.message)}</p>
        <button
          type="button"
          class="secondary-button"
          id="retry-portfolios"
        >
          Try Again
        </button>
      </div>
    `;

    document
      .getElementById("retry-portfolios")
      ?.addEventListener("click", () => {
        loadPortfolios(search);
      });
  }
}

/* =========================
   9. DISPLAY PORTFOLIO CARDS
========================= */

function renderPortfolioList(portfolios) {
  if (!portfolioList) return;

  if (!portfolios.length) {
    portfolioList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✦</div>
        <h3>No profiles found</h3>
        <p>Create a profile or try a different search.</p>
      </div>
    `;
    return;
  }

  portfolioList.innerHTML = portfolios
    .map((portfolio) => {
      const id = escapePortfolioHTML(portfolio._id);

      const skills = Array.isArray(portfolio.skills)
        ? portfolio.skills
        : [];

      const hobbies = Array.isArray(portfolio.hobbies)
        ? portfolio.hobbies
        : [];

      return `
        <article class="portfolio-card" data-id="${id}">

          <div class="portfolio-card-top">
            <div class="profile-avatar">
              ${escapePortfolioHTML(
                (portfolio.name || "V").charAt(0).toUpperCase()
              )}
            </div>

            <div class="profile-heading">
              <span class="profile-label">PORTFOLIO PROFILE</span>
              <h3>${escapePortfolioHTML(portfolio.name)}</h3>
              <p>${escapePortfolioHTML(portfolio.location)}</p>
            </div>
          </div>

          <div class="portfolio-details">

            <div class="detail-item">
              <span>AGE</span>
              <p>${escapePortfolioHTML(portfolio.age)}</p>
            </div>

            <div class="detail-item">
              <span>EMAIL</span>
              <p>${escapePortfolioHTML(portfolio.email)}</p>
            </div>

            <div class="detail-item">
              <span>COURSE</span>
              <p>${escapePortfolioHTML(portfolio.course)}</p>
            </div>

            <div class="detail-item">
              <span>INSTITUTION</span>
              <p>${escapePortfolioHTML(portfolio.institution)}</p>
            </div>

            <div class="detail-item">
              <span>YEAR</span>
              <p>${escapePortfolioHTML(portfolio.year)}</p>
            </div>

          </div>

          <div class="profile-about">
            <h4>About Me</h4>
            <p>${escapePortfolioHTML(portfolio.about)}</p>
          </div>

          <div class="profile-tags-section">
            <h4>Skills</h4>
            <div class="profile-tags">
              ${
                skills.length
                  ? skills.map((skill) =>
                      `<span class="profile-tag">${escapePortfolioHTML(skill)}</span>`
                    ).join("")
                  : "<span class='muted-text'>No skills added</span>"
              }
            </div>
          </div>

          <div class="profile-tags-section">
            <h4>Hobbies</h4>
            <div class="profile-tags">
              ${
                hobbies.length
                  ? hobbies.map((hobby) =>
                      `<span class="profile-tag">${escapePortfolioHTML(hobby)}</span>`
                    ).join("")
                  : "<span class='muted-text'>No hobbies added</span>"
              }
            </div>
          </div>

          <div class="portfolio-card-actions">
            <button
              type="button"
              class="secondary-button edit-portfolio"
              data-id="${id}"
            >
              Edit Profile
            </button>

            <button
              type="button"
              class="danger-button delete-portfolio"
              data-id="${id}"
            >
              Delete
            </button>
          </div>

        </article>
      `;
    })
    .join("");
}

/* =========================
   10. EDIT AND DELETE ACTIONS
========================= */

if (portfolioList) {
  portfolioList.addEventListener("click", async (event) => {
    const editButton = event.target.closest(".edit-portfolio");
    const deleteButton = event.target.closest(".delete-portfolio");

    if (editButton) {
      const portfolio = allPortfolios.find(
        (item) => String(item._id) === editButton.dataset.id
      );

      if (!portfolio) {
        window.showNotification?.(
          "Profile could not be found.",
          "error"
        );
        return;
      }

      renderPortfolioForm(portfolio);

      document
        .getElementById("portfolio-form-container")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      return;
    }

    if (deleteButton) {
      const id = deleteButton.dataset.id;

      const confirmed = window.confirm(
        "Are you sure you want to delete this portfolio?"
      );

      if (!confirmed) return;

      deleteButton.disabled = true;
      deleteButton.textContent = "Deleting...";

      try {
        const result = await portfolioRequest(
          `/api/portfolios/${encodeURIComponent(id)}`,
          { method: "DELETE" }
        );

        window.showNotification?.(
          result.message || "Profile deleted successfully!",
          "success"
        );

        if (String(editingPortfolioId) === String(id)) {
          editingPortfolioId = null;
          renderPortfolioForm();
        }

        await loadPortfolios(
          document.getElementById("portfolio-search")?.value.trim() || ""
        );

      } catch (error) {
        window.showNotification?.(error.message, "error");
        deleteButton.disabled = false;
        deleteButton.textContent = "Delete";
      }
    }
  });
}

/* =========================
   11. INITIALIZE PORTFOLIO
========================= */

function initializePortfolio() {
  if (!portfolioFormContainer || !portfolioList) {
    console.error(
      "Portfolio containers are missing from index.html."
    );
    return;
  }

  renderPortfolioForm();
  initializePortfolioSearch();
  loadPortfolios();

  console.log("Vivin Portfolio management initialized.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePortfolio);
} else {
  initializePortfolio();
}
