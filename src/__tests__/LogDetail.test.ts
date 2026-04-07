import { LogEntry } from '../core/types';
import { LogDetail } from '../ui/LogDetail';
import { setupObsidianMock, cleanupObsidianMock } from './obsidian-mock';
import { App } from 'obsidian';

describe('LogDetail', () => {
	let containerEl: HTMLElement;
	let mockLog: LogEntry;
	let mockApp: App;

	beforeEach(() => {
		setupObsidianMock();
		containerEl = document.createElement('div');
		
		// Create mock App
		mockApp = {
			workspace: {
				activeLeaf: null
			}
		} as App;
		
		mockLog = {
			id: 'log-test-123',
			timestamp: new Date('2026-04-07T10:34:12'),
			level: 'info',
			message: 'Test log message',
			args: [{ key: 'value', count: 42 }],
			stackTrace: 'at function1()\nat function2()'
		};
	});

	afterEach(() => {
		cleanupObsidianMock();
	});

	describe('formatTimestamp()', () => {
		it('should format timestamp as YYYY-MM-DD HH:MM:SS', () => {
			const logDetail = new LogDetail(mockApp, mockLog);
			const formatted = (logDetail as any).formatTimestamp(mockLog.timestamp);
			expect(formatted).toBe('2026-04-07 10:34:12');
		});
	});

	describe('formatLogText()', () => {
		it('should format log with all fields', () => {
			const logDetail = new LogDetail(mockApp, mockLog);
			const formatted = (logDetail as any).formatLogText(mockLog);
			
			expect(formatted).toContain('[2026-04-07 10:34:12]');
			expect(formatted).toContain('[INFO]');
			expect(formatted).toContain('Test log message');
			expect(formatted).toContain('Args:');
			expect(formatted).toContain('Stack:');
		});

		it('should format log without args when missing', () => {
			const logWithoutArgs: LogEntry = {
				...mockLog,
				args: []
			};
			
			const logDetail = new LogDetail(mockApp, logWithoutArgs);
			const formatted = (logDetail as any).formatLogText(logWithoutArgs);
			
			expect(formatted).not.toContain('Args:');
		});

		it('should format log without stack trace when missing', () => {
			const logWithoutStack: LogEntry = {
				...mockLog,
				stackTrace: undefined
			};
			
			const logDetail = new LogDetail(mockApp, logWithoutStack);
			const formatted = (logDetail as any).formatLogText(logWithoutStack);
			
			expect(formatted).not.toContain('Stack:');
		});
	});

	describe('formatLogsAsText()', () => {
		it('should format multiple logs', () => {
			const logs: LogEntry[] = [
				mockLog,
				{ ...mockLog, id: 'log-2', message: 'Second log' }
			];
			
			const logDetail = new LogDetail(mockApp, mockLog);
			const formatted = (logDetail as any).formatLogsAsText(logs);
			
			expect(formatted).toContain('Test log message');
			expect(formatted).toContain('Second log');
			expect(formatted).toContain('---\n');
		});
	});

	describe('copyToClipboard()', () => {
		it('should copy text to clipboard', async () => {
			const mockClipboard = {
				writeText: jest.fn().mockResolvedValue(undefined)
			};
			
			Object.assign(navigator, {
				clipboard: mockClipboard
			});

			const logDetail = new LogDetail(mockApp, mockLog);
			await (logDetail as any).copyToClipboard('test text');
			
			expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
		});
	});

	describe('exportAsText()', () => {
		it('should create a text file with logs', () => {
			const logs: LogEntry[] = [mockLog];
			const logDetail = new LogDetail(mockApp, mockLog);
			
			const blob = (logDetail as any).exportAsText(logs);
			
			expect(blob).toBeInstanceOf(Blob);
			expect(blob.type).toBe('text/plain;charset=utf-8');
		});
	});

	describe('exportAsJSON()', () => {
		it('should create a JSON file with logs', () => {
			const logs: LogEntry[] = [mockLog];
			const logDetail = new LogDetail(mockApp, mockLog);
			
			const blob = (logDetail as any).exportAsJSON(logs);
			
			expect(blob).toBeInstanceOf(Blob);
			expect(blob.type).toBe('application/json;charset=utf-8');
		});

		it('should format JSON with proper structure', (done) => {
			const logs: LogEntry[] = [mockLog];
			const logDetail = new LogDetail(mockApp, mockLog);
			
			const blob = (logDetail as any).exportAsJSON(logs);
			
			// Use FileReader to read blob contents
			const reader = new FileReader();
			reader.onload = () => {
				const text = reader.result as string;
				const parsed = JSON.parse(text);
				
				expect(parsed).toBeInstanceOf(Array);
				expect(parsed[0]).toHaveProperty('id');
				expect(parsed[0]).toHaveProperty('timestamp');
				expect(parsed[0]).toHaveProperty('level');
				expect(parsed[0]).toHaveProperty('message');
				
				done();
			};
			reader.readAsText(blob);
		});
	});
});