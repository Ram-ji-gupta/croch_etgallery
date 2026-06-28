/**
 * WoolCraft Studio — Product Service
 * Fetches and maintains product state, dispatching a custom event on load.
 */
let products = [];

async function loadProducts() {
  if (window.productsFetchPromise) {
    try {
      products = await window.productsFetchPromise;
      window.products = products; // Sync global reference
      return;
    } catch (e) {
      // In case of error, fall through to create a new fetch below
    }
  }

  window.productsFetchPromise = (async () => {
    const res = await fetch(WC.api("/api/products"));
    if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
    const data = await res.json();
    window.products = data;
    return data;
  })();

  try {
    products = await window.productsFetchPromise;
    // Dispatch custom event to notify other scripts (like home.js)
    document.dispatchEvent(new CustomEvent('productsLoaded', { detail: products }));
  } catch (err) {
    console.error("[products] Error loading products:", err);
  }
}

// Start loading state immediately
loadProducts();
