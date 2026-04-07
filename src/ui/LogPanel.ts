import { ItemView, WorkspaceLeaf, Setting, ButtonComponent } from 'obsidian';
import ConsoleLogViewerPlugin from '../main';
import { LogEntry } from '../core/types';
import { LogItem } from './LogItem';
import { LogDetail, copyLogsToClipboard, exportLogsAsText, exportLogsAsJSON } from './LogDetail';

export const VIEW_TYPE_CONSOLE_LOG = 'console-log-viewer';

export class LogPanel extends ItemView {
	plugin: ConsoleLogViewerPlugin;
	private logContainerEl: HTMLElement;
	private filterButtons: Map<string, ButtonComponent> = new Map();
	private currentFilter: string = 'all';
	private searchQuery: string = '';
	private logItems: Map<string, LogItem> = new Map();
	private selectedLog: LogEntry | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: ConsoleLogViewerPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_CONSOLE_LOG;
	}

	getDisplayText(): string {
		return 'Console Logs';
	}

	getIcon(): string {
		return 'scroll';
	}

	onOpen(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass('console-log-viewer');

		// Header
		this.createHeader(containerEl);

		// Toolbar
		this.createToolbar(containerEl);

		// Filter buttons
		this.createFilterButtons(containerEl);

		// Search box
		this.createSearchBox(containerEl);

		// Log container
		this.createLogContainer(containerEl);

		return Promise.resolve();
	}

	onClose(): Promise<void> {
		// Cleanup resources
		this.filterButtons.clear();
		return Promise.resolve();
	}

	private createHeader(containerEl: HTMLElement): void {
		const headerEl = containerEl.createDiv({ cls: 'console-log-header' });
		headerEl.createEl('h2', { text: 'Console Log Viewer' });
	}

	private createToolbar(containerEl: HTMLElement): void {
		const toolbarEl = containerEl.createDiv({ cls: 'console-log-toolbar' });

		// Clear button
		new ButtonComponent(toolbarEl)
			.setIcon('trash')
			.setTooltip('Clear all logs')
			.onClick(() => {
				this.plugin.consoleHook.clearLogs();
				this.refreshLogs();
			});

		// Copy all button
		new ButtonComponent(toolbarEl)
			.setIcon('clipboard')
			.setTooltip('Copy all logs')
			.onClick(() => {
				this.handleCopyAll();
			});

		// Export text button
		new ButtonComponent(toolbarEl)
			.setIcon('document')
			.setTooltip('Export as text')
			.onClick(() => {
				this.handleExportText();
			});

		// Export JSON button
		new ButtonComponent(toolbarEl)
			.setIcon('file-json')
			.setTooltip('Export as JSON')
			.onClick(() => {
				this.handleExportJSON();
			});

		// Settings button
		new ButtonComponent(toolbarEl)
			.setIcon('settings')
			.setTooltip('Open settings')
			.onClick(() => {
				// @ts-ignore - accessing internal API
				this.app.setting.open();
				// @ts-ignore - accessing internal API
				this.app.setting.openTabById('console-log-viewer');
			});
	}

	private createFilterButtons(containerEl: HTMLElement): void {
		const filterEl = containerEl.createDiv({ cls: 'console-log-filter' });

		const filters = [
			{ type: 'all', label: 'All' },
			{ type: 'info', label: 'Info' },
			{ type: 'warn', label: 'Warn' },
			{ type: 'error', label: 'Error' }
		];

		filters.forEach(({ type, label }) => {
			const btn = new ButtonComponent(filterEl)
				.setButtonText(label)
				.setClass(type === this.currentFilter ? 'active' : '')
				.onClick(() => {
					this.setFilter(type);
				});
			this.filterButtons.set(type, btn);
		});
	}

	private createSearchBox(containerEl: HTMLElement): void {
		const searchEl = containerEl.createDiv({ cls: 'console-log-search' });

		new Setting(searchEl)
			.addText(text => text
				.setPlaceholder('Search logs...')
				.onChange((value) => {
					this.searchQuery = value.toLowerCase();
					this.refreshLogs();
				}));
	}

	private createLogContainer(containerEl: HTMLElement): void {
		this.logContainerEl = containerEl.createDiv({ cls: 'console-log-container' });
		this.refreshLogs();
	}

	private setFilter(type: string): void {
		this.currentFilter = type;

		// Update button states
		this.filterButtons.forEach((btn, key) => {
			const buttonEl = btn.buttonEl;
			if (key === type) {
				buttonEl.addClass('active');
			} else {
				buttonEl.removeClass('active');
			}
		});

		this.refreshLogs();
	}

	private refreshLogs(): void {
		if (!this.logContainerEl) return;

		// Clear existing log items
		this.logItems.forEach(item => item.destroy());
		this.logItems.clear();
		this.logContainerEl.empty();

		// Get logs from console hook
		const logs = this.plugin.consoleHook.getLogs();

		// Filter logs
		const filteredLogs = this.filterLogs(logs);

		// Reverse logs to show newest first
		const reversedLogs = [...filteredLogs].reverse();

		// Display filtered logs
		if (reversedLogs.length === 0) {
			this.logContainerEl.createDiv({
				cls: 'console-log-empty',
				text: 'No logs to display'
			});
		} else {
			reversedLogs.forEach(log => {
				const logItem = new LogItem(log, {
					showTimestamp: this.plugin.settings.showTimestamp,
					onClick: (clickedLog) => {
						this.handleLogClick(clickedLog);
					}
				});
				logItem.render(this.logContainerEl);
				this.logItems.set(log.id, logItem);
			});
		}

		// Auto-scroll to bottom (newest logs)
		if (this.logContainerEl.scrollHeight > this.logContainerEl.clientHeight) {
			this.logContainerEl.scrollTop = this.logContainerEl.scrollHeight;
		}
	}

	private handleLogClick(log: LogEntry): void {
		// Store selected log
		this.selectedLog = log;

		// Open detail modal
		const modal = new LogDetail(this.app, log);
		modal.open();
	}

	/**
	 * Copy all filtered logs to clipboard
	 */
	private async handleCopyAll(): Promise<void> {
		const logs = this.plugin.consoleHook.getLogs();
		const filteredLogs = this.filterLogs(logs);
		
		if (filteredLogs.length === 0) {
			return;
		}

		await copyLogsToClipboard(filteredLogs);
	}

	/**
	 * Export filtered logs as text file
	 */
	private handleExportText(): void {
		const logs = this.plugin.consoleHook.getLogs();
		const filteredLogs = this.filterLogs(logs);
		
		if (filteredLogs.length === 0) {
			return;
		}

		const timestamp = new Date().toISOString().split('T')[0];
		exportLogsAsText(filteredLogs, `console-logs-${timestamp}.txt`);
	}

	/**
	 * Export filtered logs as JSON file
	 */
	private handleExportJSON(): void {
		const logs = this.plugin.consoleHook.getLogs();
		const filteredLogs = this.filterLogs(logs);
		
		if (filteredLogs.length === 0) {
			return;
		}

		const timestamp = new Date().toISOString().split('T')[0];
		exportLogsAsJSON(filteredLogs, `console-logs-${timestamp}.json`);
	}

	/**
	 * Filter logs based on current filter and search query
	 */
	private filterLogs(logs: LogEntry[]): LogEntry[] {
		return logs.filter(log => {
			// Type filter
			if (this.currentFilter !== 'all' && log.level !== this.currentFilter) {
				return false;
			}

			// Search filter
			if (this.searchQuery && !log.message.toLowerCase().includes(this.searchQuery)) {
				return false;
			}

			return true;
		});
	}
}