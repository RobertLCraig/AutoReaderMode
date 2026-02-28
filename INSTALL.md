# Installation Guide — Auto Reader Mode

## Requirements

- **Microsoft Edge** 79 or later, **or**
- **Google Chrome** 88 or later (or any Chromium-based browser with MV3 support)

---

## Option A — Load Unpacked (Development / Local Use)

This is the recommended method for personal use or development.

### Step 1 — Get the source code

Clone the repository:
```
git clone https://github.com/<your-username>/AutoReaderMode.git
```
Or download and extract the ZIP from GitHub.

### Step 2 — Open the extensions page

| Browser | URL |
|---|---|
| Chrome | `chrome://extensions/` |
| Edge | `edge://extensions/` |
| Brave | `brave://extensions/` |

### Step 3 — Enable Developer Mode

Toggle the **Developer mode** switch in the top-right corner of the extensions page.

### Step 4 — Load the extension

1. Click **Load unpacked**.
2. Navigate to the cloned/extracted folder and select the **`src/`** subdirectory (the folder that contains `manifest.json`).
3. Click **Select Folder**.

The extension icon will appear in your browser toolbar. Pin it for easy access.

---

## Option B — Install from a .crx file

> Note: browsers increasingly restrict side-loaded `.crx` files. Use Option A if you encounter errors.

1. Download `bin/AutoReaderMode.crx`.
2. Open the extensions page (see Step 2 above).
3. Enable **Developer mode**.
4. Drag and drop `AutoReaderMode.crx` onto the extensions page.
5. Click **Add extension** in the confirmation dialog.

---

## Verifying the Installation

1. Open any article page (e.g. a news site or blog post).
2. Click the **Auto Reader Mode** icon in the toolbar.
3. The popup should show the current site's domain and an **Open Reader Mode** button.
4. Click **Open Reader Mode** — the page should switch to a clean reading layout.

---

## Granting Permissions

On first use the browser may ask you to confirm permissions:

- **Read and change your data on websites** — needed to inject the reader overlay (Chrome) or to detect and redirect to `read://` (Edge).

Click **Allow** to proceed.

---

## Updating the Extension

If you loaded the extension unpacked:

1. Pull the latest changes: `git pull`
2. Go to `chrome://extensions/` (or `edge://extensions/`).
3. Find **Auto Reader Mode** and click the **Reload** button (circular arrow icon).

---

## Uninstalling

1. Go to `chrome://extensions/` (or `edge://extensions/`).
2. Find **Auto Reader Mode**.
3. Click **Remove** → **Remove** to confirm.
