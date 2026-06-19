// Medicine Order Portal - JavaScript

// Initialize data from localStorage
let orders = JSON.parse(localStorage.getItem('medicineOrders')) || [];
let editingId = null;

// DOM Elements
const orderForm = document.getElementById('orderForm');
const editForm = document.getElementById('editForm');
const tableBody = document.getElementById('tableBody');
const noDataMsg = document.getElementById('noData');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('editModal');
const closeBtn = document.querySelector('.close');

// Event Listeners
orderForm.addEventListener('submit', addOrder);
editForm.addEventListener('submit', updateOrder);
searchInput.addEventListener('keyup', searchOrders);
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeModal();
    }
});

// Add Order
function addOrder(e) {
    e.preventDefault();

    const newOrder = {
        id: Date.now(),
        medicineName: document.getElementById('medicineName').value,
        stockistName: document.getElementById('stockistName').value,
        quantity: parseInt(document.getElementById('quantity').value),
        mrp: parseFloat(document.getElementById('mrp').value),
        ptd: parseFloat(document.getElementById('ptd').value)
    };

    orders.push(newOrder);
    saveToLocalStorage();
    orderForm.reset();
    renderTable();
    updateStatistics();

    // Show success message
    showNotification('Order added successfully! ✅');
}

// Render Table
function renderTable(dataToRender = orders) {
    tableBody.innerHTML = '';

    if (dataToRender.length === 0) {
        noDataMsg.style.display = 'block';
        return;
    }

    noDataMsg.style.display = 'none';

    dataToRender.forEach((order, index) => {
        const totalValue = (order.quantity * order.mrp).toFixed(2);
        const totalCost = (order.quantity * order.ptd).toFixed(2);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${order.medicineName}</strong></td>
            <td>${order.stockistName}</td>
            <td>${order.quantity}</td>
            <td>₹${order.mrp.toFixed(2)}</td>
            <td>₹${order.ptd.toFixed(2)}</td>
            <td>₹${totalValue}</td>
            <td>
                <button class="btn btn-edit" onclick="openEditModal(${order.id})">✏️ Edit</button>
                <button class="btn btn-delete" onclick="deleteOrder(${order.id})">🗑️ Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search Orders
function searchOrders() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = orders.filter(order =>
        order.medicineName.toLowerCase().includes(searchTerm) ||
        order.stockistName.toLowerCase().includes(searchTerm)
    );
    renderTable(filtered);
}

// Open Edit Modal
function openEditModal(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    editingId = id;
    document.getElementById('editId').value = id;
    document.getElementById('editMedicineName').value = order.medicineName;
    document.getElementById('editStockistName').value = order.stockistName;
    document.getElementById('editQuantity').value = order.quantity;
    document.getElementById('editMrp').value = order.mrp;
    document.getElementById('editPtd').value = order.ptd;

    modal.style.display = 'block';
}

// Close Modal
function closeModal() {
    modal.style.display = 'none';
    editingId = null;
}

// Update Order
function updateOrder(e) {
    e.preventDefault();

    const orderIndex = orders.findIndex(o => o.id === editingId);
    if (orderIndex === -1) return;

    orders[orderIndex] = {
        id: editingId,
        medicineName: document.getElementById('editMedicineName').value,
        stockistName: document.getElementById('editStockistName').value,
        quantity: parseInt(document.getElementById('editQuantity').value),
        mrp: parseFloat(document.getElementById('editMrp').value),
        ptd: parseFloat(document.getElementById('editPtd').value)
    };

    saveToLocalStorage();
    renderTable();
    updateStatistics();
    closeModal();
    editForm.reset();

    // Show success message
    showNotification('Order updated successfully! ✅');
}

// Delete Order
function deleteOrder(id) {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        orders = orders.filter(order => order.id !== id);
        saveToLocalStorage();
        renderTable();
        updateStatistics();
        showNotification('Order deleted successfully! 🗑️');
    }
}

// Update Statistics
function updateStatistics() {
    const totalOrders = orders.length;
    const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);
    const totalValue = orders.reduce((sum, order) => sum + (order.quantity * order.mrp), 0);
    const totalCost = orders.reduce((sum, order) => sum + (order.quantity * order.ptd), 0);

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalQuantity').textContent = totalQuantity;
    document.getElementById('totalValue').textContent = '₹' + totalValue.toFixed(2);
    document.getElementById('totalCost').textContent = '₹' + totalCost.toFixed(2);
}

// Save to Local Storage
function saveToLocalStorage() {
    localStorage.setItem('medicineOrders', JSON.stringify(orders));
}

// Export to CSV
function exportToCSV() {
    if (orders.length === 0) {
        alert('No orders to export!');
        return;
    }

    let csv = 'Sr.No,Medicine Name,Stockist Name,Quantity,MRP,PTD,Total Value (MRP),Total Cost (PTD)\n';

    orders.forEach((order, index) => {
        const totalValue = (order.quantity * order.mrp).toFixed(2);
        const totalCost = (order.quantity * order.ptd).toFixed(2);

        csv += `${index + 1},"${order.medicineName}","${order.stockistName}",${order.quantity},${order.mrp.toFixed(2)},${order.ptd.toFixed(2)},${totalValue},${totalCost}\n`;
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicine-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showNotification('CSV exported successfully! 📥');
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s;
        font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    updateStatistics();
});