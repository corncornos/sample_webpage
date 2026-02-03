const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
let vehicleModal, saleModal, userModal;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    vehicleModal = new bootstrap.Modal(document.getElementById('vehicleModal'));
    saleModal = new bootstrap.Modal(document.getElementById('saleModal'));
    userModal = new bootstrap.Modal(document.getElementById('userModal'));

    if (token) {
        showDashboard();
    }
});

// ========== LOGIN & LOGOUT ==========
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Login failed');
            return;
        }

        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showDashboard();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Make sure the backend server is running on http://localhost:5000');
    }
}

function handleLogout() {
    token = null;
    currentUser = {};
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');

    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('loginForm').reset();
}

// ========== DASHBOARD ==========
function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';

    // Show admin menu if user is admin
    const adminMenuLi = document.getElementById('adminMenuLi');
    if (currentUser.role === 'admin') {
        adminMenuLi.style.display = 'block';
    } else {
        adminMenuLi.style.display = 'none';
    }

    showTab('dashboard');
}

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // Show selected tab
    document.getElementById(tabName + 'Tab').style.display = 'block';

    // Load content based on tab
    if (tabName === 'dashboard') {
        loadDashboardStats();
    } else if (tabName === 'vehicles') {
        loadVehicles();
    } else if (tabName === 'sales') {
        loadSales();
    } else if (tabName === 'users') {
        loadUsers();
    }
}

// ========== DASHBOARD STATS ==========
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        document.getElementById('totalCars').textContent = data.totalCars;
        document.getElementById('availableCars').textContent = data.availableCars;
        document.getElementById('soldCars').textContent = data.soldCars;
        document.getElementById('totalSales').textContent = '₹' + formatNumber(data.totalSales);
        document.getElementById('inventoryValue').textContent = '₹' + formatNumber(data.inventoryValue);

        // Load recent sales
        const tbody = document.querySelector('#recentSalesTable tbody');
        tbody.innerHTML = '';

        if (data.recentSales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No sales yet</td></tr>';
            return;
        }

        data.recentSales.forEach(sale => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${sale.stock_number}</td>
                <td>${sale.brand} ${sale.model} (${sale.year})</td>
                <td>${sale.buyer_name}</td>
                <td>₹${formatNumber(sale.sale_price)}</td>
                <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
            `;
        });
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        alert('Failed to load dashboard stats');
    }
}

// ========== VEHICLE MANAGEMENT ==========
async function loadVehicles() {
    try {
        const brand = document.getElementById('filterBrand').value;
        const model = document.getElementById('filterModel').value;
        const year = document.getElementById('filterYear').value;
        const status = document.getElementById('filterStatus').value;
        const sortBy = document.getElementById('sortBy').value;

        let url = `${API_URL}/vehicles?`;
        if (brand) url += `brand=${encodeURIComponent(brand)}&`;
        if (model) url += `model=${encodeURIComponent(model)}&`;
        if (year) url += `year=${year}&`;
        if (status) url += `status=${status}&`;
        if (sortBy) {
            url += `sortBy=${sortBy}&order=asc&`;
        }

        const response = await fetch(url.slice(0, -1), {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const vehicles = await response.json();
        const tbody = document.querySelector('#vehiclesTable tbody');
        tbody.innerHTML = '';

        vehicles.forEach(vehicle => {
            const row = tbody.insertRow();
            const statusBadge = `<span class="badge badge-${vehicle.status.toLowerCase()}">${vehicle.status}</span>`;

            row.innerHTML = `
                <td>${vehicle.stock_number}</td>
                <td>${vehicle.brand}</td>
                <td>${vehicle.model}</td>
                <td>${vehicle.year}</td>
                <td>${vehicle.color || '-'}</td>
                <td>${statusBadge}</td>
                <td>₹${formatNumber(vehicle.purchase_price)}</td>
                <td>₹${formatNumber(vehicle.selling_price)}</td>
                <td>
                    <button class="btn btn-sm btn-info btn-action" onclick="editVehicle(${vehicle.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${vehicle.status === 'Available' && currentUser.role !== 'staff' ? `
                        <button class="btn btn-sm btn-danger btn-action" onclick="deleteVehicle(${vehicle.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : ''}
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading vehicles:', error);
        alert('Failed to load vehicles');
    }
}

function showAddVehicleModal() {
    document.getElementById('vehicleModalTitle').textContent = 'Add Vehicle';
    document.getElementById('vehicleForm').reset();
    document.getElementById('vehicleId').value = '';
    vehicleModal.show();
}

