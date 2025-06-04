// stats.js

// Global function to add activity, used by other scripts like reservations.js and contact.js
// This function is now primarily defined in admin.js, but a fallback is here for robustness
window.addActivity = window.addActivity || function(description) {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.unshift({ // Add to the beginning to show most recent first
        id: Date.now(), // Unique ID for activity
        date: new Date().toISOString(),
        description: description
    });
    // Keep only the latest 10 activities to avoid clutter
    localStorage.setItem('activities', JSON.stringify(activities.slice(0, 10)));
    // Dispatch a custom event so admin.js can react and update the list
    document.dispatchEvent(new CustomEvent('activityAdded'));
};

// Function to update dashboard stats
function updateDashboardStats() {
    const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const complaints = JSON.parse(localStorage.getItem('complaints')) || [];
    const categories = new Set(recipes.map(recipe => recipe.category));

    // Update the counter elements (ensure these IDs exist in admin_dashboard.html)
    const totalRecipesElement = document.getElementById('total-recipes');
    if (totalRecipesElement) totalRecipesElement.textContent = recipes.length;

    const activeUsersElement = document.getElementById('active-users');
    if (activeUsersElement) activeUsersElement.textContent = users.length || 0;

    const totalReservationsElement = document.getElementById('total-reservations');
    if (totalReservationsElement) totalReservationsElement.textContent = reservations.length;

    const totalCategoriesElement = document.getElementById('total-categories');
    if (totalCategoriesElement) totalCategoriesElement.textContent = categories.size;

    // You might want to add a complaints counter too
    // const totalComplaintsElement = document.getElementById('total-complaints');
    // if (totalComplaintsElement) totalComplaintsElement.textContent = complaints.length;
}

// Chart instances to prevent re-initialization
let popularRecipesChartInstance = null;
let categoriesChartInstance = null;

function initializeCharts() {
    const recipes = JSON.parse(localStorage.getItem('recipes')) || [];

    // Destroy existing chart instances if they exist
    if (popularRecipesChartInstance) {
        popularRecipesChartInstance.destroy();
    }
    if (categoriesChartInstance) {
        categoriesChartInstance.destroy();
    }

    // Popular Recipes Chart
    const popularRecipesCanvas = document.getElementById('popular-recipes-chart');
    if (popularRecipesCanvas) {
        const popularRecipes = recipes
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5); // Top 5 popular recipes

        const ctx = popularRecipesCanvas.getContext('2d');
        popularRecipesChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: popularRecipes.map(recipe => recipe.name),
                datasets: [{
                    label: 'Nombre de vues',
                    data: popularRecipes.map(recipe => recipe.views || 0),
                    backgroundColor: 'rgba(141, 91, 76, 0.7)', // Primary color
                    borderColor: 'rgba(141, 91, 76, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow canvas to resize freely
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0 // Ensure integer ticks for views
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // No need for legend if only one dataset
                    },
                    title: {
                        display: true,
                        text: 'Top 5 Recettes Populaires'
                    }
                }
            }
        });
    }


    // Categories Distribution Chart
    const categoriesCanvas = document.getElementById('categories-chart');
    if (categoriesCanvas) {
        const categoryCounts = recipes.reduce((acc, recipe) => {
            acc[recipe.category] = (acc[recipe.category] || 0) + 1;
            return acc;
        }, {});

        const ctx = categoriesCanvas.getContext('2d');
        categoriesChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryCounts),
                datasets: [{
                    label: 'Nombre de recettes par catégorie',
                    data: Object.values(categoryCounts),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)', // Red
                        'rgba(54, 162, 235, 0.7)', // Blue
                        'rgba(255, 206, 86, 0.7)', // Yellow
                        'rgba(75, 192, 192, 0.7)', // Green
                        'rgba(153, 102, 255, 0.7)', // Purple
                        'rgba(255, 159, 64, 0.7)'  // Orange
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow canvas to resize freely
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Distribution des Catégories'
                    }
                }
            }
        });
    }
}

// Function to load recent activity (now in admin.js as well, but kept here for clarity if needed elsewhere)
window.loadRecentActivity = function() {
    const activityList = document.getElementById('recent-activity-list');
    if (!activityList) return;

    const activities = JSON.parse(localStorage.getItem('activities')) || [];

    activityList.innerHTML = activities
        .map(activity => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${activity.description}</span>
                <small class="text-muted">${new Date(activity.date).toLocaleString()}</small>
            </li>
        `).join('');
    if (activities.length === 0) {
        activityList.innerHTML = '<li class="list-group-item text-center text-muted">Aucune activité récente.</li>';
    }
}


// Initial setup for stats when the dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    updateDashboardStats();
    initializeCharts();
    loadRecentActivity(); // Initial load of activities

    // Listen for custom events dispatched from other pages/scripts
    // These events will trigger a dashboard update when relevant data changes.
    document.addEventListener('reservationAdded', () => {
        updateDashboardStats();
        if (typeof loadAdminReservationsTable === 'function') {
            loadAdminReservationsTable();
        }
    });

    document.addEventListener('reservationUpdated', () => {
        updateDashboardStats();
        if (typeof loadAdminReservationsTable === 'function') {
            loadAdminReservationsTable();
        }
    });

    document.addEventListener('complaintAdded', () => {
        updateDashboardStats();
        if (typeof loadAdminComplaintsTable === 'function') {
            loadAdminComplaintsTable();
        }
    });

    document.addEventListener('complaintReplied', () => {
        updateDashboardStats();
        if (typeof loadAdminComplaintsTable === 'function') {
            loadAdminComplaintsTable();
        }
    });

    document.addEventListener('menuUpdated', () => {
        updateDashboardStats(); // Menu updates might affect categories count
        initializeCharts(); // Re-render charts as menu data changes
    });

    document.addEventListener('activityAdded', loadRecentActivity); // Listen for activity updates and refresh list

    // Listen for generic data updates from app.js (e.g., recipes or users changed)
    document.addEventListener('dataUpdated', (event) => {
        if (event.detail.key === 'recipes' || event.detail.key === 'users') {
            updateDashboardStats();
            initializeCharts();
        }
    });
});

// This function is kept for backward compatibility if other scripts still call it directly
function updateStats() {
    updateDashboardStats();
}
