const API_BASE_URL = 'https://mealsfly-reataurant-database.onrender.com/api';

// DOM Elements
const homepage = document.getElementById('homepage');
const adminDashboard = document.getElementById('adminDashboard');
const restaurantForm = document.getElementById('restaurantForm');
const adminLoginForm = document.getElementById('adminLoginForm');
const logoutBtn = document.getElementById('logoutBtn');
const restaurantsTableBody = document.getElementById('restaurantsTableBody');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const detailsModal = document.getElementById('detailsModal');
const closeModals = document.querySelectorAll('.close-modal');
const searchInput = document.getElementById('searchInput');

// File upload labels
const foodLicenseInput = document.getElementById('foodLicense');
const menuSheetInput = document.getElementById('menuSheet');

foodLicenseInput.addEventListener('change', function () {
  const label = this.nextElementSibling;
  if (this.files.length > 0) {
    label.textContent = this.files[0].name;
  }
});

menuSheetInput.addEventListener('change', function () {
  const label = this.nextElementSibling;
  if (this.files.length > 0) {
    label.textContent = this.files[0].name;
  }
});

// Restaurant Form Submission
restaurantForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(restaurantForm);
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (response.ok) {
      showToast('Restaurant registered successfully!', 'success');
      restaurantForm.reset();
      document.querySelectorAll('.file-upload-label span').forEach((span) => {
        span.textContent = span.textContent.includes('Food License')
          ? 'Click to upload Food License'
          : 'Click to upload Menu Sheet';
      });
    } else {
      showToast(result.message || 'Error registering restaurant', 'error');
    }
  } catch (error) {
    console.error('Restaurant submission error:', error);
    showToast('Network error. Please check your connection and try again.', 'error');
  }
});

// Admin Login
adminLoginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();
    if (response.ok) {
      localStorage.setItem('adminToken', result.token);
      showAdminDashboard();
      loadRestaurants();
    } else {
      showToast(result.message || 'Invalid credentials', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Network error. Please check your connection and try again.', 'error');
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  showHomepage();
  adminLoginForm.reset();
});

// Show/Hide sections
function showAdminDashboard() {
  homepage.style.display = 'none';
  adminDashboard.style.display = 'block';
}

function showHomepage() {
  homepage.style.display = 'flex';
  adminDashboard.style.display = 'none';
}

// Load restaurants
async function loadRestaurants(searchQuery = '') {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showToast('No authentication token found. Please log in again.', 'error');
      showHomepage();
      return;
    }
    let url = `${API_BASE_URL}/restaurants?sort=-createdAt`;
    if (searchQuery) {
      url = `${API_BASE_URL}/restaurants/search/${encodeURIComponent(searchQuery)}`;
    }
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      const restaurants = searchQuery ? data : (data.restaurants || []);
      displayRestaurants(restaurants);
    } else {
      showToast(data.message || 'Error loading restaurants', 'error');
      if (response.status === 401) {
        showToast('Session expired. Please log in again.', 'error');
        localStorage.removeItem('adminToken');
        showHomepage();
      }
    }
  } catch (error) {
    console.error('Load restaurants error:', error);
    showToast('Network error. Please check your connection and try again.', 'error');
  }
}

