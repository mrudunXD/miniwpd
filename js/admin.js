import { requireAuth, clearSession } from "./auth.js";

// Authentication check
const session = requireAuth({ allowedRoles: ["admin"] });
if (!session) {
  throw new Error("Redirecting unauthenticated user");
}

// Storage key
const STORAGE_KEY = `ethicure:admin:${session.username}`;

// Helper function
function addDays(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString();
}

// Default data structure
const defaultData = {
  departments: [
    { id: "cardiology", name: "Cardiology", description: "Heart & vascular care" },
    { id: "neurology", name: "Neurology", description: "Brain & nervous system" },
    { id: "orthopedics", name: "Orthopedics", description: "Bones & muscular system" },
    { id: "pediatrics", name: "Pediatrics", description: "Child care & wellness" },
  ],
  doctors: [
    { 
      id: "doc-1", 
      firstName: "Riya", 
      lastName: "Sen", 
      specialization: "Cardiologist", 
      departmentId: "cardiology",
      experience: 12,
      email: "riya.sen@hospital.com",
      phone: "+1 234 567 8901"
    },
    { 
      id: "doc-2", 
      firstName: "Amit", 
      lastName: "Verma", 
      specialization: "Neurologist", 
      departmentId: "neurology",
      experience: 9,
      email: "amit.verma@hospital.com",
      phone: "+1 234 567 8902"
    },
  ],
  staff: [
    {
      id: "staff-1",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "nurse",
      departmentId: "cardiology",
      email: "sarah.j@hospital.com",
      phone: "+1 234 567 8910"
    },
  ],
  patients: [
    {
      id: "pat-1",
      patientId: "P001",
      firstName: "Sonia",
      lastName: "Kapoor",
      email: "sonia.k@email.com",
      phone: "+1 234 567 9001",
      lastVisit: addDays(-5),
      status: "active"
    },
  ],
  appointments: [
    {
      id: "apt-1",
      patientId: "pat-1",
      patient: "Sonia Kapoor",
      doctorId: "doc-1",
      departmentId: "cardiology",
      status: "confirmed",
      datetime: addDays(0),
    },
  ],
  medicines: [
    {
      id: "med-1",
      name: "Aspirin",
      stock: 150,
      unit: "tablets",
      threshold: 20,
      price: 5.00
    },
    {
      id: "med-2",
      name: "Paracetamol",
      stock: 8,
      unit: "tablets",
      threshold: 10,
      price: 3.50
    },
  ],
  dispenseHistory: [],
  profile: {
    fullName: `${session.firstName || ""} ${session.lastName || ""}`.trim() || session.username,
    email: session.email || "admin@hospital.com",
    phone: "+1 234 567 0000"
  },
  preferences: {
    hospitalName: "ethicure Medical Center",
    address: "123 Medical Street, Healthcare City",
    phone: "+1 234 567 0000",
    email: "info@ethicure.com"
  },
  notifications: [
    { id: "notif-1", message: "New appointment scheduled", time: addDays(0), read: false, type: "appointment" },
    { id: "notif-2", message: "Low stock alert: Paracetamol", time: addDays(-1), read: false, type: "pharmacy" },
  ]
};

