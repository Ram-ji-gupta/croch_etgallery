// ==========================
// LOAD ORDERS + PER-ORDER EDIT (status)
// ==========================

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered"];

function showOrderEditBackdrop(show) {
  const el = document.getElementById('orderEditBackdrop');
  if (!el) return;
  el.classList.toggle('show', !!show);
  el.style.display = show ? 'flex' : 'none';
}

function openOrderEdit(order) {
  if (!order) return;
  document.getElementById('editOrderId').value = order.id;
  document.getElementById('editOrderStatus').value = order.status || 'Pending';
  showOrderEditBackdrop(true);
}

function closeOrderEdit() {
  showOrderEditBackdrop(false);
}

async function saveOrderEdit() {
  const id = Number(document.getElementById('editOrderId').value);
  const status = document.getElementById('editOrderStatus').value;

  if (!Number.isFinite(id) || id <= 0) {
    alert('Invalid order id');
    return;
  }
  if (!STATUSES.includes(status)) {
    alert('Choose a valid status');
    return;
  }

  try {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(AdminConfig.api(`/api/orders/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(`Update failed (${res.status}): ${msg}`);
    }

    closeOrderEdit();
    await loadOrders();
  } catch (err) {
    console.log(err);
    alert('Failed to update order');
  }
}

async function loadOrders() {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(AdminConfig.api('/api/orders'), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      throw new Error(`Failed to load orders: ${response.status}`);
    }

    const orders = await response.json();
    if (!Array.isArray(orders)) {
      throw new Error('Orders response is not an array');
    }

    const container = document.getElementById('ordersList');
    if (!container) return;

    container.innerHTML = '';

    const filterVal = (document.getElementById('orderStatusFilter')?.value || 'All');
    const filteredOrders = filterVal === 'All' ? orders : orders.filter(o => String(o.status || 'Pending') === filterVal);

    filteredOrders.forEach(order => {
      const status = order.status || 'Pending';

      container.innerHTML += `
        <div class="order-card" data-order-id="${order.id}" style="margin-bottom:14px;">
          <h3>${order.customer}</h3>
          <p>📞 ${order.phone}</p>
          <p>📍 ${order.address}</p>
          <p>💰 ₹${(() => {
            const v = order.total ?? order.Total ?? order.amount ?? order.TotalAmount ?? order.priceTotal;
            if (v === null || v === undefined || v === '') return '-';
            const n = Number(v);
            return Number.isFinite(n) ? n.toFixed(2) : String(v);
          })()}</p>

          <div class="status-row" style="margin-top:8px">
            <span>Current Status</span>
            <span class="status-badge ${String(status).toLowerCase()}">${status}</span>
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
            <button class="btn-secondary" onclick='openOrderEdit(${JSON.stringify(order)})'>Edit</button>
            <button class="btn-danger" onclick='deleteOrderById(${order.id})'>Delete</button>
          </div>
        </div>
      `;
    });

  } catch (error) {
    console.log(error);
  }
}

function normalizeSelectedIds() {
  const cards = document.querySelectorAll('.order-card.order-selected');
  return Array.from(cards).map(el => Number(el.dataset.orderId)).filter(Boolean);
}

function toggleCardSelected(cardEl) {
  if (!cardEl) return;
  cardEl.classList.toggle('order-selected');
}

async function updateStatusesForSelected() {
  const selectedIds = normalizeSelectedIds();
  if (selectedIds.length === 0) {
    alert('Select one or more orders first');
    return;
  }

  const statusSelect = document.getElementById('bulkStatusSelect');
  const newStatus = statusSelect?.value;
  if (!STATUSES.includes(newStatus)) {
    alert('Choose a valid status');
    return;
  }

  try {
    const token = localStorage.getItem('adminToken');
    await Promise.all(
      selectedIds.map(id =>
        fetch(AdminConfig.api(`/api/orders/${id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ status: newStatus })
        })
      )
    );

    await loadOrders();
  } catch (error) {
    console.log(error);
    alert('Failed to update order status');
  }
}

// ==========================
// INITIALIZE
// ==========================

document.addEventListener('click', (e) => {
  const list = document.getElementById('ordersList');
  const card = e.target.closest('.order-card');
  if (!list || !card || !list.contains(card)) return;

  // Don't toggle select when clicking the edit button
  if (e.target && e.target.closest('button')) return;

  toggleCardSelected(card);
});

// expose for inline handlers
window.openOrderEdit = openOrderEdit;
window.closeOrderEdit = closeOrderEdit;
window.saveOrderEdit = saveOrderEdit;

// Filter + reload
function applyOrderStatusFilter() {
  // Simply re-render using the selected filter value.
  loadOrders();
}

window.applyOrderStatusFilter = applyOrderStatusFilter;

// Order deletion requires backend endpoint; UI still provided.
async function deleteOrderById(id) {
  if (!id) return;
  if (!confirm('Are you sure you want to delete this order?')) return;

  try {
    const token = localStorage.getItem('adminToken');
    console.log('Delete order: id=', id);
    console.log('Has adminToken?', !!token);

    const url = AdminConfig.api(`/api/orders/${id}`);

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });




    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(`Delete failed (${res.status}): ${msg}`);
    }

    await loadOrders();
  } catch (err) {
    console.log(err);
    alert(`Failed to delete order: ${err?.message || String(err)}`);
  }



}

window.deleteOrderById = deleteOrderById;

loadOrders();



