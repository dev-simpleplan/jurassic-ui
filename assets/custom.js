/* ----------------------------------------------------------------
   GLOBAL PRODUCT CARD HANDLER
   Handles variant switching store-wide.
------------------------------------------------------------------- */

// 1. EVENT DELEGATION: Variant Clicking
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
    const percentBadge = card.querySelector('[data-card-off-percent]'); // Target our badge

    // These now contain the symbol at the end because of our Liquid update above
    if (sellingPriceEl) sellingPriceEl.innerText = price;
    if (unitEl) unitEl.innerText = unit;

    //Toggle the background class based on sale status
    if (sellingPriceEl) {
      if (compare && compare !== "") {
        sellingPriceEl.classList.remove('withoutbg');
      } else {
        sellingPriceEl.classList.add('withoutbg');
      }
    }

    // --- Update Compare Price & Percent Badge ---
    if (compare && compare !== "") {
      if (compareEl) {
        compareEl.innerText = compare;
        compareEl.style.display = 'inline-block';
      }

      if (percentBadge) {
        // Strip symbols and commas to get raw numbers for math
        const rawPrice = parseFloat(price.replace(/[^\d.]/g, ''));
        const rawCompare = parseFloat(compare.replace(/[^\d.]/g, ''));

        if (rawCompare > rawPrice) {
          const percentOff = Math.round(((rawCompare - rawPrice) * 100) / rawCompare);
          
          // ADDED THE HYPHEN HERE
          percentBadge.innerText = '-' + percentOff + '%'; 
          
          percentBadge.style.display = 'inline-block';
        } else {
          percentBadge.style.display = 'none';
        }
      }
    } else {
      // Hide both if no compare price exists
      if (compareEl) {
        compareEl.style.display = 'none';
        compareEl.innerText = '';
      }
      if (percentBadge) {
        percentBadge.style.display = 'none';
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
  const addFormInput = card.querySelector('.product-card-add-form input[name="id"]');

  if (addWrap) {
    addWrap.dataset.variantId = id;
    if (addFormInput) addFormInput.value = id;
    
    // Handle Sold Out state using the translated global variables
    if (inventory > 0) {
      addBtn.disabled = false;
      addBtn.innerText = window.themeStrings.addToCart;
    } else {
      addBtn.disabled = true;
      addBtn.innerText = window.themeStrings.soldOut;
    }
  }
});
