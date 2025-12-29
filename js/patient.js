import { requireAuth, clearSession } from "./auth.js";

const session = requireAuth({ allowedRoles: ["patient"] });
if (!session) {
  throw new Error("Redirecting unauthenticated user");
}

const DATA_KEY = `ethicure:patient:${session.username}`;

const defaultData = {
  departments: [
    {
      id: "cardiology",
      name: "Cardiology",
      description: "Heart & circulatory system",
    },
    {
      id: "neurology",
      name: "Neurology",
      description: "Brain & nervous system",
    },
    {
      id: "orthopedics",
      name: "Orthopedics",
      description: "Bones & muscular system",
    },
    {
      id: "pediatrics",
      name: "Pediatrics",
      description: "Child care & wellness",
    },
  ],
  doctors: [
    {
      id: "d1",
      firstName: "Riya",
      lastName: "Sen",
      specialization: "Interventional Cardiologist",
      experience: 12,
      departmentId: "cardiology",
    },
    {
      id: "d2",
      firstName: "Amit",
      lastName: "Verma",
      specialization: "Neurologist",
      experience: 9,
      departmentId: "neurology",
    },
    {
      id: "d3",
      firstName: "Sahana",
      lastName: "Roy",
      specialization: "Orthopedic Surgeon",
      experience: 15,
      departmentId: "orthopedics",
    },
    {
      id: "d4",
      firstName: "Vikram",
      lastName: "Patel",
      specialization: "Pediatrician",
      experience: 7,
      departmentId: "pediatrics",
    },
  ],
  appointments: [
    {
      id: "apt-1",
      doctorId: "d1",
      datetime: addDays(1),
      status: "confirmed",
      notes: "Follow-up for ECG",
    },
    {
      id: "apt-2",
      doctorId: "d3",
      datetime: addDays(5),
      status: "pending",
      notes: "Knee pain consultation",
    },
  ],
  prescriptions: [
    {
      id: "rx-1",
      doctorId: "d2",
      date: addDays(-10),
      dispensed: true,
      medicines: ["Neurocalm 10mg", "Omega-3"],
    },
    {
      id: "rx-2",
      doctorId: "d1",
      date: addDays(-32),
      dispensed: false,
      medicines: ["Atorvastatin 20mg", "Aspirin 75mg", "Metoprolol 50mg"],
    },
  ],
  careUpdates: [
    {
      id: "bp",
      label: "Blood pressure",
      value: "118 / 76",
      detail: "Morning clinic reading",
      trend: "stable",
    },
    {
      id: "heart",
      label: "Heart rate",
      value: "68 bpm",
      detail: "Resting average this week",
      trend: "improving",
    },
    {
      id: "sleep",
      label: "Sleep",
      value: "7h 45m",
      detail: "Rolling 7-day average",
      trend: "stable",
    },
    {
      id: "activity",
      label: "Activity",
      value: "6,400 steps",
      detail: "Goal: 8,000 daily",
      trend: "pending",
    },
  ],
  goals: [
    {
      id: "steps-goal",
      label: "Steps",
      progress: 64,
      target: "8k steps",
    },
    {
      id: "hydration-goal",
      label: "Hydration",
      progress: 72,
      target: "2L water",
    },
    {
      id: "medication-goal",
      label: "Medication adherence",
      progress: 92,
      target: "All doses",
    },
  ],
  medicationsSchedule: [
    {
      id: "med-1",
      name: "Atorvastatin",
      dosage: "20mg",
      schedule: "9:00 PM",
      context: "After dinner",
      status: "due",
    },
    {
      id: "med-2",
      name: "Metoprolol",
      dosage: "50mg",
      schedule: "8:00 AM",
      context: "With breakfast",
      status: "completed",
    },
    {
      id: "med-3",
      name: "Vitamin D3",
      dosage: "2,000 IU",
      schedule: "Sunday",
      context: "Weekly supplement",
      status: "upcoming",
    },
  ],
  checklist: [
    { id: "ck-water", label: "Log 2L of water", completed: false },
    { id: "ck-walk", label: "20 min walk", completed: false },
    { id: "ck-meditate", label: "Breathing exercise", completed: true },
  ],
  labs: [
    {
      id: "lab-1",
      title: "Lipid profile",
      date: addDays(-14),
      status: "Normal",
      summary: "LDL trending downward · HDL within range",
    },
    {
      id: "lab-2",
      title: "Comprehensive metabolic panel",
      date: addDays(-32),
      status: "Review",
      summary: "Slightly elevated fasting glucose · monitor diet",
    },
  ],
  messages: [
    {
      id: "msg-1",
      sender: "Dr. Riya Sen",
      role: "Cardiology",
      time: addDays(-1),
      snippet: "ECG looks stable. Keep the current medication plan.",
      unread: true,
    },
    {
      id: "msg-2",
      sender: "Care Navigator",
      role: "Patient Success",
      time: addDays(-3),
      snippet: "Remember to upload your insurance card for the new plan year.",
      unread: false,
    },
  ],
  billing: {
    outstanding: 240.5,
    dueDate: addDays(7),
    invoices: [
      {
        id: "inv-1",
        label: "Cardiology follow-up",
        amount: 120,
        status: "due",
        date: addDays(-5),
      },
      {
        id: "inv-2",
        label: "Lab processing",
        amount: 98.5,
        status: "processing",
        date: addDays(-2),
      },
      {
        id: "inv-3",
        label: "Medication refill",
        amount: 22,
        status: "paid",
        date: addDays(-9),
      },
    ],
  },
  benefits: {
    provider: "HealSure Gold",
    plan: "Preferred Care 80",
    memberId: "HS-23893",
    coverage: "80% in-network",
    prescriptionCoverage: "Included",
  },
  resources: [
    {
      id: "res-1",
      title: "24/7 nurse line",
      description: "Speak with a nurse within minutes.",
      actionLabel: "Call nurse",
      href: "tel:+15551234567",
    },
    {
      id: "res-2",
      title: "Download visit summary",
      description: "Latest visit notes and attachments.",
      actionLabel: "Download PDF",
      href: "#",
    },
    {
      id: "res-3",
      title: "Mental wellbeing",
      description: "Access guided meditation & support.",
      actionLabel: "Open guide",
      href: "#",
    },
  ],
};

