/* ============================================================
   CONTATO DA PICANHA — js/admin.js
   Painel do administrador: cria/loga a conta local, lista os
   produtos de cada categoria para editar/remover/adicionar,
   edita os 5 kits, e gera o arquivo products-data.js atualizado
   para ser publicado no servidor (veja o aviso na própria página).
============================================================ */

const CATEGORY_LABELS = {
  picanhas: "Picanhas da Semana",
  bovinos: "Bovinos",
  suinos: "Suínos",
  aves: "Aves",
  diversos: "Diversos",
  sais: "Sais",
  molhos: "Molhos",
  kits: "Kits",
};

document.addEventListener("DOMContentLoaded", () => {
  boot();
});

function boot() {
  if (!Store.hasAdminAccount()) {
    show("setupSection");
    setupCreateAccountForm();
  } else if (!Store.isAdminLoggedIn()) {
    show("loginSection");
    setupLoginForm();
  } else {
    enterPanel();
  }
}

function show(id) {
  ["setupSection", "loginSection", "panelSection"].forEach((sec) => {
    const el = document.getElementById(sec);
    if (el) el.hidden = sec !== id;
  });
  const logoutBtn = document.getElementById("adminLogoutBtn");
  if (logoutBtn) logoutBtn.hidden = id !== "panelSection";
}

/* ---------------- criação de conta ---------------- */
function setupCreateAccountForm() {
  const form = document.getElementById("setupForm");
  const errorEl = document.getElementById("setupError");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const user = form.setupUser.value.trim();
    const pass = form.setupPass.value;
    const pass2 = form.setupPass2.value;
    if (pass !== pass2) {
      errorEl.textContent = "As senhas não conferem.";
      return;
    }
    const res = await Store.createAdminAccount(user, pass);
    if (!res.ok) {
      errorEl.textContent = res.error;
      return;
    }
    const loginRes = await Store.verifyAdmin(user, pass);
    if (loginRes.ok) enterPanel();
  });
}

/* ---------------- login ---------------- */
function setupLoginForm() {
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const user = form.loginUser.value.trim();
    const pass = form.loginPass.value;
    const res = await Store.verifyAdmin(user, pass);
    if (!res.ok) {
      errorEl.textContent = res.error;
      return;
    }
    enterPanel();
  });
}

/* ---------------- painel principal ---------------- */
function enterPanel() {
  show("panelSection");
  document.getElementById("adminLogoutBtn").addEventListener("click", () => {
    Store.logoutAdmin();
    location.reload();
  });
  setupChangePasswordForm();
  renderAllCategoryEditors();
  renderKitsEditor();
  document.getElementById("exportBtn").addEventListener("click", () => {
    Store.downloadExportedProductsFile();
  });
}

function setupChangePasswordForm() {
  const form = document.getElementById("changePassForm");
  const errorEl = document.getElementById("changePassError");
  const okEl = document.getElementById("changePassOk");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    okEl.textContent = "";
    const res = await Store.changeAdminPassword(form.curPass.value, form.newPass.value);
    if (!res.ok) {
      errorEl.textContent = res.error;
      return;
    }
    okEl.textContent = "Senha alterada com sucesso.";
    form.reset();
  });
}

/* ---------------- editor de produtos por categoria ---------------- */
function renderAllCategoryEditors() {
  const wrap = document.getElementById("categoriesWrap");
  wrap.innerHTML = Store.getAllCategories().map(categoryEditorHTML).join("");
  wrap.addEventListener("click", handleCategoryEditorClick);
  wrap.addEventListener("submit", handleAddProductSubmit);
}

