document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".product-card-primary").forEach((card) => {
    const variantItems = card.querySelectorAll(".fc_variant_item");
    const priceContainer = card.querySelector(".fc_price_weight p");
    const sellingPrice = card.querySelector(".selling_price");
    const comparePrice = card.querySelector("strike");
    const addToCartInput = card.querySelector('input[name="id"]');
    const trustText = card.querySelector(".fc_trust_text p");
    const mainImg = card.querySelector(".fc_image .main_img");

    variantItems.forEach((variant) => {
      variant.addEventListener("click", () => {
        // Remove existing active class
        variantItems.forEach((v) => v.classList.remove("active"));
        variant.classList.add("active");

        // Read data attributes
        const price = variant.dataset.price;
        const compare = variant.dataset.compare;
        const inventory = variant.dataset.inventory;
        const variantId = variant.dataset.id;
        const image = variant.dataset.image;

        // Update prices
        if (sellingPrice) sellingPrice.textContent = price;
        if (comparePrice) {
          if (compare && compare !== price) {
            comparePrice.textContent = compare;
            comparePrice.style.display = "inline";
          } else {
            comparePrice.style.display = "none";
          }
        }

        if (addToCartInput) addToCartInput.value = variantId;

        if (trustText && inventory)
          trustText.textContent = `Only ${inventory} Left`;

        if (image && mainImg) mainImg.src = image;
      });
    });
  });
});
