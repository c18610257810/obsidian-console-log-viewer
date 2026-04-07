import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { ConsoleHook } from './core/ConsoleHook';
import { LogPanel, VIEW_TYPE_CONSOLE_LOG } from './ui/LogPanel';

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

		// Register the console log view
		this.registerView(
			VIEW_TYPE_CONSOLE_LOG,
			(leaf) => new LogPanel(leaf, this)
		);

		// Hook console methods
		this.consoleHook.hook();

		// Provide global logging API (works even if console is disabled on mobile)
		// @ts-ignore
		window.logViewer = {
			log: (message: string, ...args: any[]) => {
				this.consoleHook.addManualLog('info', message, args);
			},
			info: (message: string, ...args: any[]) => {
				this.consoleHook.addManualLog('info', message, args);
			},
			warn: (message: string, ...args: any[]) => {
				this.consoleHook.addManualLog('warn', message, args);
			},
			error: (message: string, ...args: any[]) => {
				this.consoleHook.addManualLog('error', message, args);
			},
			clear: () => {
				this.consoleHook.clearLogs();
			},
			getLogs: () => {
				return this.consoleHook.getLogs();
			}
		};

		// Generate test logs to verify the plugin is working
		// Use manual log injection (works even if console is disabled)
		this.consoleHook.addManualLog('info', '✅ Plugin loaded successfully');
		this.consoleHook.addManualLog('info', 'ℹ️ This is an info log');
		this.consoleHook.addManualLog('warn', '⚠️ This is a warning log');
		this.consoleHook.addManualLog('error', '❌ This is an error log');
		this.consoleHook.addManualLog('info', '📝 Usage: Call window.logViewer.log("your message") to add logs', [{example: 'window.logViewer.log("test")'}]);

		// Add ribbon icon
		this.addRibbonIcon('terminal', 'Console Log Viewer', () => {
			this.activateView();
		});

		// Add command to open console log viewer
		this.addCommand({
			id: 'open-console-log-viewer',
			name: 'Open Console Log Viewer',
			callback: () => {
				this.activateView();
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
	}

	onunload() {
		// Restore original console methods
		this.consoleHook.restore();
		
		// Remove global API
		// @ts-ignore
		if (window.logViewer) {
			// @ts-ignore
			delete window.logViewer;
		}
		
		console.log('Console Log Viewer plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_CONSOLE_LOG);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({ type: VIEW_TYPE_CONSOLE_LOG, active: true });
			}
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
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