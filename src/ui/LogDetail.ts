import { App, Modal, ButtonComponent, Setting } from 'obsidian';
import { LogEntry } from '../core/types';

/**
 * Modal to display detailed log information
 */
export class LogDetail extends Modal {
	private log: LogEntry;

	constructor(app: App, log: LogEntry) {
		super(app);
		this.log = log;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('console-log-detail-modal');

		// Title
		contentEl.createEl('h2', { text: 'Log Details' });

		// Timestamp
		new Setting(contentEl)
			.setName('Timestamp')
			.setDesc(this.formatTimestamp(this.log.timestamp));

		// Level
		new Setting(contentEl)
			.setName('Level')
			.setDesc(this.log.level.toUpperCase());

		// Message
		new Setting(contentEl)
			.setName('Message')
			.setDesc(this.log.message);

		// Arguments (if present)
		if (this.log.args && this.log.args.length > 0) {
			const argsSetting = new Setting(contentEl)
				.setName('Arguments');
			
			const argsEl = argsSetting.descEl.createDiv({ cls: 'console-log-detail-args' });
			argsEl.textContent = JSON.stringify(this.log.args, null, 2);
		}

		// Stack trace (if present)
		if (this.log.stackTrace) {
			const stackSetting = new Setting(contentEl)
				.setName('Stack Trace');
			
			const stackEl = stackSetting.descEl.createDiv({ cls: 'console-log-detail-stack' });
			stackEl.textContent = this.log.stackTrace;
		}

		// Buttons
		const buttonContainer = contentEl.createDiv({ cls: 'console-log-detail-buttons' });

		// Copy button
		new ButtonComponent(buttonContainer)
			.setButtonText('Copy')
			.setTooltip('Copy log to clipboard')
			.onClick(() => {
				this.copyLogToClipboard();
			});

		// Close button
		new ButtonComponent(buttonContainer)
			.setButtonText('Close')
			.setTooltip('Close modal')
			.onClick(() => {
				this.close();
			});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	/**
	 * Format timestamp as YYYY-MM-DD HH:MM:SS
	 * @param timestamp Date object
	 * @returns Formatted string
	 */
	private formatTimestamp(timestamp: Date): string {
		const year = timestamp.getFullYear();
		const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
		const day = timestamp.getDate().toString().padStart(2, '0');
		const hours = timestamp.getHours().toString().padStart(2, '0');
		const minutes = timestamp.getMinutes().toString().padStart(2, '0');
		const seconds = timestamp.getSeconds().toString().padStart(2, '0');
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}

	/**
	 * Format a single log entry as text
	 * @param log Log entry
	 * @returns Formatted text
	 */
	private formatLogText(log: LogEntry): string {
		let text = `[${this.formatTimestamp(log.timestamp)}] [${log.level.toUpperCase()}] ${log.message}`;
		
		if (log.args && log.args.length > 0) {
			text += `\nArgs: ${JSON.stringify(log.args, null, 2)}`;
		}
		
		if (log.stackTrace) {
			text += `\nStack: ${log.stackTrace}`;
		}
		
		return text;
	}

	/**
	 * Format multiple logs as text
	 * @param logs Array of log entries
	 * @returns Formatted text
	 */
	private formatLogsAsText(logs: LogEntry[]): string {
		return logs.map(log => this.formatLogText(log)).join('\n---\n');
	}

	/**
	 * Copy current log to clipboard
	 */
	private async copyLogToClipboard(): Promise<void> {
		const text = this.formatLogText(this.log);
		await this.copyToClipboard(text);
	}

	/**
	 * Copy text to clipboard
	 * @param text Text to copy
	 */
	private async copyToClipboard(text: string): Promise<void> {
		try {
			await navigator.clipboard.writeText(text);
			// Show success notification
			// @ts-ignore - accessing internal API
			if (this.app.workspace.activeLeaf?.view) {
				this.app.workspace.activeLeaf.view.containerEl.createDiv({
					cls: 'console-log-toast',
					text: 'Copied to clipboard'
				});
			}
		} catch (err) {
			console.error('Failed to copy to clipboard:', err);
		}
	}

	/**
	 * Export logs as text file
	 * @param logs Array of log entries
	 * @returns Blob containing text
	 */
	private exportAsText(logs: LogEntry[]): Blob {
		const text = this.formatLogsAsText(logs);
		return new Blob([text], { type: 'text/plain;charset=utf-8' });
	}

	/**
	 * Export logs as JSON file
	 * @param logs Array of log entries
	 * @returns Blob containing JSON
	 */
	private exportAsJSON(logs: LogEntry[]): Blob {
		const formattedLogs = logs.map(log => ({
			...log,
			timestamp: this.formatTimestamp(log.timestamp)
		}));
		const json = JSON.stringify(formattedLogs, null, 2);
		return new Blob([json], { type: 'application/json;charset=utf-8' });
	}

	/**
	 * Download a blob as a file
	 * @param blob Blob to download
	 * @param filename Filename for download
	 */
	private downloadBlob(blob: Blob, filename: string): void {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
}

/**
 * Export helper functions for LogPanel to use
 */

/**
 * Format logs as text for copying
 * @param logs Array of log entries
 * @returns Formatted text
 */
export function formatLogsForCopy(logs: LogEntry[]): string {
	const formatter = new LogDetail(null as any, logs[0]);
	return (formatter as any).formatLogsAsText(logs);
}

/**
 * Copy logs to clipboard
 * @param logs Array of log entries
 */
export async function copyLogsToClipboard(logs: LogEntry[]): Promise<void> {
	const text = formatLogsForCopy(logs);
	await navigator.clipboard.writeText(text);
}

/**
 * Export logs as text file
 * @param logs Array of log entries
 * @param filename Filename for download
 */
export function exportLogsAsText(logs: LogEntry[], filename: string = 'console-logs.txt'): void {
	const formatter = new LogDetail(null as any, logs[0]);
	const blob = (formatter as any).exportAsText(logs);
	(formatter as any).downloadBlob(blob, filename);
}

/**
 * Export logs as JSON file
 * @param logs Array of log entries
 * @param filename Filename for download
 */
export function exportLogsAsJSON(logs: LogEntry[], filename: string = 'console-logs.json'): void {
	const formatter = new LogDetail(null as any, logs[0]);
	const blob = (formatter as any).exportAsJSON(logs);
	(formatter as any).downloadBlob(blob, filename);
}