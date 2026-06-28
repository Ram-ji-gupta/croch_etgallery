loadProducts();
loadOrders();
loadCustomers();
async function dashboard(){

try{

const response =
await fetch(
AdminConfig.api("/api/products")
);

const products =
await response.json();

document.getElementById(
"totalProducts"
).innerHTML =
products.length;

}

catch(error){

console.log(error);

}

}

dashboard();