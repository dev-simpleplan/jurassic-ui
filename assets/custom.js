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

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function setCardButtonLabel(button, text) {
  if (!button) return;
  const label = button.querySelector('.card-btn-label');
  if (label) {
    label.textContent = text;
  } else {
    button.textContent = text;
  }
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
        addBtn.classList.remove('loading', 'success', 'out-of-stock');
        setCardButtonLabel(addBtn, window.themeStrings.addToCart);
      } else {
        addBtn.disabled = true;
        addBtn.classList.remove('loading', 'success');
        addBtn.classList.add('out-of-stock');
        setCardButtonLabel(addBtn, window.themeStrings.soldOut);
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

async function handleProductCardAddForm(form) {
  if (form.dataset.submitting === 'true') return;
  form.dataset.submitting = 'true';
  const submitStart = Date.now();

  const submitButton = form.querySelector('.add-to-cart-btn');
  const card = form.closest('.product-card-primary');
  const variantInput = form.querySelector('input[name="id"]');

    if (submitButton) {
      submitButton.classList.remove('success');
      submitButton.classList.add('loading');
      submitButton.disabled = true;
    }

  try {
    await wait(250);

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
    await wait(Math.max(0, 350 - (Date.now() - submitStart)));

    if (submitButton) {
      submitButton.classList.remove('loading');
      submitButton.classList.add('success');
      setCardButtonLabel(submitButton, window.themeStrings?.added || 'Added');
    }

    document.dispatchEvent(new CustomEvent('cart:updated'));
    window.setTimeout(() => {
      document.querySelector('.cart-open, #corner-cowi-open-primary-card')?.click();
    }, 350);
  } catch (error) {
    console.error('Product card add to cart failed', error);
    if (submitButton) {
      const isOutOfStock = submitButton.classList.contains('out-of-stock');
      submitButton.classList.remove('loading', 'success');
      submitButton.disabled = isOutOfStock;
      setCardButtonLabel(
        submitButton,
        isOutOfStock
          ? (window.themeStrings?.soldOut || 'Unavailable')
          : (window.themeStrings?.addToCart || 'Add to Cart')
      );
    }
    form.dataset.submitting = 'false';
    return;
  }

  window.setTimeout(() => {
    form.dataset.submitting = 'false';

    if (!submitButton) return;

    submitButton.classList.remove('loading', 'success');

    const selectedItem = variantInput
      ? card?.querySelector(`.dropdown-item[data-id="${variantInput.value}"]`)
      : null;
    const inventoryQty = parseInt(selectedItem?.dataset.inventory || '0', 10) || 0;
    const isAvailable = inventoryQty > 0;

    submitButton.classList.toggle('out-of-stock', !isAvailable);
    submitButton.disabled = !isAvailable;
    setCardButtonLabel(
      submitButton,
      isAvailable
        ? (window.themeStrings?.addToCart || 'Add to Cart')
        : (window.themeStrings?.soldOut || 'Unavailable')
    );
  }, 1200);
}

window.bindProductCardAddForms = function (scope = document) {
  scope.querySelectorAll('.product-card-add-form').forEach((form) => {
    form.dataset.ajaxBound = 'true';
  });
};

if (!window.productCardDelegatedSubmitBound) {
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('.product-card-add-form');
    if (!form) return;

    e.preventDefault();
    e.stopPropagation();
    handleProductCardAddForm(form);
  }, true);

  window.productCardDelegatedSubmitBound = true;
}

document.addEventListener('DOMContentLoaded', () => {
  window.bindProductCardAddForms(document);
});

document.addEventListener('click', (event) => {
  const cardButton = event.target.closest('.product-card-primary .product-card-add-form .add-to-cart-btn');
  if (!cardButton || cardButton.disabled) return;
  if (cardButton.dataset.collectionFeedbackRunning === 'true') return;

  cardButton.dataset.collectionFeedbackRunning = 'true';
  cardButton.classList.remove('success');
  cardButton.classList.add('loading');

  window.setTimeout(() => {
    cardButton.classList.remove('loading');
    cardButton.classList.add('success');
    setCardButtonLabel(cardButton, window.themeStrings?.added || 'Added');

    window.setTimeout(() => {
      const isOutOfStock = cardButton.classList.contains('out-of-stock');
      cardButton.classList.remove('success');
      setCardButtonLabel(
        cardButton,
        isOutOfStock
          ? (window.themeStrings?.soldOut || 'Unavailable')
          : (window.themeStrings?.addToCart || 'Add to Cart')
      );
      cardButton.dataset.collectionFeedbackRunning = 'false';
    }, 1200);
  }, 350);
}, true);

const sidebar = document.querySelector('.filter-sidebar');
const closeBtn = document.querySelector('.filter-close-mob');
const body = document.body;

if (sidebar && closeBtn) {
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
}


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
