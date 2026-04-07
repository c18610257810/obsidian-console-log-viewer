# Console Log Viewer - Usage Guide

This guide provides detailed instructions, examples, and best practices for using the Console Log Viewer plugin.

## 📸 Interface Overview

### Main View Components

![Main Interface](https://github.com/frankzhang/obsidian-console-log-viewer/raw/main/screenshot-main.png)

1. **Header**: "Console Log Viewer" title
2. **Toolbar**: Action buttons (Clear, Copy, Export Text, Export JSON, Settings)
3. **Filter Buttons**: All | Info | Warn | Error
4. **Search Box**: Real-time log filtering
5. **Log Entries**: Individual console messages with visual indicators

### Log Entry Format

Each log entry displays:
- **Timestamp**: HH:MM:SS format (configurable)
- **Level Indicator**: Color-coded circle (🟢 Info, 🟡 Warn, 🔴 Error)
- **Message**: The actual console message content
- **Truncation**: Long messages show "..." and can be expanded by clicking

### Detail Modal

![Detail Modal](https://github.com/frankzhang/obsidian-console-log-viewer/raw/main/screenshot-detail.png)

When you click any log entry, you'll see:
- Full timestamp in YYYY-MM-DD HH:MM:SS format
- Log level (INFO, WARN, ERROR)
- Complete message text
- Original arguments (formatted as JSON)
- Stack trace (when available)
- Copy and Close buttons

## 🎯 Common Scenarios

### Scenario 1: Mobile Debugging

**Problem**: You're using Obsidian on your phone and encounter a JavaScript error, but you can't access browser developer tools.

**Solution**:
1. Open the Console Log Viewer from the ribbon
2. Reproduce the issue that causes the error
3. Look for red (🔴) error entries in the log list
4. Click on the error to see the full stack trace
5. Copy the error details to share with developers or for your own debugging

### Scenario 2: Plugin Development

**Problem**: You're developing an Obsidian plugin and need to monitor console output without constantly switching to desktop.

**Solution**:
1. Enable the Console Log Viewer plugin
2. Add `console.log()` statements in your plugin code for debugging
3. Open Console Log Viewer to see real-time output
4. Use filters to focus on specific log types (e.g., only errors)
5. Export logs as JSON for detailed analysis

### Scenario 3: Performance Monitoring

**Problem**: You want to track how long certain operations take in your workflow.

**Solution**:
1. Add timing logs in your code:
   ```javascript
   console.log('Starting operation X');
   const start = Date.now();
   // ... your operation ...
   console.log('Operation X completed in', Date.now() - start, 'ms');
   ```
2. Open Console Log Viewer to see the timing information
3. Use search to find specific operation logs
4. Export logs as text for performance reports

### Scenario 4: Error Analysis

**Problem**: Obsidian occasionally shows unexpected behavior, and you suspect it's related to console errors.

**Solution**:
1. Keep Console Log Viewer open while using Obsidian normally
2. When you notice unusual behavior, check for recent error logs
3. Filter by "Error" to focus on critical issues
4. Examine stack traces to identify which plugin or component is causing problems
5. Clear logs periodically to maintain performance

## ⌨️ Keyboard Navigation

While the plugin is primarily designed for touch/mouse interaction, you can enhance your workflow with Obsidian's built-in keyboard shortcuts:

### Assigning Custom Shortcuts

1. Go to `Settings` → `Hotkeys`
2. Search for "Console Log Viewer"
3. Assign shortcuts for:
   - **Open Console Log Viewer**: Quick access to the main view
   - **Clear Console Logs**: Reset captured logs

### Recommended Shortcuts

- **Ctrl+Shift+L** (Windows/Linux) or **Cmd+Shift+L** (Mac): Open Console Log Viewer
- **Ctrl+Shift+K** (Windows/Linux) or **Cmd+Shift+K** (Mac): Clear Console Logs

## 🔧 Advanced Configuration

### Memory Management

The plugin stores logs in memory with a default limit of 100 entries. For heavy logging scenarios:

- **Increase limit**: Set to higher values (e.g., 500) if you need more history
- **Decrease limit**: Set to lower values (e.g., 50) if you experience performance issues
- **Monitor usage**: The performance metrics logged to console show current log count

### Timestamp Display

- **Enabled**: Shows HH:MM:SS timestamps for each log entry
- **Disabled**: Removes timestamps to save space (useful for very dense logs)

## 📤 Export Options

### Copy to Clipboard

Copies all currently filtered logs in a human-readable format:

```
[2026-04-07 10:30:15] [INFO] Plugin loaded successfully
---
[2026-04-07 10:30:16] [WARN] Deprecated API usage detected
---
[2026-04-07 10:30:17] [ERROR] Failed to load resource
Stack: Error: Resource not found
    at loadResource (plugin.js:45)
    at initialize (plugin.js:23)
```

### Export as Text

Downloads a `.txt` file with the same format as clipboard copy, useful for sharing or archiving.

### Export as JSON

Downloads a `.json` file with structured data:

```json
[
  {
    "id": "log-1680867015000-0",
    "timestamp": "2026-04-07 10:30:15",
    "level": "info",
    "message": "Plugin loaded successfully",
    "args": ["Plugin loaded successfully"],
    "stackTrace": "..."
  }
]
```

JSON export is ideal for programmatic analysis or integration with other tools.

## 📱 Mobile-Specific Tips

### Touch Gestures

- **Tap log entries**: Opens detail modal
- **Tap truncated messages**: Expands to show full content
- **Scroll smoothly**: Virtual scrolling handles large log volumes efficiently

### Screen Orientation

- **Portrait**: Optimized layout with stacked buttons and larger touch targets
- **Landscape**: More horizontal space allows better use of toolbar and filter buttons

### Performance Optimization

- **Clear logs regularly**: Prevents memory buildup on mobile devices
- **Use filters**: Reduces visible items and improves scrolling performance
- **Avoid excessive logging**: Be mindful of console.log() frequency in your plugins

## 🚨 Troubleshooting

### No Logs Appearing

**Possible Causes**:
- Plugin not properly enabled
- Console methods not being called
- Logs are being filtered out

**Solutions**:
1. Verify plugin is enabled in Settings → Community plugins
2. Test with a simple `console.log('test')` in browser console
3. Ensure filter is set to "All" and search box is empty

### Performance Issues

**Possible Causes**:
- Too many logs stored in memory
- Very long log messages
- Older mobile device

**Solutions**:
1. Reduce "Maximum logs to keep" setting
2. Clear logs periodically using the Clear button
3. Use filters to reduce visible items

### Missing Stack Traces

**Possible Causes**:
- Browser limitations
- Non-error console calls
- Security restrictions

**Solutions**:
- Stack traces are only available for errors and some warnings
- Try throwing an actual Error object to test stack trace capture
- Different browsers may provide different stack trace information

## 💡 Best Practices

### For Plugin Developers

- Use appropriate log levels: `console.info()` for normal info, `console.warn()` for warnings, `console.error()` for errors
- Avoid excessive logging in production code
- Include meaningful context in log messages
- Test your plugin with Console Log Viewer enabled

### For End Users

- Keep the plugin enabled only when needed for debugging
- Clear logs after resolving issues to maintain performance
- Use export functionality to save important debugging information
- Report issues with exported log files when seeking help

### For Mobile Users

- Take advantage of the touch-optimized interface
- Use landscape orientation for better visibility when analyzing complex logs
- Clear logs before starting new debugging sessions
- Export logs immediately after capturing important information

## 🔄 Integration with Other Tools

### Browser Developer Tools

The Console Log Viewer works alongside browser developer tools:
- Logs appear in both places simultaneously (pass-through mode)
- Use browser tools for advanced debugging features
- Use Console Log Viewer for mobile access and persistent viewing

### External Logging Services

For production applications requiring persistent logging:
- Console Log Viewer is for development/debugging only
- Consider integrating proper logging services for production
- Use Console Log Viewer to validate that your logging integration works correctly

## 📊 Performance Benchmarks

### Virtual Scrolling Performance

| Log Count | Desktop Performance | Mobile Performance |
|-----------|-------------------|-------------------|
| 100       | Instant           | Instant           |
| 500       | <10ms render      | <50ms render      |
| 1000      | <20ms render      | <100ms render     |
| 5000      | <50ms render      | May lag slightly  |

### Memory Usage

- Each log entry uses approximately 1-2KB of memory
- 100 logs ≈ 100-200KB memory usage
- Memory is automatically freed when logs are cleared or plugin is unloaded

## 🎨 Customization (Future)

While the current version uses Obsidian's built-in theme colors, future versions may include:

- Custom color schemes for different log levels
- Font size adjustments
- Layout customization options
- Theme-specific styling

For now, the plugin prioritizes consistency with Obsidian's native appearance.

---

*This guide covers the v1.0.0 release. Features and instructions may change in future versions.*