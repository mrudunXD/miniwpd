import { requireAuth, clearSession } from "./auth.js";

const session = requireAuth({ allowedRoles: ["pharmacist"] });
if (!session) {
  throw new Error("Redirecting unauthenticated user");
}

const STORAGE_KEY = `ethicure:pharmacist:${session.username}`;

const defaultData = {
  prescriptions: [
    {
      id: "rx-501",
      patient: { firstName: "Sonia", lastName: "Kapoor" },
      doctor: "Dr. Riya Sen",
      createdAt: addHours(-4),
      dispensed: false,
      notes: "Check blood pressure before dispensing.",
      medicines: [
        { name: "Amlodipine 5mg", dosage: "1 tablet", duration: "30 days", frequency: "Once daily" },
        { name: "Atorvastatin 20mg", dosage: "1 tablet", duration: "30 days", frequency: "Once daily" },
      ],
    },
    {
      id: "rx-502",
      patient: { firstName: "Rohan", lastName: "Das" },
      doctor: "Dr. Amit Verma",
      createdAt: addHours(-12),
      dispensed: true,
      notes: "Patient informed about potential drowsiness.",
      medicines: [
        { name: "Gabapentin 300mg", dosage: "1 capsule", duration: "14 days", frequency: "Twice daily" },
      ],
    },
  ],
  inventory: [
    { id: "med-1", medicineName: "Aspirin", stock: 120, unit: "tablets", lowStockThreshold: 25 },
    { id: "med-2", medicineName: "Metformin", stock: 60, unit: "tablets", lowStockThreshold: 20 },
    { id: "med-3", medicineName: "Insulin", stock: 12, unit: "vials", lowStockThreshold: 15 },
  ],
};