// Data management
function readData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultData);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultData),
      ...parsed,
      departments: parsed.departments || structuredClone(defaultData.departments),
      doctors: parsed.doctors || structuredClone(defaultData.doctors),
      staff: parsed.staff || structuredClone(defaultData.staff),
      patients: parsed.patients || structuredClone(defaultData.patients),
      appointments: parsed.appointments || structuredClone(defaultData.appointments),
      medicines: parsed.medicines || structuredClone(defaultData.medicines),
      dispenseHistory: parsed.dispenseHistory || structuredClone(defaultData.dispenseHistory),
      profile: parsed.profile || structuredClone(defaultData.profile),
      preferences: parsed.preferences || structuredClone(defaultData.preferences),
      notifications: parsed.notifications || structuredClone(defaultData.notifications),
    };
  } catch (error) {
    console.warn("Failed to parse admin data", error);
    return structuredClone(defaultData);
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const state = readData();
let currentPage = "dashboard";

// DOM Elements
const elements = {
  // Sidebar
  sidebar: document.getElementById("adminSidebar"),
  sidebarCollapse: document.getElementById("sidebarCollapse"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),
  navItems: document.querySelectorAll(".nav-item"),
  
  // Navbar
  adminName: document.getElementById("adminName"),
  profileName: document.getElementById("profileName"),
  profileAvatar: document.getElementById("profileAvatar"),
  profileDropdown: document.getElementById("profileDropdown"),
  dropdownMenu: document.getElementById("dropdownMenu"),
  globalSearch: document.getElementById("globalSearch"),
  searchResults: document.getElementById("searchResults"),
  notificationsBtn: document.getElementById("notificationsBtn"),
  notificationBadge: document.getElementById("notificationBadge"),
  messagesBtn: document.getElementById("messagesBtn"),
  messageBadge: document.getElementById("messageBadge"),
  logoutBtn: document.getElementById("logoutBtn"),
  
  // Pages
  pageContents: document.querySelectorAll(".page-content"),
  
  // Dashboard
  statPatients: document.getElementById("statPatients"),
  statDoctors: document.getElementById("statDoctors"),
  statAppointments: document.getElementById("statAppointments"),
  pendingAppointments: document.getElementById("pendingAppointments"),
  statStaff: document.getElementById("statStaff"),
  statPrescriptions: document.getElementById("statPrescriptions"),
  statMedicines: document.getElementById("statMedicines"),
  lowStockAlert: document.getElementById("lowStockAlert"),
  lowStockCount: document.getElementById("lowStockCount"),
  recentActivity: document.getElementById("recentActivity"),
  
  // Doctors
  addDoctorBtn: document.getElementById("addDoctorBtn"),
  doctorFormCard: document.getElementById("doctorFormCard"),
  doctorForm: document.getElementById("doctorForm"),
  closeDoctorForm: document.getElementById("closeDoctorForm"),
  cancelDoctorForm: document.getElementById("cancelDoctorForm"),
  doctorEditId: document.getElementById("doctorEditId"),
  doctorDeptSelect: document.getElementById("doctorDeptSelect"),
  doctorDeptFilter: document.getElementById("doctorDeptFilter"),
  doctorSearch: document.getElementById("doctorSearch"),
  doctorsList: document.getElementById("doctorsList"),
  doctorCount: document.getElementById("doctorCount"),
  doctorFormError: document.getElementById("doctorFormError"),
  
  // Departments
  addDeptBtn: document.getElementById("addDeptBtn"),
  deptFormCard: document.getElementById("deptFormCard"),
  deptForm: document.getElementById("deptForm"),
  closeDeptForm: document.getElementById("closeDeptForm"),
  cancelDeptForm: document.getElementById("cancelDeptForm"),
  deptEditId: document.getElementById("deptEditId"),
  departmentsList: document.getElementById("departmentsList"),
  deptCount: document.getElementById("deptCount"),
  deptFormError: document.getElementById("deptFormError"),
  
  // Staff
  addStaffBtn: document.getElementById("addStaffBtn"),
  staffFormCard: document.getElementById("staffFormCard"),
  staffForm: document.getElementById("staffForm"),
  closeStaffForm: document.getElementById("closeStaffForm"),
  cancelStaffForm: document.getElementById("cancelStaffForm"),
  staffEditId: document.getElementById("staffEditId"),
  staffDeptSelect: document.getElementById("staffDeptSelect"),
  staffRoleFilter: document.getElementById("staffRoleFilter"),
  staffSearch: document.getElementById("staffSearch"),
  staffList: document.getElementById("staffList"),
  staffCount: document.getElementById("staffCount"),
  staffFormError: document.getElementById("staffFormError"),
  
  // Patients
  patientSearch: document.getElementById("patientSearch"),
  patientStatusFilter: document.getElementById("patientStatusFilter"),
  patientsTableBody: document.getElementById("patientsTableBody"),
  patientCount: document.getElementById("patientCount"),
  
  // Appointments
  appointmentStatusFilter: document.getElementById("appointmentStatusFilter"),
  appointmentDateFilter: document.getElementById("appointmentDateFilter"),
  appointmentSearch: document.getElementById("appointmentSearch"),
  appointmentsTableBody: document.getElementById("appointmentsTableBody"),
  appointmentCount: document.getElementById("appointmentCount"),
  
  // Pharmacy
  addMedicineBtn: document.getElementById("addMedicineBtn"),
  medicineFormCard: document.getElementById("medicineFormCard"),
  medicineForm: document.getElementById("medicineForm"),
  closeMedicineForm: document.getElementById("closeMedicineForm"),
  cancelMedicineForm: document.getElementById("cancelMedicineForm"),
  medicineEditId: document.getElementById("medicineEditId"),
  medicinesList: document.getElementById("medicinesList"),
  pharmacyTotal: document.getElementById("pharmacyTotal"),
  pharmacyLow: document.getElementById("pharmacyLow"),
  pharmacyOut: document.getElementById("pharmacyOut"),
  dispenseTableBody: document.getElementById("dispenseTableBody"),
  medicineFormError: document.getElementById("medicineFormError"),
  
  // Settings
  profileForm: document.getElementById("profileForm"),
  profileName: document.getElementById("profileName"),
  profileEmail: document.getElementById("profileEmail"),
  profilePhone: document.getElementById("profilePhone"),
  profileFormError: document.getElementById("profileFormError"),
  passwordForm: document.getElementById("passwordForm"),
  passwordFormError: document.getElementById("passwordFormError"),
  preferencesForm: document.getElementById("preferencesForm"),
  prefHospital: document.getElementById("prefHospital"),
  prefAddress: document.getElementById("prefAddress"),
  prefPhone: document.getElementById("prefPhone"),
  prefEmail: document.getElementById("prefEmail"),
  preferencesFormError: document.getElementById("preferencesFormError"),
  
  // Notifications
  notificationsPanel: document.getElementById("notificationsPanel"),
  notificationsList: document.getElementById("notificationsList"),
  closeNotifications: document.getElementById("closeNotifications"),
  
  // Overlay
  overlay: document.getElementById("overlay"),
  
  // Toast
  toast: document.getElementById("toast"),
  
  // Modern Dashboard
  heroAdminName: document.getElementById("heroAdminName"),
  currentDate: document.getElementById("currentDate"),
  deptDistribution: document.getElementById("deptDistribution"),
  stockAlerts: document.getElementById("stockAlerts"),
};

// Initialize
function init() {
  setupUserInfo();
  setupNavigation();
  setupSidebar();
  setupNavbar();
  setupForms();
  setupFilters();
  setupNotifications();
  navigateToPage("dashboard");
  updateDashboard();
}

// Setup user info
function setupUserInfo() {
  const name = state.profile.fullName;
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  if (elements.adminName) elements.adminName.textContent = name;
  if (elements.profileName) elements.profileName.textContent = name;
  if (elements.profileAvatar) elements.profileAvatar.textContent = initials;
  if (elements.heroAdminName) elements.heroAdminName.textContent = name.split(' ')[0] || name;
  
  // Set current date
  if (elements.currentDate) {
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.currentDate.textContent = date.toLocaleDateString('en-US', options);
  }
}

// Navigation
function navigateToPage(page) {
  currentPage = page;
  
  // Hide all pages
  elements.pageContents.forEach(p => p.classList.remove("active"));
  
  // Show target page
  const targetPage = document.getElementById(`page-${page}`);
  if (targetPage) {
    targetPage.classList.add("active");
  }
  
  // Update nav items
  elements.navItems.forEach(item => {
    item.classList.remove("active");
    if (item.dataset.page === page) {
      item.classList.add("active");
    }
  });
  
  // Render page content
  switch(page) {
    case "dashboard":
      updateDashboard();
      break;
    case "doctors":
      renderDoctors();
      break;
    case "departments":
      renderDepartments();
      break;
    case "staff":
      renderStaff();
      break;
    case "patients":
      renderPatients();
      break;
    case "appointments":
      renderAppointments();
      break;
    case "pharmacy":
      renderPharmacy();
      break;
    case "settings":
      renderSettings();
      break;
  }
}

function setupNavigation() {
  elements.navItems.forEach(item => {
    item.querySelector("a")?.addEventListener("click", (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      if (page) {
        navigateToPage(page);
        if (window.innerWidth <= 992) {
          elements.sidebar?.classList.remove("show");
          elements.overlay?.classList.remove("show");
        }
      }
    });
  });
  
  // Hash navigation
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.slice(1);
    if (hash) navigateToPage(hash);
  });
  
  const hash = window.location.hash.slice(1);
  if (hash) navigateToPage(hash);
}

