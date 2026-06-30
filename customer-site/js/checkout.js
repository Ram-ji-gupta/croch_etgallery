/**
 * croch_etgallery — Checkout Controller
 * Form validation, order payload creation, API posting, and WhatsApp confirmation redirect.
 */
async function placeOrder() {
  const nameEl = document.getElementById('checkoutName');
  const phoneEl = document.getElementById('checkoutPhone');
  const emailEl = document.getElementById('checkoutEmail');
  const addressEl = document.getElementById('checkoutAddress');
  const customReqEl = document.getElementById('customRequirement');

  const name = nameEl?.value?.trim() || "";
  const phone = phoneEl?.value?.trim() || "";
  const email = emailEl?.value?.trim() || "";
  const address = addressEl?.value?.trim() || "";
  const customRequirement = customReqEl?.value?.trim() || "";

  if (!name || !phone || !email || !address) {
    showToast("Please fill all required fields", "error");
    return;
  }

  // customRequirement is intentionally optional on checkout.

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!Array.isArray(cart) || cart.length === 0) {
    showToast("Your shopping cart is empty", "error");
    return;
  }

  // Sanitize and validate cart items
  const items = cart
    .filter(it => it && typeof it === 'object')
    .map(it => ({
      id: Number(it.id),
      price: Number(it.price),
      qty: parseInt(it.qty, 10)
    }))
    .filter(
      it =>
        Number.isFinite(it.id) && it.id > 0 &&
        Number.isFinite(it.price) && it.price >= 0 &&
        Number.isFinite(it.qty) && it.qty > 0
    );

  if (items.length === 0) {
    showToast("Your cart items are invalid", "error");
    return;
  }

  const orderPayload = {
    customer: name,
    phone,
    email,
    address,
    custom_requirement: customRequirement,
    items
  };

  showToast("Processing order...", "info");

  try {
    const res = await fetch(WC.api("/api/orders"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });

    if (!res.ok) {
      const errorMsg = await res.text().catch(() => "");
      throw new Error(`Order posting failed (HTTP ${res.status}): ${errorMsg}`);
    }

    const result = await res.json().catch(() => ({}));

    // Clear cart storage immediately upon successful post
    localStorage.removeItem("cart");
    showToast("Order Placed Successfully!", "success");

    const orderId = result?.orderId || "";
    const status = result?.status || "Pending";

    const itemsDetailed = Array.isArray(result?.itemsDetailed) ? result.itemsDetailed : [];

    // Ensure WhatsApp message always includes line items.
    // Backend may not return itemsDetailed; fallback to the cart we just validated.
    const itemsForMessage = itemsDetailed.length ? itemsDetailed : items;

    const itemsText = itemsForMessage.length
      ? itemsForMessage
          .map((it) => {
            const id = Number(it.id);
            const qty = Number(it.qty) || 0;
            const price = Number(it.price) || 0;

            // If cart fallback is used, items don't have name; try to resolve from global products.
            const name = it.name || (window.products || []).find((p) => Number(p.id) === id)?.name || "Item";

            const link = Number.isFinite(id) && id > 0
              ? `${location.origin}/product.html?id=${id}`
              : '';

            const amount = price * qty;

            // WhatsApp formatting-friendly: keep link on its own line.
            return link
              ? `• ${name} x ${qty} = ₹${amount.toFixed(0)}\n${link}`
              : `• ${name} x ${qty} = ₹${amount.toFixed(0)}`;
          })
          .join("\n")
      : '';

    const customRequirementText = customRequirement
      ? `\n\nCustom Request:\n${customRequirement}`
      : '';

    // WhatsApp message WITHOUT customer personal info.
    const waText = `Hello croch_etgallery! 🧶\n\nNew order received!\n\nOrder ID: ${orderId || "N/A"}\nStatus: ${status}\n\nItems Ordered:\n${itemsText}${customRequirementText}\n\nThank you!`;

    const waPhone = "917973856211"; // keep in sync with wa-me link used on site
    const encodedText = encodeURIComponent(waText);
    const fallbackWaUrl = `https://wa.me/${waPhone}?text=${encodedText}`;

    // Try to open WhatsApp immediately after successful order.
    // Some browsers block popups if navigation happens too quickly.
    setTimeout(() => {
      let opened = false;
      try {
        const url = (window.WC && typeof window.WC.waLink === "function")
          ? window.WC.waLink(waText)
          : fallbackWaUrl;

        if (!url || typeof url !== "string") {
          showToast("WhatsApp notification failed to generate. Please try again.", "error");
        } else {
          const w = window.open(url, "_blank", "noopener,noreferrer");
          opened = !!w;
        }
      } catch (e) {
        console.error("[checkout] WhatsApp open error:", e);
        showToast("WhatsApp notification failed. Please try again.", "error");
      } finally {
        // Redirect after attempting to open WhatsApp (gives the popup chance to start).
        setTimeout(() => {
          window.location.href = "index.html";
        }, opened ? 1000 : 0);
      }
    }, 200);

  } catch (error) {
    // Even if API fails, try to open WhatsApp with filled form data.
    try {
      const name = document.getElementById('checkoutName')?.value?.trim() || '';
      const phone = document.getElementById('checkoutPhone')?.value?.trim() || '';
      const email = document.getElementById('checkoutEmail')?.value?.trim() || '';
      const address = document.getElementById('checkoutAddress')?.value?.trim() || '';
      const customRequirement = document.getElementById('customRequirement')?.value?.trim() || '';

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const itemsText = Array.isArray(cart) && cart.length
        ? cart.map((it) => {
            const id = Number(it.id);
            const qty = Number(it.qty) || 0;
            const price = Number(it.price) || 0;
            const itemName = it.name || (window.products || []).find((p) => Number(p.id) === id)?.name || 'Item';
            const link = id > 0 ? `${location.origin}/product.html?id=${id}` : '';
            const line = `• ${itemName} x ${qty} = ₹${(price * qty).toFixed(0)}`;
            return link ? `${line}\n${link}` : line;
          }).join("\n")
        : 'No items in cart.';

      const waText = `Hello croch_etgallery! 🧶\n\nCheckout details (API failed):\nName: ${name || 'N/A'}\nPhone: ${phone || 'N/A'}\nEmail: ${email || 'N/A'}\nAddress: ${address || 'N/A'}\n\nItems:\n${itemsText}${customRequirement ? `\n\nCustom Requirement: ${customRequirement}` : ''}`;

      const waPhone = "917973856211";
      const encodedText = encodeURIComponent(waText);
      const fallbackWaUrl = `https://wa.me/${waPhone}?text=${encodedText}`;

      window.open(fallbackWaUrl, "_blank", "noopener,noreferrer");
    } catch (waErr) {
      // ignore
    }

    console.error("[checkout] Order error:", error);
    showToast("Order failed. Please try again or contact support.", "error");
  }
}

