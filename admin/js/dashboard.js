// ==========================
// DASHBOARD
// ==========================

async function dashboard(){
  try{
    const token = localStorage.getItem("adminToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const [prodRes, orderRes, custRes] = await Promise.all([
      fetch(AdminConfig.api("/api/products"), { headers }),
      fetch(AdminConfig.api("/api/orders"), { headers }),
      fetch(AdminConfig.api("/api/customers"), { headers })
    ]);

    if (!prodRes.ok || !orderRes.ok || !custRes.ok) {
      if (prodRes.status === 401 || orderRes.status === 401 || custRes.status === 401 ||
          prodRes.status === 403 || orderRes.status === 403 || custRes.status === 403) {
        logout();
        return;
      }
      throw new Error("Failed to fetch dashboard statistics");
    }

    const [products, orders, customers] = await Promise.all([
      prodRes.json(),
      orderRes.json(),
      custRes.json()
    ]);

    if (!Array.isArray(products) || !Array.isArray(orders) || !Array.isArray(customers)) {
      throw new Error("Invalid dashboard data received");
    }

    document.getElementById("totalProducts").textContent = products.length;
    document.getElementById("totalOrders").textContent = orders.length;
    document.getElementById("totalCustomers").textContent = customers.length;

    let revenue = 0;
    orders.forEach(order => { revenue += Number(order.total) || 0; });
    document.getElementById("revenue").textContent = "₹" + revenue;

    // Recent orders
    const recentDiv = document.getElementById("recentOrders");
    if(recentDiv){
      recentDiv.innerHTML = "";
      orders.slice(0,5).forEach(order => {
        const status = order.status || "Pending";
        recentDiv.innerHTML += `
          <div class="card">
            <h3>${order.customer}</h3>
            <p>💰 ₹${order.total}</p>
            <p>📞 ${order.phone}</p>
            <p>📍 ${order.address}</p>
            <p>Status : <span class="status-badge ${String(status).toLowerCase()}">${status}</span></p>
          </div>
        `;
      });
    }
  }catch(error){
    console.log(error);
  }
}

dashboard();
