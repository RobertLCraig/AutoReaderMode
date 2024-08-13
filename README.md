# Auto Reader Mode

**Auto Reader Mode** is a Chrome extension that automatically enables reader mode on user-specified websites. This extension helps improve your reading experience by stripping away unnecessary elements like ads and menus, allowing you to focus on the content.

## Features

- Automatically redirects specified websites to reader mode.
- Simple UI to add or remove websites from the list of enabled sites.
- On-demand switch to reader mode with a button click.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by clicking the toggle switch in the top right corner.
4. Click on "Load unpacked" and select the directory containing the extension files.

## Usage

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. The popup will display the current site's domain.
3. To enable reader mode for the current site, click the "Add Current Site" button.
4. The site will be added to the list of enabled sites.
5. You can remove sites from the list by clicking the "Remove" button next to each site.
6. Use the "Switch to Reader Mode" button to manually convert the current page to reader mode.

## File Structure

- `manifest.json` - Defines the extension's metadata, permissions, and background scripts.
- `background.js` - Handles tab updates and redirects to reader mode using the utility functions.
- `popup.html` - The HTML file for the extension's popup interface.
- `popup.js` - Manages the UI interactions in the popup, including adding/removing sites and switching to reader mode.
- `utils.js` - Contains utility functions like `convertUrl` for generating reader mode URLs.

## Development

To modify or extend the functionality of this extension:

1. Make your changes to the relevant files.
2. Reload the extension in Chrome by going to `chrome://extensions/` and clicking "Reload" on the Auto Reader Mode extension.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss your changes.

## Contact

If you have any questions or suggestions, feel free to open an issue in this repository.
