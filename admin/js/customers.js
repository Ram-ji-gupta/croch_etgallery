async function loadCustomers(){

try{
const token = localStorage.getItem("adminToken");
const response =
await fetch(
AdminConfig.api("/api/customers"),
{
  headers: token ? { Authorization: `Bearer ${token}` } : undefined
}
    );
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      throw new Error(`Failed to load customers: ${response.status}`);
    }

    const customers = await response.json();
    if (!Array.isArray(customers)) {
      throw new Error("Customers response is not an array");
    }

    const container = document.getElementById("customerList");

    if(!container) return;

    container.innerHTML = "";

    customers.forEach(customer=>{

container.innerHTML += `

<div class="customer-card">

<h3>
${customer.name}
</h3>

<p>
📞 ${customer.phone}
</p>

<p>
📍 ${customer.address}
</p>

</div>

`;

});

}

catch(error){

console.log(error);

}

}

loadCustomers();