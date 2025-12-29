import { requireAuth, clearSession } from "./auth.js";

const session = requireAuth({ allowedRoles: ["doctor"] });
if (!session) {
  throw new Error("Redirecting unauthenticated user");
}

const DATA_KEY = `ethicure:doctor:${session.username}`;

const defaultData = {
  profile: {
    specialization: "General Medicine",
    department: "Internal Medicine",
  },
  appointments: [
    {
      id: "apt-101",
      patient: { firstName: "Sonia", lastName: "Kapoor" },
      datetime: addHours(2),
      status: "pending",
      notes: "Complaints of chest discomfort",
    },
    {
      id: "apt-102",
      patient: { firstName: "Rohan", lastName: "Das" },
      datetime: addHours(5),
      status: "confirmed",
      notes: "Routine follow-up",
    },
    {
      id: "apt-103",
      patient: { firstName: "Nisha", lastName: "Gill" },
      datetime: addHours(-3),
      status: "completed",
      notes: "Migraine check-in",
    },
  ],
  prescriptions: [
    {
      id: "rx-201",
      appointmentId: "apt-103",
      patient: { firstName: "Nisha", lastName: "Gill" },
      createdAt: addHours(-2),
      medicines: [
        { name: "Sumatriptan 50mg", dosage: "1 tablet", duration: "As needed", frequency: "Twice daily" },
      ],
      notes: "Take at onset of symptoms",
    },
  ],
};

function addHours(offset) {
  const date = new Date();
  date.setHours(date.getHours() + offset);
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
    };
  } catch (error) {
    console.warn("Failed to load doctor data", error);
    return structuredClone(defaultData);
  }
}

function saveData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

const state = readData();
let selectedAppointmentId = null;
let draftMedicines = [];
let draftNotes = "";

const refs = {
  name: document.querySelector("[data-session-name]"),
  specialization: document.querySelector("[data-doctor-specialization]"),
  department: document.querySelector("[data-doctor-department]"),
  statsHost: document.querySelector("[data-doctor-stats]"),
  appointmentList: document.querySelector("[data-appointment-list]"),
  prescriptionList: document.querySelector("[data-prescription-list]"),
  prescriptionForm: document.querySelector("[data-prescription-form]"),
  prescriptionContext: document.querySelector("[data-prescription-context]"),
  prescriptionEmpty: document.querySelector("[data-prescription-empty]"),
  prescriptionFeedback: document.querySelector("[data-prescription-feedback]"),
  addMedicine: document.querySelector("[data-add-medicine]"),
  medicineList: document.querySelector("[data-medicine-list]"),
  notesInput: document.getElementById("prescription-notes"),
  cancelPrescription: document.querySelector("[data-cancel-prescription]"),
  toast: document.querySelector("[data-toast]"),
  logout: document.querySelector("[data-button-logout]"),
};

refs.name.textContent = `${session.firstName ?? ""} ${session.lastName ?? ""}`.trim() || session.username;
refs.specialization.textContent = state.profile.specialization;
refs.department.textContent = state.profile.department;

refs.logout?.addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

refs.addMedicine?.addEventListener("click", () => {
  addDraftMedicine();
  renderMedicineInputs();
});

refs.notesInput?.addEventListener("input", (event) => {
  draftNotes = event.target.value;
});

refs.cancelPrescription?.addEventListener("click", () => {
  resetPrescriptionForm();
});

refs.prescriptionForm?.addEventListener("submit", handlePrescriptionSubmit);

render();

function render() {
  renderStats();
  renderAppointments();
  renderPrescriptions();
  syncPrescriptionSection();
}

function renderStats() {
  if (!refs.statsHost) return;
  const today = new Date().toDateString();
  const todaysAppointments = state.appointments.filter(
    (apt) => new Date(apt.datetime).toDateString() === today
  );
  const pending = state.appointments.filter((apt) => apt.status === "pending");
  const confirmed = state.appointments.filter((apt) => apt.status === "confirmed");

  const stats = [
    { title: "Today's Appointments", value: todaysAppointments.length },
    { title: "Pending", value: pending.length },
    { title: "Confirmed", value: confirmed.length },
  ];

  refs.statsHost.innerHTML = "";
  stats.forEach((stat) => {
    const card = document.createElement("article");
    card.className = "list-item";
    card.innerHTML = `
      <div class="card-title">${stat.title}</div>
      <div class="stat-value" style="margin: 0;">${stat.value}</div>
    `;
    refs.statsHost.appendChild(card);
  });
}

