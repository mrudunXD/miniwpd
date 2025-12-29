import { requireAuth, clearSession } from "./auth.js";

const session = requireAuth({ allowedRoles: ["staff"] });
if (!session) {
  throw new Error("Redirecting unauthenticated user");
}

const STORAGE_KEY = `ethicure:staff:${session.username}`;

const defaultData = {
  visits: [
    {
      id: "visit-1",
      patient: { firstName: "Sonia", lastName: "Kapoor", patientId: "PAT-123456" },
      doctor: "Dr. Riya Sen",
      purpose: "Follow-up",    
      notes: "Patient reported dizziness last visit",
      status: "waiting",
      visitDate: addMinutes(-30),
    },
    {
      id: "visit-2",
      patient: { firstName: "Rohan", lastName: "Das", patientId: "PAT-987654" },
      doctor: "Dr. Amit Verma",
      purpose: "MRI results review",
      notes: "Bring previous MRI scans",
      status: "in-progress",
      visitDate: addMinutes(-10),
    },
  ],
  billing: [
    {
      id: "bill-1",
      patient: "Sonia Kapoor",
      type: "Consultation",
      amount: 1200,
      dueDate: addDays(0),
      status: "pending",
    },
    {
      id: "bill-2",
      patient: "Rohan Das",
      type: "MRI Scan",
      amount: 3500,
      dueDate: addDays(-1),
      status: "overdue",
    },
  ],
  highlights: [
    { title: "Walk-ins", value: 4, description: "Patients without appointments" },
    { title: "Completed Visits", value: 12, description: "Handled by front desk" },
    { title: "Billing Collected", value: "₹18,500", description: "Settled today" },
  ],
  actions: [
    "Confirm tomorrow's appointments",
    "Send reminders for overdue bills",
    "Prepare discharge summaries",
  ],
};

function addDays(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString();
}

function addMinutes(offset) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + offset);
  return date.toISOString();
}

