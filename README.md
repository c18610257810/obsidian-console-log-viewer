# Obsidian Console Log Viewer

A powerful plugin for viewing, filtering, and managing console logs directly within Obsidian, especially designed for mobile debugging and development workflows.

![Console Log Viewer Screenshot](https://github.com/frankzhang/obsidian-console-log-viewer/raw/main/screenshot.png)

## 🌟 Features

- 📱 **Mobile-First Design**: Fully responsive interface optimized for touch devices
- 🎨 **Syntax Highlighting**: Color-coded log levels (info, warn, error) with visual indicators
- 🔍 **Advanced Filtering**: Filter logs by type (All, Info, Warn, Error)
- 🔎 **Search Functionality**: Real-time search through all captured logs
- 📊 **Persistent Logging**: Keep logs in memory with configurable limits
- ⚙️ **Customizable Settings**: Adjust max logs and timestamp display preferences
- 💾 **Export Capabilities**: Copy to clipboard, export as text, or export as JSON
- 📋 **Detailed View**: Click any log entry to see full details including arguments and stack traces
- 🧪 **Virtual Scrolling**: High-performance rendering for large log volumes
- 🔄 **Pass-Through Mode**: Logs are still visible in the original console

## 📥 Installation

### Via BRAT (Recommended)

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) from Obsidian's community plugin browser
2. Open BRAT settings (`Settings` → `BRAT`)
3. Click "Add Beta plugin"
4. Enter the repository URL: `https://github.com/frankzhang/obsidian-console-log-viewer`
5. Enable the plugin in `Settings` → `Community plugins`

### Manual Installation