function renderAppointments() {
  if (!refs.appointmentList) return;
  refs.appointmentList.innerHTML = "";

  if (!state.appointments.length) {
    refs.appointmentList.innerHTML = `<div class="empty-state">No appointments scheduled.</div>`;
    return;
  }

  const sorted = [...state.appointments].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  sorted.forEach((apt) => {
    const item = document.createElement("article");
    item.className = "list-item";
    item.dataset.active = String(selectedAppointmentId === apt.id);
    item.innerHTML = `
      <header class="list-item_header">
        <div>
          <h3 style="margin: 0; font-family: var(--font-heading);">${apt.patient.firstName} ${apt.patient.lastName}</h3>
          <div class="list-item_meta">
            <span>${new Date(apt.datetime).toLocaleString()}</span>
          </div>
          ${apt.notes ? `<p class="card-meta">Notes: ${apt.notes}</p>` : ""}
        </div>
        <span class="status-pill" data-status="${apt.status}">${apt.status}</span>
      </header>
      <div class="button-group align-end">
        ${renderAppointmentButtons(apt)}
      </div>
    `;

    bindAppointmentActions(item, apt);
    refs.appointmentList.appendChild(item);
  });
}

function renderAppointmentButtons(appointment) {
  const actions = [];
  if (appointment.status === "pending") {
    actions.push(`<button class="btn btn-outline" data-action="confirm">Confirm</button>`);
  }
  if (appointment.status === "pending" || appointment.status === "confirmed") {
    actions.push(`<button class="btn" data-action="prescribe">Add Prescription</button>`);
    actions.push(`<button class="btn btn-outline" data-action="complete">Complete</button>`);
  }
  if (!actions.length) {
    actions.push(`<span class="button-pill">No actions</span>`);
  }
  return actions.join("\n");
}

function bindAppointmentActions(item, appointment) {
  item.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "confirm") {
        updateAppointmentStatus(appointment.id, "confirmed");
      } else if (action === "complete") {
        updateAppointmentStatus(appointment.id, "completed");
      } else if (action === "prescribe") {
        openPrescriptionForm(appointment.id);
      }
    });
  });
}

function updateAppointmentStatus(id, status) {
  const appointment = state.appointments.find((apt) => apt.id === id);
  if (!appointment) return;
  appointment.status = status;
  saveData(state);
  showToast(`Appointment ${status}`);
  render();
}

function openPrescriptionForm(appointmentId) {
  selectedAppointmentId = appointmentId;
  const appointment = state.appointments.find((apt) => apt.id === appointmentId);
  if (!appointment) return;

  draftMedicines = [createEmptyMedicine()];
  draftNotes = "";
  if (refs.notesInput) refs.notesInput.value = "";

  refs.prescriptionContext.textContent = `For ${appointment.patient.firstName} ${appointment.patient.lastName} on ${new Date(appointment.datetime).toLocaleString()}`;
  refs.prescriptionEmpty.hidden = true;
  refs.prescriptionForm.hidden = false;
  renderMedicineInputs();
  syncAppointmentHighlights();
}

function syncAppointmentHighlights() {
  document.querySelectorAll("[data-appointment-list] .list-item").forEach((el) => {
    const header = el.querySelector(".button-group [data-action]");
    // dataset on parent already set during render; re-render will handle. No-op.
  });
  renderAppointments();
}

function renderMedicineInputs() {
  if (!refs.medicineList) return;
  refs.medicineList.innerHTML = "";

  draftMedicines.forEach((medicine, index) => {
    const wrapper = document.createElement("article");
    wrapper.className = "medicine-card";
    wrapper.dataset.index = String(index);
    wrapper.innerHTML = `
      <div class="list-item_header">
        <h4 style="margin: 0; font-family: var(--font-heading);">Medicine ${index + 1}</h4>
        ${draftMedicines.length > 1 ? `<button type="button" class="btn btn-outline" data-remove>Remove</button>` : ""}
      </div>
      <div class="medicine-fields">
        <input class="form-input" name="name" placeholder="Medicine name" value="${medicine.name}" />
        <input class="form-input" name="dosage" placeholder="Dosage (e.g., 500mg)" value="${medicine.dosage}" />
        <input class="form-input" name="duration" placeholder="Duration (e.g., 7 days)" value="${medicine.duration}" />
        <input class="form-input" name="frequency" placeholder="Frequency (e.g., Twice daily)" value="${medicine.frequency}" />
      </div>
    `;

    wrapper.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", (event) => {
        const target = event.target;
        const field = target.name;
        draftMedicines[index][field] = target.value;
      });
    });

    const removeBtn = wrapper.querySelector("[data-remove]");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        draftMedicines.splice(index, 1);
        renderMedicineInputs();
      });
    }

    refs.medicineList.appendChild(wrapper);
  });
}

