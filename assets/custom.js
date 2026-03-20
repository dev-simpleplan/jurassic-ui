document.addEventListener('click', (e) => {
  const dropdownWrap = e.target.closest('.wrapper-dropdown');
  const item = e.target.closest('.dropdown-item');

  // 1. Toggle Open/Close
  if (dropdownWrap && !item) {
    // Close other open dropdowns
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
    // Get the Title and Pieces from the clicked item
    const titleText = item.querySelector('.item-title').innerText;
    const priceText = item.querySelector('.pull-right').innerText;

    // Update Dropdown Visuals
    display.innerText = `${titleText} — ${priceText}`;
    parent.classList.remove('active');

    // Extract Data
    const { id, price, compare, unit, inventory } = item.dataset;

    // Update Hidden Form ID
    if (hiddenInput) hiddenInput.value = id;

    // --- YOUR EXISTING PRICE/INVENTORY LOGIC ---
    const priceWrap = card.querySelector('.fc_price_weight');
    if (priceWrap) {
      const sellingPriceEl = priceWrap.querySelector('.selling_price');
      const compareEl = priceWrap.querySelector('#compare_price');
      const unitEl = card.querySelector('.fc_weight');
      const percentBadge = card.querySelector('[data-card-off-percent]');
      const unitPriceEl = card.querySelector('.fc_weight');

      if (sellingPriceEl) sellingPriceEl.innerText = price;
      if (unitPriceEl) {
        // If the unit data is empty (because we fixed the Liquid above), hide the element
        if (unit && unit.trim() !== "") {
          unitPriceEl.innerText = unit;
          unitPriceEl.style.display = 'block';
        } else {
          unitPriceEl.style.display = 'none'; // Hides it if it's just repeating the main price
        }
      }
      if (unitEl) unitEl.innerText = unit;

      if (compare && compare !== "") {
        if (sellingPriceEl) sellingPriceEl.classList.remove('withoutbg');
        if (compareEl) {
          compareEl.innerText = compare;
          compareEl.style.display = 'inline-block';
        }
        if (percentBadge) {
          const rawPrice = parseFloat(price.replace(/[^\d.]/g, ''));
          const rawCompare = parseFloat(compare.replace(/[^\d.]/g, ''));
          const percentOff = Math.round(((rawCompare - rawPrice) * 100) / rawCompare);
          percentBadge.innerText = '-' + percentOff + '%';
          percentBadge.style.display = 'inline-block';
        }
      } else {
        if (sellingPriceEl) sellingPriceEl.classList.add('withoutbg');
        if (compareEl) compareEl.style.display = 'none';
        if (percentBadge) percentBadge.style.display = 'none';
      }
    }

    // Update Add to Cart Button & Inventory
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