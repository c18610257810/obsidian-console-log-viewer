import { ItemView, WorkspaceLeaf, Setting, ButtonComponent } from 'obsidian';
import ConsoleLogViewerPlugin from '../main';
import { LogEntry } from '../core/types';
import { LogItem } from './LogItem';
import { LogDetail, copyLogsToClipboard, exportLogsAsText, exportLogsAsJSON } from './LogDetail';

export const VIEW_TYPE_CONSOLE_LOG = 'console-log-viewer';

// Performance configuration
const VIRTUAL_SCROLL_ITEM_HEIGHT = 56; // Increased height for mobile touch targets
const VIRTUAL_SCROLL_BUFFER = 5; // Number of items to render above/below viewport
const DEBOUNCE_DELAY = 150; // Search debounce delay in ms

export class LogPanel extends ItemView {
	plugin: ConsoleLogViewerPlugin;
	private logContainerEl: HTMLElement;
	private virtualScrollWrapper: HTMLElement | null = null;
	private virtualScrollContent: HTMLElement | null = null;
	private filterButtons: Map<string, ButtonComponent> = new Map();
	private currentFilter: string = 'all';
	private searchQuery: string = '';
	private logItems: Map<string, LogItem> = new Map();
	private selectedLog: LogEntry | null = null;
	private filteredLogs: LogEntry[] = [];
	private scrollTop: number = 0;
	private viewportHeight: number = 0;
	private renderStartIndex: number = 0;
	private renderEndIndex: number = 0;
	private searchDebounceTimer: number | null = null;
	private lastRenderTime: number = 0;
	private performanceMetrics: {
		renderCount: number;
		totalRenderTime: number;
		avgRenderTime: number;
		lastFilterTime: number;
	} = { renderCount: 0, totalRenderTime: 0, avgRenderTime: 0, lastFilterTime: 0 };

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

		// Initial refresh - load existing logs
		this.refreshLogs();

		// Auto-refresh every 500ms to show new logs
		this.registerInterval(window.setInterval(() => {
			this.refreshLogs();
		}, 500));