async function editVehicle(id) {
    try {
        const response = await fetch(`${API_URL}/vehicles/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const vehicle = await response.json();

        document.getElementById('vehicleModalTitle').textContent = 'Edit Vehicle';
        document.getElementById('vehicleId').value = vehicle.id;
        document.getElementById('stockNumber').value = vehicle.stock_number;
        document.getElementById('brand').value = vehicle.brand;
        document.getElementById('model').value = vehicle.model;
        document.getElementById('year').value = vehicle.year;
        document.getElementById('variant').value = vehicle.variant || '';
        document.getElementById('color').value = vehicle.color || '';
        document.getElementById('transmission').value = vehicle.transmission;
        document.getElementById('fuelType').value = vehicle.fuel_type;
        document.getElementById('mileage').value = vehicle.mileage || '';
        document.getElementById('purchasePrice').value = vehicle.purchase_price;
        document.getElementById('sellingPrice').value = vehicle.selling_price;
        document.getElementById('vehicleStatus').value = vehicle.status;
        document.getElementById('notes').value = vehicle.notes || '';

        vehicleModal.show();
    } catch (error) {
        console.error('Error loading vehicle:', error);
        alert('Failed to load vehicle');
    }
}

async function saveVehicle() {
    const vehicleId = document.getElementById('vehicleId').value;
    const vehicleData = {
        stock_number: document.getElementById('stockNumber').value,
        brand: document.getElementById('brand').value,
        model: document.getElementById('model').value,
        year: document.getElementById('year').value,
        variant: document.getElementById('variant').value,
        color: document.getElementById('color').value,
        transmission: document.getElementById('transmission').value,
        fuel_type: document.getElementById('fuelType').value,
        mileage: document.getElementById('mileage').value,
        purchase_price: document.getElementById('purchasePrice').value,
        selling_price: document.getElementById('sellingPrice').value,
        status: document.getElementById('vehicleStatus').value,
        notes: document.getElementById('notes').value
    };

    try {
        let response;
        if (vehicleId) {
            response = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(vehicleData)
            });
        } else {
            response = await fetch(`${API_URL}/vehicles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(vehicleData)
            });
        }

        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Failed to save vehicle');
            return;
        }

        alert(vehicleId ? 'Vehicle updated successfully' : 'Vehicle added successfully');
        vehicleModal.hide();
        loadVehicles();
    } catch (error) {
        console.error('Error saving vehicle:', error);
        alert('Failed to save vehicle');
    }
}

async function deleteVehicle(id) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
        const response = await fetch(`${API_URL}/vehicles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            alert('Failed to delete vehicle');
            return;
        }

        alert('Vehicle deleted successfully');
        loadVehicles();
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Failed to delete vehicle');
    }
}

function filterVehicles() {
    loadVehicles();
}

function resetFilters() {
    document.getElementById('filterBrand').value = '';
    document.getElementById('filterModel').value = '';
    document.getElementById('filterYear').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('sortBy').value = '';
    loadVehicles();
}

// ========== SALES MANAGEMENT ==========
async function loadSales() {
    try {
        const response = await fetch(`${API_URL}/sales`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const sales = await response.json();
        const tbody = document.querySelector('#salesTable tbody');
        tbody.innerHTML = '';

        sales.forEach(sale => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${sale.stock_number}</td>
                <td>${sale.brand} ${sale.model} (${sale.year})</td>
                <td>${sale.buyer_name}</td>
                <td>₹${formatNumber(sale.sale_price)}</td>
                <td>${sale.payment_method}</td>
                <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
                <td>
                    ${currentUser.role === 'admin' ? `
                        <button class="btn btn-sm btn-danger btn-action" onclick="deleteSale(${sale.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : ''}
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading sales:', error);
        alert('Failed to load sales');
    }
}

async function showRecordSaleModal() {
    try {
        // Load available vehicles
        const response = await fetch(`${API_URL}/vehicles?status=Available`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const vehicles = await response.json();
        const vehicleSelect = document.getElementById('saleVehicle');
        vehicleSelect.innerHTML = '<option value="">Select a vehicle</option>';

        vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = `${vehicle.stock_number} - ${vehicle.brand} ${vehicle.model} (₹${formatNumber(vehicle.selling_price)})`;
            vehicleSelect.appendChild(option);
        });

        saleModal.show();
    } catch (error) {
        console.error('Error loading vehicles for sale:', error);
        alert('Failed to load vehicles');
    }
}

async function recordSale() {
    const vehicleId = document.getElementById('saleVehicle').value;
    const buyerName = document.getElementById('buyerName').value;
    const salePrice = document.getElementById('salePrice').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!vehicleId || !buyerName || !salePrice) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/sales`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                vehicle_id: vehicleId,
                buyer_name: buyerName,
                sale_price: salePrice,
                payment_method: paymentMethod
            })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Failed to record sale');
            return;
        }

        alert('Sale recorded successfully');
        saleModal.hide();
        document.getElementById('saleForm').reset();
        loadSales();
        loadDashboardStats();
    } catch (error) {
        console.error('Error recording sale:', error);
        alert('Failed to record sale');
    }
}

async function deleteSale(id) {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    try {
        const response = await fetch(`${API_URL}/sales/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            alert('Failed to delete sale');
            return;
        }

        alert('Sale deleted successfully');
        loadSales();
        loadDashboardStats();
    } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Failed to delete sale');
    }
}

// ========== USER MANAGEMENT ==========
async function loadUsers() {
    if (currentUser.role !== 'admin') {
        alert('Only admins can manage users');
        return;
    }

    // Since we don't have a GET users endpoint, we'll just show a message
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">User management feature - use backend admin panel for user list</td></tr>';
}

function showAddUserModal() {
    if (currentUser.role !== 'admin') {
        alert('Only admins can add users');
        return;
    }

    document.getElementById('userForm').reset();
    userModal.show();
}

async function addUser() {
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        role: document.getElementById('userRole').value
    };

    if (!userData.name || !userData.email || !userData.password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Failed to add user');
            return;
        }

        alert('User added successfully');
        userModal.hide();
        document.getElementById('userForm').reset();
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Failed to add user');
    }
}

// ========== UTILITY FUNCTIONS ==========
function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(Math.round(num || 0));
}
