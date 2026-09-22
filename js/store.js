/* ============================================================
   CONTATO DA PICANHA — js/store.js
   Camada de dados do site. Como o site roda sem servidor/banco
   de dados, tudo abaixo fica salvo no navegador (localStorage):

   - Catálogo:   PRODUCTS (js/products-data.js) + edições feitas
                 pelo admin (cp_overrides_v1 / cp_custom_v1)
   - Kits:       edições de nome/preço/imagem (cp_kit_overrides_v1)
   - Carrinho:   cp_cart_v1
   - Cliente:    cp_customer_v1 (nome + telefone)
   - Admin:      cp_admin_v1 (conta) + sessionStorage cp_admin_session

   IMPORTANTE — leia o README.md: como não há banco de dados,
   as edições do admin só aparecem no navegador/aparelho onde
   ele fez a alteração. Para a mudança valer para todo mundo que
   visita o site, o admin precisa usar o botão "Baixar catálogo
   atualizado" no painel e o dono do site precisa subir o arquivo
   baixado no lugar do js/products-data.js atual.
============================================================ */

const Store = (() => {

  const WHATSAPP_PHONE = "5531992657190";

  const LS = {
    overrides: "cp_overrides_v1",   // edições/remoções de produtos existentes
    custom: "cp_custom_v1",         // produtos novos criados pelo admin
    kitOverrides: "cp_kit_overrides_v1",
    catalogSig: "cp_catalog_sig_v1",   // assinatura do products-data.js publicado
    cart: "cp_cart_v1",
    customer: "cp_customer_v1",
    admin: "cp_admin_v1",
  };
  const SS = {
    adminSession: "cp_admin_session",
  };

  /* ---------------- helpers genéricos ---------------- */

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Store: erro lendo", key, e);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Store: erro salvando", key, e);
      return false;
    }
  }

  function slugify(text) {
    return text
      .toString()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || ("item-" + Date.now());
  }

  function parseBRL(str) {
    if (typeof str === "number") return str;
    if (!str) return 0;
    const cleaned = String(str).replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  function formatBRL(num) {
    return num.toFixed(2).replace(".", ",");
  }

  /* ---------------- catálogo de produtos ---------------- */

  function getOverrides() { return readJSON(LS.overrides, {}); }
  function getCustom() { return readJSON(LS.custom, {}); }

  function overrideKey(category, slug) { return category + ":" + slug; }

  // Retorna a lista mesclada (base + overrides + custom, sem os removidos)
  // de uma categoria específica.
  function getCategoryProducts(category) {
    const base = (window.PRODUCTS && window.PRODUCTS[category]) || [];
    const overrides = getOverrides();
    const custom = getCustom()[category] || [];

    const merged = base
      .map((p) => {
        const ov = overrides[overrideKey(category, p.slug)];
        if (ov && ov.removed) return null;
        return Object.assign({ category }, p, ov || {});
      })
      .filter(Boolean);

    custom.forEach((p) => {
      if (p.removed) return;
      merged.push(Object.assign({ category, __custom: true }, p));
    });

    return merged;
  }

  function getAllCategories() {
    return window.PRODUCTS ? Object.keys(window.PRODUCTS) : [];
  }

  // Produto único já mesclado (base + override). Retorna null se foi removido.
  function getMergedProduct(category, slug) {
    const base = (window.PRODUCTS && window.PRODUCTS[category]) || [];
    const found = base.find((p) => p.slug === slug);
    if (!found) return null;
    const overrides = getOverrides();
    const ov = overrides[overrideKey(category, slug)];
    if (ov && ov.removed) return null;
    return Object.assign({ category }, found, ov || {});
  }

  function getCustomProductsForCategory(category) {
    return (getCustom()[category] || []).filter((p) => !p.removed);
  }

  function getProductImage(p) {
    if (p.image) return p.image;
    return "images/products/" + p.slug + ".png";
  }

  // Edita/insere override de um produto que já existe em products-data.js
  function saveOverride(category, slug, fields) {
    const overrides = getOverrides();
    const key = overrideKey(category, slug);
    overrides[key] = Object.assign({}, overrides[key], fields);
    return writeJSON(LS.overrides, overrides);
  }

  function removeExistingProduct(category, slug) {
    return saveOverride(category, slug, { removed: true });
  }

  function restoreExistingProduct(category, slug) {
    const overrides = getOverrides();
    const key = overrideKey(category, slug);
    if (overrides[key]) {
      delete overrides[key].removed;
    }
    return writeJSON(LS.overrides, overrides);
  }

  // Cria um produto novo (aparece junto dos demais da categoria)
  function addCustomProduct(category, fields) {
    const custom = getCustom();
    if (!custom[category]) custom[category] = [];
    const slug = fields.slug || slugify(fields.name);
    custom[category].push(Object.assign({ slug }, fields));
    return writeJSON(LS.custom, custom);
  }

  function updateCustomProduct(category, slug, fields) {
    const custom = getCustom();
    const list = custom[category] || [];
    const idx = list.findIndex((p) => p.slug === slug);
    if (idx === -1) return false;
    list[idx] = Object.assign({}, list[idx], fields);
    return writeJSON(LS.custom, custom);
  }

  function deleteCustomProduct(category, slug) {
    const custom = getCustom();
    const list = custom[category] || [];
    custom[category] = list.filter((p) => p.slug !== slug);
    return writeJSON(LS.custom, custom);
  }

  /* ---------------- kits ---------------- */

  function getKitOverrides() { return readJSON(LS.kitOverrides, {}); }

  function saveKitOverride(kitSlug, fields) {
    const overrides = getKitOverrides();
    overrides[kitSlug] = Object.assign({}, overrides[kitSlug], fields);
    return writeJSON(LS.kitOverrides, overrides);
  }

  /* ---------------- carrinho ---------------- */

  function getCart() { return readJSON(LS.cart, []); }
  function saveCart(cart) { return writeJSON(LS.cart, cart); }

  // item: { key, name, price (número), unit, qty }
  function addToCart(item, qty = 1) {
    const cart = getCart();
    const existing = cart.find((i) => i.key === item.key);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push(Object.assign({}, item, { qty }));
    }
    saveCart(cart);
    return cart;
  }

  function updateCartQty(key, qty) {
    let cart = getCart();
    if (qty <= 0) {
      cart = cart.filter((i) => i.key !== key);
    } else {
      const item = cart.find((i) => i.key === key);
      if (item) item.qty = qty;
    }
    saveCart(cart);
    return cart;
  }

  function removeFromCart(key) {
    const cart = getCart().filter((i) => i.key !== key);
    saveCart(cart);
    return cart;
  }

  function clearCart() { saveCart([]); }

  function cartCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }

  // Produtos vendidos por peso (unidade "kg") não têm preço final até
  // serem pesados na loja — por isso não entram na soma do total.
  function isWeightedItem(item) {
    return item.unit === "kg";
  }

  function cartHasWeightedItems() {
    return getCart().some(isWeightedItem);
  }

  // Soma apenas os itens de preço fechado (não vendidos por peso).
  function cartTotal() {
    return getCart().reduce((sum, i) => sum + (isWeightedItem(i) ? 0 : i.qty * i.price), 0);
  }

  /* ---------------- cliente (nome + telefone) ---------------- */

  function getCustomer() { return readJSON(LS.customer, null); }
  function saveCustomer(name, phone) {
    return writeJSON(LS.customer, { name: name.trim(), phone: phone.trim() });
  }
  function clearCustomer() { localStorage.removeItem(LS.customer); }

  /* ---------------- checkout via WhatsApp ---------------- */

  function buildWhatsAppCheckoutUrl(deliveryMethod, address) {
    const cart = getCart();
    const customer = getCustomer();
    const hasWeighted = cart.some(isWeightedItem);
    const fixedTotal = cartTotal();

    let msg = "Olá! ";
    if (customer && customer.name) {
            msg += `Meu nome é ${customer.name}${customer.phone ? " | " + customer.phone : ""}. `;
    }
    msg += "Gostaria de fazer o seguinte pedido:\n\n";

         cart.forEach((i, idx) => {
      const unit = i.unit ? "/" + i.unit : "";
      if (isWeightedItem(i)) {
        if (i.qty > 1) {
          msg += `${idx + 1}) ${i.name} — ${i.qty}x R$ ${formatBRL(i.price)}${unit} | Valor da peça: R$ \n\n`;
        } else {
          msg += `${idx + 1}) ${i.name} — R$ ${formatBRL(i.price)}${unit} | Valor da peça: R$ \n\n`;
        }
      } else if (i.qty > 1) {
        const subtotal = i.qty * i.price;
        msg += `${idx + 1}) ${i.name} — ${i.qty}x R$ ${formatBRL(i.price)}${unit} = R$ ${formatBRL(subtotal)}\n\n`;
      } else {
        msg += `${idx + 1}) ${i.name} — R$ ${formatBRL(i.price)}${unit}\n\n`;
      }
    });

    // Mostra o resumo (subtotais + taxa) sempre que falta algum valor a
    // confirmar — itens pesados e/ou taxa de entrega. Sem nenhum dos dois
    // (retirada, sem peso), manda o total já fechado direto.
    const showBreakdown = hasWeighted || deliveryMethod === "entrega";

    if (showBreakdown) {
      if (fixedTotal > 0) {
        msg += `Subtotal dos itens com preço fechado: R$ ${formatBRL(fixedTotal)}\n`;
      }
      if (hasWeighted) {
        msg += `Subtotal dos itens pesados: R$ \n`;
      }
      if (deliveryMethod === "entrega") {
        msg += `Taxa de entrega: R$ \n`;
      }
      msg += `\nTotal: R$ `;
    } else {
      msg += `Total: R$${formatBRL(fixedTotal)}`;
    }

     if (deliveryMethod === "entrega") {
      msg += `\n\n🚚 Modalidade: Entrega`;
      if (address) msg += `\nEndereço: ${address}`;
    } else if (deliveryMethod === "retirada") {
      msg += `\n\n🏪 Modalidade: Retirada no local.`;
    }

    msg = msg.replace(/\n{3,}/g, "\n\n");

    return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(msg)}`;
  }

  /* ---------------- admin (login local, sem servidor) ---------------- */

  async function sha256Hex(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function randomSalt() {
    const arr = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function hasAdminAccount() {
    return !!readJSON(LS.admin, null);
  }

  async function createAdminAccount(username, password) {
    if (hasAdminAccount()) return { ok: false, error: "Já existe uma conta de administrador." };
    if (!username || !password || password.length < 6) {
      return { ok: false, error: "Usuário obrigatório e senha com pelo menos 6 caracteres." };
    }
    const salt = randomSalt();
    const hash = await sha256Hex(salt + password);
    writeJSON(LS.admin, { username, salt, hash });
    return { ok: true };
  }

  async function verifyAdmin(username, password) {
    const account = readJSON(LS.admin, null);
    if (!account) return { ok: false, error: "Nenhuma conta cadastrada ainda." };
    if (account.username !== username) return { ok: false, error: "Usuário ou senha incorretos." };
    const hash = await sha256Hex(account.salt + password);
    if (hash !== account.hash) return { ok: false, error: "Usuário ou senha incorretos." };
    sessionStorage.setItem(SS.adminSession, "1");
    return { ok: true };
  }

  function isAdminLoggedIn() {
    return sessionStorage.getItem(SS.adminSession) === "1";
  }

  function logoutAdmin() {
    sessionStorage.removeItem(SS.adminSession);
  }

  async function changeAdminPassword(currentPassword, newPassword) {
    const account = readJSON(LS.admin, null);
    if (!account) return { ok: false, error: "Nenhuma conta cadastrada." };
    const hash = await sha256Hex(account.salt + currentPassword);
    if (hash !== account.hash) return { ok: false, error: "Senha atual incorreta." };
    if (!newPassword || newPassword.length < 6) return { ok: false, error: "Nova senha muito curta." };
    const salt = randomSalt();
    account.hash = await sha256Hex(salt + newPassword);
    account.salt = salt;
    writeJSON(LS.admin, account);
    return { ok: true };
  }

  /* ---------------- exportar catálogo atualizado ---------------- */

  // Gera o conteúdo de um novo js/products-data.js já com todas as
  // edições do admin aplicadas — para o dono do site subir no
  // servidor/hospedagem e a mudança valer para todo mundo.
  function buildExportedProductsFile() {
    const categories = getAllCategories();
    const kitOverrides = getKitOverrides();
    const KIT_IMAGES = (window.KIT_IMAGES) || {};
    const mergedKitImages = Object.assign({}, KIT_IMAGES);
    Object.keys(kitOverrides).forEach((slug) => {
      if (kitOverrides[slug].image) mergedKitImages[slug] = kitOverrides[slug].image;
    });

    function fieldLine(p) {
      const parts = [`slug: "${p.slug}"`, `name: "${p.name.replace(/"/g, '\\"')}"`];
      if (p.origin) parts.push(`origin: "${p.origin}"`);
      if (p.storage) parts.push(`storage: "${p.storage}"`);
      if (p.meta && !p.origin && !p.storage) parts.push(`meta: "${p.meta.replace(/"/g, '\\"')}"`);
      parts.push(`price: "${p.price}"`);
      if (p.unit) parts.push(`unit: "${p.unit}"`);
      if (p.image) parts.push(`image: "${p.image}"`);
      if (p.imageZoom && parseFloat(p.imageZoom) !== 100) parts.push(`imageZoom: "${p.imageZoom}"`);
      if (p.image2) parts.push(`image2: "${p.image2}"`);
      if (p.image2Zoom && parseFloat(p.image2Zoom) !== 100) parts.push(`image2Zoom: "${p.image2Zoom}"`);
      if (p.description) parts.push(`description: "${p.description.replace(/"/g, '\\"').replace(/\r?\n/g, '\\n')}"`);
      if (p.tag) parts.push(`tag: "${p.tag.replace(/"/g, '\\"')}"`);
      if (p.soldOut) parts.push(`soldOut: true`);
      return `    { ${parts.join(", ")} },`;
    }

      /* ---------------- edições locais x catálogo publicado ---------------- */

  // O products-data.js publicado é a "verdade". As edições do painel (guardadas
  // neste navegador) só valem até o arquivo publicado mudar: quando ele muda,
  // elas foram feitas em cima de uma versão antiga e são descartadas — assim
  // uma edição velha nunca mais esconde algo que você mudou no arquivo.
  function catalogSignature() {
    const str = JSON.stringify(window.PRODUCTS || {}) + JSON.stringify(window.KIT_IMAGES || {});
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return String(h);
  }

  function syncWithPublishedCatalog() {
    if (!window.PRODUCTS) return; // arquivo não carregou: não mexe em nada
    try {
      const current = catalogSignature();
      const saved = localStorage.getItem(LS.catalogSig);
      if (saved && saved !== current) {
        localStorage.removeItem(LS.overrides);
        localStorage.removeItem(LS.custom);
        localStorage.removeItem(LS.kitOverrides);
      }
      localStorage.setItem(LS.catalogSig, current);
    } catch (e) {
      console.error("Store: erro sincronizando catálogo", e);
    }
  }
  syncWithPublishedCatalog();

    let out = `/* ============================================================
   CONTATO DA PICANHA — Catálogo de produtos
   Arquivo gerado pelo painel do administrador em ${new Date().toLocaleString("pt-BR")}.
   Substitua o js/products-data.js do site por este arquivo para
   que as alterações passem a valer para todos os visitantes.
============================================================ */

const PRODUCTS = {

`;

    categories.forEach((cat) => {
      const items = getCategoryProducts(cat);
      out += `  ${cat}: [\n`;
      items.forEach((p) => { out += fieldLine(p) + "\n"; });
      out += `  ],\n\n`;
    });

    out += `};\n\n/* Kit images — mapped to data-kit-slug in index.html */\nconst KIT_IMAGES = {\n`;
    Object.keys(mergedKitImages).forEach((slug) => {
      out += `  "${slug}": "${mergedKitImages[slug]}",\n`;
    });
    out += `};\n`;

    return out;
  }

  function downloadExportedProductsFile() {
    const content = buildExportedProductsFile();
    const blob = new Blob([content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-data.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return {
    WHATSAPP_PHONE,
    parseBRL, formatBRL, slugify,
    getCategoryProducts, getAllCategories, getProductImage, getMergedProduct, getCustomProductsForCategory,
    saveOverride, removeExistingProduct, restoreExistingProduct,
    addCustomProduct, updateCustomProduct, deleteCustomProduct,
    getKitOverrides, saveKitOverride,
    getCart, addToCart, updateCartQty, removeFromCart, clearCart, cartCount, cartTotal,
    isWeightedItem, cartHasWeightedItems,
    getCustomer, saveCustomer, clearCustomer,
    buildWhatsAppCheckoutUrl,
    hasAdminAccount, createAdminAccount, verifyAdmin, isAdminLoggedIn, logoutAdmin, changeAdminPassword,
    buildExportedProductsFile, downloadExportedProductsFile,
  };
})();

/* IMPORTANTE: 'const' no escopo global de um <script> comum NÃO cria uma
   propriedade em `window` (diferente de 'var'). script.js e admin.js
   checam `window.Store` antes de rodar algumas funções — sem esta linha,
   essa checagem sempre dava falso e o carrinho/checkout não funcionavam. */
window.Store = Store;