function categoryEditorHTML(category) {
  const products = Store.getCategoryProducts(category);
  const isPicanhas = category === "picanhas";
  return `
  <div class="admin-card" data-category="${category}">
    <h2>${CATEGORY_LABELS[category] || category}</h2>
    <p class="admin-sub">O tamanho da foto no site já é padronizado sozinho para todo produto. Se uma foto
      específica ficar parecendo "menor" que as outras (porque foi tirada de mais longe, por exemplo), use o
      campo <strong>Zoom</strong> dela pra aproximar, sem precisar editar o arquivo da imagem.</p>
    <div class="admin-product-list">
      ${products.map((p) => productRowHTML(category, p, isPicanhas)).join("")}
    </div>
    <details class="admin-add-product">
      <summary>+ Adicionar produto em ${CATEGORY_LABELS[category] || category}</summary>
      <form class="admin-add-form" data-category="${category}">
        <input type="text" name="name" placeholder="Nome do produto" required>
        <input type="text" name="price" placeholder="Preço (ex: 49,90)" required>
        <input type="text" name="unit" placeholder="Unidade — kg vende por peso, opcional">
        ${isPicanhas ? `<input type="text" name="meta" placeholder="Ex: Nacional · Resfriada — opcional">` : ""}
        <input type="text" name="tag" placeholder="Selo (ex: Promoção) — opcional">
        <input type="text" name="image" placeholder="Caminho da 1ª imagem (ex: images/products/novo.png) — opcional">
        <input type="number" name="imageZoom" placeholder="Zoom da 1ª foto % (padrão 100)" min="100" max="250" step="5">
        <input type="text" name="image2" placeholder="Caminho da 2ª imagem — opcional">
        <input type="number" name="image2Zoom" placeholder="Zoom da 2ª foto % (padrão 100)" min="100" max="250" step="5">
        <textarea name="description" placeholder="Descrição breve, mostrada ao clicar no produto — opcional" rows="2"></textarea>
        <label class="admin-checkbox-label"><input type="checkbox" name="soldOut"> Já cadastrar esgotado</label>
        <button type="submit" class="btn btn-primary">Adicionar</button>
      </form>
    </details>
  </div>`;
}

function productRowHTML(category, p, isPicanhas) {
  const isCustom = !!p.__custom;
  return `
  <div class="admin-product-row${p.soldOut ? " admin-row-soldout" : ""}" data-category="${category}" data-slug="${p.slug}" data-custom="${isCustom ? "1" : "0"}">
    <div class="admin-product-fields">
      <label>Nome <input type="text" class="f-name" value="${escapeAttr(p.name)}"></label>
      <label>Preço <input type="text" class="f-price" value="${escapeAttr(p.price)}"></label>
      <label>Unidade <input type="text" class="f-unit" value="${escapeAttr(p.unit || "")}" placeholder="kg vende por peso"></label>
      ${isPicanhas ? `<label>Info extra <input type="text" class="f-meta" value="${escapeAttr(p.meta || [p.origin, p.storage].filter(Boolean).join(" · "))}"></label>` : ""}
      <label>Selo <input type="text" class="f-tag" value="${escapeAttr(p.tag || "")}" placeholder="Promoção"></label>
      <label>Imagem 1 <input type="text" class="f-image" value="${escapeAttr(p.image || ("images/products/" + p.slug + ".png"))}"></label>
      <label>Zoom foto 1 (%) <input type="number" class="f-image-zoom" value="${escapeAttr(p.imageZoom || 100)}" min="100" max="250" step="5"></label>
      <label>Imagem 2 <input type="text" class="f-image2" value="${escapeAttr(p.image2 || "")}" placeholder="opcional, mostrada ao clicar"></label>
      <label>Zoom foto 2 (%) <input type="number" class="f-image2-zoom" value="${escapeAttr(p.image2Zoom || 100)}" min="100" max="250" step="5"></label>
      <label class="admin-checkbox-label"><input type="checkbox" class="f-soldout"${p.soldOut ? " checked" : ""}> Esgotado</label>
    </div>
    <label class="admin-desc-label">Descrição (aparece ao clicar no produto)
      <textarea class="f-desc" rows="2" placeholder="Ex: Corte selecionado, maturado 21 dias, ideal pro ponto malpassado.">${escapeHTML(p.description || "")}</textarea>
    </label>
    <div class="admin-product-actions">
      <button type="button" class="btn btn-outline btn-small admin-save-btn">Salvar</button>
      <button type="button" class="btn btn-outline btn-small admin-remove-btn">${isCustom ? "Excluir" : "Remover"}</button>
    </div>
  </div>`;
}

