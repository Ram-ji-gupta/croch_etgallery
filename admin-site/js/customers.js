// ==========================
// LOAD CUSTOMERS + CRUD UI
// ==========================

function showEditBackdrop(show) {
  const el = document.getElementById('customerEditBackdrop');
  if (!el) return;
  el.classList.toggle('show', !!show);
  el.style.display = show ? 'flex' : 'none';
}

function openCustomerEdit(customer) {
  if (!customer) return;
  document.getElementById('editCustomerId').value = customer.id;
  document.getElementById('editCustomerName').value = customer.name || '';
  document.getElementById('editCustomerPhone').value = customer.phone || '';
  document.getElementById('editCustomerEmail').value = customer.email || '';
  document.getElementById('editCustomerAddress').value = customer.address || '';

  showEditBackdrop(true);
}

function closeCustomerEdit() {
  showEditBackdrop(false);
}

async function saveCustomerEdit() {
  const id = Number(document.getElementById('editCustomerId').value);
  const name = document.getElementById('editCustomerName').value?.trim();
  const phone = document.getElementById('editCustomerPhone').value?.trim();
  const email = document.getElementById('editCustomerEmail').value?.trim();
  const address = document.getElementById('editCustomerAddress').value?.trim();

  if (!Number.isFinite(id) || id <= 0) {
    alert('Invalid customer id');
    return;
  }
  if (!name || !phone || !address) {
    alert('Name, Phone and Address are required');
    return;
  }

  try {
    const token = localStorage.getItem('adminToken');

    const res = await fetch(AdminConfig.api(`/api/customers/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        name,
        phone,
        email: email || null,
        address
      })
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(`Update failed (${res.status}): ${msg}`);
    }

    closeCustomerEdit();
    await loadCustomers();
  } catch (err) {
    console.log(err);
    alert('Failed to update customer');
  }
}

async function deleteCustomerById(id) {
  if (!confirm('Are you sure you want to delete this customer?')) return;

  try {
    const token = localStorage.getItem('adminToken');

    const res = await fetch(AdminConfig.api(`/api/customers/${id}`), {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(`Delete failed (${res.status}): ${msg}`);
    }

    await loadCustomers();
  } catch (err) {
    console.log(err);
    alert('Failed to delete customer');
  }
}

async function loadCustomers() {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(AdminConfig.api('/api/customers'), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      throw new Error(`Failed to load customers: ${response.status}`);
    }

    const customers = await response.json();
    if (!Array.isArray(customers)) {
      throw new Error('Customers response is not an array');
    }

    const container = document.getElementById('customerList');
    if (!container) return;

    container.innerHTML = '';

    customers.forEach((customer) => {
      const id = customer.id;
      const name = customer.name || '';
      const phone = customer.phone || '';
      const address = customer.address || '';

      container.innerHTML += `
        <div class="customer-card" style="margin-bottom:14px;">
          <h3>${name}</h3>
          <p>📞 ${phone}</p>
          <p>📍 ${address}</p>
          <div class="customer-actions">
            <button class="btn-secondary" onclick='openCustomerEdit(${JSON.stringify(customer)})'>Edit</button>
            <button class="btn-danger" onclick='deleteCustomerById(${id})'>Delete</button>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.log(error);
  }
}

// expose for inline handlers
window.openCustomerEdit = openCustomerEdit;
window.closeCustomerEdit = closeCustomerEdit;
window.saveCustomerEdit = saveCustomerEdit;
window.deleteCustomerById = deleteCustomerById;

loadCustomers();

