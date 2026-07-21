const sections = [
  ["site", "Site Details", "Company name, contact channels and social links."],
  ["mediaManager", "Media Library", "Upload new images, replace existing assets and copy paths."],
  ["media", "Image Settings", "Choose the logo and product images used by the public site."],
  ["homePage", "Homepage", "Hero, story sections, audiences and final call to action."],
  ["eventIntelligencePage", "Event Intelligence", "Hero, screenshots, use cases, MCP, control and CTA."],
  ["mcpPage", "Mitingu MCP", "MCP explanation, supported capabilities, compatibility, permissions and CTA."],
  ["aboutPage", "About", "About page hero and supporting sections."],
  ["pageCopy", "Page Copy", "Hero copy, answer boxes and page-side checklist items."],
  ["metadata", "SEO Metadata", "Page titles and descriptions used by search engines."],
  ["navItems", "Main Navigation", "Primary links in the site header."],
  ["solutionLinks", "Solution Links", "Links in the Solutions menu and footer."],
  ["moneyPages", "Money Pages", "High-intent SaaS SEO pages and summaries."],
  ["discoveryFaqs", "Homepage FAQs", "Question and answer content for the homepage schema."],
  ["pricingPlans", "Pricing", "Plan names, positioning and feature lists."],
  ["resources", "Resources", "Resource cards in the content hub."],
  ["platformModules", "Platform Modules", "Reusable platform capability cards."],
  ["outcomes", "Outcomes", "Homepage outcome cards."],
  ["eventStages", "Event Stages", "Before, during and after cards."],
  ["aiQuestions", "AI Questions", "Prompt-style questions in the AI panel."],
  ["enterpriseControls", "Controls", "Enterprise governance and security chips."],
  ["intentClusters", "Search Intent", "SEO and answer-engine content clusters."],
  ["caseStudy", "Case Study", "The proof-structure section on the homepage."],
  ["redirects", "Redirects", "Old URL paths and their new destinations."],
  ["raw", "Raw JSON", "Direct access to the full content file."],
];

const tupleLabels = {
  navItems: ["Label", "URL"],
  solutionLinks: ["Label", "URL"],
  outcomes: ["Title", "Text"],
  eventStages: ["Stage", "Title", "Text"],
  platformModules: ["Title", "Text"],
  solutions: ["Title", "URL", "Text"],
  pricingPlans: ["Plan", "Description", "Features"],
  resources: ["Title", "Type", "Text"],
  moneyPages: ["Title", "URL", "Text"],
  discoveryFaqs: ["Question", "Answer"],
  intentClusters: ["Title", "Text"],
  caseStudy: ["Title", "Text"],
};

const friendlyLabels = {
  actionHref: "Action URL",
  actionLabel: "Action Label",
  aiQuestions: "AI Questions",
  discoveryFaqs: "Homepage FAQs",
  enterpriseControls: "Enterprise Controls",
  eventStages: "Event Stages",
  finalCta: "Final CTA",
  eventIntelligence: "Event Intelligence",
  eventIntelligencePage: "Event Intelligence Page",
  mcpPage: "Mitingu MCP Page",
  aboutPage: "About Page",
  builtIn: "Built-in Event Intelligence",
  mcp: "Mitingu MCP",
  supportLine: "Supporting Line",
  qualification: "Qualification",
  ctaLabel: "CTA Label",
  ctaHref: "CTA URL",
  supported: "Supported Capabilities",
  compatibility: "Compatibility",
  permissions: "Permissions",
  operations: "Operations Context",
  status: "Status",
  description: "Description",
  showcase: "Product Showcase",
  subtitle: "Subtitle",
  image: "Image",
  alt: "Alt Text",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  media: "Image Settings",
  mediaManager: "Media Library",
  homePage: "Homepage",
  trustedBy: "Trusted By",
  betterWay: "Better Way",
  memoryItems: "Memory Items",
  moneyPages: "Money Pages",
  navItems: "Main Navigation",
  pageCopy: "Page Copy",
  platformModules: "Platform Modules",
  pricingPlans: "Pricing Plans",
  primaryAction: "Primary Action",
  proofPoints: "Proof Points",
  secondaryAction: "Secondary Action",
  solutionLinks: "Solution Links",
  productScreenshot: "Product Screenshot",
  domainRestriction: "Domain Restriction",
};