function addDays(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString();
}

function readData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return structuredClone(defaultData);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultData),
      ...parsed,
      appointments: parsed.appointments || structuredClone(defaultData.appointments),
      prescriptions: parsed.prescriptions || structuredClone(defaultData.prescriptions),
      careUpdates: parsed.careUpdates || structuredClone(defaultData.careUpdates),
      goals: parsed.goals || structuredClone(defaultData.goals),
      medicationsSchedule: parsed.medicationsSchedule || structuredClone(defaultData.medicationsSchedule),
      checklist: parsed.checklist || structuredClone(defaultData.checklist),
      labs: parsed.labs || structuredClone(defaultData.labs),
      messages: parsed.messages || structuredClone(defaultData.messages),
      billing: parsed.billing || structuredClone(defaultData.billing),
      benefits: parsed.benefits || structuredClone(defaultData.benefits),
      resources: parsed.resources || structuredClone(defaultData.resources),
    };
  } catch (error) {
    console.warn("Failed to load patient data", error);
    return structuredClone(defaultData);
  }
}

function saveData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

const state = readData();
let selectedDepartmentId = "";

const refs = {
  name: document.querySelector("[data-session-name]"),
  patientId: document.querySelector("[data-session-patient-id]"),
  statsHost: document.querySelector("[data-patient-stats]"),
  departmentList: document.querySelector("[data-department-list]"),
  doctorList: document.querySelector("[data-doctor-list]"),
  doctorFilter: document.querySelector("[data-doctor-filter]"),
  appointmentList: document.querySelector("[data-appointment-list]"),
  prescriptionList: document.querySelector("[data-prescription-list]"),
  bookForm: document.querySelector("[data-book-form]"),
  toast: document.querySelector("[data-toast]"),
  logout: document.querySelector("[data-button-logout]"),
  departmentSelect: document.getElementById("book-department"),
  doctorSelect: document.getElementById("book-doctor"),
  feedback: document.querySelector("[data-feedback]"),
  careUpdates: document.querySelector("[data-care-updates]"),
  goalList: document.querySelector("[data-goal-list]"),
  medicationSchedule: document.querySelector("[data-medication-schedule]"),
  checklist: document.querySelector("[data-checklist]"),
  labs: document.querySelector("[data-labs]"),
  messages: document.querySelector("[data-messages]"),
  billingSummary: document.querySelector("[data-billing-summary]"),
  billingInvoices: document.querySelector("[data-billing-invoices]"),
  benefits: document.querySelector("[data-benefits]"),
  resources: document.querySelector("[data-resource-links]"),
};

