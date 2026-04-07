import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { ConsoleHook } from './core/ConsoleHook';

interface ConsoleLogViewerSettings {
	maxLogs: number;
	showTimestamp: boolean;
}

const DEFAULT_SETTINGS: ConsoleLogViewerSettings = {
	maxLogs: 100,
	showTimestamp: true
}

export default class ConsoleLogViewerPlugin extends Plugin {
	settings: ConsoleLogViewerSettings;
	consoleHook: ConsoleHook;

	async onload() {
		await this.loadSettings();

		// Initialize Console Hook
		this.consoleHook = new ConsoleHook({
			maxLogs: this.settings.maxLogs,
			captureStackTrace: true,
			passThrough: true, // Also output to original console
			onLogCapture: (entry) => {
				// Will trigger UI update when view is open
				// console.log('Captured:', entry.message);
			}
		});

		// Hook console methods
		this.consoleHook.hook();

		// Add ribbon icon
		this.addRibbonIcon('terminal', 'Console Log Viewer', () => {
			// Will open console log viewer view
		});

		// Add command to open console log viewer
		this.addCommand({
			id: 'open-console-log-viewer',
			name: 'Open Console Log Viewer',
			callback: () => {
				// Will open console log viewer view
			}
		});

		// Add command to clear logs
		this.addCommand({
			id: 'clear-console-logs',
			name: 'Clear Console Logs',
			callback: () => {
				this.consoleHook.clearLogs();
				console.log('Console logs cleared');
			}
		});

		// Add settings tab
		this.addSettingTab(new ConsoleLogViewerSettingTab(this.app, this));

		console.log('Console Log Viewer plugin loaded');
	}

	onunload() {
		// Restore original console methods
		this.consoleHook.restore();
		console.log('Console Log Viewer plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ConsoleLogViewerSettingTab extends PluginSettingTab {
	plugin: ConsoleLogViewerPlugin;

	constructor(app: App, plugin: ConsoleLogViewerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Maximum logs to keep')
			.setDesc('Maximum number of logs to keep in memory')
			.addText(text => text
				.setPlaceholder('100')
				.setValue(String(this.plugin.settings.maxLogs))
				.onChange(async (value) => {
					this.plugin.settings.maxLogs = parseInt(value) || 100;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show timestamp')
			.setDesc('Show timestamp for each log entry')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showTimestamp)
				.onChange(async (value) => {
					this.plugin.settings.showTimestamp = value;
					await this.plugin.saveSettings();
				}));
	}
}