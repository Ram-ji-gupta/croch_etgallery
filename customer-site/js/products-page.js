/**
 * croch_etgallery — Shop Page Controller
 * Wires search, category filtering, and product rendering.
 */
(function () {
  "use strict";

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function normalizeCategory(str) {
    return String(str || "")
      // NBSP -> normal space
      .replaceAll("\u00A0", " ")
      // collapse multiple whitespace
      .replaceAll(/\s+/g, " ")
      .trim();
  }

  function getSelectedCategory(selectEl) {
    if (!selectEl) return "";
    const selected = selectEl.options[selectEl.selectedIndex];
    const raw = selected?.value !== undefined ? selected.value : (selected?.text || "");
    return normalizeCategory(raw);
  }


  async function loadAndRenderProducts() {
    const grid = document.getElementById('shopProducts');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (!grid) return;

    // Show beautiful skeletal or text loader
    grid.innerHTML = '<div class="loading-state"><p>Loading our handmade collection...</p></div>';

    let products = [];
    try {
      const res = await fetch(WC.api('/api/products'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      products = await res.json();

      // Keep compatibility with global product state
      window.products = products;
      window.allProducts = products;
    } catch (err) {
      console.error('[products-page] Fetch error:', err);
      grid.innerHTML = `<div class="error-state"><p>Failed to load products. Please check your connection or try again.</p></div>`;
      return;
    }

    const render = (list) => {
      grid.innerHTML = '';
      if (list.length === 0) {
        grid.innerHTML = `<div class="no-results"><p>No items match your search or filter criteria.</p></div>`;
        return;
      }

      const frag = document.createDocumentFragment();

      list.forEach(p => {
        const id = p.id;
        const name = escapeHtml(p.name || '');
        const price = p.price ?? '';
        const descRaw = p.description ? String(p.description) : '';
        const desc = descRaw
          ? `${escapeHtml(descRaw.slice(0, 90))}${descRaw.length > 90 ? '...' : ''}`
          : '';

        const targetPage = location.pathname.endsWith('.html') ? 'product.html' : 'product';
        const card = document.createElement('div');
        card.className = 'product-card animate-fade-in';
        card.innerHTML = `
          <a href="${targetPage}?id=${id}">
            <img src="${WC.img(p.image)}" alt="${name}" width="400" height="220" loading="lazy" decoding="async">
            <h3>${name}</h3>
            <p class="price">₹${price}</p>
            ${desc ? `<p class="desc">${desc}</p>` : ''}
          </a>
          <button type="button" onclick="addToCart(${id})">Add To Cart</button>
        `;
        frag.appendChild(card);
      });

      grid.appendChild(frag);
    };

    const getFiltered = () => {
      const q = (searchInput?.value || '').trim().toLowerCase();
      const cat = normalizeCategory(getSelectedCategory(categoryFilter)).toLowerCase();

      const selectedCat = cat;
      return products.filter(p => {

        const name = String(p.name || '').toLowerCase();
        const desc = String(p.description || '').toLowerCase();
        const category = String(p.category || '').toLowerCase();

        const matchesSearch = !q ||
          name.includes(q) ||
          desc.includes(q) ||
          (category && category.includes(q));

        const matchesCategory = !selectedCat ||
          category === selectedCat ||
          // partial match
          category.includes(selectedCat);

        return matchesSearch && matchesCategory;


      });
    };

    // Read query params (q, cat) before initial render
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    if (qParam && searchInput) {
      searchInput.value = String(qParam);
    }

    const catParam = params.get('cat');
    if (catParam && categoryFilter) {
      const normalizedCatParam = normalizeCategory(catParam).toLowerCase();
      for (let i = 0; i < categoryFilter.options.length; i++) {
        const opt = categoryFilter.options[i];
        const optValue = normalizeCategory(opt.value).toLowerCase();
        const optText = normalizeCategory(opt.text).toLowerCase();

        if (optValue === normalizedCatParam || optText === normalizedCatParam) {
          categoryFilter.selectedIndex = i;
          break;
        }
      }
    }

    // Initial render
    render(getFiltered());

    // Event listeners for instant search/filter feedback
    if (searchInput) {
      searchInput.addEventListener('input', () => render(getFiltered()));
    }
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => render(getFiltered()));
    }


  }

  function init() {
    loadAndRenderProducts().catch(console.error);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