refs.name.textContent = `${session.firstName ?? ""} ${session.lastName ?? ""}`.trim() || session.username;
refs.patientId.textContent = session.patientId || "Assigned on first visit";

refs.logout?.addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

render();
wireBookingForm();
wireDepartmentSelect();

function render() {
  renderCareSnapshot();
  renderGoals();
  renderMedications();
  renderChecklist();
  renderLabs();
  renderMessages();
  renderBilling();
  renderBenefits();
  renderResources();
  renderStats();
  renderDepartments();
  renderDoctors();
  renderAppointments();
  renderPrescriptions();
  hydrateSelects();
}

function renderStats() {
  if (!refs.statsHost) return;
  const upcoming = state.appointments.filter((apt) => new Date(apt.datetime) >= new Date());
  const confirmed = state.appointments.filter((apt) => apt.status === "confirmed");
  const totalDoctors = state.doctors.length;

  refs.statsHost.innerHTML = "";
  const stats = [
    {
      title: "Upcoming",
      value: upcoming.length,
      description: "Scheduled appointments",
    },
    {
      title: "Confirmed",
      value: confirmed.length,
      description: "Awaiting visit",
    },
    {
      title: "Doctors",
      value: totalDoctors,
      description: "Available specialists",
    },
  ];

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

function renderCareSnapshot() {
  if (!refs.careUpdates) return;
  refs.careUpdates.innerHTML = "";
  state.careUpdates.forEach((item) => {
    const card = document.createElement("article");
    card.className = "metric-card";
    card.innerHTML = `
      <div class="badge-subtle">${item.label}</div>
      <strong>${item.value}</strong>
      <p class="card-meta">${item.detail}</p>
    `;
    refs.careUpdates.appendChild(card);
  });
}

function renderGoals() {
  if (!refs.goalList) return;
  refs.goalList.innerHTML = "";
  state.goals.forEach((goal) => {
    const item = document.createElement("article");
    item.className = "list-item";
    item.innerHTML = `
      <div class="list-item_header">
        <div>
          <h3 style="margin: 0; font-family: var(--font-heading);">${goal.label}</h3>
          <p class="card-meta">${goal.target}</p>
        </div>
        <span class="stat-value" style="font-size: 1.2rem;">${goal.progress}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-value" style="width: ${Math.min(goal.progress, 100)}%;"></div>
      </div>
    `;
    refs.goalList.appendChild(item);
  });
}

function renderMedications() {
  if (!refs.medicationSchedule) return;
  refs.medicationSchedule.innerHTML = "";
  state.medicationsSchedule.forEach((dose) => {
    const item = document.createElement("article");
    item.className = "list-item";
    item.innerHTML = `
      <div class="list-item_header">
        <div>
          <h3 style="margin: 0; font-family: var(--font-heading);">${dose.name}</h3>
          <p class="card-meta">${dose.dosage} • ${dose.context}</p>
        </div>
        <span class="status-pill" data-status="${dose.status}">${dose.schedule}</span>
      </div>
    `;
    refs.medicationSchedule.appendChild(item);
  });
}

function renderChecklist() {
  if (!refs.checklist) return;
  refs.checklist.innerHTML = "";
  state.checklist.forEach((item) => {
    const row = document.createElement("div");
    row.className = "list-item checklist-item";
    row.innerHTML = `
      <label>
        <input type="checkbox" ${item.completed ? "checked" : ""} data-checklist="${item.id}" />
        ${item.label}
      </label>
      <span class="card-meta">${item.completed ? "Done" : "Pending"}</span>
    `;
    row.querySelector("input")?.addEventListener("change", (event) => {
      item.completed = event.target.checked;
      saveData(state);
      renderChecklist();
      showToast(item.completed ? "Great job checking that off" : "Marked as pending");
    });
    refs.checklist.appendChild(row);
  });
}

function renderLabs() {
  if (!refs.labs) return;
  refs.labs.innerHTML = "";
  state.labs
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((lab) => {
      const wrapper = document.createElement("div");
      wrapper.className = "timeline-item";
      wrapper.innerHTML = `
        <span class="timeline-dot"></span>
        <div class="timeline-card">
          <div class="list-item_header">
            <div>
              <h3 style="margin: 0; font-family: var(--font-heading);">${lab.title}</h3>
              <p class="card-meta">${formatDate(lab.date)}</p>
            </div>
            <span class="status-pill" data-status="${lab.status === "Normal" ? "completed" : "pending"}">${lab.status}</span>
          </div>
          <p class="card-meta">${lab.summary}</p>
        </div>
      `;
      refs.labs.appendChild(wrapper);
    });
}

function renderMessages() {
  if (!refs.messages) return;
  refs.messages.innerHTML = "";
  state.messages.forEach((msg) => {
    const item = document.createElement("article");
    item.className = "list-item";
    item.innerHTML = `
      <div class="list-item_header">
        <div class="list-item_meta" style="gap: 0.75rem; align-items: flex-start;">
          <div class="avatar">${msg.sender.charAt(0)}</div>
          <div>
            <h3 style="margin: 0; font-family: var(--font-heading);">${msg.sender}</h3>
            <p class="card-meta">${msg.role} • ${formatDate(msg.time)}</p>
          </div>
        </div>
        ${msg.unread ? '<span class="status-chip" data-variant="pending">New</span>' : ""}
      </div>
      <p class="card-meta">${msg.snippet}</p>
    `;
    refs.messages.appendChild(item);
  });
}

function renderBilling() {
  if (!refs.billingSummary || !refs.billingInvoices) return;
  const outstanding = state.billing?.outstanding ?? 0;
  refs.billingSummary.innerHTML = `
    <span class="card-meta">Outstanding balance</span>
    <strong>${formatCurrency(outstanding)}</strong>
    <p class="card-meta">Due ${formatDate(state.billing?.dueDate)}</p>
  `;
  refs.billingInvoices.innerHTML = "";
  (state.billing?.invoices ?? []).forEach((invoice) => {
    const item = document.createElement("article");
    item.className = "list-item";
    item.innerHTML = `
      <div class="list-item_header">
        <div>
          <h3 style="margin: 0; font-family: var(--font-heading);">${invoice.label}</h3>
          <p class="card-meta">${formatDate(invoice.date)}</p>
        </div>
        <span class="status-pill" data-status="${invoice.status}">${invoice.status}</span>
      </div>
      <div class="list-line">
        <strong>${formatCurrency(invoice.amount)}</strong>
        <button class="btn btn-outline" type="button">View</button>
      </div>
    `;
    refs.billingInvoices.appendChild(item);
  });
}

function renderBenefits() {
  if (!refs.benefits) return;
  const benefits = state.benefits || defaultData.benefits;
  refs.benefits.innerHTML = `
    <div class="list">
      <div class="list-item">
        <p class="card-meta">Provider</p>
        <strong>${benefits.provider}</strong>
      </div>
      <div class="list-item">
        <p class="card-meta">Plan</p>
        <strong>${benefits.plan}</strong>
      </div>
      <div class="list-item">
        <p class="card-meta">Member ID</p>
        <strong>${benefits.memberId}</strong>
      </div>
      <div class="list-item">
        <p class="card-meta">Coverage</p>
        <strong>${benefits.coverage}</strong>
      </div>
      <div class="list-item">
        <p class="card-meta">Prescription</p>
        <strong>${benefits.prescriptionCoverage}</strong>
      </div>
    </div>
  `;
}

function renderResources() {
  if (!refs.resources) return;
  refs.resources.innerHTML = "";
  state.resources.forEach((res) => {
    const link = document.createElement("a");
    link.href = res.href || "#";
    link.target = res.href?.startsWith("http") ? "_blank" : "_self";
    link.rel = "noreferrer";
    link.innerHTML = `
      <span>${res.title}<br /><small class="card-meta">${res.description}</small></span>
      <span>${res.actionLabel} →</span>
    `;
    refs.resources.appendChild(link);
  });
}

function renderDepartments() {
  if (!refs.departmentList) return;
  refs.departmentList.innerHTML = "";

  if (!state.departments.length) {
    refs.departmentList.innerHTML = `<p class="text-muted">No departments available.</p>`;
    return;
  }

  state.departments.forEach((dept) => {
    const item = document.createElement("article");
    item.className = "list-item";
    item.dataset.active = String(selectedDepartmentId === dept.id);
    item.innerHTML = `
      <header class="list-item_header">
        <div>
          <h3 style="margin: 0; font-family: var(--font-heading);">${dept.name}</h3>
          <p class="card-meta">${dept.description}</p>
        </div>
      </header>
    `;
    item.addEventListener("click", () => {
      selectedDepartmentId = selectedDepartmentId === dept.id ? "" : dept.id;
      renderDoctors();
      renderDepartments();
    });
    refs.departmentList.appendChild(item);
  });
}

function renderDoctors() {
  if (!refs.doctorList) return;
  const doctors = selectedDepartmentId
    ? state.doctors.filter((doc) => doc.departmentId === selectedDepartmentId)
    : state.doctors;

  refs.doctorFilter.textContent = selectedDepartmentId
    ? state.departments.find((d) => d.id === selectedDepartmentId)?.name ?? "All departments"
    : "All departments";

  refs.doctorList.innerHTML = "";
  if (!doctors.length) {
    refs.doctorList.innerHTML = `<p class="text-muted">No doctors available for this department.</p>`;
    return;
  }

  doctors.forEach((doc) => {
    const department = state.departments.find((dept) => dept.id === doc.departmentId);
    const item = document.createElement("article");
    item.className = "list-item";
    item.innerHTML = `
      <header class="list-item_header">
        <div class="list-item_meta" style="gap: 0.75rem; align-items: flex-start;">
          <div class="avatar">${doc.firstName.charAt(0)}${doc.lastName.charAt(0)}</div>
          <div>
            <h3 style="margin: 0; font-family: var(--font-heading);">Dr. ${doc.firstName} ${doc.lastName}</h3>
            <p class="card-meta">${doc.specialization} • ${doc.experience} yrs</p>
            <span class="chip">${department?.name ?? "General"}</span>
          </div>
        </div>
      </header>
      <div class="button-group">
        <button class="btn btn-outline" data-book-doctor="${doc.id}">Book appointment</button>
      </div>
    `;
    item.querySelector("button")?.addEventListener("click", () => {
      selectedDepartmentId = doc.departmentId;
      renderDepartments();
      renderDoctors();
      refs.departmentSelect.value = doc.departmentId;
      populateDoctorSelect(doc.departmentId);
      refs.doctorSelect.value = doc.id;
      showToast(`Booking form prefilled for Dr. ${doc.lastName}`);
    });
    refs.doctorList.appendChild(item);
  });
}

function renderAppointments() {
  if (!refs.appointmentList) return;
  refs.appointmentList.innerHTML = "";

  if (!state.appointments.length) {
    refs.appointmentList.innerHTML = `<p class="text-muted">No appointments scheduled yet.</p>`;
    return;
  }

  const sorted = [...state.appointments].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  sorted.forEach((apt) => {
    const doctor = state.doctors.find((doc) => doc.id === apt.doctorId);
    const item = document.createElement("article");
    item.className = "list-item";
    item.innerHTML = `
      <header class="list-item_header">
        <div>
          <h3 style="margin: 0; font-family: var(--font-heading);">${doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Doctor"}</h3>
          <div class="list-item_meta">
            <span>${new Date(apt.datetime).toLocaleString()}</span>
          </div>
        </div>
        <span class="status-pill" data-status="${apt.status}">${apt.status}</span>
      </header>
      ${apt.notes ? `<p class="card-meta">Notes: ${apt.notes}</p>` : ""}
    `;
    refs.appointmentList.appendChild(item);
  });
}

function renderPrescriptions() {
  if (!refs.prescriptionList) return;
  refs.prescriptionList.innerHTML = "";

  if (!state.prescriptions.length) {
    refs.prescriptionList.innerHTML = `<p class="text-muted">No prescriptions recorded.</p>`;
    return;
  }

  const sorted = [...state.prescriptions].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.slice(0, 5).forEach((rx) => {
    const doctor = state.doctors.find((doc) => doc.id === rx.doctorId);
    const item = document.createElement("article");
    item.className = "list-item";
    const truncated = rx.medicines.slice(0, 2).join(", ");
    const extra = rx.medicines.length > 2 ? ` +${rx.medicines.length - 2} more` : "";
    item.innerHTML = `
      <header class="list-item_header">
        <div>
          <h3 style="margin: 0; font-family: var(--font-heading);">${doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Doctor"}</h3>
          <div class="list-item_meta">
            <span>${new Date(rx.date).toLocaleDateString()}</span>
          </div>
        </div>
        <span class="status-pill" data-status="${rx.dispensed ? "completed" : "pending"}">
          ${rx.dispensed ? "Dispensed" : "Pending"}
        </span>
      </header>
      <p class="card-meta">${truncated}${extra}</p>
    `;
    refs.prescriptionList.appendChild(item);
  });
}

function hydrateSelects() {
  populateDepartmentSelect();
  populateDoctorSelect(refs.departmentSelect.value || "");
}

function populateDepartmentSelect() {
  if (!refs.departmentSelect) return;
  const current = refs.departmentSelect.value;
  refs.departmentSelect.innerHTML = `<option value="">Select department</option>`;
  state.departments.forEach((dept) => {
    const option = document.createElement("option");
    option.value = dept.id;
    option.textContent = dept.name;
    refs.departmentSelect.appendChild(option);
  });
  if (current) refs.departmentSelect.value = current;
}

function populateDoctorSelect(departmentId) {
  if (!refs.doctorSelect) return;
  const current = refs.doctorSelect.value;
  refs.doctorSelect.innerHTML = `<option value="">Select doctor</option>`;
  const doctors = departmentId ? state.doctors.filter((doc) => doc.departmentId === departmentId) : state.doctors;
  doctors.forEach((doc) => {
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = `Dr. ${doc.firstName} ${doc.lastName}`;
    refs.doctorSelect.appendChild(option);
  });
  if (current && [...refs.doctorSelect.options].some((opt) => opt.value === current)) {
    refs.doctorSelect.value = current;
  } else {
    refs.doctorSelect.value = "";
  }
}

function wireDepartmentSelect() {
  refs.departmentSelect?.addEventListener("change", (event) => {
    const departmentId = event.target.value;
    populateDoctorSelect(departmentId);
  });
}

function wireBookingForm() {
  refs.bookForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const departmentId = formData.get("department");
    const doctorId = formData.get("doctor");
    const date = formData.get("date");
    const time = formData.get("time");
    const notes = formData.get("notes")?.toString().trim() ?? "";

    if (!doctorId || !date || !time) {
      setFeedback("Please choose a doctor, date, and time.", true);
      return;
    }

    const appointment = {
      id: `apt-${Date.now()}`,
      doctorId,
      datetime: new Date(`${date}T${time}`).toISOString(),
      status: "pending",
      notes,
    };

    state.appointments.push(appointment);
    saveData(state);
    renderAppointments();
    renderStats();
    event.currentTarget.reset();
    if (departmentId) refs.departmentSelect.value = departmentId;
    populateDoctorSelect(departmentId);
    showToast("Appointment request submitted");
    setFeedback("", false);
  });
}

function setFeedback(message, isError) {
  if (!refs.feedback) return;
  refs.feedback.textContent = message;
  refs.feedback.hidden = !message;
  refs.feedback.style.color = isError ? "rgb(185, 28, 28)" : "inherit";
}

function showToast(message) {
  if (!refs.toast) return;
  refs.toast.textContent = message;
  refs.toast.dataset.show = "true";
  setTimeout(() => {
    if (refs.toast) {
      refs.toast.dataset.show = "false";
    }
  }, 2400);
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount ?? 0);
}
