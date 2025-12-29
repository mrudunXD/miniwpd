const STORAGE_KEYS = {
  users: "ethicureUsers",
  session: "ethicureCurrentUser",
};

const ROLE_TO_PAGE = {
  patient: "patient.html",
  doctor: "doctor.html",
  admin: "admin.html",
  pharmacist: "pharmacist.html",
  staff: "staff.html",
};

function readUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.users);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse stored users", error);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function createSession(user) {
  const session = {
    username: user.username,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    patientId: user.patientId ?? null,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  return session;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to read session", error);
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

export function requireAuth({ allowedRoles = [] } = {}) {
  const session = getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }

  if (allowedRoles.length && !allowedRoles.includes(session.role)) {
    window.location.href = ROLE_TO_PAGE[session.role] || "index.html";
    return null;
  }

  return session;
}

function showStatus(message, type = "info") {
  const container = document.querySelector("[data-feedback]");
  if (!container) {
    if (message) alert(message);
    return;
  }
  container.textContent = message;
  container.dataset.type = type;
  container.hidden = !message;
}

function toggleErrors(form, errors) {
  const errorEntries = Object.entries(errors);
  errorEntries.forEach(([field, message]) => {
    const errorEl = form.querySelector(`[data-error="${field}"]`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = !message;
    }
  });
}

function handleButtonLoading(button, isLoading) {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    const loadingText = button.dataset.loadingText || "Please wait...";
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    const original = button.dataset.originalText;
    if (original) button.textContent = original;
    button.disabled = false;
  }
}

function validateLogin(formData) {
  const errors = {
    username: "",
    password: "",
  };

  if (!formData.username || formData.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!formData.password || formData.password.trim().length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

function validateSignup(formData) {
  const errors = {
    role: "",
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  };

  if (!formData.role) errors.role = "Please choose a role.";

  if (!formData.firstName || formData.firstName.trim().length < 2) {
    errors.firstName = "First name is required.";
  }

  if (!formData.lastName || formData.lastName.trim().length < 2) {
    errors.lastName = "Last name is required.";
  }

  if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!formData.username || formData.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!formData.password || formData.password.trim().length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

function noErrors(errorMap) {
  return Object.values(errorMap).every((value) => !value);
}

function generatePatientId() {
  return `PAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function onLoginSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type=submit]");
  const formData = Object.fromEntries(new FormData(form));

  const errors = validateLogin(formData);
  toggleErrors(form, errors);
  if (!noErrors(errors)) return;

  handleButtonLoading(submitButton, true);
  const users = readUsers();
  const user = users.find((u) => u.username === formData.username.trim());

  if (!user || user.password !== formData.password) {
    showStatus("Invalid username or password", "error");
    handleButtonLoading(submitButton, false);
    return;
  }

  const session = createSession(user);
  const redirect = ROLE_TO_PAGE[session.role] || "index.html";
  setTimeout(() => {
    window.location.href = redirect;
  }, 300);
}

function onSignupSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type=submit]");
  const formData = Object.fromEntries(new FormData(form));
  formData.role = formData.role || "";

  const errors = validateSignup(formData);
  toggleErrors(form, errors);
  if (!noErrors(errors)) return;

  const users = readUsers();
  if (users.some((user) => user.username === formData.username.trim())) {
    errors.username = "This username is already taken.";
    toggleErrors(form, errors);
    showStatus("Please choose a different username", "error");
    return;
  }

  handleButtonLoading(submitButton, true);

  const newUser = {
    username: formData.username.trim(),
    password: formData.password,
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email.trim(),
    role: formData.role,
    patientId: formData.role === "patient" ? generatePatientId() : null,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  showStatus("Account created! Please sign in to continue.", "success");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 400);
}

function hydrateRoleInputs(form) {
  const inputs = form.querySelectorAll(".role-input");
  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      const errors = { role: "" };
      toggleErrors(form, errors);
    });
  });
}

function wireForms() {
  const loginForm = document.getElementById("login-form");
  if (loginForm && !loginForm.dataset.wired) {
    loginForm.addEventListener("submit", onLoginSubmit);
    loginForm.dataset.wired = "true";
  }

  const signupForm = document.getElementById("signup-form");
  if (signupForm && !signupForm.dataset.wired) {
    hydrateRoleInputs(signupForm);
    signupForm.addEventListener("submit", onSignupSubmit);
    signupForm.dataset.wired = "true";
  }
}

function initAuth() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireForms, { once: true });
  } else {
    wireForms();
  }
}

const ethicureAuthAPI = {
  getSession,
  clearSession,
  requireAuth,
  showStatus,
  readUsers,
  saveUsers,
  createSession,
};

window.ethicureAuth = Object.freeze(ethicureAuthAPI);

initAuth();
