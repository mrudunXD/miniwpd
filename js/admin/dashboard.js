// Admin Dashboard Functionality

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI components
  initializeUI();
  
  // Load dashboard data
  loadDashboardData();
  
  // Initialize event listeners
  setupEventListeners();
  
  // Check authentication
  checkAuth();
});

// Initialize UI components
function initializeUI() {
  // Initialize sidebar toggle for mobile
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.admin-sidebar');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      document.body.classList.toggle('sidebar-active');
    });
  }
  
  // Initialize tooltips
  if (window.utils && typeof window.utils.initTooltips === 'function') {
    window.utils.initTooltips();
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // Show loading state
    setLoadingState(true);
    
    // In a real app, you would fetch this data from your API
    // For now, we'll use mock data
    const dashboardData = await fetchDashboardData();
    
    // Update the UI with the fetched data
    updateDashboardUI(dashboardData);
    
    // Initialize charts
    initializeCharts(dashboardData.charts);
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Failed to load dashboard data. Please try again.', 'error');
  } finally {
    setLoadingState(false);
  }
}

// Fetch dashboard data (mock implementation)
async function fetchDashboardData() {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock data - replace with actual API calls
  return {
    stats: {
      totalPatients: 2845,
      activeDoctors: 48,
      todaysAppointments: 127,
      medicineStock: 86
    },
    recentActivities: [
      {
        id: 1,
        type: 'appointment',
        title: 'New appointment scheduled',
        details: 'Dr. Smith with John Doe (Cardiology)',
        time: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      },
      {
        id: 2,
        type: 'prescription',
        title: 'Prescription issued',
        details: 'For Sarah Johnson by Dr. Williams',
        time: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      },
      {
        id: 3,
        type: 'lab',
        title: 'Lab test results ready',
        details: 'Blood work for Michael Brown',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 4,
        type: 'payment',
        title: 'Payment received',
        details: '$250.00 from Robert Taylor',
        time: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        id: 5,
        type: 'appointment',
        title: 'Appointment cancelled',
        details: 'Dr. Johnson with Emily Wilson',
        time: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      }
    ],
    charts: {
      appointments: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [12, 19, 15, 22, 18, 25, 20],
        type: 'line'
      },
      departments: {
        labels: ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology'],
        data: [25, 20, 15, 30, 10],
        type: 'doughnut'
      }
    }
  };
}

// Update the UI with dashboard data
function updateDashboardUI(data) {
  // Update stats
  if (data.stats) {
    updateStat('total-patients', data.stats.totalPatients);
    updateStat('active-doctors', data.stats.activeDoctors);
    updateStat('todays-appointments', data.stats.todaysAppointments);
    updateStat('medicine-stock', `${data.stats.medicineStock}%`);
  }
  
  // Update recent activities
  if (data.recentActivities && data.recentActivities.length > 0) {
    updateRecentActivities(data.recentActivities);
  }
}

// Update a single stat card
function updateStat(statId, value) {
  const statElement = document.querySelector(`#${statId} .stat-value`);
  if (statElement) {
    statElement.textContent = value;
  }
}

// Update recent activities list
function updateRecentActivities(activities) {
  const activitiesContainer = document.querySelector('.activity-list');
  if (!activitiesContainer) return;
  
  // Clear existing activities
  activitiesContainer.innerHTML = '';
  
  // Add new activities
  activities.forEach(activity => {
    const activityElement = createActivityElement(activity);
    activitiesContainer.appendChild(activityElement);
  });
}

// Create an activity list item element
function createActivityElement(activity) {
  const timeAgo = window.utils ? window.utils.timeAgo(activity.time) : '';
  
  const li = document.createElement('li');
  li.className = 'activity-item';
  li.innerHTML = `
    <div class="activity-icon ${activity.type}">
      <i class="${getActivityIcon(activity.type)}"></i>
    </div>
    <div class="activity-content">
      <h4 class="activity-title">${activity.title}</h4>
      <p class="activity-meta">${activity.details}</p>
    </div>
    <span class="activity-time">${timeAgo}</span>
  `;
  
  return li;
}

// Get icon class based on activity type
function getActivityIcon(type) {
  const icons = {
    'appointment': 'fas fa-calendar-check',
    'prescription': 'fas fa-prescription',
    'lab': 'fas fa-flask',
    'payment': 'fas fa-credit-card',
    'default': 'fas fa-info-circle'
  };
  
  return icons[type] || icons['default'];
}