// Sidebar
function setupSidebar() {
  elements.sidebarCollapse?.addEventListener("click", () => {
    elements.sidebar?.classList.toggle("collapsed");
  });
  
  elements.mobileMenuBtn?.addEventListener("click", () => {
    elements.sidebar?.classList.toggle("show");
    elements.overlay?.classList.toggle("show");
  });
  
  elements.overlay?.addEventListener("click", () => {
    elements.sidebar?.classList.remove("show");
    elements.overlay?.classList.remove("show");
  });
}

// Navbar
function setupNavbar() {
  elements.profileDropdown?.addEventListener("click", (e) => {
    e.stopPropagation();
    elements.dropdownMenu?.classList.toggle("show");
  });
  
  document.addEventListener("click", () => {
    elements.dropdownMenu?.classList.remove("show");
  });
  
  elements.logoutBtn?.addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

  elements.globalSearch?.addEventListener("input", handleGlobalSearch);
  elements.notificationsBtn?.addEventListener("click", () => {
    elements.notificationsPanel?.classList.toggle("show");
    elements.overlay?.classList.toggle("show");
  });
  
  elements.closeNotifications?.addEventListener("click", () => {
    elements.notificationsPanel?.classList.remove("show");
    elements.overlay?.classList.remove("show");
  });
}

// Global search
function handleGlobalSearch(e) {
  const term = e.target.value.toLowerCase();
  if (term.length < 2) {
    elements.searchResults.classList.remove("show");
    return;
  }
  
  const results = {
    doctors: state.doctors.filter(d => 
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(term) ||
      d.specialization.toLowerCase().includes(term)
    ),
    patients: state.patients.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(term) ||
      p.patientId.toLowerCase().includes(term)
    ),
    appointments: state.appointments.filter(a => 
      a.patient.toLowerCase().includes(term)
    ),
    departments: state.departments.filter(d => 
      d.name.toLowerCase().includes(term)
    )
  };
  
  renderSearchResults(results);
  elements.searchResults.classList.add("show");
}

function renderSearchResults(results) {
  if (!elements.searchResults) return;
  
  let html = "";
  if (results.doctors.length) {
    html += `<div class="search-section"><strong>Doctors</strong>`;
    results.doctors.slice(0, 3).forEach(doc => {
      html += `<div class="search-item" onclick="navigateToPage('doctors')">Dr. ${doc.firstName} ${doc.lastName}</div>`;
    });
    html += `</div>`;
  }
  
  if (results.patients.length) {
    html += `<div class="search-section"><strong>Patients</strong>`;
    results.patients.slice(0, 3).forEach(pat => {
      html += `<div class="search-item" onclick="navigateToPage('patients')">${pat.patientId} - ${pat.firstName} ${pat.lastName}</div>`;
    });
    html += `</div>`;
  }
  
  elements.searchResults.innerHTML = html || "<div class='search-item'>No results found</div>";
}

// Dashboard
function updateDashboard() {
  updateDashboardStats();
  renderRecentActivity();
  renderDepartmentDistribution();
  renderStockAlerts();
  updateCharts();
}

function updateDashboardStats() {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = state.appointments.filter(a => a.datetime.split('T')[0] === today);
  const pendingAppts = state.appointments.filter(a => a.status === 'pending');
  const lowStock = state.medicines.filter(m => m.stock > 0 && m.stock <= m.threshold);
  
  if (elements.statPatients) elements.statPatients.textContent = state.patients.length;
  if (elements.statDoctors) elements.statDoctors.textContent = state.doctors.length;
  if (elements.statAppointments) elements.statAppointments.textContent = todayAppointments.length;
  if (elements.pendingAppointments) elements.pendingAppointments.textContent = `${pendingAppts.length} pending`;
  if (elements.statStaff) elements.statStaff.textContent = state.staff.length;
  if (elements.statPrescriptions) elements.statPrescriptions.textContent = "0"; // Placeholder
  if (elements.statMedicines) elements.statMedicines.textContent = state.medicines.filter(m => m.stock > 0).length;
  if (elements.lowStockCount) elements.lowStockCount.textContent = `${lowStock.length} low stock`;
}

