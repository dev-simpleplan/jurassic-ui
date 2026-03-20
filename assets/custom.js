document.addEventListener('click', (e) => {
  const dropdownWrap = e.target.closest('.wrapper-dropdown');
  const item = e.target.closest('.dropdown-item');

  // 1. Toggle Open/Close
  if (dropdownWrap && !item) {
    document.querySelectorAll('.wrapper-dropdown.active').forEach(d => {
      if (d !== dropdownWrap) d.classList.remove('active');
    });
    dropdownWrap.classList.toggle('active');
    return;
  }

  // 2. Handle Selection
  if (item) {
    const parent = item.closest('.wrapper-dropdown');
    const card = item.closest('.product-card-primary');
    const display = parent.querySelector('.selected-display');
    const hiddenInput = parent.querySelector('.custom-variant-id');
    
    // Update Display Text in Dropdown
    const titleText = item.querySelector('.item-title').innerText;
    const priceText = item.querySelector('.pull-right').innerText;
    display.innerText = `${titleText} — ${priceText}`;
    parent.classList.remove('active');

    // Extract Data from LI
    const { id, price, compare, unit, inventory } = item.dataset;

    if (hiddenInput) hiddenInput.value = id;

    // --- UPDATE PRICE & DISCOUNT UI ---
    const priceWrap = card.querySelector('.fc_price_weight');
    if (priceWrap) {
      const sellingPriceEl = priceWrap.querySelector('.selling_price');
      const compareEl = priceWrap.querySelector('#compare_price');
      const unitEl = priceWrap.querySelector('.fc_weight');
      const percentBadge = card.querySelector('[data-card-off-percent]');

      // Update Selling Price
      if (sellingPriceEl) sellingPriceEl.innerText = price;

      // Update Unit Price (per kg) logic
      if (unitEl) {
        if (unit && unit.trim() !== "") {
          unitEl.innerText = unit;
          unitEl.style.display = 'inline-block';
        } else {
          unitEl.style.display = 'none';
        }
      }

      // Handle Sale/Discount Logic
      if (compare && compare.trim() !== "" && compare !== price) {
        // We have a sale
        if (sellingPriceEl) sellingPriceEl.classList.remove('withoutbg');
        
        if (compareEl) {
          compareEl.innerText = compare;
          compareEl.style.display = 'inline-block';
        }

        if (percentBadge) {
          const rawPrice = parseFloat(price.replace(/[^\d.]/g, ''));
          const rawCompare = parseFloat(compare.replace(/[^\d.]/g, ''));
          
          if (rawCompare > rawPrice) {
            const percentOff = Math.round(((rawCompare - rawPrice) * 100) / rawCompare);
            percentBadge.innerText = '-' + percentOff + '%';
            percentBadge.style.display = 'inline-block';
          } else {
            percentBadge.style.display = 'none';
          }
        }
      } else {
        // NO SALE - This is the fix you needed
        if (sellingPriceEl) sellingPriceEl.classList.add('withoutbg');
        if (compareEl) compareEl.style.display = 'none';
        if (percentBadge) percentBadge.style.display = 'none';
      }
    }

    // Update Inventory & Add to Cart
    const trustText = card.querySelector('.fc_trust_text p:first-child');
    if (trustText) {
      trustText.innerText = `Only ${inventory} Left`;
      parseInt(inventory) < 10 ? trustText.classList.add('low-stock') : trustText.classList.remove('low-stock');
    }

    const addBtn = card.querySelector('.add-to-cart-btn');
    const addFormInput = card.querySelector('.product-card-add-form input[name="id"]');
    
    if (addFormInput) addFormInput.value = id;
    
    if (addBtn) {
      if (parseInt(inventory) > 0) {
        addBtn.disabled = false;
        addBtn.innerText = window.themeStrings.addToCart;
      } else {
        addBtn.disabled = true;
        addBtn.innerText = window.themeStrings.soldOut;
      }
    }
  }

  // 3. Close if clicking outside
  if (!dropdownWrap) {
    document.querySelectorAll('.wrapper-dropdown.active').forEach(d => d.classList.remove('active'));
  }
});