const lockedObjects = new Set(["metadata", "pageCopy"]);
const nav = document.querySelector("#sectionNav");
const editor = document.querySelector("#editor");
const sectionTitle = document.querySelector("#sectionTitle");
const sectionDescription = document.querySelector("#sectionDescription");
const sectionKicker = document.querySelector("#sectionKicker");
const status = document.querySelector("#status");
const saveButton = document.querySelector("#saveButton");
const rebuildButton = document.querySelector("#rebuildButton");
const downloadButton = document.querySelector("#downloadButton");
const importFile = document.querySelector("#importFile");

let draft = null;
let mediaLibrary = [];
let activeSection = "site";
let isDirty = false;

load();

saveButton.addEventListener("click", save);
rebuildButton.addEventListener("click", rebuild);
downloadButton.addEventListener("click", downloadJson);
importFile.addEventListener("change", importJson);
window.addEventListener("beforeunload", (event) => {
  if (!isDirty) return;
  event.preventDefault();
  event.returnValue = "";
});

async function load() {
  try {
    const [response] = await Promise.all([
      fetch("/cms/api/content", { cache: "no-store" }),
      refreshMedia(),
    ]);
    if (!response.ok) throw new Error("Could not load content");
    draft = await response.json();
    setStatus("Content loaded", "saved");
    renderNav();
    renderSection();
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function renderNav() {
  nav.replaceChildren(
    ...sections.map(([id, label, description]) => {
      const button = document.createElement("button");
      button.className = `nav-button${id === activeSection ? " active" : ""}`;
      button.type = "button";

      const strong = document.createElement("strong");
      strong.textContent = label;
      const span = document.createElement("span");
      span.textContent = description;

      button.append(strong, span);
      button.addEventListener("click", () => {
        activeSection = id;
        renderNav();
        renderSection();
      });

      return button;
    }),
  );
}

function renderSection() {
  const section = sections.find(([id]) => id === activeSection) || sections[0];
  const [id, label, description] = section;

  sectionKicker.textContent = "Content";
  sectionTitle.textContent = label;
  sectionDescription.textContent = description;
  editor.replaceChildren();

  if (id === "raw") {
    renderRawEditor();
    return;
  }

  const value = draft[id];
  if (id === "mediaManager") {
    renderMediaManager();
  } else if (id === "media") {
    editor.append(renderMediaSettings(["media"], value || {}));
  } else if (id === "metadata") {
    editor.append(renderMetadata(["metadata"], value));
  } else if (id === "pageCopy") {
    editor.append(renderPageCopy(["pageCopy"], value));
  } else if (id === "redirects") {
    editor.append(renderRedirects(["redirects"], value));
  } else {
    editor.append(renderNode([id], value, label));
  }
}

function renderRawEditor() {
  const panel = panelShell("Raw content file");
  const textarea = document.createElement("textarea");
  textarea.className = "raw-textarea";
  textarea.value = JSON.stringify(draft, null, 2);

  const applyButton = smallButton("Apply to Draft", () => {
    try {
      draft = JSON.parse(textarea.value);
      markDirty();
      renderNav();
      renderSection();
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  panel.append(textarea, buttonRow([applyButton]));
  editor.append(panel);
}

function renderMediaManager() {
  const uploadPanel = panelShell("Upload new image");
  const uploadGrid = document.createElement("div");
  uploadGrid.className = "upload-grid";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/png,image/jpeg,image/webp,image/gif";

  const filename = document.createElement("input");
  filename.type = "text";
  filename.placeholder = "image-name.webp";

  const preview = document.createElement("img");
  preview.className = "upload-preview";
  preview.alt = "";

  let selectedFile = null;

  fileInput.addEventListener("change", () => {
    selectedFile = fileInput.files[0] || null;
    filename.value = selectedFile ? sanitizeFilename(selectedFile.name) : "";
    preview.src = selectedFile ? URL.createObjectURL(selectedFile) : "";
    preview.alt = selectedFile ? selectedFile.name : "";
  });

  const uploadButton = smallButton("Upload Image", async () => {
    if (!selectedFile) {
      setStatus("Choose an image first", "error");
      return;
    }

    await uploadMedia({
      file: selectedFile,
      filename: filename.value || selectedFile.name,
      replace: false,
    });

    fileInput.value = "";
    filename.value = "";
    preview.removeAttribute("src");
    selectedFile = null;
  });

  uploadGrid.append(
    labelledControl("Image file", fileInput),
    labelledControl("Filename", filename),
    preview,
  );
  uploadPanel.append(uploadGrid, buttonRow([uploadButton]));

  const libraryPanel = panelShell("Current images");
  const tools = buttonRow([
    smallButton("Refresh Library", async () => {
      await refreshMedia();
      renderSection();
    }),
  ]);
  const grid = document.createElement("div");
  grid.className = "media-grid";

  if (!mediaLibrary.length) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.textContent = "No images found in public/assets yet.";
    grid.append(empty);
  }

  for (const item of mediaLibrary) {
    grid.append(mediaCard(item));
  }

  libraryPanel.append(tools, grid);
  editor.append(uploadPanel, libraryPanel);
}

function renderMediaSettings(path, value) {
  const panel = panelShell("Site image settings");
  const list = document.createElement("div");
  list.className = "item-list";

  for (const [key, image] of Object.entries(value || {})) {
    const card = itemCard(labelFor(key));
    const preview = document.createElement("img");
    preview.className = "media-setting-preview";
    preview.src = cacheBusted(image.src);
    preview.alt = image.alt || "";

    card.append(
      preview,
      imagePathField([...path, key, "src"], image.src || "", "Image"),
      primitiveField([...path, key, "alt"], image.alt || "", "Alt Text"),
    );

    if ("caption" in image) {
      card.append(primitiveField([...path, key, "caption"], image.caption || "", "Caption"));
    }

    list.append(card);
  }

  panel.append(
    list,
    buttonRow([
      smallButton("Refresh Image List", async () => {
        await refreshMedia();
        renderSection();
      }),
    ]),
  );
  return panel;
}

function mediaCard(item) {
  const card = document.createElement("article");
  card.className = "media-card";

  const image = document.createElement("img");
  image.src = cacheBusted(item.url, item.updatedAt);
  image.alt = item.name;

  const body = document.createElement("div");
  body.className = "media-card-body";

  const title = document.createElement("strong");
  title.textContent = item.name;
  const path = document.createElement("code");
  path.textContent = item.path;
  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${formatBytes(item.size)} | ${new Date(item.updatedAt).toLocaleString()}`;

  const replaceInput = document.createElement("input");
  replaceInput.type = "file";
  replaceInput.accept = "image/png,image/jpeg,image/webp,image/gif";
  replaceInput.className = "hidden-file";
  replaceInput.addEventListener("change", async () => {
    const [file] = replaceInput.files;
    if (!file) return;
    await uploadMedia({
      file,
      filename: item.name,
      target: item.name,
      replace: true,
    });
    replaceInput.value = "";
  });

  const replaceLabel = document.createElement("label");
  replaceLabel.className = "small-button";
  replaceLabel.textContent = "Replace";
  replaceLabel.append(replaceInput);

  body.append(
    title,
    path,
    meta,
    buttonRow([
      smallButton("Copy Path", () => copyText(item.path)),
      replaceLabel,
      smallButton("Use For Logo", () => setMediaSlot("logo", item.path)),
      smallButton("Use For Product Screenshot", () => setMediaSlot("productScreenshot", item.path)),
      smallButton("Use For Domain Image", () => setMediaSlot("domainRestriction", item.path)),
    ]),
  );

  card.append(image, body);
  return card;
}

function imagePathField(path, value, label) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";

  const span = document.createElement("span");
  span.textContent = labelFor(label);

  const select = document.createElement("select");
  const custom = document.createElement("option");
  custom.value = "";
  custom.textContent = "Custom path";
  select.append(custom);

  for (const item of mediaLibrary) {
    const option = document.createElement("option");
    option.value = item.path;
    option.textContent = item.path;
    select.append(option);
  }

  select.value = mediaLibrary.some((item) => item.path === value) ? value : "";

  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.placeholder = "/assets/image-name.webp";

  select.addEventListener("change", () => {
    if (!select.value) return;
    input.value = select.value;
    setAtPath(path, select.value);
    markDirty();
    renderSection();
  });

  input.addEventListener("input", () => {
    setAtPath(path, input.value);
    markDirty();
  });

  wrapper.append(span, select, input);
  return wrapper;
}

function renderMetadata(path, value) {
  const panel = panelShell("SEO metadata");
  const list = document.createElement("div");
  list.className = "item-list";

  for (const [pagePath, meta] of Object.entries(value || {})) {
    const card = itemCard(pagePath);
    card.append(
      primitiveField([...path, pagePath, 0], meta[0] || "", "Title"),
      primitiveField([...path, pagePath, 1], meta[1] || "", "Description"),
    );
    list.append(card);
  }

  panel.append(list);
  return panel;
}

function renderPageCopy(path, value) {
  const panel = panelShell("Editable page copy");
  const list = document.createElement("div");
  list.className = "item-list";

  for (const [pagePath, blocks] of Object.entries(value || {})) {
    const card = itemCard(pagePath);
    const nested = document.createElement("div");
    nested.className = "nested";

    for (const [blockName, blockValue] of Object.entries(blocks || {})) {
      nested.append(renderObject([...path, pagePath, blockName], blockValue, labelFor(blockName)));
    }

    card.append(nested);
    list.append(card);
  }

  panel.append(list);
  return panel;
}

function renderRedirects(path, value) {
  const panel = panelShell("Redirects");
  const list = document.createElement("div");
  list.className = "item-list";

  for (const [from, to] of Object.entries(value || {})) {
    const row = document.createElement("div");
    row.className = "pair-grid";

    const fromInput = inputField("Old Path", from);
    const toInput = inputField("New Path", to);
    const remove = dangerButton("Remove", () => {
      delete value[from];
      markDirty();
      renderSection();
    });

    fromInput.addEventListener("change", () => {
      const nextKey = fromInput.value.trim();
      if (!nextKey || nextKey === from) return;
      value[nextKey] = value[from];
      delete value[from];
      markDirty();
      renderSection();
    });

    toInput.addEventListener("input", () => {
      value[from] = toInput.value;
      markDirty();
    });

    row.append(fromInput.closest(".field"), toInput.closest(".field"), remove);
    list.append(row);
  }

  const add = smallButton("Add Redirect", () => {
    value["/old-path"] = "/";
    markDirty();
    renderSection();
  });

  panel.append(list, buttonRow([add]));
  return panel;
}

function renderNode(path, value, label) {
  if (Array.isArray(value)) return renderArray(path, value, label);
  if (value && typeof value === "object") return renderObject(path, value, label);
  if (typeof value === "string" && shouldUseImagePicker(path)) return imagePathField(path, value, label);
  return primitiveField(path, value ?? "", label);
}

function shouldUseImagePicker(path) {
  const key = String(path[path.length - 1] || "").toLowerCase();
  return key === "image" || key === "src";
}

function renderObject(path, value, label) {
  const panel = panelShell(label);
  const grid = document.createElement("div");
  grid.className = "field-grid";

  for (const [key, child] of Object.entries(value || {})) {
    grid.append(renderNode([...path, key], child, labelFor(key)));
  }

  if (!grid.children.length) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.textContent = "No fields yet.";
    grid.append(empty);
  }

  panel.append(grid);
  return panel;
}

function renderArray(path, value, label) {
  const panel = panelShell(label);
  const root = path[0];
  const list = document.createElement("div");
  list.className = "item-list";

  if (!value.length) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.textContent = "No items yet.";
    list.append(empty);
  }

  value.forEach((item, index) => {
    if (Array.isArray(item)) {
      list.append(tupleCard(path, value, item, index, tupleLabels[root] || []));
    } else if (item && typeof item === "object") {
      const card = itemCard(`${singular(label)} ${index + 1}`);
      card.append(renderObject([...path, index], item, `${singular(label)} ${index + 1}`));
      card.append(removeRow(value, index));
      list.append(card);
    } else {
      const card = itemCard(`${singular(label)} ${index + 1}`);
      card.append(primitiveField([...path, index], item ?? "", `${singular(label)} ${index + 1}`));
      card.append(removeRow(value, index));
      list.append(card);
    }
  });

  const add = smallButton(`Add ${singular(label)}`, () => {
    value.push(emptyFrom(value[0] ?? ""));
    markDirty();
    renderSection();
  });

  panel.append(list, buttonRow([add]));
  return panel;
}

function tupleCard(path, collection, item, index, labels) {
  const heading = item.find((entry) => typeof entry === "string" && entry.trim()) || `Item ${index + 1}`;
  const card = itemCard(heading);

  item.forEach((child, childIndex) => {
    const childLabel = labels[childIndex] || `Field ${childIndex + 1}`;
    card.append(renderNode([...path, index, childIndex], child, childLabel));
  });

  card.append(removeRow(collection, index));
  return card;
}

function primitiveField(path, value, label) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";

  const span = document.createElement("span");
  span.textContent = labelFor(label);

  const control = shouldUseTextarea(value, label)
    ? document.createElement("textarea")
    : document.createElement("input");

  if (control.tagName === "INPUT") control.type = "text";
  control.value = String(value ?? "");
  control.addEventListener("input", () => {
    setAtPath(path, control.value);
    markDirty();
  });

  wrapper.append(span, control);
  return wrapper;
}

function inputField(label, value) {
  const wrapper = primitiveField([], value, label);
  return wrapper.querySelector("input, textarea");
}

function labelledControl(label, control) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";
  const span = document.createElement("span");
  span.textContent = label;
  wrapper.append(span, control);
  return wrapper;
}

async function refreshMedia() {
  const response = await fetch("/cms/api/media", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "Could not load media");
  mediaLibrary = result.media || [];
}

async function uploadMedia({ file, filename, target = "", replace = false }) {
  setStatus(replace ? `Replacing ${target}` : "Uploading image", "");

  try {
    const response = await fetch("/cms/api/media", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        filename,
        target,
        replace,
        dataUrl: await fileToDataUrl(file),
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Upload failed");

    mediaLibrary = result.media || [];
    setStatus(`${result.file} saved`, "saved");
    renderSection();
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function sanitizeFilename(name) {
  const dotIndex = name.lastIndexOf(".");
  const extension = dotIndex >= 0 ? name.slice(dotIndex).toLowerCase() : "";
  const base = (dotIndex >= 0 ? name.slice(0, dotIndex) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "image"}${extension}`;
}

function cacheBusted(url, version = "") {
  if (!url) return "";
  return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version || Date.now())}`;
}

function formatBytes(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(`${text} copied`, "saved");
  } catch {
    setStatus(text, "saved");
  }
}

function setMediaSlot(slot, path) {
  draft.media ||= {};
  draft.media[slot] ||= { src: "", alt: "" };
  draft.media[slot].src = path;
  markDirty();
  activeSection = "media";
  renderNav();
  renderSection();
}

function panelShell(title) {
  const panel = document.createElement("section");
  panel.className = "panel";

  const header = document.createElement("div");
  header.className = "panel-header";
  const heading = document.createElement("h3");
  heading.className = "panel-title";
  heading.textContent = labelFor(title);
  header.append(heading);

  panel.append(header);
  return panel;
}

function itemCard(title) {
  const card = document.createElement("article");
  card.className = "item-card";
  const heading = document.createElement("div");
  heading.className = "item-heading";
  const strong = document.createElement("strong");
  strong.textContent = title;
  heading.append(strong);
  card.append(heading);
  return card;
}

function buttonRow(buttons) {
  const row = document.createElement("div");
  row.className = "button-row";
  row.append(...buttons);
  return row;
}

function removeRow(collection, index) {
  return buttonRow([
    dangerButton("Remove", () => {
      collection.splice(index, 1);
      markDirty();
      renderSection();
    }),
  ]);
}

function smallButton(label, action) {
  const button = document.createElement("button");
  button.className = "small-button";
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function dangerButton(label, action) {
  const button = smallButton(label, action);
  button.className = "danger-button";
  return button;
}

function getAtPath(path) {
  return path.reduce((current, key) => current?.[key], draft);
}

function setAtPath(path, value) {
  if (!path.length) return;
  const parent = getAtPath(path.slice(0, -1));
  parent[path[path.length - 1]] = value;
}

function emptyFrom(value) {
  if (Array.isArray(value)) return value.length ? value.map(emptyFrom) : [""];
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, emptyFrom(child)]));
  }
  return "";
}

function shouldUseTextarea(value, label) {
  const key = String(label).toLowerCase();
  return String(value || "").length > 72 || key.includes("text") || key.includes("description") || key.includes("answer");
}

function singular(label) {
  return String(label || "Item")
    .replace(/ies$/, "y")
    .replace(/s$/, "");
}

function labelFor(key) {
  const raw = friendlyLabels[key] || String(key);
  return raw
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function markDirty() {
  isDirty = true;
  setStatus("Unsaved changes", "dirty");
}

function setStatus(message, state = "") {
  status.className = state;
  status.textContent = message;
}

async function save() {
  if (!draft) return;
  saveButton.disabled = true;
  setStatus("Saving and rebuilding", "");

  try {
    const response = await fetch("/cms/api/content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      const message = result.errors?.join("; ") || result.error || "Save failed";
      throw new Error(message);
    }
    isDirty = false;
    setStatus("Saved and rebuilt", "saved");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
}

async function rebuild() {
  rebuildButton.disabled = true;
  setStatus("Rebuilding preview", "");

  try {
    const response = await fetch("/cms/api/rebuild", { method: "POST" });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Rebuild failed");
    setStatus("Preview rebuilt", isDirty ? "dirty" : "saved");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    rebuildButton.disabled = false;
  }
}

function downloadJson() {
  const blob = new Blob([`${JSON.stringify(draft, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "site-content.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function importJson() {
  const [file] = importFile.files;
  if (!file) return;

  try {
    draft = JSON.parse(await file.text());
    markDirty();
    renderNav();
    renderSection();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    importFile.value = "";
  }
}
