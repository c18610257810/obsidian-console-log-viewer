# Obsidian Console Log Viewer

A plugin for viewing console logs in Obsidian, especially useful for mobile debugging.

## Features

- 📱 **Mobile-friendly**: View console logs on Obsidian mobile
- 🎨 **Syntax highlighting**: Color-coded log levels (log, info, warn, error, debug)
- 🔍 **Filterable**: Filter logs by type
- 📊 **Persistent logs**: Keep logs in memory for review
- ⚙️ **Configurable**: Customize max logs, timestamp display

## Installation

### Via BRAT (Recommended)

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) from Obsidian's community plugin browser
2. Open BRAT settings
3. Click "Add Beta plugin"
4. Enter the repository URL: `https://github.com/frankzhang/obsidian-console-log-viewer`
5. Enable the plugin in Settings > Community plugins

### Manual Installation

1. Download the latest release from the [Releases page](https://github.com/frankzhang/obsidian-console-log-viewer/releases)
2. Extract the files to your vault's `.obsidian/plugins/console-log-viewer/` folder
3. Enable the plugin in Settings > Community plugins

## Usage

1. Click the terminal icon in the ribbon, or use the command palette: "Open Console Log Viewer"
2. View all console logs in the viewer
3. Use filters to show only specific log types
4. Clear logs with the "Clear" button

## Configuration

- **Maximum logs to keep**: Set the maximum number of logs stored in memory (default: 100)
- **Show timestamp**: Toggle timestamp display for each log entry

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Build for development (watch mode)
npm run dev
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

Frank Zhang

## Support

If you encounter any issues or have feature requests, please [open an issue](https://github.com/frankzhang/obsidian-console-log-viewer/issues) on GitHub.