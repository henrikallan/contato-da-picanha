/* ============================================================
   CONTATO DA PICANHA — script.js
   1. Aplica em cima dos cards ESTÁTICOS do index.html as edições
      feitas pelo admin (nome/preço/unidade/selo/foto/esgotado),
      esconde produtos removidos e acrescenta produtos novos
      criados no painel — sem recriar o HTML original.
   2. Aplica edições de kit (nome/preço/foto) feitas pelo admin.
   3. Trata fallback de imagem (produtos, kits, banner do topo).
   4. Carrossel do banner do topo (desliza sozinho + setas + dots).
   5. Carrinho: adicionar, ajustar quantidade, remover, finalizar
      — com tratamento especial para produtos vendidos por peso,
      e bloqueio de produtos marcados como esgotados.
   6. Cadastro rápido do cliente (nome + telefone) antes de fechar
      o pedido no WhatsApp.
   7. Horários: destaca o dia da semana atual automaticamente.
   8. Menu mobile / scroll reveal / gráfico de horário de pico.

   Os cards de produto continuam sendo HTML estático dentro do
   index.html (um por produto, dentro de cada categoria). O
   catálogo de js/products-data.js e as edições do painel do
   admin (js/store.js) só são usados para ATUALIZAR esses cards
   já existentes — não para gerá-los do zero. Veja o README.md.
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  applyProductOverrides();
  appendCustomProducts();
  applyKitOverrides();
  setupImageFallback();
  renderKitImages();
  setupProductAddToCart();
  setupKitAddToCart();
  setupKitQuickView();
  setupDeliveryChoice();
  setupProductQuickView();
  setupProductSearch();
  setupHeroBannerCarousel();
  setupMobileNav();
  setupScrollReveal();
  drawPopularChart();
  setupCart();
  highlightCurrentDay();
  updateTodayStatus();
});

/* ----------------------------------------------------------
   ÍCONE DE CARRINHO (usado nos produtos adicionados pelo admin)
---------------------------------------------------------- */
const ICON_CART_ADD = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none"/><circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none"/><path d="M2.5 3h2.4l2.4 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6"/></svg>`;

/* ----------------------------------------------------------
   1) APLICAR EDIÇÕES DO ADMIN NOS CARDS ESTÁTICOS EXISTENTES
---------------------------------------------------------- */
function applyProductOverrides() {
  if (!window.Store) return;
  document.querySelectorAll(".product-card[data-key]").forEach((card) => {
    const [category, slug] = card.dataset.key.split(":");
    const merged = Store.getMergedProduct(category, slug);
    if (!merged) {
      // produto removido pelo admin
      card.remove();
      return;
    }
    fillProductCard(card, merged);
  });
}

// Alguns produtos (ex.: Carvão) não têm um preço único — o campo "price"
// nesses casos vem como um texto ("ESCOLHA O TAMANHO") em vez de um
// número. Essa função decide se prefixa "R$" (preço de verdade) ou só
// mostra o texto puro (rótulo), e é usada tanto no card quanto no modal.
function renderPrice(el, rawPrice, unit) {
  if (!el || !rawPrice) return;
  const isNumeric = /^[\d.,]+$/.test(String(rawPrice).trim());
  if (isNumeric) {
    const unitHtml = unit ? `<em>/${escapeHTML(unit)}</em>` : "";
    el.innerHTML = `<small>R$</small>${escapeHTML(rawPrice)}${unitHtml}`;
    el.classList.remove("product-price-choose");
  } else {
    el.textContent = rawPrice;
    el.classList.add("product-price-choose");
  }
}

function fillProductCard(card, p) {
  const img = card.querySelector(".product-photo");
  const nameEl = card.querySelector(".product-name");
  const metaEl = card.querySelector(".product-meta");
  const priceEl = card.querySelector(".product-price");
  const tagEl = card.querySelector(".product-tag");
  const addBtn = card.querySelector(".add-cart-btn");

  if (img && p.image) img.src = p.image;
  if (img) applyImageZoom(img, p.imageZoom);
  if (nameEl && p.name) nameEl.textContent = p.name;

  const meta = p.meta || (p.origin || p.storage ? [p.origin, p.storage].filter(Boolean).join(" · ") : "");
  if (metaEl) metaEl.textContent = meta;

   if (priceEl && p.price) {
    renderPrice(priceEl, p.price, p.unit);
  }

  applyStockState(card, tagEl, addBtn, p);
}

// Aplica o mesmo "zoom" cadastrado no painel do admin (campo Zoom da foto,
// em %) — assim toda foto preenche o quadro do card no mesmo tamanho
// padrão, sem precisar cortar/redimensionar o arquivo original.
function applyImageZoom(img, zoomPercent) {
  const zoom = parseFloat(zoomPercent);
  img.style.transform = zoom && zoom !== 100 ? `scale(${zoom / 100})` : "";
}

// Marca visualmente o card como esgotado e desativa o botão de carrinho
// (usado tanto nos cards originais quanto nos criados pelo admin).
function applyStockState(card, tagEl, addBtn, p) {
  const soldOut = !!p.soldOut;
  card.classList.toggle("is-sold-out", soldOut);
  if (tagEl) {
    tagEl.textContent = soldOut ? "Esgotado" : (p.tag || "");
    tagEl.classList.toggle("product-tag-soldout", soldOut);
  }
  if (addBtn) {
    addBtn.disabled = soldOut;
    addBtn.setAttribute("aria-disabled", String(soldOut));
    addBtn.title = soldOut ? "Produto esgotado" : "";
  }
}

function escapeHTML(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ----------------------------------------------------------
   2) ACRESCENTAR PRODUTOS NOVOS CRIADOS NO PAINEL DO ADMIN
---------------------------------------------------------- */
function appendCustomProducts() {
  if (!window.Store) return;
  document.querySelectorAll(".cards-grid[data-category]").forEach((grid) => {
    const category = grid.dataset.category;
    const customProducts = Store.getCustomProductsForCategory(category);
    customProducts.forEach((p) => {
      grid.insertAdjacentHTML("beforeend", customProductCardHTML(category, p));
    });
  });
}

function customProductCardHTML(category, p) {
  const image = p.image || ("images/products/" + p.slug + ".png");
  const meta = p.meta || "";
  const unit = p.unit ? `<em>/${escapeHTML(p.unit)}</em>` : "";
  const soldOut = !!p.soldOut;
  const tagText = soldOut ? "Esgotado" : (p.tag ? escapeHTML(p.tag) : "");
  const zoom = parseFloat(p.imageZoom);
  const zoomStyle = zoom && zoom !== 100 ? ` style="transform: scale(${zoom / 100})"` : "";
  return `
  <div class="product-card${soldOut ? " is-sold-out" : ""}" data-key="${category}:${p.slug}">
    <div class="product-media">
      <img class="product-photo" src="${image}" alt="${escapeHTML(p.name)}" loading="lazy"${zoomStyle}>
      <span class="product-flame" aria-hidden="true">🔥</span>
      <span class="product-tag${soldOut ? " product-tag-soldout" : ""}">${tagText}</span>
    </div>
    <div class="product-body">
      <h4 class="product-name">${escapeHTML(p.name)}</h4>
      <p class="product-meta">${escapeHTML(meta)}</p>
      <div class="product-footer">
        <span class="product-price"><small>R$</small>${escapeHTML(p.price)}${unit}</span>
        <button type="button" class="product-cta add-cart-btn" aria-label="Adicionar ${escapeHTML(p.name)} ao carrinho"${soldOut ? ' disabled aria-disabled="true" title="Produto esgotado"' : ""}>
          ${ICON_CART_ADD}
        </button>
      </div>
    </div>
  </div>`;
}

/* ----------------------------------------------------------
   3) EDIÇÕES DE KIT FEITAS PELO ADMIN (nome / preço / foto)
---------------------------------------------------------- */
function applyKitOverrides() {
  if (!window.Store) return;
  const overrides = Store.getKitOverrides();
  Object.keys(overrides).forEach((slug) => {
    const img = document.querySelector(`.kit-card-media img[data-kit-slug="${slug}"]`);
    const card = img ? img.closest(".kit-card") : null;
    if (!card) return;
    const ov = overrides[slug];
    if (ov.name) card.querySelector("h4").textContent = ov.name;
    if (ov.price) card.querySelector(".kit-price").textContent = "R$" + ov.price;
  });
}

/* ----------------------------------------------------------
   4) FALLBACK DE IMAGEM
   Se a foto de um produto/kit/dono ainda não existir em disco,
   remove a <img> quebrada e deixa só o ícone de brasa 🔥 no lugar.
---------------------------------------------------------- */
function setupImageFallback() {
  const images = document.querySelectorAll(
    ".product-photo, .kit-card-media img, .hero-banner-slide img"
  );
  images.forEach((img) => {
    img.addEventListener("load", () => img.setAttribute("data-loaded", "true"));
    img.addEventListener("error", () => {
      img.removeAttribute("src");
      img.removeAttribute("data-loaded");
    });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) {
      img.removeAttribute("src");
    }
  });
}

/* ----------------------------------------------------------
   5) IMAGENS DOS KITS (images/kits/<kit-slug>.png + overrides)
---------------------------------------------------------- */
function renderKitImages() {
  if (!window.KIT_IMAGES) return;
  const overrides = window.Store ? Store.getKitOverrides() : {};
  document.querySelectorAll("img[data-kit-slug]").forEach((img) => {
    const slug = img.dataset.kitSlug;
    const src = (overrides[slug] && overrides[slug].image) || KIT_IMAGES[slug];
    if (!src) return;
    img.src = src;
    img.addEventListener("error", () => img.removeAttribute("src"));
  });
}

/* ----------------------------------------------------------
   6) CARROSSEL DO BANNER DO TOPO (desliza sozinho + setas + dots)
---------------------------------------------------------- */
function setupHeroBannerCarousel() {
  const track = document.getElementById("heroBannerTrack");
  const prevBtn = document.getElementById("heroBannerPrev");
  const nextBtn = document.getElementById("heroBannerNext");
  const dotsWrap = document.getElementById("heroBannerDots");
  if (!track) return;

  const slides = Array.from(track.children);
  const dots = dotsWrap ? Array.from(dotsWrap.children) : [];
  const total = slides.length;
  const AUTO_ADVANCE_MS = 5500;
  let index = 0;
  let timer = null;

  function goTo(i) {
    index = (i + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, di) => dot.classList.toggle("active", di === index));
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function restartAutoAdvance() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, AUTO_ADVANCE_MS);
  }

  nextBtn?.addEventListener("click", () => { next(); restartAutoAdvance(); });
  prevBtn?.addEventListener("click", () => { prev(); restartAutoAdvance(); });
  dots.forEach((dot, di) => {
    dot.addEventListener("click", () => { goTo(di); restartAutoAdvance(); });
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  goTo(0);
  if (!prefersReducedMotion && total > 1) {
    restartAutoAdvance();
  }
}

function setupProductAddToCart() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".product-card .add-cart-btn");
    if (!btn) return;
    if (btn.disabled) return;
    const card = btn.closest(".product-card");
    if (!card || !card.dataset.key) return;

    // Produto com marca/sabor: não dá pra escolher a variação pelo
    // ícone do card, então abrimos o modal pra escolher antes.
    const [category, slug] = card.dataset.key.split(":");
    const merged = window.Store ? Store.getMergedProduct(category, slug) : null;
    if (merged && merged.variants) {
      window.openProductModalByKey?.(category, slug);
      return;
    }

    addProductToCartFromCard(card);
  });
}

// Usado tanto pelo clique no botão de cada card quanto pelo botão
// "Adicionar ao carrinho" dentro do modal de visualização ampliada
// (para produtos SEM marca/sabor para escolher).
function addProductToCartFromCard(card) {
  if (!card || !card.dataset.key) return;
  if (card.classList.contains("is-sold-out")) return;

  const name = card.querySelector(".product-name")?.textContent.trim() || "Produto";
  const priceEl = card.querySelector(".product-price");
  const { price, unit } = parsePriceEl(priceEl);

  Store.addToCart({ key: card.dataset.key, name, price, unit });
  pulseCartBadge();
  refreshCartUI();
}

// Usado pelo botão "Adicionar ao carrinho" do modal QUANDO o produto tem
// marca/sabor — cada combinação vira um item separado no carrinho, com
// chave própria (para não se misturar com outra variação do mesmo produto).
function addVariantProductToCart(card, brand, flavor) {
  if (!card || !card.dataset.key) return;

  const baseName = card.querySelector(".product-name")?.textContent.trim() || "Produto";
  const priceEl = card.querySelector(".product-price");
  let { price, unit } = parsePriceEl(priceEl);
  const brandLabel = brand?.name || "";
  const flavorLabel = flavor && typeof flavor === "object" ? flavor.name : flavor;

  if (flavor && typeof flavor === "object" && flavor.price) price = Store.parseBRL(flavor.price);

  const variantLabel = [brandLabel, flavorLabel].filter(Boolean).join(" · ");
  const variantSlug = Store.slugify([brandLabel, flavorLabel].filter(Boolean).join("-"));

  Store.addToCart({
    key: `${card.dataset.key}:${variantSlug}`,
    name: variantLabel ? `${baseName} — ${variantLabel}` : baseName,
    price,
    unit,
  });

  pulseCartBadge();
  refreshCartUI();
}

function parsePriceEl(priceEl) {
  if (!priceEl) return { price: 0, unit: "" };
  const clone = priceEl.cloneNode(true);
  const em = clone.querySelector("em");
  const unit = em ? em.textContent.replace("/", "").trim() : "";
  const small = clone.querySelector("small");
  if (small) small.remove();
  if (em) em.remove();
  const price = Store.parseBRL(clone.textContent.trim());
  return { price, unit };
}

/* ----------------------------------------------------------
   8) VISUALIZAÇÃO AMPLIADA DO PRODUTO (clique no card abre o modal)
---------------------------------------------------------- */
function setupProductQuickView() {
  const overlay = document.getElementById("productModalOverlay");
  if (!overlay || !window.Store) return;

  const closeBtn = document.getElementById("productModalClose");
  const addBtn = document.getElementById("productModalAddBtn");
  const imagesWrap = document.getElementById("productModalImages");
  const track = document.getElementById("productModalTrack");
  const slide2 = document.getElementById("productModalSlide2");
  const prevBtn = document.getElementById("productModalPrev");
  const nextBtn = document.getElementById("productModalNext");
  const dotsWrap = document.getElementById("productModalDots");
  const dots = dotsWrap ? Array.from(dotsWrap.children) : [];
  const prevProductBtn = document.getElementById("productModalPrevProduct");
  const nextProductBtn = document.getElementById("productModalNextProduct");
  const variantsWrap = document.getElementById("productModalVariants");
  const brandGroup = document.getElementById("variantBrandGroup");
  const brandOptions = document.getElementById("variantBrandOptions");
  const flavorGroup = document.getElementById("variantFlavorGroup");
  const flavorOptions = document.getElementById("variantFlavorOptions");
  const flavorPrevBtn = document.getElementById("variantFlavorPrev");
  const flavorNextBtn = document.getElementById("variantFlavorNext");
  let currentCard = null;
  let currentCategory = null;
  let currentSlug = null;
  let slideCount = 1;
  let slideIndex = 0;
  let currentVariants = null;
  let selectedBrand = null;
  let selectedFlavor = null;

  // clique em qualquer lugar do card, exceto no botão de carrinho, abre o modal
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card || !card.dataset.key) return;
    if (e.target.closest(".add-cart-btn")) return;
    const [category, slug] = card.dataset.key.split(":");
    openProductModal(category, slug);
  });

  function goToSlide(i) {
    slideIndex = (i + slideCount) % slideCount;
    track.style.transform = `translateX(-${slideIndex * 100}%)`;
    dots.forEach((dot, di) => dot.classList.toggle("active", di === slideIndex));
  }

  prevBtn?.addEventListener("click", () => goToSlide(slideIndex - 1));
  nextBtn?.addEventListener("click", () => goToSlide(slideIndex + 1));
  dots.forEach((dot, di) => dot.addEventListener("click", () => goToSlide(di)));

  function goToProduct(category, slug) {
    openProductModal(category, slug);
  }

  function stepProduct(direction) {
    if (!currentCategory) return;
    const list = Store.getCategoryProducts(currentCategory);
    if (list.length < 2) return;
    const index = list.findIndex((p) => p.slug === currentSlug);
    const nextIndex = ((index === -1 ? 0 : index) + direction + list.length) % list.length;
    goToProduct(currentCategory, list[nextIndex].slug);
  }

    prevProductBtn?.addEventListener("click", () => stepProduct(-1));
  nextProductBtn?.addEventListener("click", () => stepProduct(1));

  // ---------- marca/sabor (produtos com variantes) ----------
    function renderVariants(p) {
    currentVariants = p.variants || null;
    const flavorLabelEl = document.getElementById("variantFlavorLabel");
    if (flavorLabelEl) flavorLabelEl.textContent = (currentVariants && currentVariants.flavorLabel) || "Sabor";
    selectedBrand = null;
    selectedFlavor = null;

    const brands = currentVariants && Array.isArray(currentVariants.brands) ? currentVariants.brands : [];
    if (brands.length === 0) {
      variantsWrap.hidden = true;
      brandOptions.innerHTML = "";
      flavorOptions.innerHTML = "";
      updateAddButtonState();
      return;
    }

    variantsWrap.hidden = false;
    // Se só existe 1 "marca" e ela não tem nome, é um produto que só
    // varia por sabor (ex.: linguiça recheada) — pula a etapa de marca.
    const hasNamedBrands = brands.length > 1 || !!brands[0].name;

    if (!hasNamedBrands) {
      brandGroup.hidden = true;
      selectedBrand = brands[0];
      renderFlavorOptions(selectedBrand);
    } else {
      brandGroup.hidden = false;
      flavorGroup.hidden = true;
      flavorOptions.innerHTML = "";
      brandOptions.innerHTML = brands
        .map((b, i) => `<button type="button" class="variant-pill" data-brand-index="${i}">${escapeHTML(b.name)}</button>`)
        .join("");
    }
    updateAddButtonState();
  }

function renderFlavorOptions(brand) {
  flavorGroup.hidden = false;
  selectedFlavor = null;

  const flavors = brand.flavors || [];
  const hasMultiple = flavors.length > 1;

  flavorPrevBtn.hidden = !hasMultiple;
  flavorNextBtn.hidden = !hasMultiple;

  flavorOptions.innerHTML = flavors
    .map((flavor, i) => {
      const name = typeof flavor === "object" ? flavor.name : flavor;

      return `<button type="button" class="variant-pill" data-flavor-index="${i}">${escapeHTML(name)}</button>`;
    })
    .join("");
}

  // Seleciona o sabor pelo índice (usado tanto pelo clique direto na pílula
  // quanto pelas setas "‹ ›" que andam sabor a sabor, sem mexer na marca).
  function selectFlavorByIndex(idx) {
  if (!selectedBrand) return;

  const flavors = selectedBrand.flavors || [];
  if (flavors.length === 0) return;

  const i = ((idx % flavors.length) + flavors.length) % flavors.length;

  selectedFlavor = flavors[i];

  Array.from(flavorOptions.children).forEach((el, elIdx) => {
    el.classList.toggle("selected", elIdx === i);
  });

  const modalImg = document.getElementById("productModalImg1");

  if (modalImg && selectedFlavor.image) {
    modalImg.src = selectedFlavor.image;
    modalImg.alt = `${selectedFlavor.name} - ${currentSlug}`;
  }

  const priceEl = document.getElementById("productModalPrice");

  if (priceEl && selectedFlavor.price) {
    renderPrice(priceEl, selectedFlavor.price, null);
  }

  updateAddButtonState();
}

  flavorPrevBtn?.addEventListener("click", () => {
    if (!selectedBrand) return;
    const curIdx = selectedBrand.flavors.indexOf(selectedFlavor);
    selectFlavorByIndex(curIdx === -1 ? 0 : curIdx - 1);
  });
  flavorNextBtn?.addEventListener("click", () => {
    if (!selectedBrand) return;
    const curIdx = selectedBrand.flavors.indexOf(selectedFlavor);
    selectFlavorByIndex(curIdx === -1 ? 0 : curIdx + 1);
  });

  flavorOptions?.addEventListener("click", (e) => {
    const pill = e.target.closest(".variant-pill[data-flavor-index]");
    if (!pill || !selectedBrand) return;
    selectFlavorByIndex(Number(pill.dataset.flavorIndex));
  });

  function updateAddButtonState() {
    const needsVariant = !!currentVariants && Array.isArray(currentVariants.brands) && currentVariants.brands.length > 0;
    const missingSelection = needsVariant && (!selectedBrand || !selectedFlavor);
    addBtn.disabled = missingSelection || addBtn.dataset.soldOut === "true";
  }

brandOptions?.addEventListener("click", (e) => {
  const pill = e.target.closest(".variant-pill[data-brand-index]");
  if (!pill || !currentVariants) return;

  selectedBrand = currentVariants.brands[Number(pill.dataset.brandIndex)];

  Array.from(brandOptions.children).forEach((el) =>
    el.classList.toggle("selected", el === pill)
  );

  // Troca a imagem principal para a imagem da marca selecionada
  const img1 = document.getElementById("productModalImg1");

  if (selectedBrand.image) {
    img1.src = selectedBrand.image;
    img1.alt = selectedBrand.name;
    img1.removeAttribute("data-loaded");
  }

  renderFlavorOptions(selectedBrand);
  updateAddButtonState();
});

  function openProductModal(category, slug) {
    const p = Store.getMergedProduct(category, slug);
    if (!p) return;
    currentCategory = category;
    currentSlug = slug;
    currentCard = document.querySelector(`.product-card[data-key="${category}:${slug}"]`);

    const img1 = document.getElementById("productModalImg1");
    const img2 = document.getElementById("productModalImg2");
    const tagEl = document.getElementById("productModalTag");
    const nameEl = document.getElementById("productModalName");
    const metaEl = document.getElementById("productModalMeta");
    const descEl = document.getElementById("productModalDesc");
    const priceEl = document.getElementById("productModalPrice");

  const cardImg = currentCard ? currentCard.querySelector(".product-photo") : null;
    img1.src = (cardImg && cardImg.getAttribute("src")) || Store.getProductImage(p);
    img1.alt = p.name;
    img1.removeAttribute("data-loaded");
    applyImageZoom(img1, p.imageZoom);

    // A 2ª foto só entra no carrossel se o produto tiver uma cadastrada.
    // Usamos style.display (em vez do atributo "hidden") porque
    // .product-media já define display:flex, que teria prioridade sobre
    // o [hidden] do navegador.
    if (p.image2) {
      img2.src = p.image2;
      img2.alt = p.name;
      img2.removeAttribute("data-loaded");
      applyImageZoom(img2, p.image2Zoom);
      slide2.style.display = "flex";
      slideCount = 2;
    } else {
      img2.removeAttribute("src");
      slide2.style.display = "none";
      slideCount = 1;
    }
    imagesWrap.classList.toggle("single-image", slideCount === 1);
    goToSlide(0); // sempre abre mostrando a primeira foto

    tagEl.textContent = p.soldOut ? "Esgotado" : (p.tag || "");
    tagEl.classList.toggle("product-tag-soldout", !!p.soldOut);
    nameEl.textContent = p.name;
    metaEl.textContent = p.meta || (p.origin || p.storage ? [p.origin, p.storage].filter(Boolean).join(" · ") : "");
    descEl.textContent = p.description || "";

    const unit = p.unit ? p.unit : "";
    renderPrice(priceEl, p.price, unit);

    addBtn.dataset.soldOut = p.soldOut ? "true" : "false";
    addBtn.setAttribute("aria-disabled", String(!!p.soldOut));
    addBtn.title = p.soldOut ? "Produto esgotado" : "";
    addBtn.setAttribute("aria-label", p.soldOut ? "Produto esgotado" : `Adicionar ${p.name} ao carrinho`);
    renderVariants(p); // mostra o seletor de marca/sabor (se o produto tiver) e já deixa o botão no estado certo

    // Setas de "produto anterior/próximo" só aparecem se a categoria tiver
    // mais de um produto — sem elas ficando à toa quando não faz sentido.
    const categoryList = Store.getCategoryProducts(category);
    const showProductNav = categoryList.length > 1;
    if (prevProductBtn) prevProductBtn.hidden = !showProductNav;
    if (nextProductBtn) nextProductBtn.hidden = !showProductNav;

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeProductModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = document.getElementById("cartDrawer")?.classList.contains("open") ? "hidden" : "";
    currentCard = null;
    currentCategory = null;
    currentSlug = null;
  }

  closeBtn?.addEventListener("click", closeProductModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeProductModal(); });
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") closeProductModal();
    if (e.key === "ArrowRight") stepProduct(1);
    if (e.key === "ArrowLeft") stepProduct(-1);
  });
    addBtn?.addEventListener("click", () => {
    if (!currentCard) return;
    const needsVariant = !!currentVariants && Array.isArray(currentVariants.brands) && currentVariants.brands.length > 0;
    if (needsVariant) {
      if (!selectedFlavor) return; // segurança extra; o botão já fica desabilitado até escolher
      addVariantProductToCart(currentCard, selectedBrand, selectedFlavor);
    } else {
      addProductToCartFromCard(currentCard);
    }
    closeProductModal();
  });

  // Permite que outras funções (ex.: o botão de carrinho de cada card,
  // quando o produto exige marca/sabor) abram este mesmo modal.
  window.openProductModalByKey = openProductModal;
}

/* ----------------------------------------------------------
   8b) BUSCA DE PRODUTOS (lupa no header)
---------------------------------------------------------- */
const SEARCH_CATEGORY_LABELS = {
  picanhas: "Picanhas da Semana",
  bovinos: "Bovinos",
  suinos: "Suínos",
  aves: "Aves",
  diversos: "Diversos",
  sais: "Sais",
  molhos: "Molhos",
  kits: "Kits",
};

function setupProductSearch() {
  const toggle = document.getElementById("searchToggle");
  const overlay = document.getElementById("searchOverlay");
  const closeBtn = document.getElementById("searchClose");
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");
  if (!toggle || !overlay || !input || !results || !window.Store) return;

  function normalize(str) {
    return (str || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function buildIndex() {
    const index = [];
    Store.getAllCategories().forEach((category) => {
      Store.getCategoryProducts(category).forEach((p) => index.push(p));
    });
    // Kits ficam só no HTML (não estão no products-data.js), então são lidos dos cards
    document.querySelectorAll(".kit-card").forEach((card) => {
      const slug = card.querySelector("img[data-kit-slug]")?.dataset.kitSlug;
      const name = card.querySelector("h4")?.textContent.trim();
      const price = card.querySelector(".kit-price")?.textContent.replace("R$", "").trim();
      if (!slug || !name) return;
      index.push({ category: "kits", slug, name, price, unit: "", searchText: "kit " + name, __kitCard: card });
    });
    return index;
  }

  function openSearch() {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    input.value = "";
    renderResults("");
    setTimeout(() => input.focus(), 50);
  }

  function closeSearch() {
    overlay.classList.remove("open");
    document.body.style.overflow = document.getElementById("cartDrawer")?.classList.contains("open") ? "hidden" : "";
  }

  function renderResults(query) {
    const q = normalize(query.trim());
    if (!q) {
      results.innerHTML = '<p class="search-hint">Digite para buscar em todo o cardápio.</p>';
      return;
    }
    const matches = buildIndex().filter((p) => normalize(p.searchText || p.name).includes(q)).slice(0, 30);
    if (matches.length === 0) {
      results.innerHTML = '<p class="search-empty">Nenhum produto encontrado.</p>';
      return;
    }
    results.innerHTML = matches.map((p) => {
      const card = p.__kitCard || document.querySelector(`.product-card[data-key="${p.category}:${p.slug}"]`);
      const img = card ? card.querySelector(".product-photo, .kit-card-media img") : null;
      const photo = img && img.getAttribute("src") ? img.getAttribute("src") : "";
      const unit = p.unit ? "/" + escapeHTML(p.unit) : "";
      const isNumeric = /^\d/.test(String(p.price));
      const priceHTML = p.soldOut
        ? "ESGOTADO"
        : isNumeric ? `<small>R$</small>${escapeHTML(p.price)}${unit}` : escapeHTML(p.price);
      return `
        <button type="button" class="search-result-item${p.soldOut ? " is-sold-out" : ""}" data-key="${p.category}:${p.slug}">
          <img class="search-result-photo" src="${photo}" alt="" loading="lazy">
          <span class="search-result-info">
            <span class="search-result-name">${escapeHTML(p.name)}</span>
            <span class="search-result-cat">${escapeHTML(SEARCH_CATEGORY_LABELS[p.category] || p.category)}</span>
          </span>
          <span class="search-result-price${isNumeric && !p.soldOut ? "" : " is-text"}">${priceHTML}</span>
        </button>`;
    }).join("");
  }

  toggle.addEventListener("click", openSearch);
  closeBtn?.addEventListener("click", closeSearch);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeSearch(); });
  document.addEventListener("keydown", (e) => {
    if (overlay.classList.contains("open") && e.key === "Escape") closeSearch();
  });
  input.addEventListener("input", () => renderResults(input.value));

  results.addEventListener("click", (e) => {
    const item = e.target.closest(".search-result-item");
    if (!item) return;
    const key = item.dataset.key;
    closeSearch();
    if (key.startsWith("kits:")) {
      const slug = key.slice(5);
      document.querySelector(`.kit-card img[data-kit-slug="${slug}"]`)?.closest(".kit-card")?.click();
      return;
    }
    document.querySelector(`.product-card[data-key="${key}"]`)?.click();
  });
}

/* ----------------------------------------------------------
   9) ADICIONAR KITS AO CARRINHO (botão já existe no HTML)
---------------------------------------------------------- */
function setupKitAddToCart() {
  document.querySelectorAll(".kit-card").forEach((card) => {
    const imgEl = card.querySelector("img[data-kit-slug]");
    const slug = imgEl ? imgEl.dataset.kitSlug : null;
    const btn = card.querySelector(".kit-add-btn");
    if (!slug || !btn) return;

    btn.addEventListener("click", () => {
      addKitCardToCart(card, slug);
    });
  });
}

function addKitCardToCart(card, slug) {
  const name = card.querySelector("h4").textContent.trim();
  const priceText = card.querySelector(".kit-price").textContent.replace("R$", "").trim();
  Store.addToCart({
    key: "kit:" + slug,
    name,
    price: Store.parseBRL(priceText),
    unit: "",
  });
  pulseCartBadge();
  refreshCartUI();
  openCart();
}

/* ----------------------------------------------------------
   9b) VISUALIZAÇÃO AMPLIADA DO KIT (clique na foto abre o modal,
   com setas pra passar de um kit pro outro, igual nos produtos)
---------------------------------------------------------- */
function setupKitQuickView() {
  const overlay = document.getElementById("kitModalOverlay");
  const closeBtn = document.getElementById("kitModalClose");
  const prevBtn = document.getElementById("kitModalPrevKit");
  const nextBtn = document.getElementById("kitModalNextKit");
  const imgEl = document.getElementById("kitModalImg");
  const peopleEl = document.getElementById("kitModalPeople");
  const nameEl = document.getElementById("kitModalName");
  const listEl = document.getElementById("kitModalList");
  const priceEl = document.getElementById("kitModalPrice");
  const addBtn = document.getElementById("kitModalAddBtn");
  if (!overlay || !imgEl) return;

  let currentIndex = -1;

  function getKitCards() {
    return Array.from(document.querySelectorAll(".kit-card"));
  }

  function openKitModal(index) {
    const cards = getKitCards();
    if (index < 0 || index >= cards.length) return;
    currentIndex = index;
    const card = cards[index];

    const cardImg = card.querySelector(".kit-card-media img");
    imgEl.src = cardImg && cardImg.getAttribute("src") ? cardImg.getAttribute("src") : "";
    imgEl.alt = card.querySelector("h4")?.textContent.trim() || "";
    imgEl.removeAttribute("data-loaded");

    peopleEl.textContent = card.querySelector(".kit-people")?.textContent.trim() || "";
    nameEl.textContent = card.querySelector("h4")?.textContent.trim() || "";
    priceEl.innerHTML = card.querySelector(".kit-price")?.innerHTML || "";

    const items = Array.from(card.querySelectorAll("ul li")).map((li) => li.textContent.trim());
    listEl.innerHTML = items.map((item) => `<li>${escapeHTML(item)}</li>`).join("");

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeKitModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = document.getElementById("cartDrawer")?.classList.contains("open") ? "hidden" : "";
  }

  function stepKit(direction) {
    const cards = getKitCards();
    if (cards.length < 2) return;
    const nextIndex = (currentIndex + direction + cards.length) % cards.length;
    openKitModal(nextIndex);
  }

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".kit-card");
    if (!card) return;
    if (e.target.closest(".kit-add-btn")) return;
    const cards = getKitCards();
    openKitModal(cards.indexOf(card));
  });

  closeBtn?.addEventListener("click", closeKitModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeKitModal(); });
  document.addEventListener("keydown", (e) => {
    if (overlay.classList.contains("open") && e.key === "Escape") closeKitModal();
  });
  prevBtn?.addEventListener("click", () => stepKit(-1));
  nextBtn?.addEventListener("click", () => stepKit(1));

  addBtn?.addEventListener("click", () => {
    const cards = getKitCards();
    const card = cards[currentIndex];
    const imgOnCard = card?.querySelector("img[data-kit-slug]");
    const slug = imgOnCard?.dataset.kitSlug;
    if (!card || !slug) return;
    addKitCardToCart(card, slug);
    closeKitModal();
  });
}

/* ----------------------------------------------------------
   10) MENU MOBILE
---------------------------------------------------------- */
function setupMobileNav() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.querySelector("nav");
  const navList = document.getElementById("navList");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  navList.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ----------------------------------------------------------
   11) SCROLL REVEAL
---------------------------------------------------------- */
function setupScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach((t) => t.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -5% 0px" }
  );
  targets.forEach((t) => observer.observe(t));
}

/* ----------------------------------------------------------
   12) GRÁFICO DE HORÁRIO DE PICO (canvas simples, sem libs)
---------------------------------------------------------- */
function drawPopularChart() {
  const canvas = document.getElementById("popular-canvas");
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const cssW = rect.width || canvas.clientWidth || 600;
  const cssH = rect.height || canvas.clientHeight || 180;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const values = [5, 10, 25, 55, 40, 30, 45, 70, 90, 60, 35, 20];
  const w = cssW;
  const h = cssH;
  const pad = 10;
  const step = (w - pad * 2) / (values.length - 1);
  const max = Math.max(...values);

  ctx.clearRect(0, 0, w, h);

  const points = values.map((v, i) => ({
    x: pad + i * step,
    y: h - pad - (v / max) * (h - pad * 2),
  }));

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(255,106,44,0.45)");
  grad.addColorStop(1, "rgba(255,106,44,0.02)");

  ctx.beginPath();
  ctx.moveTo(points[0].x, h - pad);
  points.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, h - pad);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.strokeStyle = "#ff9752";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.stroke();

  const peakIndex = values.indexOf(max);
  ctx.beginPath();
  ctx.arc(points[peakIndex].x, points[peakIndex].y, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = "#e8b34d";
  ctx.fill();
}

let _chartResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(_chartResizeTimer);
  _chartResizeTimer = setTimeout(drawPopularChart, 150);
});

/* ----------------------------------------------------------
   13) HORÁRIOS: destaca o dia da semana atual sozinho
   (data-day em cada linha segue Date.getDay(): 0=domingo … 6=sábado)
---------------------------------------------------------- */
function highlightCurrentDay() {
  const rows = document.querySelectorAll("#hoursList .row[data-day]");
  if (!rows.length) return;
  const todayIndex = String(new Date().getDay());
  rows.forEach((row) => {
    row.classList.toggle("today", row.dataset.day === todayIndex);
  });
}

function updateTodayStatus() {
  const el = document.getElementById("todayStatus");
  if (!el) return;

  // 0=domingo … 6=sábado → [abre, fecha] em minutos; null = fechado o dia todo
  const horarios = {
    0: [10 * 60 + 30, 13 * 60],
    1: null,
    2: [9 * 60, 19 * 60],
    3: [9 * 60, 19 * 60],
    4: [9 * 60, 19 * 60],
    5: [9 * 60, 19 * 60],
    6: [9 * 60, 19 * 60],
  };
  const nomes = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const fmt = (min) => {
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
  };

  const now = new Date();
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = horarios[day];

  if (today && minutes >= today[0] && minutes < today[1]) {
    el.textContent = `Aberto · Fecha às ${fmt(today[1])}`;
    el.classList.remove("warn");
    return;
  }

  el.classList.add("warn");
  if (today && minutes < today[0]) {
    el.textContent = `Fechado · Abre hoje às ${fmt(today[0])}`;
    return;
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (horarios[d]) {
      const quando = i === 1 ? "amanhã" : nomes[d];
      el.textContent = `Fechado · Abre ${quando} às ${fmt(horarios[d][0])}`;
      return;
    }
  }
}

/* ----------------------------------------------------------
   14) CARRINHO
---------------------------------------------------------- */
function setupCart() {
  if (!window.Store) return;

  const cartToggle = document.getElementById("cartToggle");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartClose = document.getElementById("cartClose");
  const cartCheckoutBtn = document.getElementById("cartCheckoutBtn");

  cartToggle?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);

  cartCheckoutBtn?.addEventListener("click", () => {
    if (Store.getCart().length === 0) return;
    const proceed = () => openRegisterModal((address) => goToWhatsAppCheckout(address));
    if (Store.cartHasWeightedItems()) {
      openWeightAlert(proceed);
    } else {
      proceed();
    }
  });

  setupRegisterModal();
  refreshCartUI();
}

function openCart() {
  document.getElementById("cartDrawer")?.setAttribute("aria-hidden", "false");
  document.getElementById("cartOverlay")?.classList.add("open");
  document.getElementById("cartDrawer")?.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  document.getElementById("cartDrawer")?.setAttribute("aria-hidden", "true");
  document.getElementById("cartOverlay")?.classList.remove("open");
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.body.style.overflow = "";
}

function pulseCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  badge.classList.remove("pulse");
  void badge.offsetWidth;
  badge.classList.add("pulse");
}

function refreshCartUI() {
  const itemsWrap = document.getElementById("cartItems");
  const emptyMsg = document.getElementById("cartEmpty");
  const totalEl = document.getElementById("cartTotal");
  const totalLabelEl = document.getElementById("cartTotalLabel");
  const badge = document.getElementById("cartBadge");
  if (!itemsWrap) return;

  const cart = Store.getCart();
  badge.textContent = String(Store.cartCount());
  badge.style.display = Store.cartCount() > 0 ? "flex" : "none";

  if (cart.length === 0) {
    itemsWrap.innerHTML = "";
    emptyMsg.style.display = "block";
  } else {
    emptyMsg.style.display = "none";
    itemsWrap.innerHTML = cart.map(cartItemHTML).join("");
  }

  const hasWeighted = Store.cartHasWeightedItems();
  const fixedTotal = Store.cartTotal();

    if (hasWeighted) {
    totalLabelEl.textContent = fixedTotal > 0 ? "Subtotal (itens com preço fechado)" : "Total";
    totalEl.textContent = fixedTotal > 0 ? "R$" + Store.formatBRL(fixedTotal) : "a definir";
  } else {
    totalLabelEl.textContent = "Total";
    totalEl.textContent = "R$" + Store.formatBRL(fixedTotal);
  }
}

function cartItemHTML(item) {
  const unit = item.unit ? "/" + item.unit : "";
  const weighted = Store.isWeightedItem(item);
  return `
  <div class="cart-item${weighted ? " cart-item-weighted" : ""}" data-key="${item.key}">
    <div class="cart-item-info">
      <span class="cart-item-name">${escapeHTML(item.name)}</span>
      <span class="cart-item-price"><small>R$</small>${Store.formatBRL(item.price)}${unit ? `<em>${unit}</em>` : ""}</span>
      ${weighted ? `<span class="cart-item-note">Será pesado na loja</span>` : ""}
    </div>
    <div class="cart-item-qty">
      <button type="button" class="qty-btn qty-minus" aria-label="Diminuir quantidade">−</button>
      <span class="qty-value">${item.qty}</span>
      <button type="button" class="qty-btn qty-plus" aria-label="Aumentar quantidade">+</button>
    </div>
    <button type="button" class="cart-item-remove" aria-label="Remover item">×</button>
  </div>`;
}

document.addEventListener("click", (e) => {
  const row = e.target.closest(".cart-item");
  if (!row) return;
  const key = row.dataset.key;
  const cart = Store.getCart();
  const item = cart.find((i) => i.key === key);
  if (!item) return;

  if (e.target.closest(".qty-plus")) {
    Store.updateCartQty(key, item.qty + 1);
    refreshCartUI();
  } else if (e.target.closest(".qty-minus")) {
    Store.updateCartQty(key, item.qty - 1);
    refreshCartUI();
  } else if (e.target.closest(".cart-item-remove")) {
    Store.removeFromCart(key);
    refreshCartUI();
  }
});

function goToWhatsAppCheckout(address) {
  if (!selectedDeliveryMethod) return; // segurança extra; o botão já fica desabilitado até escolher
  const url = Store.buildWhatsAppCheckoutUrl(selectedDeliveryMethod, address);
  window.open(url, "_blank", "noopener");
  Store.clearCart();
  refreshCartUI();
  closeCart();
  resetDeliveryChoice();
}

/* ----------------------------------------------------------
   14b) RETIRADA OU ENTREGA (precisa escolher antes de enviar)
---------------------------------------------------------- */
let selectedDeliveryMethod = null;

function setupDeliveryChoice() {
  const options = document.querySelectorAll(".delivery-option");
  const checkoutBtn = document.getElementById("cartCheckoutBtn");
  const note = document.getElementById("deliveryChoiceNote");
  if (!options.length || !checkoutBtn) return;

  checkoutBtn.disabled = true;

  options.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedDeliveryMethod = btn.dataset.method;
      options.forEach((b) => b.classList.toggle("selected", b === btn));
      checkoutBtn.disabled = false;
      if (note) note.hidden = selectedDeliveryMethod !== "entrega";
      const feeEl = document.getElementById("cartDeliveryFee");
      if (feeEl) feeEl.hidden = selectedDeliveryMethod !== "entrega";
    });
  });
}

function resetDeliveryChoice() {
  selectedDeliveryMethod = null;
  document.querySelectorAll(".delivery-option").forEach((b) => b.classList.remove("selected"));
  const checkoutBtn = document.getElementById("cartCheckoutBtn");
  const note = document.getElementById("deliveryChoiceNote");
  if (checkoutBtn) checkoutBtn.disabled = true;
  if (note) note.hidden = true;
  const feeEl = document.getElementById("cartDeliveryFee");
  if (feeEl) feeEl.hidden = true;
}

/* ----------------------------------------------------------
   15) CADASTRO RÁPIDO DO CLIENTE (nome + telefone)
---------------------------------------------------------- */
function setupRegisterModal() {
  const overlay = document.getElementById("registerOverlay");
  const form = document.getElementById("registerForm");
  const cancelBtn = document.getElementById("registerCancel");
  const addressGroup = document.getElementById("registerAddressGroup");
  const addressInput = document.getElementById("registerAddress");
  if (!overlay || !form) return;

  const customer = Store.getCustomer();
  if (customer) {
    form.registerName.value = customer.name || "";
    form.registerPhone.value = customer.phone || "";
  }

  cancelBtn.addEventListener("click", () => closeRegisterModal());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeRegisterModal(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.registerName.value.trim();
    const phone = form.registerPhone.value.trim();
    if (!name || !phone) return;

    // O endereço só é pedido quando a entrega foi escolhida, e NUNCA fica
    // salvo em lugar nenhum (nem localStorage, nem pré-preenchido depois) —
    // por segurança, é sempre digitado na hora, pra não ficar guardado.
        const needsAddress = addressGroup && !addressGroup.classList.contains("register-field-hidden");
    let address = "";
    if (needsAddress) {
      address = addressInput.value.trim();
      if (!address) {
        addressInput.focus();
        return;
      }
    }

    Store.saveCustomer(name, phone);
    if (addressInput) addressInput.value = "";
    closeRegisterModal();
    if (window.__afterRegister) {
      const cb = window.__afterRegister;
      window.__afterRegister = null;
      cb(address);
    }
  });
}

// Alerta "itens vendidos por peso" — aparece antes do cadastro, só quando
// o carrinho tem algum item pesado. O clique em "Entendi" segue para o
// cadastro (nome/telefone/endereço) normalmente.
function openWeightAlert(onConfirm) {
  const overlay = document.getElementById("weightAlertOverlay");
  const okBtn = document.getElementById("weightAlertOk");
  if (!overlay || !okBtn) { onConfirm(); return; }

  const close = () => {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  };
  const handler = () => { close(); onConfirm(); };

  okBtn.addEventListener("click", handler, { once: true });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) { close(); okBtn.removeEventListener("click", handler); } }, { once: true });

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function openRegisterModal(afterRegisterCallback) {
  window.__afterRegister = afterRegisterCallback || null;
  const overlay = document.getElementById("registerOverlay");
  const addressGroup = document.getElementById("registerAddressGroup");
  const addressInput = document.getElementById("registerAddress");
  if (!overlay) return;

  // Campo de endereço só aparece se "Entrega" foi escolhido no carrinho,
  // e começa sempre vazio (não guarda o que foi digitado da última vez).
  if (addressGroup) addressGroup.classList.toggle("register-field-hidden", selectedDeliveryMethod !== "entrega");
  if (addressInput) addressInput.value = "";

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeRegisterModal() {
  const overlay = document.getElementById("registerOverlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = document.getElementById("cartDrawer")?.classList.contains("open") ? "hidden" : "";
}