function readData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultData);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultData),
      ...parsed,
      visits: parsed.visits || structuredClone(defaultData.visits),
      billing: parsed.billing || structuredClone(defaultData.billing),
      highlights: parsed.highlights || structuredClone(defaultData.highlights),
      actions: parsed.actions || structuredClone(defaultData.actions),
    };
  } catch (error) {
    console.warn("Failed to load staff data", error);
    return structuredClone(defaultData);
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const state = readData();

const refs = {
  name: document.querySelector("[data-session-name]"),
  statsHost: document.querySelector("[data-staff-stats]"),
  visitList: document.querySelector("[data-visit-list]"),
  billingList: document.querySelector("[data-billing-list]"),
  reportDate: document.querySelector("[data-report-date]"),
  reportHighlights: document.querySelector("[data-report-highlights]"),
  reportActions: document.querySelector("[data-report-actions]"),
  showCheckinForm: document.querySelector("[data-show-checkin-form]"),
  hideCheckinForm: document.querySelector("[data-hide-checkin-form]"),
  checkinFormSection: document.querySelector("[data-section=checkin-form]"),
  checkinForm: document.querySelector("[data-form-checkin]"),
  checkinFeedback: document.querySelector("[data-feedback-checkin]"),
  toast: document.querySelector("[data-toast]"),
  logout: document.querySelector("[data-button-logout]"),
};

refs.name.textContent = `${session.firstName ?? ""} ${session.lastName ?? ""}`.trim() || session.username;
refs.reportDate.textContent = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

refs.logout?.addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

refs.showCheckinForm?.addEventListener("click", () => {
  refs.checkinFormSection?.removeAttribute("hidden");
  refs.checkinForm?.scrollIntoView({ behavior: "smooth" });
});

refs.hideCheckinForm?.addEventListener("click", () => {
  refs.checkinFormSection?.setAttribute("hidden", "true");
});

refs.checkinForm?.addEventListener("submit", handleCheckinSubmit);

renderAll();

function renderAll() {
  renderStats();
  renderVisits();
  renderBilling();
  renderReport();
}

function renderStats() {
  if (!refs.statsHost) return;
  const today = new Date().toDateString();
  const todaysVisits = state.visits.filter((visit) => new Date(visit.visitDate).toDateString() === today);
  const totalVisits = state.visits.length;
  const pendingBilling = state.billing.filter((bill) => bill.status !== "paid").length;

  const stats = [
    { title: "Today's Visits", value: todaysVisits.length, description: "Scheduled and walk-ins" },
    { title: "Total Visits", value: totalVisits, description: "All visits recorded" },
    { title: "Pending Bills", value: pendingBilling, description: "Require follow-up" },
  ];

  refs.statsHost.innerHTML = "";
  stats.forEach((stat) => {
    const card = document.createElement("article");
    card.className = "list-item";
    card.innerHTML = `
      <div class="card-title">${stat.title}</div>
      <div class="stat-value" style="margin: 0;">${stat.value}</div>
      <p class="card-meta">${stat.description}</p>
    `;
    refs.statsHost.appendChild(card);
  });
}

function renderVisits() {
  if (!refs.visitList) return;
  refs.visitList.innerHTML = "";

  if (!state.visits.length) {
    refs.visitList.innerHTML = `<div class="empty-state">No visits logged yet.</div>`;
    return;
  }

  const sorted = [...state.visits].sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

  sorted.forEach((visit) => {
    const item = document.createElement("article");
    item.className = "list-item";
    item.innerHTML = `
      <header class="list-item_header">
        <div>
          <h3 style="margin: 0; font-family: var(--font-heading);">${visit.patient.firstName} ${visit.patient.lastName}</h3>
          <p class="card-meta">Doctor: ${visit.doctor}</p>
          <p class="card-meta">Purpose: ${visit.purpose}</p>
          ${visit.notes ? `<p class="card-meta">Notes: ${visit.notes}</p>` : ""}
          <div class="list-item_meta">
            <span>${new Date(visit.visitDate).toLocaleString()}</span>
          </div>
        </div>
        <span class="status-pill" data-status="${mapStatus(visit.status)}">${visit.status}</span>
      </header>
    `;
    refs.visitList.appendChild(item);
  });
}

function mapStatus(status) {
  switch (status) {
    case "waiting":
      return "pending";
    case "in-progress":
      return "confirmed";
    case "completed":
      return "completed";
    default:
      return "pending";
  }
}

function renderBilling() {
  if (!refs.billingList) return;
  refs.billingList.innerHTML = "";

  if (!state.billing.length) {
    refs.billingList.innerHTML = `<div class="empty-state">No billing pending.</div>`;
    return;
  }

  state.billing.forEach((bill) => {
    const item = document.createElement("article");
    item.className = "list-item";
    item.innerHTML = `
      <header class="list-item_header">
        <div>
          <h3 style="margin: 0; font-family: var(--font-heading);">${bill.patient}</h3>
          <p class="card-meta">${bill.type}</p>
          <p class="card-meta">Amount: ₹${bill.amount.toLocaleString()}</p>
          <div class="list-item_meta">
            <span>Due: ${new Date(bill.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
        <span class="status-pill" data-status="${bill.status === "paid" ? "completed" : "pending"}">
          ${bill.status}
        </span>
      </header>
      <div class="button-group align-end">
        ${bill.status === "paid" ? "" : `<button class="btn" data-action="mark-paid" data-id="${bill.id}">Mark as paid</button>`}
        <button class="btn btn-outline" data-action="remove" data-id="${bill.id}">Remove</button>
      </div>
    `;

    item.querySelector("[data-action=mark-paid]")?.addEventListener("click", () => {
      markBillPaid(bill.id);
    });

    item.querySelector("[data-action=remove]")?.addEventListener("click", () => {
      removeBill(bill.id);
    });

    refs.billingList.appendChild(item);
  });
}

function renderReport() {
  if (!refs.reportHighlights || !refs.reportActions) return;
  refs.reportHighlights.innerHTML = "";
  refs.reportActions.innerHTML = "";

  state.highlights.forEach((highlight) => {
    const card = document.createElement("article");
    card.className = "list-item";
    card.innerHTML = `
      <h3 style="margin: 0; font-family: var(--font-heading);">${highlight.title}</h3>
      <div class="stat-value" style="margin: 0;">${highlight.value}</div>
      <p class="card-meta">${highlight.description}</p>
    `;
    refs.reportHighlights.appendChild(card);
  });

  state.actions.forEach((action) => {
    const card = document.createElement("article");
    card.className = "list-item";
    card.innerHTML = `
      <p class="card-meta">${action}</p>
    `;
    refs.reportActions.appendChild(card);
  });
}

function handleCheckinSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = formData.get("name")?.toString().trim() ?? "";
  const doctor = formData.get("doctor")?.toString().trim() ?? "";
  const time = formData.get("time")?.toString().trim() ?? "";
  const status = formData.get("status")?.toString().trim() ?? "waiting";
  const notes = formData.get("notes")?.toString().trim() ?? "";

  if (!name || !doctor || !time) {
    showFormFeedback(refs.checkinFeedback, "Please fill patient name, doctor, and appointment time.");
    return;
  }

  const visit = {
    id: `visit-${Date.now()}`,
    patient: { firstName: name.split(" ")[0] || name, lastName: name.split(" ")[1] || "", patientId: null },
    doctor,
    purpose: "Walk-in",
    notes,
    status,
    visitDate: combineTodayWithTime(time),
  };

  state.visits.push(visit);
  saveData(state);
  event.currentTarget.reset();
  showToast("Patient check-in logged");
  showFormFeedback(refs.checkinFeedback, "");
  renderAll();
}

function combineTodayWithTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function markBillPaid(id) {
  const bill = state.billing.find((b) => b.id === id);
  if (!bill) return;
  bill.status = "paid";
  saveData(state);
  showToast("Bill marked as paid");
  renderBilling();
}

function removeBill(id) {
  state.billing = state.billing.filter((bill) => bill.id !== id);
  saveData(state);
  showToast("Billing entry removed");
  renderBilling();
}

function showFormFeedback(node, message) {
  if (!node) return;
  node.textContent = message;
  node.hidden = !message;
}

function showToast(message) {
  if (!refs.toast) return;
  refs.toast.textContent = message;
  refs.toast.dataset.open = "true";
  setTimeout(() => {
    if (refs.toast) refs.toast.dataset.open = "false";
  }, 2400);
}