// Display restaurants in table
function displayRestaurants(restaurants) {
  restaurantsTableBody.innerHTML = '';
  if (restaurants.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5" style="text-align: center;">No restaurants found.</td>';
    restaurantsTableBody.appendChild(row);
    return;
  }
  restaurants.forEach((restaurant) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(restaurant.createdAt).toLocaleDateString()}</td>
      <td>${restaurant.restaurantName}</td>
      <td>${restaurant.ownerName}</td>
      <td class="status-${restaurant.status.toLowerCase()}">${restaurant.status}</td>
      <td class="action-buttons">
        <button class="edit-btn" onclick="editRestaurant('${restaurant._id}')">Edit</button>
        <button class="delete-btn" onclick="deleteRestaurant('${restaurant._id}')">Delete</button>
      </td>
    `;
    row.addEventListener('click', (e) => {
      if (!e.target.classList.contains('edit-btn') && !e.target.classList.contains('delete-btn')) {
        showRestaurantDetails(restaurant._id);
      }
    });
    restaurantsTableBody.appendChild(row);
  });
}

// Search restaurants
function searchRestaurants() {
  const query = searchInput.value.trim();
  loadRestaurants(query);
}

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchRestaurants();
  }
});

// Show restaurant details
async function showRestaurantDetails(id) {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showToast('No authentication token found. Please log in again.', 'error');
      showHomepage();
      return;
    }
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const restaurant = await response.json();
    if (response.ok) {
      document.getElementById('detailsRestaurantName').textContent = restaurant.restaurantName;
      document.getElementById('detailsOwnerName').textContent = restaurant.ownerName;
      document.getElementById('detailsPhoneNumber').textContent = restaurant.phoneNumber;
      document.getElementById('detailsBusinessEmail').textContent = restaurant.businessEmail;
      document.getElementById('detailsRestaurantAddress').textContent = restaurant.restaurantAddress;
      document.getElementById('detailsOperatingHours').textContent = restaurant.operatingHours;
      document.getElementById('detailsCuisineType').textContent = restaurant.cuisineType;
      document.getElementById('detailsStatus').textContent = restaurant.status;
      document.getElementById('detailsStatus').className = `status-${restaurant.status.toLowerCase()}`;
      document.getElementById('detailsCreatedAt').textContent = new Date(restaurant.createdAt).toLocaleString();

      const foodLicenseImg = document.getElementById('detailsFoodLicense');
      const foodLicenseText = document.getElementById('detailsFoodLicenseText');
      const menuSheetImg = document.getElementById('detailsMenuSheet');
      const menuSheetText = document.getElementById('detailsMenuSheetText');

      if (restaurant.foodLicenseUrl && restaurant.foodLicenseUrl.match(/\.(jpg|jpeg|png)$/)) {
        foodLicenseImg.src = restaurant.foodLicenseUrl;
        foodLicenseImg.style.display = 'block';
        foodLicenseText.innerHTML = `<a href="${restaurant.foodLicenseUrl}" target="_blank">View Food License</a>`;
      } else {
        foodLicenseImg.style.display = 'none';
        foodLicenseText.innerHTML = restaurant.foodLicenseUrl
          ? `<a href="${restaurant.foodLicenseUrl}" target="_blank">View Food License (PDF)</a>`
          : 'No Food License Available';
      }

      if (restaurant.menuSheetUrl && restaurant.menuSheetUrl.match(/\.(jpg|jpeg|png)$/)) {
        menuSheetImg.src = restaurant.menuSheetUrl;
        menuSheetImg.style.display = 'block';
        menuSheetText.innerHTML = `<a href="${restaurant.menuSheetUrl}" target="_blank">View Menu Sheet</a>`;
      } else {
        menuSheetImg.style.display = 'none';
        menuSheetText.innerHTML = restaurant.menuSheetUrl
          ? `<a href="${restaurant.menuSheetUrl}" target="_blank">View Menu Sheet (PDF)</a>`
          : 'No Menu Sheet Available';
      }

      detailsModal.style.display = 'block';
    } else {
      showToast(restaurant.message || 'Error loading restaurant details', 'error');
      if (response.status === 401) {
        showToast('Session expired. Please log in again.', 'error');
        localStorage.removeItem('adminToken');
        showHomepage();
      }
    }
  } catch (error) {
    console.error('Show restaurant details error:', error);
    showToast('Network error. Please check your connection and try again.', 'error');
  }
}

// Edit restaurant
async function editRestaurant(id) {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showToast('No authentication token found. Please log in again.', 'error');
      showHomepage();
      return;
    }
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const restaurant = await response.json();
    if (response.ok) {
      document.getElementById('editRestaurantId').value = restaurant._id;
      document.getElementById('editRestaurantName').value = restaurant.restaurantName;
      document.getElementById('editOwnerName').value = restaurant.ownerName;
      document.getElementById('editPhoneNumber').value = restaurant.phoneNumber;
      document.getElementById('editBusinessEmail').value = restaurant.businessEmail;
      document.getElementById('editRestaurantAddress').value = restaurant.restaurantAddress;
      document.getElementById('editOperatingHours').value = restaurant.operatingHours;
      document.getElementById('editCuisineType').value = restaurant.cuisineType;
      document.getElementById('editStatus').value = restaurant.status;
      editModal.style.display = 'block';
    } else {
      showToast(restaurant.message || 'Error loading restaurant details', 'error');
      if (response.status === 401) {
        showToast('Session expired. Please log in again.', 'error');
        localStorage.removeItem('adminToken');
        showHomepage();
      }
    }
  } catch (error) {
    console.error('Edit restaurant error:', error);
    showToast('Network error. Please check your connection and try again.', 'error');
  }
}

// Delete restaurant
async function deleteRestaurant(id) {
  if (!confirm('Are you sure you want to delete this restaurant?')) {
    return;
  }
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showToast('No authentication token found. Please log in again.', 'error');
      showHomepage();
      return;
    }
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      showToast('Restaurant deleted successfully!', 'success');
      loadRestaurants();
    } else {
      const result = await response.json();
      showToast(result.message || 'Error deleting restaurant', 'error');
      if (response.status === 401) {
        showToast('Session expired. Please log in again.', 'error');
        localStorage.removeItem('adminToken');
        showHomepage();
      }
    }
  } catch (error) {
    console.error('Delete restaurant error:', error);
    showToast('Network error. Please check your connection and try again.', 'error');
  }
}

// Edit form submission
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(editForm);
  const id = document.getElementById('editRestaurantId').value;
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showToast('No authentication token found. Please log in again.', 'error');
      showHomepage();
      return;
    }
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    if (response.ok) {
      showToast('Restaurant updated successfully!', 'success');
      editModal.style.display = 'none';
      loadRestaurants();
    } else {
      const result = await response.json();
      showToast(result.message || 'Error updating restaurant', 'error');
      if (response.status === 401) {
        showToast('Session expired. Please log in again.', 'error');
        localStorage.removeItem('adminToken');
        showHomepage();
      }
    }
  } catch (error) {
    console.error('Update restaurant error:', error);
    showToast('Network error. Please check your connection and try again.', 'error');
  }
});

// Close modals
closeModals.forEach((closeBtn) => {
  closeBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
    detailsModal.style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target === editModal || e.target === detailsModal) {
    editModal.style.display = 'none';
    detailsModal.style.display = 'none';
  }
});

// Show toast notification
function showToast(message, type) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Check if admin is already logged in
window.addEventListener('load', () => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    showAdminDashboard();
    loadRestaurants();
  }
});

// Make functions global for onclick handlers
window.editRestaurant = editRestaurant;
window.deleteRestaurant = deleteRestaurant;
window.searchRestaurants = searchRestaurants;