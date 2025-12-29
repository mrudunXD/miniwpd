// Utility functions for the application

// Format date to readable format
function formatDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format time ago
function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
  
  return 'just now';
}

// Generate random ID
function generateId(prefix = '') {
  return prefix + Math.random().toString(36).substr(2, 9);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Validate email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Format phone number
function formatPhoneNumber(phone) {
  // Format as (123) 456-7890
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? '(' + match[1] + ') ' + match[2] + '-' + match[3] : phone;
}

// Export functions
window.utils = {
  formatDate,
  timeAgo,
  generateId,
  debounce,
  formatCurrency,
  isValidEmail,
  formatPhoneNumber
};

// Initialize tooltips
function initTooltips() {
  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
  
  tooltipTriggers.forEach(trigger => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = trigger.getAttribute('data-tooltip');
    document.body.appendChild(tooltip);
    
    const updateTooltip = () => {
      const rect = trigger.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${rect.bottom + 8}px`;
    };
    
    trigger.addEventListener('mouseenter', () => {
      tooltip.classList.add('show');
      updateTooltip();
    });
    
    trigger.addEventListener('mouseleave', () => {
      tooltip.classList.remove('show');
    });
    
    window.addEventListener('resize', updateTooltip);
  });
}

// Initialize dropdowns
function initDropdowns() {
  document.addEventListener('click', (e) => {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  });
  
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = toggle.closest('.dropdown');
      dropdown.classList.toggle('active');
    });
  });
}

// Initialize modals
function initModals() {
  // Close modal when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
  
  // Close buttons
  const closeButtons = document.querySelectorAll('.modal-close, .btn-close-modal');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  });
  
  // Open modal triggers
  const modalTriggers = document.querySelectorAll('[data-modal]');
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
}

// Initialize form validation
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('[required]');
    
    inputs.forEach(input => {
      // Add validation classes on blur
      input.addEventListener('blur', () => {
        validateInput(input);
      });
      
      // Real-time validation for some input types
      if (input.type === 'email') {
        input.addEventListener('input', () => {
          if (input.value && !isValidEmail(input.value)) {
            input.setCustomValidity('Please enter a valid email address');
          } else {
            input.setCustomValidity('');
          }
        });
      }
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
      let isValid = true;
      
      inputs.forEach(input => {
        if (!validateInput(input)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        e.preventDefault();
      }
    });
  });
  
  function validateInput(input) {
    if (input.required && !input.value.trim()) {
      input.classList.add('error');
      input.setCustomValidity('This field is required');
      return false;
    }
    
    if (input.type === 'email' && input.value && !isValidEmail(input.value)) {
      input.classList.add('error');
      input.setCustomValidity('Please enter a valid email address');
      return false;
    }
    
    if (input.pattern && input.value) {
      const regex = new RegExp(input.pattern);
      if (!regex.test(input.value)) {
        input.classList.add('error');
        input.setCustomValidity(input.dataset.patternMessage || 'Invalid format');
        return false;
      }
    }
    
    input.classList.remove('error');
    input.setCustomValidity('');
    return true;
  }
}

// Initialize all UI components
document.addEventListener('DOMContentLoaded', () => {
  initTooltips();
  initDropdowns();
  initModals();
  initFormValidation();
  
  // Initialize sidebar toggle for mobile
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.admin-sidebar');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      document.body.classList.toggle('sidebar-active');
    });
  }
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992 && 
        sidebar && 
        !sidebar.contains(e.target) && 
        menuToggle && 
        !menuToggle.contains(e.target)) {
      sidebar.classList.remove('active');
      document.body.classList.remove('sidebar-active');
    }
  });
  
  // Active menu item highlighting
  const menuItems = document.querySelectorAll('.sidebar-nav a');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      menuItems.forEach(i => i.parentElement.classList.remove('active'));
      item.parentElement.classList.add('active');
    });
  });
  
  // Initialize chart buttons
  const chartButtons = document.querySelectorAll('.chart-actions button');
  chartButtons.forEach(button => {
    button.addEventListener('click', () => {
      chartButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      // Here you would update the chart data based on the selected period
      updateChartData(button.textContent.trim().toLowerCase());
    });
  });
  
  // Logout functionality
  const logoutButtons = document.querySelectorAll('[data-button-logout]');
  logoutButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      // Clear any session data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = 'login.html';
    });
  });
});

// Function to update chart data (placeholder - implement with actual chart library)
function updateChartData(period = 'week') {
  console.log(`Updating chart data for ${period}`);
  // This would be implemented with a charting library like Chart.js
}

// Function to show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Function to toggle loading state
function setLoading(selector, isLoading) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    if (isLoading) {
      el.classList.add('loading');
      el.disabled = true;
      const originalText = el.textContent;
      el.setAttribute('data-original-text', originalText);
      el.innerHTML = '<span class="spinner"></span> Loading...';
    } else {
      el.classList.remove('loading');
      el.disabled = false;
      const originalText = el.getAttribute('data-original-text');
      if (originalText) {
        el.textContent = originalText;
      }
    }
  });
}

// Add utility functions to window
window.utils = {
  ...window.utils,
  showNotification,
  setLoading,
  updateChartData
};

// Initialize any dynamic content that might be added later
const observer = new MutationObserver((mutations) => {
  initTooltips();
  initDropdowns();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
