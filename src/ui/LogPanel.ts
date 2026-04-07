import { ItemView, WorkspaceLeaf, Setting, ButtonComponent } from 'obsidian';
import ConsoleLogViewerPlugin from '../main';

export const VIEW_TYPE_CONSOLE_LOG = 'console-log-viewer';

export class LogPanel extends ItemView {
	plugin: ConsoleLogViewerPlugin;
	private logContainerEl: HTMLElement;
	private filterButtons: Map<string, ButtonComponent> = new Map();
	private currentFilter: string = 'all';
	private searchQuery: string = '';

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
			if (key === type) {
				btn.setClass('active');
			} else {
				btn.removeClass('active');
			}
		});

		this.refreshLogs();
	}

	private refreshLogs(): void {
		if (!this.logContainerEl) return;

		// Clear existing logs
		this.logContainerEl.empty();

		// Get logs from console hook
		const logs = this.plugin.consoleHook.getLogs();

		// Filter logs
		const filteredLogs = logs.filter(log => {
			// Type filter
			if (this.currentFilter !== 'all' && log.type !== this.currentFilter) {
				return false;
			}

			// Search filter
			if (this.searchQuery && !log.message.toLowerCase().includes(this.searchQuery)) {
				return false;
			}

			return true;
		});

		// Display filtered logs
		if (filteredLogs.length === 0) {
			this.logContainerEl.createDiv({ 
				cls: 'console-log-empty',
				text: 'No logs to display'
			});
		} else {
			filteredLogs.forEach(log => {
				this.createLogEntry(log);
			});
		}
	}

	private createLogEntry(log: any): void {
		const logEl = this.logContainerEl.createDiv({ 
			cls: `console-log-entry console-log-${log.type}` 
		});

		// Timestamp
		if (this.plugin.settings.showTimestamp) {
			const timeEl = logEl.createDiv({ cls: 'console-log-time' });
			timeEl.textContent = new Date(log.timestamp).toLocaleTimeString();
		}

		// Type badge
		const typeEl = logEl.createDiv({ cls: 'console-log-type' });
		typeEl.textContent = log.type.toUpperCase();

		// Message
		const messageEl = logEl.createDiv({ cls: 'console-log-message' });
		messageEl.textContent = log.message;
	}
}