function addHours(offset) {
  const date = new Date();
  date.setHours(date.getHours() + offset);
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
      prescriptions: parsed.prescriptions || structuredClone(defaultData.prescriptions),
      inventory: parsed.inventory || structuredClone(defaultData.inventory),
    };
  } catch (error) {
    console.warn("Failed to load pharmacist data", error);
    return structuredClone(defaultData);
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const state = readData();
let filterStatus = "all";

const refs = {
  name: document.querySelector("[data-session-name]"),
  statsHost: document.querySelector("[data-pharmacist-stats]"),
  prescriptionList: document.querySelector("[data-prescription-list]"),
  inventoryList: document.querySelector("[data-inventory-list]"),
  filterSelect: document.querySelector("[data-filter-status]"),
  inventoryFormSection: document.querySelector("[data-section=inventory-form]"),
  toggleInventoryForm: document.querySelector("[data-toggle-inventory-form]"),
  closeInventoryForm: document.querySelector("[data-close-inventory-form]"),
  inventoryForm: document.querySelector("[data-form-inventory]"),
  inventoryFeedback: document.querySelector("[data-feedback-inventory]"),
  toast: document.querySelector("[data-toast]"),
  logout: document.querySelector("[data-button-logout]"),
};

refs.name.textContent = `${session.firstName ?? ""} ${session.lastName ?? ""}`.trim() || session.username;

refs.logout?.addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

refs.filterSelect?.addEventListener("change", (event) => {
  filterStatus = event.target.value;
  renderPrescriptions();
  renderStats();
});

refs.toggleInventoryForm?.addEventListener("click", () => {
  refs.inventoryFormSection?.removeAttribute("hidden");
  refs.inventoryForm?.scrollIntoView({ behavior: "smooth" });
});

refs.closeInventoryForm?.addEventListener("click", () => {
  refs.inventoryFormSection?.setAttribute("hidden", "true");
});

refs.inventoryForm?.addEventListener("submit", handleInventorySubmit);

renderAll();

function renderAll() {
  renderStats();
  renderPrescriptions();
  renderInventory();
}

function renderStats() {
  if (!refs.statsHost) return;
  const pending = state.prescriptions.filter((rx) => !rx.dispensed).length;
  const totalInventory = state.inventory.length;
  const lowStock = state.inventory.filter((item) => item.stock <= item.lowStockThreshold).length;

  const stats = [
    { title: "Pending", value: pending, description: "Prescriptions awaiting dispensing" },
    { title: "Inventory Items", value: totalInventory, description: "Active medicines in stock" },
    { title: "Low Stock", value: lowStock, description: "Items below threshold" },
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

function renderPrescriptions() {
  if (!refs.prescriptionList) return;
  refs.prescriptionList.innerHTML = "";

  const filtered = state.prescriptions.filter((rx) => {
    if (filterStatus === "pending") return !rx.dispensed;
    if (filterStatus === "dispensed") return rx.dispensed;
    return true;
  });

  if (!filtered.length) {
    refs.prescriptionList.innerHTML = `<div class="empty-state">No prescriptions found for this filter.</div>`;
    return;
  }

  filtered.forEach((rx) => {
    const item = document.createElement("article");
    item.className = "list-item";
    item.innerHTML = `
      <header class="list-item_header">
        <div>
          <h3 style="margin: 0; font-family: var(--font-heading);">${rx.patient.firstName} ${rx.patient.lastName}</h3>
          <p class="card-meta">Prescribed by ${rx.doctor}</p>
          <div class="list-item_meta"><span>${new Date(rx.createdAt).toLocaleString()}</span></div>
        </div>
        <span class="status-pill" data-status="${rx.dispensed ? "completed" : "pending"}">
          ${rx.dispensed ? "Dispensed" : "Pending"}
        </span>
      </header>
      <div class="list" style="gap: 0.5rem;">
        ${rx.medicines
          .map(
            (med) => `
              <div class="medicine-card">
                <div class="medicine-fields">
                  <span class="card-meta">${med.name}</span>
                  <span class="card-meta">${med.dosage}</span>
                  <span class="card-meta">${med.frequency}</span>
                  <span class="card-meta">${med.duration}</span>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
      ${rx.notes ? `<p class="card-meta">Notes: ${rx.notes}</p>` : ""}
      <div class="button-group align-end">
        ${rx.dispensed ? "" : `<button class="btn" data-action="dispense" data-id="${rx.id}">Mark as dispensed</button>`}
      </div>
    `;

    item.querySelector("[data-action=dispense]")?.addEventListener("click", () => {
      markPrescriptionDispensed(rx.id);
    });

    refs.prescriptionList.appendChild(item);
  });
}

function renderInventory() {
  if (!refs.inventoryList) return;
  refs.inventoryList.innerHTML = "";

  if (!state.inventory.length) {
    refs.inventoryList.innerHTML = `<div class="empty-state">No medicines in inventory.</div>`;
    return;
  }

  state.inventory.forEach((item) => {
    const isLow = item.stock <= item.lowStockThreshold;
    const el = document.createElement("article");
    el.className = "list-item";
    el.innerHTML = `
      <header class="list-item_header">
        <div>
          <h3 style="margin: 0; font-family: var(--font-heading);">${item.medicineName}</h3>
          <p class="card-meta">${item.stock} ${item.unit}</p>
        </div>
        <span class="chip" style="${isLow ? "background: rgba(220, 38, 38, 0.1); color: rgb(185, 28, 28);" : ""}">
          ${isLow ? "Low stock" : "Healthy"}
        </span>
      </header>
      <div class="button-group">
        <input class="form-input" type="number" placeholder="Add stock" data-add-stock value="" />
        <button class="btn btn-outline" data-action="restock" data-id="${item.id}">Restock</button>
        <button class="btn btn-outline" data-action="remove" data-id="${item.id}">Remove</button>
      </div>
    `;

    el.querySelector("[data-action=restock]")?.addEventListener("click", () => {
      const input = el.querySelector("[data-add-stock]");
      const amount = parseInt(input.value);
      if (Number.isFinite(amount) && amount > 0) {
        updateInventory(item.id, item.stock + amount);
        input.value = "";
      } else {
        showToast("Enter a valid stock amount");
      }
    });

    el.querySelector("[data-action=remove]")?.addEventListener("click", () => {
      removeInventory(item.id);
    });

    el.querySelector("[data-add-stock]")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        el.querySelector("[data-action=restock]")?.dispatchEvent(new Event("click"));
      }
    });

    refs.inventoryList.appendChild(el);
  });
}

function handleInventorySubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = formData.get("name")?.toString().trim() ?? "";
  const stock = parseInt(formData.get("stock"));
  const unit = formData.get("unit")?.toString() ?? "tablets";
  const threshold = parseInt(formData.get("threshold"));

  if (!name || !Number.isFinite(stock) || stock <= 0 || !Number.isFinite(threshold) || threshold < 0) {
    showFormFeedback(refs.inventoryFeedback, "Fill all fields with valid values.");
    return;
  }

  state.inventory.push({
    id: `med-${Date.now()}`,
    medicineName: name,
    stock,
    unit,
    lowStockThreshold: threshold,
  });
  saveData(state);
  event.currentTarget.reset();
  showToast("Medicine added to inventory");
  showFormFeedback(refs.inventoryFeedback, "");
  renderAll();
}

function markPrescriptionDispensed(id) {
  const prescription = state.prescriptions.find((rx) => rx.id === id);
  if (!prescription) return;
  prescription.dispensed = true;
  saveData(state);
  showToast("Prescription marked as dispensed");
  renderAll();
}

function updateInventory(id, stock) {
  const item = state.inventory.find((inv) => inv.id === id);
  if (!item) return;
  item.stock = stock;
  saveData(state);
  showToast("Inventory updated");
  renderAll();
}

function removeInventory(id) {
  state.inventory = state.inventory.filter((inv) => inv.id !== id);
  saveData(state);
  showToast("Medicine removed");
  renderAll();
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