function escapeAttr(str) {
  return String(str == null ? "" : str).replace(/"/g, "&quot;");
}

function escapeHTML(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function handleCategoryEditorClick(e) {
  const row = e.target.closest(".admin-product-row");
  if (!row) return;
  const category = row.dataset.category;
  const slug = row.dataset.slug;
  const isCustom = row.dataset.custom === "1";

  if (e.target.closest(".admin-save-btn")) {
    const fields = {
      name: row.querySelector(".f-name").value.trim(),
      price: row.querySelector(".f-price").value.trim(),
      unit: row.querySelector(".f-unit").value.trim(),
      tag: row.querySelector(".f-tag").value.trim(),
      image: row.querySelector(".f-image").value.trim(),
      imageZoom: row.querySelector(".f-image-zoom").value.trim() || "100",
      image2: row.querySelector(".f-image2").value.trim(),
      image2Zoom: row.querySelector(".f-image2-zoom").value.trim() || "100",
      description: row.querySelector(".f-desc").value.trim(),
      soldOut: row.querySelector(".f-soldout").checked,
    };
    const metaInput = row.querySelector(".f-meta");
    if (metaInput) fields.meta = metaInput.value.trim();

    if (isCustom) {
      Store.updateCustomProduct(category, slug, fields);
    } else {
      Store.saveOverride(category, slug, fields);
    }
    flashRow(row);
    row.classList.toggle("admin-row-soldout", fields.soldOut);
  }

  if (e.target.closest(".admin-remove-btn")) {
    if (isCustom) {
      if (!confirm("Excluir este produto definitivamente?")) return;
      Store.deleteCustomProduct(category, slug);
    } else {
      Store.removeExistingProduct(category, slug);
    }
    renderAllCategoryEditors();
    renderMainSitePreviewNote();
  }
}

function handleAddProductSubmit(e) {
  const form = e.target.closest(".admin-add-form");
  if (!form) return;
  e.preventDefault();
  const category = form.dataset.category;
  const fields = {
    name: form.name.value.trim(),
    price: form.price.value.trim(),
    unit: form.unit.value.trim(),
    soldOut: form.soldOut.checked,
  };
  if (form.meta) fields.meta = form.meta.value.trim();
  if (form.tag && form.tag.value.trim()) fields.tag = form.tag.value.trim();
  if (form.image && form.image.value.trim()) fields.image = form.image.value.trim();
  if (form.imageZoom && form.imageZoom.value.trim()) fields.imageZoom = form.imageZoom.value.trim();
  if (form.image2 && form.image2.value.trim()) fields.image2 = form.image2.value.trim();
  if (form.image2Zoom && form.image2Zoom.value.trim()) fields.image2Zoom = form.image2Zoom.value.trim();
  if (form.description && form.description.value.trim()) fields.description = form.description.value.trim();
  if (!fields.name || !fields.price) return;

  Store.addCustomProduct(category, fields);
  renderAllCategoryEditors();
}

function flashRow(row) {
  row.classList.add("saved-flash");
  setTimeout(() => row.classList.remove("saved-flash"), 900);
}

function renderMainSitePreviewNote() {
  // placeholder para futuras notificações; hoje a própria re-renderização já basta
}

/* ---------------- editor de kits ---------------- */
function renderKitsEditor() {
  const wrap = document.getElementById("kitsEditWrap");
  const kitSlugs = window.KIT_IMAGES ? Object.keys(window.KIT_IMAGES) : [];
  const overrides = Store.getKitOverrides();

  wrap.innerHTML = kitSlugs.map((slug) => {
    const ov = overrides[slug] || {};
    return `
    <div class="admin-product-row" data-kit-slug="${slug}">
      <div class="admin-product-fields">
        <label>Nome do kit <input type="text" class="f-kit-name" value="${escapeAttr(ov.name || "")}" placeholder="(mantém o atual se vazio)"></label>
        <label>Preço <input type="text" class="f-kit-price" value="${escapeAttr(ov.price || "")}" placeholder="Ex: 149,90"></label>
        <label>Imagem <input type="text" class="f-kit-image" value="${escapeAttr(ov.image || ("images/kits/" + slug + ".png"))}"></label>
      </div>
      <div class="admin-product-actions">
        <button type="button" class="btn btn-outline btn-small admin-kit-save-btn">Salvar</button>
      </div>
    </div>`;
  }).join("");

  wrap.addEventListener("click", (e) => {
    const row = e.target.closest(".admin-product-row[data-kit-slug]");
    if (!row || !e.target.closest(".admin-kit-save-btn")) return;
    const slug = row.dataset.kitSlug;
    Store.saveKitOverride(slug, {
      name: row.querySelector(".f-kit-name").value.trim(),
      price: row.querySelector(".f-kit-price").value.trim(),
      image: row.querySelector(".f-kit-image").value.trim(),
    });
    flashRow(row);
  });
}
