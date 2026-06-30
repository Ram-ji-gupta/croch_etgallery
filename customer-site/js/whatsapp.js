/**
 * croch_etgallery — WhatsApp Direct Order
 * Allows placing an order directly via WhatsApp from the cart.
 */
function sendWhatsAppOrder() {
  if (!cart || cart.length === 0) {
    showToast("Your cart is empty. Please add items before ordering.", "error");
    return;
  }

  let message = "Hello croch_etgallery! 🧶\n\nI would like to place an order for:\n\n";
  let total = 0;

  cart.forEach((item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const amount = price * qty;
    total += amount;

    // Enrich with image/link from in-memory products (if available)
    const pid = Number(item.id);
    const matched = (window.products || []).find((p) => Number(p.id) === pid);

    const image = matched?.image || item?.image;
    const productLink = matched?.id ? `${location.origin}/product.html?id=${matched.id}` : "";

    if (productLink) {
      // Put link on the same line so WhatsApp reliably detects it.
      message += `• ${item.name || "Item"} x ${qty} = ₹${amount}\n  ${productLink}\n`;
    } else {
      message += `• ${item.name || "Item"} x ${qty} = ₹${amount}\n`;
    }

    if (image) {
      // Keep image url for completeness (preview typically comes from the product page link above)
      message += `  Image: ${WC.img(image)}\n`;
    }
  });

  message += `\nTotal: ₹${total}\n\nPlease let me know the next steps!`;

  const waUrl = WC.waLink(message);
  window.open(waUrl, "_blank", "noopener,noreferrer");
}