function handlePrescriptionSubmit(event) {
  event.preventDefault();
  if (!selectedAppointmentId) {
    showPrescriptionFeedback("Select an appointment first.", true);
    return;
  }

  const cleaned = draftMedicines
    .map((med) => ({
      name: med.name.trim(),
      dosage: med.dosage.trim(),
      duration: med.duration.trim(),
      frequency: med.frequency.trim(),
    }))
    .filter((med) => med.name && med.dosage);

  if (!cleaned.length) {
    showPrescriptionFeedback("Add at least one medicine with a name and dosage.", true);
    return;
  }

  const appointment = state.appointments.find((apt) => apt.id === selectedAppointmentId);
  if (!appointment) return;

  const prescription = {
    id: `rx-${Date.now()}`,
    appointmentId: appointment.id,
    patient: structuredClone(appointment.patient),
    createdAt: new Date().toISOString(),
    medicines: cleaned,
    notes: draftNotes.trim(),
  };

  state.prescriptions.unshift(prescription);
  appointment.status = "completed";
  saveData(state);

  showToast("Prescription saved");
  resetPrescriptionForm();
  render();
}

function resetPrescriptionForm() {
  selectedAppointmentId = null;
  draftMedicines = [];
  draftNotes = "";
  if (refs.notesInput) refs.notesInput.value = "";
  if (refs.prescriptionForm) refs.prescriptionForm.reset?.();
  refs.prescriptionForm.hidden = true;
  refs.prescriptionEmpty.hidden = false;
  refs.prescriptionContext.textContent = "No appointment selected";
  showPrescriptionFeedback("", false);
  renderAppointments();
}

function showPrescriptionFeedback(message, isError) {
  if (!refs.prescriptionFeedback) return;
  refs.prescriptionFeedback.textContent = message;
  refs.prescriptionFeedback.hidden = !message;
  refs.prescriptionFeedback.style.color = isError ? "rgb(185, 28, 28)" : "inherit";
}

function renderPrescriptions() {
  if (!refs.prescriptionList) return;
  refs.prescriptionList.innerHTML = "";

  if (!state.prescriptions.length) {
    refs.prescriptionList.innerHTML = `<div class="empty-state">No prescriptions created yet.</div>`;
    return;
  }

  state.prescriptions
    .slice(0, 6)
    .forEach((rx) => {
      const item = document.createElement("article");
      item.className = "list-item";
      const medicinesPreview = rx.medicines
        .map((med) => `${med.name} (${med.dosage})`)
        .slice(0, 2)
        .join(", ");
      const extraCount = rx.medicines.length > 2 ? ` +${rx.medicines.length - 2} more` : "";
      item.innerHTML = `
        <header class="list-item_header">
          <div>
            <h3 style="margin: 0; font-family: var(--font-heading);">${rx.patient.firstName} ${rx.patient.lastName}</h3>
            <div class="list-item_meta">
              <span>${new Date(rx.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <span class="status-pill" data-status="completed">Issued</span>
        </header>
        <p class="card-meta">${medicinesPreview}${extraCount}</p>
        ${rx.notes ? `<p class="card-meta">Notes: ${rx.notes}</p>` : ""}
      `;
      refs.prescriptionList.appendChild(item);
    });
}

function addDraftMedicine() {
  draftMedicines.push(createEmptyMedicine());
}

function createEmptyMedicine() {
  return {
    name: "",
    dosage: "",
    duration: "",
    frequency: "",
  };
}

function syncPrescriptionSection() {
  if (!selectedAppointmentId) {
    refs.prescriptionForm.hidden = true;
    refs.prescriptionEmpty.hidden = false;
  }
}

function showToast(message) {
  if (!refs.toast) return;
  refs.toast.textContent = message;
  refs.toast.dataset.open = "true";
  setTimeout(() => {
    if (refs.toast) {
      refs.toast.dataset.open = "false";
    }
  }, 2400);
}