1. Download the latest release from the [Releases page](https://github.com/frankzhang/obsidian-console-log-viewer/releases)
2. Extract the contents to your vault's `.obsidian/plugins/console-log-viewer/` folder
3. Enable the plugin in `Settings` → `Community plugins`

## 🚀 Usage

### Opening the Console Log Viewer

- **Ribbon Icon**: Click the terminal icon in the right sidebar
- **Command Palette**: Press `Ctrl/Cmd+P` and search for "Open Console Log Viewer"
- **Keyboard Shortcut**: Assign a custom shortcut in `Settings` → `Hotkeys`

### Interface Overview

1. **Header**: Shows "Console Log Viewer" title
2. **Toolbar**: Contains action buttons:
   - 🗑️ **Clear**: Remove all captured logs
   - 📋 **Copy**: Copy all filtered logs to clipboard
   - 📄 **Export Text**: Download logs as a `.txt` file
   - 📂 **Export JSON**: Download logs as a `.json` file
   - ⚙️ **Settings**: Open plugin settings
3. **Filter Buttons**: Toggle between All, Info, Warn, and Error logs
4. **Search Box**: Type to filter logs by message content
5. **Log List**: Displays captured console logs with timestamps and level indicators

### Interacting with Logs

- **Click on any log entry** to open a detailed modal showing:
  - Full timestamp (YYYY-MM-DD HH:MM:SS)
  - Log level
  - Complete message
  - Original arguments (if any)
  - Stack trace (when available)
- **Long messages** are truncated but can be expanded by clicking on them
- **Touch-friendly design** with proper spacing and feedback for mobile devices

## ⚙️ Configuration Options

Access settings via `Settings` → `Console Log Viewer`:

| Setting | Description | Default |
|---------|-------------|---------|
| **Maximum logs to keep** | Maximum number of logs stored in memory | `100` |
| **Show timestamp** | Display timestamp for each log entry | `Enabled` |

## 💻 Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/frankzhang/obsidian-console-log-viewer.git
cd obsidian-console-log-viewer

# Install dependencies
npm install
```

### Build Commands

```bash
# Build for production
npm run build

# Build for development (watch mode)
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Project Structure

```
src/
├── core/           # Core logging functionality
│   ├── ConsoleHook.ts  # Console interception logic
│   └── types.ts        # TypeScript interfaces
├── ui/             # User interface components
│   ├── LogPanel.ts     # Main view component
│   ├── LogItem.ts      # Individual log entry component
│   └── LogDetail.ts    # Detailed log modal
├── __tests__/      # Unit tests
└── main.ts         # Plugin entry point
```

### Testing Strategy

- **Unit Tests**: Comprehensive test coverage for core functionality
- **Mock Console**: Custom mock implementation for testing
- **Performance Tests**: Benchmark scripts for virtual scrolling performance
- **Manual Testing**: Script for real-world testing scenarios

## 📱 Mobile Optimization

The plugin is specifically designed with mobile users in mind:

- **Touch Targets**: All interactive elements meet minimum 44px touch target guidelines
- **Responsive Layout**: Adapts to different screen sizes and orientations
- **Performance**: Virtual scrolling ensures smooth performance even with hundreds of logs
- **Font Sizes**: Optimized for readability on small screens
- **Input Handling**: Search input uses 16px font size to prevent iOS zoom behavior

## ❓ FAQ

### Q: Will this plugin slow down my Obsidian?

**A**: No. The plugin uses efficient virtual scrolling and only renders visible log entries, ensuring smooth performance even with large log volumes.

### Q: Are my console logs sent to any external servers?

**A**: Absolutely not. All logs are stored locally in your browser's memory and never leave your device.

### Q: Why don't I see stack traces for all logs?

**A**: Stack traces are only captured for logs that originate from your own code or when errors are thrown. Built-in browser console messages typically don't include stack traces.

### Q: Can I customize the colors or appearance?

**A**: Currently, the plugin uses Obsidian's built-in theme colors for consistency. Future versions may include more customization options.

### Q: What happens when I close Obsidian?

**A**: All captured logs are stored in memory only and will be lost when you close Obsidian. Use the export functionality to save important logs.

## 🐛 Known Issues

- **Coverage Gap**: LogDetail.ts has lower test coverage (42%) compared to other components
- **Mobile Performance**: Very large log volumes (>1000 entries) may cause slight lag on older mobile devices
- **Stack Trace Format**: Stack trace formatting may vary between different browsers

## 📝 Common Use Cases

### Mobile Debugging
Debug JavaScript issues on mobile devices where browser developer tools aren't available.

### Plugin Development
Monitor console output while developing other Obsidian plugins.

### Error Tracking
Capture and analyze error messages that occur during normal Obsidian usage.

### Performance Monitoring
Track timing information and performance metrics logged to the console.

### Learning and Education
Understand how different parts of Obsidian or plugins work by observing their console output.

## ⌨️ Keyboard Shortcuts

While the plugin doesn't include built-in keyboard shortcuts, you can assign them in Obsidian:

1. Go to `Settings` → `Hotkeys`
2. Search for "Console Log Viewer"
3. Assign shortcuts for:
   - Open Console Log Viewer
   - Clear Console Logs

## 📊 Performance Metrics

The plugin includes built-in performance monitoring that logs metrics to the console:

- **Log Count**: Number of currently displayed logs
- **Filter Time**: Time taken to apply filters (typically <1ms)
- **Render Time**: Time taken to render visible items
- **Render Range**: Which items are currently being rendered

You can view these metrics by opening your browser's developer console while using the plugin.

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 👤 Author

Frank Zhang

## 🤝 Support

If you encounter any issues or have feature requests, please [open an issue](https://github.com/frankzhang/obsidian-console-log-viewer/issues) on GitHub.

## 🔄 Changelog

### v1.0.0 (2026-04-07)
- Initial release
- Console hook interception with pass-through support
- Log filtering by type (All, Info, Warn, Error)
- Search functionality with debounced input
- Detailed log view modal
- Export capabilities (clipboard, text, JSON)
- Mobile-responsive design with touch optimization
- Virtual scrolling for performance
- Comprehensive unit tests (46 tests passing)
- BRAT and manual installation support