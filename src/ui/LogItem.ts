import { LogEntry } from '../core/types';

/**
 * Options for rendering a log item
 */
export interface LogItemOptions {
	/** Maximum message length before truncation */
	maxMessageLength?: number;
	/** Whether to show timestamp */
	showTimestamp?: boolean;
	/** Click callback */
	onClick?: (log: LogEntry) => void;
}

/**
 * Represents a single log entry in the UI
 */
export class LogItem {
	private log: LogEntry;
	private options: Required<LogItemOptions>;
	private element: HTMLElement | null = null;
	private isMessageExpanded: boolean = false;
	private messageEl: HTMLElement | null = null;

	/**
	 * Default options
	 */
	private static readonly DEFAULT_OPTIONS: Required<LogItemOptions> = {
		maxMessageLength: 100,
		showTimestamp: true,
		onClick: () => {}
	};

	/**
	 * Level icons mapping
	 */
	private static readonly LEVEL_ICONS: Record<string, string> = {
		info: '🟢',
		warn: '🟡',
		error: '🔴'
	};

	/**
	 * Create a new LogItem instance
	 * @param log Log entry to render
	 * @param options Rendering options
	 */
	constructor(log: LogEntry, options?: LogItemOptions) {
		this.log = log;
		this.options = { ...LogItem.DEFAULT_OPTIONS, ...options };
	}

	/**
	 * Render the log item to a container element
	 * @param container Container element to render into
	 * @returns The rendered element
	 */
	render(container: HTMLElement): HTMLElement {
		// Create log entry element
		this.element = container.createDiv({
			cls: `console-log-entry console-log-${this.log.level}`
		});

		// Add timestamp if enabled
		if (this.options.showTimestamp) {
			this.renderTimestamp();
		}

		// Add level icon
		this.renderLevelIcon();

		// Add message (with truncation)
		this.renderMessage();

		// Add click handler
		if (this.options.onClick) {
			this.element.addEventListener('click', () => {
				this.options.onClick(this.log);
			});
		}

		return this.element;
	}

	/**
	 * Render timestamp element
	 */
	private renderTimestamp(): void {
		if (!this.element) return;

		const timeEl = this.element.createDiv({ cls: 'console-log-time' });
		timeEl.textContent = this.formatTimestamp(this.log.timestamp);
	}

	/**
	 * Render level icon element
	 */
	private renderLevelIcon(): void {
		if (!this.element) return;

		const iconEl = this.element.createDiv({ cls: 'console-log-icon' });
		iconEl.textContent = LogItem.LEVEL_ICONS[this.log.level] || '⚪';
	}

	/**
	 * Render message element (with truncation support)
	 */
	private renderMessage(): void {
		if (!this.element) return;

		this.messageEl = this.element.createDiv({ cls: 'console-log-message' });
		
		// Check if message should be truncated
		const shouldTruncate = this.log.message.length > this.options.maxMessageLength;
		
		if (shouldTruncate && !this.isMessageExpanded) {
			// Show truncated message
			const truncated = this.log.message.substring(0, this.options.maxMessageLength) + '...';
			this.messageEl.textContent = truncated;
			this.messageEl.addClass('truncated');

			// Add click handler to expand/collapse message
			this.messageEl.addEventListener('click', (e) => {
				e.stopPropagation(); // Prevent triggering item click
				this.toggleMessageExpand();
			});
		} else {
			// Show full message
			this.messageEl.textContent = this.log.message;
		}
	}

	/**
	 * Toggle message expanded/collapsed state
	 */
	private toggleMessageExpand(): void {
		if (!this.messageEl) return;

		// Only toggle if message was originally long enough to truncate
		if (this.log.message.length <= this.options.maxMessageLength) {
			return;
		}

		this.isMessageExpanded = !this.isMessageExpanded;

		if (this.isMessageExpanded) {
			// Show full message
			this.messageEl.textContent = this.log.message;
			this.messageEl.removeClass('truncated');
		} else {
			// Show truncated message
			const truncated = this.log.message.substring(0, this.options.maxMessageLength) + '...';
			this.messageEl.textContent = truncated;
			this.messageEl.addClass('truncated');
		}
	}

	/**
	 * Format timestamp to HH:MM:SS
	 * @param timestamp Date object
	 * @returns Formatted time string
	 */
	private formatTimestamp(timestamp: Date): string {
		const hours = timestamp.getHours().toString().padStart(2, '0');
		const minutes = timestamp.getMinutes().toString().padStart(2, '0');
		const seconds = timestamp.getSeconds().toString().padStart(2, '0');
		return `${hours}:${minutes}:${seconds}`;
	}

	/**
	 * Check if message is currently expanded
	 * @returns True if message is expanded
	 */
	isExpanded(): boolean {
		return this.isMessageExpanded;
	}

	/**
	 * Get the log entry
	 * @returns Log entry
	 */
	getLog(): LogEntry {
		return this.log;
	}

	/**
	 * Get the rendered element
	 * @returns The rendered HTML element or null if not rendered
	 */
	getElement(): HTMLElement | null {
		return this.element;
	}

	/**
	 * Update options (useful for re-rendering)
	 * @param newOptions New options to apply
	 */
	updateOptions(newOptions: Partial<LogItemOptions>): void {
		this.options = { ...this.options, ...newOptions };
	}

	/**
	 * Destroy the log item (cleanup)
	 */
	destroy(): void {
		if (this.element) {
			this.element.remove();
			this.element = null;
			this.messageEl = null;
		}
	}
}