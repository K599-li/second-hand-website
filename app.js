const STATUS = {
  available: { label: "在售", hint: "可以购买" },
  reserved: { label: "预订", hint: "已有人预订" },
  sold: { label: "已售", hint: "已经卖出" },
};

const STORAGE_KEY = "secondhand-shop-data-v5";
const defaultItems = structuredClone(window.ITEMS);
const defaultConfig = structuredClone(window.SITE_CONFIG);

let currentFilter = "all";
let currentSearch = "";
let toastTimer;

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.items?.length) {
      return {
        items: saved.items,
        config: { ...saved.config, ...defaultConfig },
      };
    }
  } catch (error) {
    console.warn("无法读取本地数据：", error);
  }

  return {
    items: structuredClone(defaultItems),
    config: structuredClone(defaultConfig),
  };
}

let shopData = loadData();

const grid = document.querySelector("#productGrid");
const itemCount = document.querySelector("#itemCount");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const filters = document.querySelector("#filters");
const productDialog = document.querySelector("#productDialog");
const productDialogContent = document.querySelector("#productDialogContent");
const manageDialog = document.querySelector("#manageDialog");
const manageForm = document.querySelector("#manageForm");
const manageList = document.querySelector("#manageList");
const toast = document.querySelector("#toast");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function filteredItems() {
  return shopData.items.filter((item) => {
    const matchesFilter = currentFilter === "all" || item.status === currentFilter;
    const matchesSearch = item.name.toLowerCase().includes(currentSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

function render() {
  const visibleItems = filteredItems();
  const availableCount = shopData.items.filter((item) => item.status === "available").length;

  itemCount.textContent = `${availableCount} 件在售 · 共 ${shopData.items.length} 件`;
  document.querySelector("#areaText").textContent = shopData.config.area;
  document.title = shopData.config.title;

  grid.innerHTML = visibleItems
    .map((item) => {
      const status = STATUS[item.status] || STATUS.available;
      return `
        <article class="product-card ${item.status === "sold" ? "is-sold" : ""}" data-id="${item.id}" tabindex="0">
          <div class="product-image">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />
            <span class="status-badge ${item.status}">${status.label}</span>
          </div>
          <div class="product-info">
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <p>${status.hint}</p>
            </div>
            <span class="price">${escapeHtml(item.price)}</span>
          </div>
        </article>
      `;
    })
    .join("");

  emptyState.hidden = visibleItems.length > 0;
}

function openProduct(itemId) {
  const item = shopData.items.find((entry) => entry.id === itemId);
  if (!item) return;

  const status = STATUS[item.status] || STATUS.available;
  productDialogContent.innerHTML = `
    <div class="product-detail">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
      <div class="product-detail-copy">
        <span class="status-badge ${item.status}" style="position: static">${status.label}</span>
        <h2>${escapeHtml(item.name)}</h2>
        <p class="product-detail-price">${escapeHtml(item.price)}</p>
        <p class="product-detail-note">
          实物实拍，取货时间请联系卖家确认。
        </p>
        <button class="button button-primary" type="button" data-contact>
          复制微信号
        </button>
      </div>
    </div>
  `;
  productDialog.showModal();
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    window.prompt("请手动复制：", text);
  }
}

function contactSeller() {
  const wechat = shopData.config.wechat.trim();
  if (!wechat || wechat === "请填写微信号") {
    showToast("请先在“管理物品”中填写微信号");
    return;
  }
  copyText(wechat, `微信号 ${wechat} 已复制`);
}

async function shareShop() {
  const shareData = {
    title: shopData.config.title,
    text: "我有一些闲置物品正在出售，来看看有没有你需要的。",
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  copyText(window.location.href, "小铺链接已复制");
}

function renderManager() {
  manageForm.elements.wechat.value = shopData.config.wechat;
  manageForm.elements.area.value = shopData.config.area;
  manageList.innerHTML = shopData.items
    .map(
      (item) => `
        <div class="manage-item" data-id="${item.id}">
          <img src="${escapeHtml(item.image)}" alt="" />
          <label>
            <span>物品名称</span>
            <input name="name" value="${escapeHtml(item.name)}" required />
          </label>
          <label>
            <span>价格</span>
            <input name="price" value="${escapeHtml(item.price)}" required />
          </label>
          <label>
            <span>状态</span>
            <select name="status">
              ${Object.entries(STATUS)
                .map(
                  ([value, meta]) =>
                    `<option value="${value}" ${value === item.status ? "selected" : ""}>${meta.label}</option>`,
                )
                .join("")}
            </select>
          </label>
        </div>
      `,
    )
    .join("");
}

function readManagerData() {
  const items = shopData.items.map((item) => {
    const row = manageList.querySelector(`[data-id="${item.id}"]`);
    return {
      ...item,
      name: row.querySelector('[name="name"]').value.trim() || item.name,
      price: row.querySelector('[name="price"]').value.trim() || "面议",
      status: row.querySelector('[name="status"]').value,
    };
  });

  return {
    config: {
      ...shopData.config,
      wechat: manageForm.elements.wechat.value.trim() || defaultConfig.wechat,
      area: manageForm.elements.area.value.trim() || defaultConfig.area,
    },
    items,
  };
}

function saveManagerData() {
  shopData = readManagerData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shopData));
  render();
  showToast("修改已保存在这台设备");
}

function exportItems() {
  shopData = readManagerData();
  const content = `window.SITE_CONFIG = ${JSON.stringify(shopData.config, null, 2)};\n\nwindow.ITEMS = ${JSON.stringify(shopData.items, null, 2)};\n`;
  const blob = new Blob([content], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "items.js";
  link.click();
  URL.revokeObjectURL(url);
  showToast("items.js 已导出");
}

grid.addEventListener("click", (event) => {
  const card = event.target.closest(".product-card");
  if (card) openProduct(card.dataset.id);
});

grid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".product-card");
  if (card) {
    event.preventDefault();
    openProduct(card.dataset.id);
  }
});

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  currentFilter = button.dataset.filter;
  filters.querySelectorAll(".filter").forEach((entry) => {
    entry.classList.toggle("active", entry === button);
  });
  render();
});

searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value.trim();
  render();
});

document.querySelector("#contactButton").addEventListener("click", contactSeller);
document.querySelector("#contactButtonBottom").addEventListener("click", contactSeller);

document.querySelector("#exportButton").addEventListener("click", exportItems);

document.querySelector("#resetButton").addEventListener("click", () => {
  const confirmed = window.confirm("确定恢复为 items.js 中的默认内容吗？");
  if (!confirmed) return;
  localStorage.removeItem(STORAGE_KEY);
  shopData = {
    items: structuredClone(defaultItems),
    config: structuredClone(defaultConfig),
  };
  renderManager();
  render();
  showToast("已恢复默认内容");
});

manageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveManagerData();
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-contact]")) contactSeller();
  if (event.target.matches("[data-close-dialog]")) {
    event.target.closest("dialog").close();
  }
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

render();

if (new URLSearchParams(window.location.search).has("manage")) {
  renderManager();
  manageDialog.showModal();
}