function renderRecentActivity() {
  if (!elements.recentActivity) return;
  
  const activities = [
    ...state.appointments.slice(0, 3).map(apt => ({
      type: "appointment",
      title: "New appointment scheduled",
      meta: `${apt.patient} with ${getDoctorName(apt.doctorId)}`,
      time: formatTimeAgo(new Date(apt.datetime))
    })),
    ...state.notifications.slice(0, 2).map(notif => ({
      type: notif.type === "pharmacy" ? "pharmacy" : "appointment",
      title: notif.message,
      meta: "System alert",
      time: formatTimeAgo(new Date(notif.time))
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
  
  elements.recentActivity.innerHTML = activities.length ? activities.map(act => `
    <div class="activity-item-modern">
      <div class="activity-icon-modern ${act.type}">
        <i class="fas fa-${act.type === 'appointment' ? 'calendar-check' : 'exclamation-triangle'}"></i>
      </div>
      <div class="activity-content-modern">
        <div class="activity-title-modern">${act.title}</div>
        <div class="activity-meta-modern">${act.meta}</div>
      </div>
      <div class="activity-time-modern">${act.time}</div>
    </div>
  `).join("") : '<div class="empty-state">No recent activity</div>';
}

function renderDepartmentDistribution() {
  if (!elements.deptDistribution) return;
  
  const deptCounts = state.departments.map(dept => ({
    name: dept.name,
    count: state.doctors.filter(d => d.departmentId === dept.id).length
  })).sort((a, b) => b.count - a.count);
  
  const maxCount = Math.max(...deptCounts.map(d => d.count), 1);
  
  elements.deptDistribution.innerHTML = deptCounts.length ? deptCounts.map(dept => {
    const percentage = (dept.count / maxCount) * 100;
    return `
      <div class="dept-item">
        <div class="dept-name">${dept.name}</div>
        <div class="dept-bar-container">
          <div class="dept-bar" style="width: ${percentage}%">${dept.count}</div>
        </div>
        <div class="dept-count">${dept.count}</div>
      </div>
    `;
  }).join("") : '<div class="empty-state">No departments</div>';
}

function renderStockAlerts() {
  if (!elements.stockAlerts) return;
  
  const lowStock = state.medicines.filter(m => m.stock > 0 && m.stock <= m.threshold);
  const outOfStock = state.medicines.filter(m => m.stock === 0);
  const alerts = [
    ...lowStock.map(m => ({ type: 'low', name: m.name, stock: m.stock, threshold: m.threshold })),
    ...outOfStock.map(m => ({ type: 'out', name: m.name, stock: 0 }))
  ].slice(0, 5);
  
  elements.stockAlerts.innerHTML = alerts.length ? alerts.map(alert => `
    <div class="alert-item">
      <i class="fas fa-${alert.type === 'out' ? 'times-circle' : 'exclamation-triangle'}"></i>
      <span><strong>${alert.name}</strong> - ${alert.type === 'out' ? 'Out of stock' : `Only ${alert.stock} left (threshold: ${alert.threshold})`}</span>
    </div>
  `).join("") : '<div class="alert-item"><i class="fas fa-check-circle"></i><span>All medicines in stock</span></div>';
}

function updateCharts() {
  // Placeholder for charts - would integrate Chart.js here
  console.log("Charts would be rendered here");
}

function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

// Doctors
function renderDoctors() {
  let filtered = [...state.doctors];
  const deptFilter = elements.doctorDeptFilter?.value;
  const searchTerm = elements.doctorSearch?.value.toLowerCase() || "";
  
  if (deptFilter) filtered = filtered.filter(d => d.departmentId === deptFilter);
  if (searchTerm) filtered = filtered.filter(d => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm) ||
    d.specialization.toLowerCase().includes(searchTerm)
  );
  
  if (elements.doctorCount) elements.doctorCount.textContent = `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''}`;
  
  if (!elements.doctorsList) return;
  elements.doctorsList.innerHTML = filtered.length ? filtered.map(doc => {
    const dept = state.departments.find(d => d.id === doc.departmentId);
    return `
      <div class="data-item">
        <div class="data-item-header">
        <div>
            <div class="data-item-title">Dr. ${doc.firstName} ${doc.lastName}</div>
            <div class="data-item-meta">${doc.specialization} • ${doc.experience || 0} years</div>
          </div>
          <span class="data-item-badge">${dept?.name || "Unassigned"}</span>
        </div>
        <div class="data-item-actions">
          <button class="btn-secondary btn-sm" onclick="editDoctor('${doc.id}')">Edit</button>
          <button class="btn-secondary btn-sm" onclick="deleteDoctor('${doc.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join("") : '<div class="empty-state">No doctors found</div>';
  
  populateDoctorDeptSelect();
  populateDoctorFilter();
}

function populateDoctorDeptSelect() {
  if (!elements.doctorDeptSelect) return;
  const current = elements.doctorDeptSelect.value;
  elements.doctorDeptSelect.innerHTML = '<option value="">Select department</option>';
  state.departments.forEach(dept => {
    const option = document.createElement("option");
    option.value = dept.id;
    option.textContent = dept.name;
    elements.doctorDeptSelect.appendChild(option);
  });
  if (current) elements.doctorDeptSelect.value = current;
}

function populateDoctorFilter() {
  if (!elements.doctorDeptFilter) return;
  const current = elements.doctorDeptFilter.value;
  elements.doctorDeptFilter.innerHTML = '<option value="">All Departments</option>';
  state.departments.forEach(dept => {
    const option = document.createElement("option");
    option.value = dept.id;
    option.textContent = dept.name;
    elements.doctorDeptFilter.appendChild(option);
  });
  if (current) elements.doctorDeptFilter.value = current;
}

function editDoctor(id) {
  const doc = state.doctors.find(d => d.id === id);
  if (!doc) return;
  
  elements.doctorFormCard.classList.remove("hidden");
  elements.doctorForm.querySelector("[name=firstName]").value = doc.firstName || "";
  elements.doctorForm.querySelector("[name=lastName]").value = doc.lastName || "";
  elements.doctorForm.querySelector("[name=specialization]").value = doc.specialization || "";
  elements.doctorForm.querySelector("[name=departmentId]").value = doc.departmentId || "";
  elements.doctorForm.querySelector("[name=experience]").value = doc.experience || "";
  elements.doctorForm.querySelector("[name=email]").value = doc.email || "";
  elements.doctorForm.querySelector("[name=phone]").value = doc.phone || "";
  elements.doctorEditId.value = id;
  populateDoctorDeptSelect();
}

function deleteDoctor(id) {
  if (!confirm("Are you sure you want to delete this doctor?")) return;
  state.doctors = state.doctors.filter(d => d.id !== id);
  state.appointments = state.appointments.filter(a => a.doctorId !== id);
  saveData(state);
  showToast("Doctor deleted");
  renderDoctors();
  if (currentPage === "dashboard") updateDashboard();
}

// Departments
function renderDepartments() {
  if (elements.deptCount) {
    elements.deptCount.textContent = `${state.departments.length} department${state.departments.length !== 1 ? 's' : ''}`;
  }
  
  if (!elements.departmentsList) return;
  elements.departmentsList.innerHTML = state.departments.length ? state.departments.map(dept => {
    const doctorCount = state.doctors.filter(d => d.departmentId === dept.id).length;
    return `
      <div class="data-item">
        <div class="data-item-header">
        <div>
            <div class="data-item-title">${dept.name}</div>
            <div class="data-item-meta">${dept.description}</div>
          </div>
          <span class="data-item-badge">${doctorCount} doctors</span>
        </div>
        <div class="data-item-actions">
          <button class="btn-secondary btn-sm" onclick="editDepartment('${dept.id}')">Edit</button>
          <button class="btn-secondary btn-sm" onclick="deleteDepartment('${dept.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join("") : '<div class="empty-state">No departments</div>';
}

function editDepartment(id) {
  const dept = state.departments.find(d => d.id === id);
  if (!dept) return;
  
  elements.deptFormCard.classList.remove("hidden");
  elements.deptForm.querySelector("[name=name]").value = dept.name || "";
  elements.deptForm.querySelector("[name=description]").value = dept.description || "";
  elements.deptEditId.value = id;
}

function deleteDepartment(id) {
  if (!confirm("Delete this department? All associated doctors will be unassigned.")) return;
  state.departments = state.departments.filter(d => d.id !== id);
  state.doctors = state.doctors.filter(d => d.departmentId !== id).map(d => ({...d, departmentId: ""}));
  state.appointments = state.appointments.filter(a => a.departmentId !== id);
  state.staff = state.staff.filter(s => s.departmentId !== id).map(s => ({...s, departmentId: ""}));
  saveData(state);
  showToast("Department deleted");
  renderDepartments();
  if (currentPage === "doctors") renderDoctors();
  if (currentPage === "staff") renderStaff();
}

// Staff
function renderStaff() {
  let filtered = [...state.staff];
  const roleFilter = elements.staffRoleFilter?.value;
  const searchTerm = elements.staffSearch?.value.toLowerCase() || "";
  
  if (roleFilter) filtered = filtered.filter(s => s.role === roleFilter);
  if (searchTerm) filtered = filtered.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm) ||
    s.role.toLowerCase().includes(searchTerm)
  );
  
  if (elements.staffCount) elements.staffCount.textContent = `${filtered.length} staff member${filtered.length !== 1 ? 's' : ''}`;
  
  if (!elements.staffList) return;
  elements.staffList.innerHTML = filtered.length ? filtered.map(staff => {
    const dept = state.departments.find(d => d.id === staff.departmentId);
    return `
      <div class="data-item">
        <div class="data-item-header">
          <div>
            <div class="data-item-title">${staff.firstName} ${staff.lastName}</div>
            <div class="data-item-meta">${staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}</div>
          </div>
          ${dept ? `<span class="data-item-badge">${dept.name}</span>` : ''}
        </div>
        <div class="data-item-actions">
          <button class="btn-secondary btn-sm" onclick="editStaff('${staff.id}')">Edit</button>
          <button class="btn-secondary btn-sm" onclick="deleteStaff('${staff.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join("") : '<div class="empty-state">No staff members found</div>';
  
  populateStaffDeptSelect();
}

function populateStaffDeptSelect() {
  if (!elements.staffDeptSelect) return;
  const current = elements.staffDeptSelect.value;
  elements.staffDeptSelect.innerHTML = '<option value="">No Department</option>';
  state.departments.forEach(dept => {
    const option = document.createElement("option");
    option.value = dept.id;
    option.textContent = dept.name;
    elements.staffDeptSelect.appendChild(option);
  });
  if (current) elements.staffDeptSelect.value = current;
}

function editStaff(id) {
  const staff = state.staff.find(s => s.id === id);
  if (!staff) return;
  
  elements.staffFormCard.classList.remove("hidden");
  elements.staffForm.querySelector("[name=firstName]").value = staff.firstName || "";
  elements.staffForm.querySelector("[name=lastName]").value = staff.lastName || "";
  elements.staffForm.querySelector("[name=role]").value = staff.role || "";
  elements.staffForm.querySelector("[name=departmentId]").value = staff.departmentId || "";
  elements.staffForm.querySelector("[name=email]").value = staff.email || "";
  elements.staffForm.querySelector("[name=phone]").value = staff.phone || "";
  elements.staffEditId.value = id;
  populateStaffDeptSelect();
}

function deleteStaff(id) {
  if (!confirm("Delete this staff member?")) return;
  state.staff = state.staff.filter(s => s.id !== id);
  saveData(state);
  showToast("Staff member deleted");
  renderStaff();
}

// Patients
function renderPatients() {
  let filtered = [...state.patients];
  const statusFilter = elements.patientStatusFilter?.value;
  const searchTerm = elements.patientSearch?.value.toLowerCase() || "";
  
  if (statusFilter) filtered = filtered.filter(p => p.status === statusFilter);
  if (searchTerm) filtered = filtered.filter(p => 
    p.patientId.toLowerCase().includes(searchTerm) ||
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm) ||
    p.email.toLowerCase().includes(searchTerm)
  );
  
  if (elements.patientCount) elements.patientCount.textContent = `${filtered.length} patient${filtered.length !== 1 ? 's' : ''}`;
  
  if (!elements.patientsTableBody) return;
  elements.patientsTableBody.innerHTML = filtered.length ? filtered.map(pat => `
    <tr>
      <td>${pat.patientId}</td>
      <td>${pat.firstName} ${pat.lastName}</td>
      <td>${pat.email}</td>
      <td>${pat.phone}</td>
      <td>${new Date(pat.lastVisit).toLocaleDateString()}</td>
      <td><span class="status-badge ${pat.status}">${pat.status}</span></td>
      <td><button class="btn-secondary btn-sm" onclick="viewPatient('${pat.id}')">View</button></td>
    </tr>
  `).join("") : '<tr><td colspan="7" class="empty-state">No patients found</td></tr>';
}

function viewPatient(id) {
  showToast("Viewing patient profile");
}

// Appointments
function renderAppointments() {
  let filtered = [...state.appointments];
  const statusFilter = elements.appointmentStatusFilter?.value;
  const dateFilter = elements.appointmentDateFilter?.value;
  const searchTerm = elements.appointmentSearch?.value.toLowerCase() || "";
  
  if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);
  if (dateFilter) filtered = filtered.filter(a => a.datetime.split('T')[0] === dateFilter);
  if (searchTerm) filtered = filtered.filter(a => 
    a.patient.toLowerCase().includes(searchTerm) ||
    getDoctorName(a.doctorId).toLowerCase().includes(searchTerm)
  );
  
  const sorted = filtered.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  
  if (elements.appointmentCount) elements.appointmentCount.textContent = `${sorted.length} appointment${sorted.length !== 1 ? 's' : ''}`;
  
  if (!elements.appointmentsTableBody) return;
  elements.appointmentsTableBody.innerHTML = sorted.length ? sorted.map(apt => {
    const doctor = getDoctorName(apt.doctorId);
    const dept = state.departments.find(d => d.id === apt.departmentId);
    return `
      <tr>
        <td>${apt.patient}</td>
        <td>${doctor}</td>
        <td>${dept?.name || "—"}</td>
        <td>${new Date(apt.datetime).toLocaleString()}</td>
        <td><span class="status-badge ${apt.status}">${apt.status}</span></td>
        <td>
          ${apt.status === 'pending' ? `<button class="btn-secondary btn-sm" onclick="confirmAppointment('${apt.id}')">Confirm</button>` : ''}
          <button class="btn-secondary btn-sm" onclick="viewAppointment('${apt.id}')">View</button>
        </td>
      </tr>
    `;
  }).join("") : '<tr><td colspan="6" class="empty-state">No appointments found</td></tr>';
}

function confirmAppointment(id) {
  const apt = state.appointments.find(a => a.id === id);
  if (apt) {
    apt.status = 'confirmed';
    saveData(state);
    showToast("Appointment confirmed");
    renderAppointments();
    updateDashboard();
  }
}

function viewAppointment(id) {
  showToast("Viewing appointment details");
}

function getDoctorName(id) {
  const doc = state.doctors.find(d => d.id === id);
  return doc ? `Dr. ${doc.firstName} ${doc.lastName}` : "—";
}

// Pharmacy
function renderPharmacy() {
  renderMedicines();
  updatePharmacyStats();
  renderDispenseHistory();
}

function renderMedicines() {
  const filter = document.querySelector("[data-filter]")?.dataset?.filter || "all";
  let filtered = [...state.medicines];
  
  if (filter === "low") filtered = filtered.filter(m => m.stock > 0 && m.stock <= m.threshold);
  if (filter === "out") filtered = filtered.filter(m => m.stock === 0);
  
  if (!elements.medicinesList) return;
  elements.medicinesList.innerHTML = filtered.length ? filtered.map(med => {
    const isLow = med.stock > 0 && med.stock <= med.threshold;
    const isOut = med.stock === 0;
    return `
      <div class="data-item">
        <div class="data-item-header">
          <div>
            <div class="data-item-title">${med.name}</div>
            <div class="data-item-meta">${med.stock} ${med.unit} • $${med.price?.toFixed(2) || '0.00'} per ${med.unit}</div>
          </div>
          <span class="status-badge ${isOut ? 'cancelled' : isLow ? 'pending' : 'completed'}">
            ${isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
          </span>
        </div>
        <div class="data-item-actions">
          <button class="btn-secondary btn-sm" onclick="editMedicine('${med.id}')">Edit</button>
          <button class="btn-secondary btn-sm" onclick="deleteMedicine('${med.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join("") : '<div class="empty-state">No medicines found</div>';
}

function updatePharmacyStats() {
  const total = state.medicines.length;
  const low = state.medicines.filter(m => m.stock > 0 && m.stock <= m.threshold).length;
  const out = state.medicines.filter(m => m.stock === 0).length;
  
  if (elements.pharmacyTotal) elements.pharmacyTotal.textContent = total;
  if (elements.pharmacyLow) elements.pharmacyLow.textContent = low;
  if (elements.pharmacyOut) elements.pharmacyOut.textContent = out;
}

function renderDispenseHistory() {
  if (!elements.dispenseTableBody) return;
  const sorted = [...state.dispenseHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  elements.dispenseTableBody.innerHTML = sorted.length ? sorted.map(disp => {
    const doctor = getDoctorName(disp.doctorId);
    return `
      <tr>
        <td>${new Date(disp.date).toLocaleDateString()}</td>
        <td>${disp.patient}</td>
        <td>${disp.medicine}</td>
        <td>${disp.quantity}</td>
        <td>${doctor}</td>
      </tr>
    `;
  }).join("") : '<tr><td colspan="5" class="empty-state">No dispense history</td></tr>';
}

function editMedicine(id) {
  const med = state.medicines.find(m => m.id === id);
  if (!med) return;
  
  elements.medicineFormCard.classList.remove("hidden");
  elements.medicineForm.querySelector("[name=name]").value = med.name || "";
  elements.medicineForm.querySelector("[name=stock]").value = med.stock || "";
  elements.medicineForm.querySelector("[name=unit]").value = med.unit || "tablets";
  elements.medicineForm.querySelector("[name=threshold]").value = med.threshold || "";
  elements.medicineForm.querySelector("[name=price]").value = med.price || "";
  elements.medicineEditId.value = id;
}

function deleteMedicine(id) {
  if (!confirm("Delete this medicine?")) return;
  state.medicines = state.medicines.filter(m => m.id !== id);
  saveData(state);
  showToast("Medicine deleted");
  renderPharmacy();
}

// Settings
function renderSettings() {
  if (elements.profileName) elements.profileName.value = state.profile.fullName;
  if (elements.profileEmail) elements.profileEmail.value = state.profile.email;
  if (elements.profilePhone) elements.profilePhone.value = state.profile.phone;
  
  if (elements.prefHospital) elements.prefHospital.value = state.preferences.hospitalName;
  if (elements.prefAddress) elements.prefAddress.value = state.preferences.address;
  if (elements.prefPhone) elements.prefPhone.value = state.preferences.phone;
  if (elements.prefEmail) elements.prefEmail.value = state.preferences.email;
}

// Forms setup
function setupForms() {
  // Doctor form
  elements.addDoctorBtn?.addEventListener("click", () => {
    elements.doctorFormCard.classList.remove("hidden");
    elements.doctorForm.reset();
    elements.doctorEditId.value = "";
    populateDoctorDeptSelect();
  });
  
  elements.closeDoctorForm?.addEventListener("click", () => {
    elements.doctorFormCard.classList.add("hidden");
  });
  
  elements.cancelDoctorForm?.addEventListener("click", () => {
    elements.doctorFormCard.classList.add("hidden");
    elements.doctorForm.reset();
  });
  
  elements.doctorForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const editId = formData.get("doctorId");
    
    const doctor = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      specialization: formData.get("specialization"),
      departmentId: formData.get("departmentId"),
      experience: parseInt(formData.get("experience") || "0"),
      email: formData.get("email"),
      phone: formData.get("phone")
    };
    
    if (editId) {
      const index = state.doctors.findIndex(d => d.id === editId);
      if (index !== -1) {
        state.doctors[index] = { ...state.doctors[index], ...doctor };
        showToast("Doctor updated");
      }
    } else {
      state.doctors.push({ ...doctor, id: `doc-${Date.now()}` });
      showToast("Doctor added");
    }
    
    saveData(state);
    elements.doctorFormCard.classList.add("hidden");
    elements.doctorForm.reset();
    renderDoctors();
    if (currentPage === "dashboard") updateDashboard();
  });
  
  // Department form
  elements.addDeptBtn?.addEventListener("click", () => {
    elements.deptFormCard.classList.remove("hidden");
    elements.deptForm.reset();
    elements.deptEditId.value = "";
  });
  
  elements.closeDeptForm?.addEventListener("click", () => {
    elements.deptFormCard.classList.add("hidden");
  });
  
  elements.cancelDeptForm?.addEventListener("click", () => {
    elements.deptFormCard.classList.add("hidden");
    elements.deptForm.reset();
  });
  
  elements.deptForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const editId = formData.get("deptId");
    const name = formData.get("name");
    const description = formData.get("description");
    
    if (editId) {
      const index = state.departments.findIndex(d => d.id === editId);
      if (index !== -1) {
        state.departments[index] = { ...state.departments[index], name, description };
        showToast("Department updated");
      }
    } else {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32);
  state.departments.push({ id, name, description });
      showToast("Department added");
    }
    
    saveData(state);
    elements.deptFormCard.classList.add("hidden");
    elements.deptForm.reset();
    renderDepartments();
  });
  
  // Staff form
  elements.addStaffBtn?.addEventListener("click", () => {
    elements.staffFormCard.classList.remove("hidden");
    elements.staffForm.reset();
    elements.staffEditId.value = "";
    populateStaffDeptSelect();
  });
  
  elements.closeStaffForm?.addEventListener("click", () => {
    elements.staffFormCard.classList.add("hidden");
  });
  
  elements.cancelStaffForm?.addEventListener("click", () => {
    elements.staffFormCard.classList.add("hidden");
    elements.staffForm.reset();
  });
  
  elements.staffForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const editId = formData.get("staffId");
    
    const staff = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      role: formData.get("role"),
      departmentId: formData.get("departmentId") || "",
      email: formData.get("email"),
      phone: formData.get("phone")
    };
    
    if (editId) {
      const index = state.staff.findIndex(s => s.id === editId);
      if (index !== -1) {
        state.staff[index] = { ...state.staff[index], ...staff };
        showToast("Staff updated");
      }
    } else {
      state.staff.push({ ...staff, id: `staff-${Date.now()}` });
      showToast("Staff added");
    }
    
  saveData(state);
    elements.staffFormCard.classList.add("hidden");
    elements.staffForm.reset();
    renderStaff();
  });
  
  // Medicine form
  elements.addMedicineBtn?.addEventListener("click", () => {
    elements.medicineFormCard.classList.remove("hidden");
    elements.medicineForm.reset();
    elements.medicineEditId.value = "";
  });
  
  elements.closeMedicineForm?.addEventListener("click", () => {
    elements.medicineFormCard.classList.add("hidden");
  });
  
  elements.cancelMedicineForm?.addEventListener("click", () => {
    elements.medicineFormCard.classList.add("hidden");
    elements.medicineForm.reset();
  });
  
  elements.medicineForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const editId = formData.get("medicineId");
    
    const medicine = {
      name: formData.get("name"),
      stock: parseInt(formData.get("stock") || "0"),
      unit: formData.get("unit"),
      threshold: parseInt(formData.get("threshold") || "0"),
      price: parseFloat(formData.get("price") || "0")
    };
    
    if (editId) {
      const index = state.medicines.findIndex(m => m.id === editId);
      if (index !== -1) {
        state.medicines[index] = { ...state.medicines[index], ...medicine };
        showToast("Medicine updated");
      }
    } else {
      state.medicines.push({ ...medicine, id: `med-${Date.now()}` });
      showToast("Medicine added");
    }
    
    saveData(state);
    elements.medicineFormCard.classList.add("hidden");
    elements.medicineForm.reset();
    renderPharmacy();
    if (currentPage === "dashboard") updateDashboard();
  });
  
  // Profile form
  elements.profileForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.profile.fullName = formData.get("fullName");
    state.profile.email = formData.get("email");
    state.profile.phone = formData.get("phone");
    saveData(state);
    setupUserInfo();
    showToast("Profile updated");
  });
  
  // Password form
  elements.passwordForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");
    
    if (newPassword !== confirmPassword) {
      showError(elements.passwordFormError, "Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      showError(elements.passwordFormError, "Password must be at least 6 characters");
    return;
  }

    showToast("Password changed successfully");
    elements.passwordForm.reset();
    hideError(elements.passwordFormError);
  });
  
  // Preferences form
  elements.preferencesForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.preferences.hospitalName = formData.get("hospitalName");
    state.preferences.address = formData.get("address");
    state.preferences.phone = formData.get("phone");
    state.preferences.email = formData.get("email");
  saveData(state);
    showToast("Preferences saved");
  });
}