		return Promise.resolve();
	}

	onClose(): Promise<void> {
		// Cleanup resources
		this.filterButtons.clear();
		if (this.searchDebounceTimer) {
			clearTimeout(this.searchDebounceTimer);
			this.searchDebounceTimer = null;
		}
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
					this.handleSearchChange(value);
				}));
	}

	private handleSearchChange(value: string): void {
		// Debounce search input
		if (this.searchDebounceTimer) {
			clearTimeout(this.searchDebounceTimer);
		}
		
		this.searchDebounceTimer = window.setTimeout(() => {
			this.searchQuery = value.toLowerCase();
			this.refreshFilteredLogs();
		}, DEBOUNCE_DELAY);
	}

	private createLogContainer(containerEl: HTMLElement): void {
		this.logContainerEl = containerEl.createDiv({ cls: 'console-log-container' });
		
		// Setup virtual scroll wrapper
		this.virtualScrollWrapper = this.logContainerEl.createDiv({
			cls: 'virtual-scroll-wrapper'
		});
		
		// Content element that will be scrolled
		this.virtualScrollContent = this.virtualScrollWrapper.createDiv({
			cls: 'virtual-scroll-content'
		});
		
		// Set up scroll event listener
		this.virtualScrollWrapper.addEventListener('scroll', () => {
			this.handleScroll();
		});
		
		// Initial refresh
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

		this.refreshFilteredLogs();
	}

	private refreshFilteredLogs(): void {
		const startTime = performance.now();
		
		// Get logs from console hook
		const logs = this.plugin.consoleHook.getLogs();
		
		// Filter logs based on current filter and search query
		this.filteredLogs = this.filterLogs(logs).reverse(); // Reverse to show newest first
		
		// Update performance metrics
		this.performanceMetrics.lastFilterTime = performance.now() - startTime;
		
		// Reset scroll position tracking
		this.scrollTop = 0;
		this.viewportHeight = this.virtualScrollWrapper?.clientHeight || 0;
		
		// Render visible items
		this.renderVisibleItems();
		
		// Update performance metrics and log to console
		this.updatePerformanceMetrics();
	}

	private refreshLogs(): void {
		if (!this.logContainerEl) return;
		
		// Clear existing log items but keep DOM structure for virtual scrolling
		this.logItems.forEach(item => item.destroy());
		this.logItems.clear();
		
		if (this.virtualScrollContent) {
			this.virtualScrollContent.empty();
		}
		
		this.refreshFilteredLogs();
	}

	private handleScroll(): void {
		if (!this.virtualScrollWrapper || !this.virtualScrollContent) return;
		
		this.scrollTop = this.virtualScrollWrapper.scrollTop;
		this.viewportHeight = this.virtualScrollWrapper.clientHeight;
		
		this.renderVisibleItems();
	}

	private renderVisibleItems(): void {
		if (!this.virtualScrollContent || this.filteredLogs.length === 0) {
			if (this.filteredLogs.length === 0 && this.virtualScrollContent) {
				this.virtualScrollContent.createDiv({
					cls: 'console-log-empty',
					text: 'No logs to display'
				});
			}
			return;
		}
		
		const startTime = performance.now();
		
		// Calculate which items should be visible
		const totalHeight = this.filteredLogs.length * VIRTUAL_SCROLL_ITEM_HEIGHT;
		this.virtualScrollContent.style.height = `${totalHeight}px`;
		
		// Calculate visible range with buffer
		const startItem = Math.max(0, Math.floor(this.scrollTop / VIRTUAL_SCROLL_ITEM_HEIGHT) - VIRTUAL_SCROLL_BUFFER);
		const endItem = Math.min(
			this.filteredLogs.length,
			Math.ceil((this.scrollTop + this.viewportHeight) / VIRTUAL_SCROLL_ITEM_HEIGHT) + VIRTUAL_SCROLL_BUFFER
		);
		
		// Only re-render if the visible range has changed significantly
		const rangeChanged = (
			startItem !== this.renderStartIndex || 
			endItem !== this.renderEndIndex ||
			this.renderStartIndex === 0 // First render
		);
		
		if (!rangeChanged) return;
		
		this.renderStartIndex = startItem;
		this.renderEndIndex = endItem;
		
		// Clear current visible items
		this.virtualScrollContent.empty();
		
		// Create placeholder at the top for non-visible items
		const topPlaceholderHeight = startItem * VIRTUAL_SCROLL_ITEM_HEIGHT;
		if (topPlaceholderHeight > 0) {
			const topPlaceholder = this.virtualScrollContent.createDiv({
				cls: 'virtual-scroll-placeholder'
			});
			topPlaceholder.style.height = `${topPlaceholderHeight}px`;
		}
		
		// Render visible items
		for (let i = startItem; i < endItem && i < this.filteredLogs.length; i++) {
			const log = this.filteredLogs[i];
			const logItem = new LogItem(log, {
				showTimestamp: this.plugin.settings.showTimestamp,
				onClick: (clickedLog) => {
					this.handleLogClick(clickedLog);
				}
			});
			
			const itemEl = logItem.render(this.virtualScrollContent);
			itemEl.style.position = 'absolute';
			itemEl.style.top = `${topPlaceholderHeight + (i - startItem) * VIRTUAL_SCROLL_ITEM_HEIGHT}px`;
			itemEl.style.width = '100%';
			
			this.logItems.set(log.id, logItem);
		}
		
		// Update performance metrics
		const renderTime = performance.now() - startTime;
		this.performanceMetrics.renderCount++;
		this.performanceMetrics.totalRenderTime += renderTime;
		this.performanceMetrics.avgRenderTime = this.performanceMetrics.totalRenderTime / this.performanceMetrics.renderCount;
		
		// Auto-scroll to bottom when new logs are added (if we were at bottom)
		const wasAtBottom = this.scrollTop >= (this.virtualScrollWrapper.scrollHeight - this.viewportHeight - 10);
		if (wasAtBottom && this.virtualScrollWrapper.scrollHeight > this.viewportHeight) {
			this.virtualScrollWrapper.scrollTop = this.virtualScrollWrapper.scrollHeight;
		}
		
		this.lastRenderTime = renderTime;
	}

	private updatePerformanceMetrics(): void {
		// Log performance metrics to console for debugging
		console.log(`[ConsoleLogViewer] Performance Metrics:`, {
			logCount: this.filteredLogs.length,
			filterTime: this.performanceMetrics.lastFilterTime.toFixed(2) + 'ms',
			lastRenderTime: this.lastRenderTime.toFixed(2) + 'ms',
			avgRenderTime: this.performanceMetrics.avgRenderTime.toFixed(2) + 'ms',
			renderRange: `${this.renderStartIndex}-${this.renderEndIndex}`
		});
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