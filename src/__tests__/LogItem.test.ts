import { LogEntry } from '../core/types';
import { LogItem } from '../ui/LogItem';
import { setupObsidianMock, cleanupObsidianMock } from './obsidian-mock';

describe('LogItem', () => {
	// Mock DOM element
	let containerEl: HTMLElement;

	beforeEach(() => {
		// Setup Obsidian mock
		setupObsidianMock();
		
		// Create a mock container element
		containerEl = document.createElement('div');
	});

	afterEach(() => {
		// Cleanup Obsidian mock
		cleanupObsidianMock();
	});

	describe('render()', () => {
		it('should render a log entry with all components', () => {
			const log: LogEntry = {
				id: 'log-123',
				timestamp: new Date('2024-01-01T10:30:45'),
				level: 'info',
				message: 'Test message',
				args: ['Test message']
			};

			const logItem = new LogItem(log);
			const element = logItem.render(containerEl);

			// Check that element was created
			expect(element).toBeDefined();
			expect(element.className).toContain('console-log-entry');
			expect(element.className).toContain('console-log-info');
		});

		it('should display timestamp in HH:MM:SS format', () => {
			const log: LogEntry = {
				id: 'log-123',
				timestamp: new Date('2024-01-01T10:30:45'),
				level: 'info',
				message: 'Test message',
				args: ['Test message']
			};

			const logItem = new LogItem(log);
			const element = logItem.render(containerEl);

			const timeEl = element.querySelector('.console-log-time');
			expect(timeEl).toBeDefined();
			expect(timeEl?.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
		});

		it('should display correct level icons', () => {
			const levels: Array<{ level: 'info' | 'warn' | 'error', icon: string }> = [
				{ level: 'info', icon: '🟢' },
				{ level: 'warn', icon: '🟡' },
				{ level: 'error', icon: '🔴' }
			];

			levels.forEach(({ level, icon }) => {
				const log: LogEntry = {
					id: `log-${level}`,
					timestamp: new Date(),
					level: level,
					message: 'Test message',
					args: ['Test message']
				};

				const logItem = new LogItem(log);
				const element = logItem.render(containerEl);

				const iconEl = element.querySelector('.console-log-icon');
				expect(iconEl?.textContent).toBe(icon);
			});
		});

		it('should truncate long messages', () => {
			const longMessage = 'This is a very long message that should be truncated because it exceeds the maximum display length';
			const log: LogEntry = {
				id: 'log-123',
				timestamp: new Date(),
				level: 'info',
				message: longMessage,
				args: [longMessage]
			};

			const logItem = new LogItem(log, { maxMessageLength: 50 });
			const element = logItem.render(containerEl);

			const messageEl = element.querySelector('.console-log-message');
			expect(messageEl?.textContent?.length).toBeLessThanOrEqual(53); // 50 + '...'
		});

		it('should not truncate short messages', () => {
			const shortMessage = 'Short message';
			const log: LogEntry = {
				id: 'log-123',
				timestamp: new Date(),
				level: 'info',
				message: shortMessage,
				args: [shortMessage]
			};

			const logItem = new LogItem(log);
			const element = logItem.render(containerEl);

			const messageEl = element.querySelector('.console-log-message');
			expect(messageEl?.textContent).toBe(shortMessage);
		});
	});

	describe('click behavior', () => {
		it('should trigger onClick callback when clicked', () => {
			const log: LogEntry = {
				id: 'log-123',
				timestamp: new Date(),
				level: 'info',
				message: 'Test message',
				args: ['Test message']
			};

			let clickedLog: LogEntry | null = null;
			const logItem = new LogItem(log, {
				onClick: (entry) => {
					clickedLog = entry;
				}
			});

			const element = logItem.render(containerEl);

			// Simulate click
			element.click();

			expect(clickedLog).toBe(log);
		});

		it('should show full message when truncated message is clicked', () => {
			const longMessage = 'This is a very long message that should be truncated';
			const log: LogEntry = {
				id: 'log-123',
				timestamp: new Date(),
				level: 'info',
				message: longMessage,
				args: [longMessage]
			};

			const logItem = new LogItem(log, { maxMessageLength: 20 });
			const element = logItem.render(containerEl);

			// Initially truncated
			const messageEl = element.querySelector('.console-log-message') as unknown as HTMLElement;
			expect(messageEl?.textContent).toContain('...');

			// Click to expand
			messageEl?.click();

			// Should show full message
			expect(messageEl?.textContent).toBe(longMessage);
		});
	});

	describe('expand/collapse behavior', () => {
		it('should toggle expanded state on click', () => {
			const longMessage = 'This is a very long message that should be truncated when collapsed';
			const log: LogEntry = {
				id: 'log-123',
				timestamp: new Date(),
				level: 'info',
				message: longMessage,
				args: [longMessage]
			};

			const logItem = new LogItem(log, { maxMessageLength: 20 });
			const element = logItem.render(containerEl);

			const messageEl = element.querySelector('.console-log-message') as unknown as HTMLElement;

			// Initially collapsed
			expect(logItem.isExpanded()).toBe(false);

			// Click to expand
			messageEl?.click();
			expect(logItem.isExpanded()).toBe(true);

			// Click to collapse again
			messageEl?.click();
			expect(logItem.isExpanded()).toBe(false);
		});

		it('should not allow expansion for short messages', () => {
			const shortMessage = 'Short';
			const log: LogEntry = {
				id: 'log-123',
				timestamp: new Date(),
				level: 'info',
				message: shortMessage,
				args: [shortMessage]
			};

			const logItem = new LogItem(log);
			const element = logItem.render(containerEl);

			const messageEl = element.querySelector('.console-log-message') as unknown as HTMLElement;

			// Click should not expand
			messageEl?.click();
			expect(logItem.isExpanded()).toBe(false);
		});
	});

	describe('options', () => {
		it('should hide timestamp when showTimestamp is false', () => {
			const log: LogEntry = {
				id: 'log-123',
				timestamp: new Date(),
				level: 'info',
				message: 'Test message',
				args: ['Test message']
			};

			const logItem = new LogItem(log, { showTimestamp: false });
			const element = logItem.render(containerEl);

			const timeEl = element.querySelector('.console-log-time');
			expect(timeEl).toBeNull();
		});

		it('should show timestamp by default', () => {
			const log: LogEntry = {
				id: 'log-123',
				timestamp: new Date(),
				level: 'info',
				message: 'Test message',
				args: ['Test message']
			};

			const logItem = new LogItem(log);
			const element = logItem.render(containerEl);

			const timeEl = element.querySelector('.console-log-time');
			expect(timeEl).toBeDefined();
		});
	});
});