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

function isCornerCartActive() {
  return Boolean(
    window.corner ||
    document.querySelector('.corner-widget, #corner-widget-page-wrapper, #corner-cowi-cart-wrapper, #corner-cowi-header')
  );
}

function getInventoryMessage(inventory, isAvailable = true) {
  const qty = parseInt(inventory, 10) || 0;
  const template = window.themeStrings?.inventoryStatus || 'Only __COUNT__ left';

  if (!isAvailable || qty <= 0) return window.themeStrings?.outOfStock || 'Out of stock';
  if (qty < 100) return template.replace('__COUNT__', qty);
  return window.themeStrings?.inStock || 'In stock';
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

    const selectedTitle = (item.dataset.selectedTitle || item.querySelector('.item-title')?.childNodes[0]?.textContent || item.querySelector('.item-title')?.textContent || '').trim();
    display.innerHTML = `<b>${selectedTitle}</b>`;

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
      const topBadge = card.querySelector('[data-card-top-badge]');
      const topBadgeText = card.querySelector('[data-card-top-badge-text]');
      const isBestsellerProduct = topBadge?.dataset.isBestseller === 'true';

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
            // Future use:
            // if (topBadge && topBadgeText && !isBestsellerProduct) {
            //   topBadgeText.innerText = '-' + percentOff + '%';
            //   topBadge.style.display = 'block';
            // }
          } else {
            percentBadge.style.display = 'none';
            if (topBadge && !isBestsellerProduct) topBadge.style.display = 'none';
          }
        }
      } else {
        if (sellingPriceEl) sellingPriceEl.classList.add('withoutbg');
        if (compareEl) compareEl.style.display = 'none';
        if (percentBadge) percentBadge.style.display = 'none';
        if (topBadge && !isBestsellerProduct) topBadge.style.display = 'none';
      }
    }

    const trustText = card.querySelector('.fc_trust_text p:first-child');
    if (trustText) {
      const inventoryQty = parseInt(inventory, 10) || 0;
      trustText.innerText = getInventoryMessage(inventoryQty, inventoryQty > 0);
      inventoryQty > 0 && inventoryQty < 100
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

window.bindProductCardAddForms = function (scope = document) {
  scope.querySelectorAll('.product-card-add-form').forEach((form) => {
    if (form.dataset.ajaxBound === 'true') return;
    form.dataset.ajaxBound = 'true';

    form.addEventListener('submit', async (e) => {
      if (isCornerCartActive()) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (form.dataset.submitting === 'true') return;
      form.dataset.submitting = 'true';

      const submitButton = form.querySelector('.add-to-cart-btn');
      const originalLabel = submitButton ? submitButton.innerText : '';

      if (submitButton) {
        submitButton.disabled = true;
      }

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          body: new FormData(form),
          headers: {
            Accept: 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Add to cart failed: ${response.status}`);
        }

        await response.json();

        document.dispatchEvent(new CustomEvent('cart:updated'));
        document.querySelector('.cart-open')?.click();
      } catch (error) {
        console.error('Product card add to cart failed', error);
      } finally {
        form.dataset.submitting = 'false';

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerText = originalLabel;
        }
      }
    }, true);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  window.bindProductCardAddForms(document);
});

const sidebar = document.querySelector('.filter-sidebar');
const closeBtn = document.querySelector('.filter-close-mob');
const body = document.body;

// Function to sync body state
function syncBodyState() {
  if (sidebar.classList.contains('active')) {
    body.setAttribute('data-lenis-prevent', '');
    body.classList.add('backdrop');
  } else {
    body.removeAttribute('data-lenis-prevent');
    body.classList.remove('backdrop');
  }
}

// Watch for class changes (in case it's toggled elsewhere)
const observer = new MutationObserver(syncBodyState);

observer.observe(sidebar, {
  attributes: true,
  attributeFilter: ['class']
});

// Close button click
closeBtn.addEventListener('click', () => {
  sidebar.classList.remove('active');
  syncBodyState(); // ensure cleanup immediately
});

// Run once on load
syncBodyState();


document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('.review-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      // 👇 use your actual class here
      const target = document.querySelector('.okeReviews');

      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
