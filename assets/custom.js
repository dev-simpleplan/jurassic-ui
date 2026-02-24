/* ----------------------------------------------------------------
   GLOBAL PRODUCT CARD HANDLER
   Handles variant switching and AJAX Add to Cart store-wide.
------------------------------------------------------------------- */

// 1. HELPER: AJAX Add to Cart
async function globalAddToCart(id, qty = 1) {
  return fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, quantity: qty })
  }).then(r => r.json());
}

// 2. HELPER: Open Side Cart (Keep your specific logic)
function globalOpenSideCart() {
  const sideCart = document.querySelector('.sideCart');
  if (!sideCart) return;

  sideCart.classList.add('active');
  document.body.classList.add('stay');
  document.documentElement.classList.add('stay');

  if (typeof window.loadCartItems === 'function') {
    window.loadCartItems();
  }
}

// 3. EVENT DELEGATION: Variant Clicking
document.addEventListener('click', (e) => {
  const variant = e.target.closest('.fc_variant_item');
  if (!variant) return;

  const card = variant.closest('.product-card-primary');
  if (!card) return;

  // Update UI: Active state
  variant.parentElement.querySelectorAll('.fc_variant_item').forEach(v => v.classList.remove('active'));
  variant.classList.add('active');

  // Extract Data from dataset
  const { id, price, compare, unit, inventory } = variant.dataset;

  // Update Price Wrap
  const priceWrap = card.querySelector('.fc_price_weight');
  if (priceWrap) {
    const sellingPriceEl = priceWrap.querySelector('.selling_price');
    const compareEl = priceWrap.querySelector('#compare_price');
    const unitEl = card.querySelector('.fc_weight');

    // These now contain the symbol at the end because of our Liquid update above
    if (sellingPriceEl) sellingPriceEl.innerText = price;
    if (unitEl) unitEl.innerText = unit;

    if (compareEl) {
      if (compare && compare !== "") {
        compareEl.innerText = compare;
        compareEl.style.display = 'inline-block';
      } else {
        compareEl.style.display = 'none';
        compareEl.innerText = ''; // Clear it out
      }
    }
  }

  // Update Inventory Text (The "Only X Left" logic)
  const trustText = card.querySelector('.fc_trust_text p:first-child');
  if (trustText) {
    trustText.innerText = `Only ${inventory} Left`;
    inventory < 10 ? trustText.classList.add('low-stock') : trustText.classList.remove('low-stock');
  }

  // Update hidden ID for Add to Cart
  const addWrap = card.querySelector('.fc_add_to_cart');
  const addBtn = addWrap?.querySelector('.add-to-cart-btn');
  if (addWrap) {
    addWrap.dataset.variantId = id;
    // Handle Sold Out state
    if (inventory > 0) {
       addBtn.disabled = false;
       addBtn.innerText = 'Add to Cart';
    } else {
       addBtn.disabled = true;
       addBtn.innerText = 'Sold Out';
    }
  }
});

// 4. EVENT DELEGATION: Add to Cart Button
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.fc_add_to_cart .add-to-cart-btn');
  if (!btn) return;

  e.preventDefault();
  const wrap = btn.closest('.fc_add_to_cart');
  const variantId = wrap?.dataset.variantId;

  if (!variantId) return;

  btn.disabled = true;
  const originalText = btn.innerText;
  btn.innerText = 'Adding…';

  try {
    await globalAddToCart(Number(variantId), 1);
    globalOpenSideCart();
  } catch (err) {
    console.error('Add to cart failed', err);
  } finally {
    btn.disabled = false;
    btn.innerText = originalText;
  }
});