// Initialize charts (placeholder - implement with actual chart library)
function initializeCharts(chartData) {
  if (!chartData) return;
  
  // This is a placeholder for chart initialization
  // In a real app, you would use a charting library like Chart.js
  console.log('Initializing charts with data:', chartData);
  
  // Example with Chart.js (uncomment and implement if you include Chart.js)
  /*
  if (chartData.appointments && typeof Chart !== 'undefined') {
    const ctx = document.createElement('canvas');
    const container = document.querySelector('.appointments-chart-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(ctx);
      
      new Chart(ctx, {
        type: chartData.appointments.type || 'line',
        data: {
          labels: chartData.appointments.labels,
          datasets: [{
            label: 'Appointments',
            data: chartData.appointments.data,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
          }
        }
      });
    }
  }
  */
}

// Set loading state
function setLoadingState(isLoading) {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = isLoading ? 'flex' : 'none';
  }
  
  // Disable interactive elements
  const interactiveElements = document.querySelectorAll('button, a, input, select');
  interactiveElements.forEach(el => {
    if (isLoading) {
      el.setAttribute('disabled', 'disabled');
    } else {
      el.removeAttribute('disabled');
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Logout button
  const logoutButtons = document.querySelectorAll('[data-button-logout]');
  logoutButtons.forEach(button => {
    button.addEventListener('click', handleLogout);
  });
  
  // Chart period toggles
  const periodToggles = document.querySelectorAll('.chart-period-toggle');
  periodToggles.forEach(toggle => {
    toggle.addEventListener('click', handlePeriodToggle);
  });
  
  // Search functionality
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    const debouncedSearch = window.utils ? 
      window.utils.debounce(handleSearch, 300) : 
      debounce(handleSearch, 300);
    
    searchInput.addEventListener('input', debouncedSearch);
  }
  
  // Responsive adjustments
  window.addEventListener('resize', handleResize);
}

// Handle logout
function handleLogout(e) {
  e.preventDefault();
  
  // Clear authentication data
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  // Redirect to login page
  window.location.href = 'login.html';
}

// Handle chart period toggle
function handlePeriodToggle(e) {
  const period = e.target.dataset.period || 'week';
  
  // Update active state
  document.querySelectorAll('.chart-period-toggle').forEach(btn => {
    btn.classList.toggle('active', btn === e.target);
  });
  
  // Update chart data
  updateChartData(period);
}

// Update chart data based on selected period
function updateChartData(period) {
  console.log(`Updating charts for period: ${period}`);
  
  // In a real app, you would fetch new data for the selected period
  // and update the charts accordingly
  
  // For now, we'll just log the action
  showNotification(`Showing data for ${period}`, 'info');
}

// Handle search
function handleSearch(e) {
  const query = e.target.value.trim();
  console.log('Searching for:', query);
  
  // In a real app, you would trigger a search API call
  // and update the UI with the results
  
  if (query.length > 2) {
    // Show search results
    showNotification(`Searching for "${query}"`, 'info');
  }
}

// Handle window resize
function handleResize() {
  // Update any responsive elements
  const sidebar = document.querySelector('.admin-sidebar');
  if (window.innerWidth > 992) {
    sidebar.classList.remove('active');
    document.body.classList.remove('sidebar-active');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  if (window.utils && typeof window.utils.showNotification === 'function') {
    window.utils.showNotification(message, type);
    return;
  }
  
  // Fallback notification
  console.log(`${type.toUpperCase()}: ${message}`);
  alert(`${type.toUpperCase()}: ${message}`);
}

// Check if user is authenticated
function checkAuth() {
  // In a real app, you would check for a valid auth token
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
    return;
  }
  
  // Load user data
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      updateUserProfile(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
}

// Update user profile in the UI
function updateUserProfile(user) {
  // Update user name
  const userNameElements = document.querySelectorAll('.user-name, .user-profile-name');
  userNameElements.forEach(el => {
    if (user.name) el.textContent = user.name;
  });
  
  // Update user role
  const userRoleElements = document.querySelectorAll('.user-role, .user-profile-role');
  userRoleElements.forEach(el => {
    if (user.role) el.textContent = user.role;
  });
  
  // Update user avatar
  const userAvatarElements = document.querySelectorAll('.user-avatar, .user-avatar-small img');
  userAvatarElements.forEach(el => {
    if (user.avatar) {
      el.src = user.avatar;
    } else if (user.name) {
      // Generate avatar with initials as fallback
      const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
      el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`;
    }
  });
}

// Debounce function (fallback if not available in utils)
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Make functions available globally
window.adminDashboard = {
  loadDashboardData,
  updateChartData,
  handleSearch,
  handleLogout
};