// Filters setup
function setupFilters() {
  elements.doctorDeptFilter?.addEventListener("change", renderDoctors);
  elements.doctorSearch?.addEventListener("input", renderDoctors);
  elements.staffRoleFilter?.addEventListener("change", renderStaff);
  elements.staffSearch?.addEventListener("input", renderStaff);
  elements.patientStatusFilter?.addEventListener("change", renderPatients);
  elements.patientSearch?.addEventListener("input", renderPatients);
  elements.appointmentStatusFilter?.addEventListener("change", renderAppointments);
  elements.appointmentDateFilter?.addEventListener("change", renderAppointments);
  elements.appointmentSearch?.addEventListener("input", renderAppointments);
  
  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderPharmacy();
    });
  });
}

// Notifications
function setupNotifications() {
  updateNotifications();
  renderNotifications();
}

function updateNotifications() {
  const unread = state.notifications.filter(n => !n.read).length;
  if (elements.notificationBadge) elements.notificationBadge.textContent = unread;
}

function renderNotifications() {
  if (!elements.notificationsList) return;
  const unread = state.notifications.filter(n => !n.read);
  
  elements.notificationsList.innerHTML = unread.length ? unread.map(notif => `
    <div class="activity-item">
      <div class="activity-icon ${notif.type}">
        <i class="fas fa-${notif.type === 'pharmacy' ? 'exclamation-triangle' : 'calendar-check'}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${notif.message}</div>
        <div class="activity-meta">${formatTimeAgo(new Date(notif.time))}</div>
      </div>
    </div>
  `).join("") : '<div class="empty-state">No new notifications</div>';
}

// Utility functions
function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 3000);
}

function showError(element, message) {
  if (!element) return;
  element.textContent = message;
  element.classList.add("show");
}

function hideError(element) {
  if (!element) return;
  element.classList.remove("show");
}

// Make functions global for onclick handlers
window.navigateToPage = navigateToPage;
window.editDoctor = editDoctor;
window.deleteDoctor = deleteDoctor;
window.editDepartment = editDepartment;
window.deleteDepartment = deleteDepartment;
window.editStaff = editStaff;
window.deleteStaff = deleteStaff;
window.viewPatient = viewPatient;
window.confirmAppointment = confirmAppointment;
window.viewAppointment = viewAppointment;
window.editMedicine = editMedicine;
window.deleteMedicine = deleteMedicine;

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

