function isTouchLikeDevice() {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

function closeAllDropdowns(except) {
  document.querySelectorAll('.wrapper-dropdown.active').forEach(dropdown => {
    if (dropdown !== except) dropdown.classList.remove('active');
  });
}

function canOpenOnHover(dropdown) {
  return !dropdown?.dataset.hoverLocked;
}

function syncSelectedDropdownItem(parent) {
  if (!parent) return;

  const hiddenInput = parent.querySelector('.custom-variant-id');
  const selectedId = hiddenInput?.value;

  parent.querySelectorAll('.dropdown-item').forEach(item => {
    const isSelected = item.dataset.id === selectedId;
    item.classList.toggle('is-selected', isSelected);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wrapper-dropdown').forEach(syncSelectedDropdownItem);
});

document.addEventListener('mouseenter', (e) => {
  if (isTouchLikeDevice()) return;

  const dropdownWrap = e.target.closest('.wrapper-dropdown');
  if (!dropdownWrap) return;
  if (!canOpenOnHover(dropdownWrap)) return;

  closeAllDropdowns(dropdownWrap);
  dropdownWrap.classList.add('active');
}, true);

document.addEventListener('mouseleave', (e) => {
  if (isTouchLikeDevice()) return;

  const dropdownWrap = e.target.closest('.wrapper-dropdown');
  if (!dropdownWrap) return;

  delete dropdownWrap.dataset.hoverLocked;
  dropdownWrap.classList.remove('active');
}, true);

document.addEventListener('click', (e) => {
  const dropdownWrap = e.target.closest('.wrapper-dropdown');
  const item = e.target.closest('.dropdown-item');

  if (item) {
    const parent = item.closest('.wrapper-dropdown');
    const card = item.closest('.product-card-primary');
    const display = parent.querySelector('.selected-display');
    const hiddenInput = parent.querySelector('.custom-variant-id');

    const titleText = item.querySelector('.item-title').innerText;
    const priceText = item.querySelector('.pull-right').innerText;
    display.innerText = `${titleText} — ${priceText}`;

    const { id, price, compare, unit, inventory } = item.dataset;

    if (hiddenInput) hiddenInput.value = id;
    syncSelectedDropdownItem(parent);
    parent.dataset.hoverLocked = 'true';
    parent.classList.remove('active');

    const priceWrap = card.querySelector('.fc_price_weight');
    if (priceWrap) {
      const sellingPriceEl = priceWrap.querySelector('.selling_price');
      const compareEl = priceWrap.querySelector('#compare_price');
      const unitEl = priceWrap.querySelector('.fc_weight');
      const percentBadge = card.querySelector('[data-card-off-percent]');

      if (sellingPriceEl) sellingPriceEl.innerText = price;

      if (unitEl) {
        if (unit && unit.trim() !== '') {
          unitEl.innerText = unit;
          unitEl.style.display = 'inline-block';
        } else {
          unitEl.style.display = 'none';
        }
      }

      if (compare && compare.trim() !== '' && compare !== price) {
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
        if (sellingPriceEl) sellingPriceEl.classList.add('withoutbg');
        if (compareEl) compareEl.style.display = 'none';
        if (percentBadge) percentBadge.style.display = 'none';
      }
    }

    const trustText = card.querySelector('.fc_trust_text p:first-child');
    if (trustText) {
      trustText.innerText = `Only ${inventory} Left`;
      parseInt(inventory, 10) < 10
        ? trustText.classList.add('low-stock')
        : trustText.classList.remove('low-stock');
    }

    const addBtn = card.querySelector('.add-to-cart-btn');
    const addFormInput = card.querySelector('.product-card-add-form input[name="id"]');

    if (addFormInput) addFormInput.value = id;

    if (addBtn) {
      if (parseInt(inventory, 10) > 0) {
        addBtn.disabled = false;
        addBtn.innerText = window.themeStrings.addToCart;
      } else {
        addBtn.disabled = true;
        addBtn.innerText = window.themeStrings.soldOut;
      }
    }

    return;
  }

  if (dropdownWrap && isTouchLikeDevice()) {
    closeAllDropdowns(dropdownWrap);
    dropdownWrap.classList.toggle('active');
    return;
  }

  if (!dropdownWrap) {
    closeAllDropdowns();
  }
});
