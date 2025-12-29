// Sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.admin-sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    
    // Add overlay after sidebar in DOM
    if (sidebar && !document.querySelector('.sidebar-overlay')) {
        sidebar.parentNode.insertBefore(sidebarOverlay, sidebar.nextSibling);
    }

    // Toggle sidebar on mobile
    function toggleSidebar() {
        if (window.innerWidth <= 992) {
            document.body.classList.toggle('sidebar-active');
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        }
    }

    // Close sidebar when clicking outside on mobile
    function closeSidebar(e) {
        if (window.innerWidth <= 992 && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target) &&
            !sidebarToggle.contains(e.target)) {
            closeSidebar();
        }
    }

    // Close sidebar
    function closeSidebar() {
        document.body.classList.remove('sidebar-active');
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }

    // Event listeners
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    sidebarOverlay.addEventListener('click', closeSidebar);

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 992) {
                document.body.classList.remove('sidebar-active');
                sidebarOverlay.classList.remove('active');
            }
        }, 250);
    });

    // Highlight active menu item
    const menuItems = document.querySelectorAll('.sidebar-nav a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active class from all items
            menuItems.forEach(i => i.parentElement.classList.remove('active'));
            // Add active class to clicked item
            this.parentElement.classList.add('active');
            
            // Close sidebar on mobile after clicking a link
            if (window.innerWidth <= 992) {
                closeSidebar();
            }
        });
    });

    // Initialize tooltips for sidebar items
    const sidebarItems = document.querySelectorAll('.sidebar-nav [data-tooltip]');
    sidebarItems.forEach(item => {
        const tooltip = document.createElement('span');
        tooltip.className = 'sidebar-tooltip';
        tooltip.textContent = item.getAttribute('data-tooltip');
        item.appendChild(tooltip);
    });
});
