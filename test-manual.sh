#!/bin/bash

# Manual Test Script for Console Log Viewer Plugin
# This script helps verify that the plugin works correctly in Obsidian

echo "=== Console Log Viewer Manual Test Script ==="
echo ""
echo "Testing steps:"
echo ""

# Check if plugin is built
if [ ! -f "main.js" ]; then
    echo "❌ Plugin not built. Run 'npm run build' first."
    exit 1
fi

echo "✅ Plugin is built (main.js exists)"
echo ""

# Check manifest
if [ ! -f "manifest.json" ]; then
    echo "❌ manifest.json not found"
    exit 1
fi

echo "✅ manifest.json exists"
echo ""

# Check styles
if [ ! -f "styles.css" ]; then
    echo "❌ styles.css not found"
    exit 1
fi

echo "✅ styles.css exists"
echo ""

echo "📋 Manual Testing Checklist:"
echo ""
echo "1. Copy plugin to Obsidian vault:"
echo "   - Destination: ~/.obsidian/plugins/obsidian-console-log-viewer/"
echo "   - Files to copy: main.js, manifest.json, styles.css"
echo ""
echo "2. Enable plugin in Obsidian:"
echo "   - Open Settings > Community plugins"
echo "   - Find 'Console Log Viewer'"
echo "   - Enable it"
echo ""
echo "3. Open Console Log Viewer:"
echo "   - Click terminal icon in left ribbon"
echo "   - Or use command: 'Open Console Log Viewer'"
echo ""
echo "4. Test Log Display:"
echo "   - Execute: console.log('Test info message')"
echo "   - Execute: console.warn('Test warning message')"
echo "   - Execute: console.error('Test error message')"
echo "   - Verify logs appear in the panel"
echo ""
echo "5. Test Filters:"
echo "   - Click 'All', 'Info', 'Warn', 'Error' buttons"
echo "   - Verify only matching logs are shown"
echo ""
echo "6. Test Search:"
echo "   - Enter search term in search box"
echo "   - Verify only matching logs are shown"
echo ""
echo "7. Test Timestamp:"
echo "   - Check that timestamps appear (HH:MM:SS format)"
echo "   - Toggle setting in plugin settings"
echo ""
echo "8. Test Level Icons:"
echo "   - 🟢 for Info logs"
echo "   - 🟡 for Warn logs"
echo "   - 🔴 for Error logs"
echo ""
echo "9. Test Message Truncation:"
echo "   - Log a very long message (>100 chars)"
echo "   - Verify it's truncated with '...'"
echo "   - Click truncated message to expand"
echo ""
echo "10. Test Click Handler:"
echo "    - Click on any log entry"
echo "    - Check console for 'Log clicked: log-xxx'"
echo ""
echo "11. Test Performance:"
echo "    - Generate 100+ logs"
echo "    - Verify scrolling is smooth"
echo "    - Check that list renders quickly"
echo ""
echo "=== Test Script Complete ==="