import { ConsoleHook, hookConsole, restoreConsole, getConsoleHook } from '../core/ConsoleHook';
import { LogEntry, LogLevel } from '../core/types';

describe('ConsoleHook', () => {
	let consoleHook: ConsoleHook;
	let capturedLogs: LogEntry[];

	beforeEach(() => {
		// Reset captured logs
		capturedLogs = [];
		
		// Create a new ConsoleHook instance with callback
		consoleHook = new ConsoleHook({
			maxLogs: 10,
			captureStackTrace: true,
			onLogCapture: (entry: LogEntry) => {
				capturedLogs.push(entry);
			},
			passThrough: false // Don't output to console during tests
		});
	});

	afterEach(() => {
		// Restore console after each test
		consoleHook.restore();
	});

	describe('hook()', () => {
		it('should successfully intercept console.log calls', () => {
			consoleHook.hook();
			
			console.log('test message');
			
			expect(capturedLogs.length).toBe(1);
			expect(capturedLogs[0].message).toBe('test message');
			expect(capturedLogs[0].level).toBe('info');
		});

		it('should intercept console.info calls', () => {
			consoleHook.hook();
			
			console.info('info message');
			
			expect(capturedLogs.length).toBe(1);
			expect(capturedLogs[0].level).toBe('info');
		});

		it('should intercept console.warn calls', () => {
			consoleHook.hook();
			
			console.warn('warning message');
			
			expect(capturedLogs.length).toBe(1);
			expect(capturedLogs[0].level).toBe('warn');
		});

		it('should intercept console.error calls', () => {
			consoleHook.hook();
			
			console.error('error message');
			
			expect(capturedLogs.length).toBe(1);
			expect(capturedLogs[0].level).toBe('error');
		});

		it('should not hook twice', () => {
			consoleHook.hook();
			consoleHook.hook();
			
			console.log('test');
			
			expect(capturedLogs.length).toBe(1);
		});
	});

	describe('restore()', () => {
		it('should restore original console methods', () => {
			consoleHook.hook();
			console.log('captured');
			
			expect(capturedLogs.length).toBe(1);
			
			consoleHook.restore();
			capturedLogs = [];
			
			console.log('not captured');
			
			expect(capturedLogs.length).toBe(0);
		});

		it('should be safe to call restore multiple times', () => {
			consoleHook.hook();
			consoleHook.restore();
			consoleHook.restore();
			
			// Should not throw error
		});
	});

	describe('log format', () => {
		it('should include timestamp', () => {
			consoleHook.hook();
			
			const before = new Date();
			console.log('test');
			const after = new Date();
			
			expect(capturedLogs[0].timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
			expect(capturedLogs[0].timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
		});

		it('should include level', () => {
			consoleHook.hook();
			
			console.log('info');
			console.warn('warn');
			console.error('error');
			
			expect(capturedLogs[0].level).toBe('info');
			expect(capturedLogs[1].level).toBe('warn');
			expect(capturedLogs[2].level).toBe('error');
		});

		it('should include message', () => {
			consoleHook.hook();
			
			console.log('Hello', 'World', 123);
			
			expect(capturedLogs[0].message).toBe('Hello World 123');
		});

		it('should include original args', () => {
			consoleHook.hook();
			
			const obj = { key: 'value' };
			console.log('test', obj, 123);
			
			expect(capturedLogs[0].args[0]).toBe('test');
			expect(capturedLogs[0].args[1]).toBe(obj);
			expect(capturedLogs[0].args[2]).toBe(123);
		});

		it('should include stack trace when enabled', () => {
			consoleHook.hook();
			
			console.log('test');
			
			expect(capturedLogs[0].stackTrace).toBeDefined();
			expect(capturedLogs[0].stackTrace!.length).toBeGreaterThan(0);
		});

		it('should not include stack trace when disabled', () => {
			const hookNoStack = new ConsoleHook({
				captureStackTrace: false,
				passThrough: false
			});
			
			hookNoStack.hook();
			
			console.log('test');
			
			const logs = hookNoStack.getLogs();
			expect(logs[0].stackTrace).toBeUndefined();
			
			hookNoStack.restore();
		});

		it('should generate unique IDs', () => {
			consoleHook.hook();
			
			console.log('test1');
			console.log('test2');
			console.log('test3');
			
			const ids = capturedLogs.map(log => log.id);
			const uniqueIds = new Set(ids);
			
			expect(uniqueIds.size).toBe(3);
		});
	});

	describe('maxLogs', () => {
		it('should enforce maximum log limit', () => {
			const hook = new ConsoleHook({
				maxLogs: 3,
				passThrough: false
			});
			
			hook.hook();
			
			console.log('log1');
			console.log('log2');
			console.log('log3');
			console.log('log4');
			
			const logs = hook.getLogs();
			expect(logs.length).toBe(3);
			expect(logs[0].message).toBe('log2'); // First log was removed
			expect(logs[2].message).toBe('log4');
			
			hook.restore();
		});
	});

	describe('passThrough', () => {
		it('should call original console when passThrough is true', () => {
			const originalLog = console.log;
			let callCount = 0;
			
			console.log = () => {
				callCount++;
			};
			
			const hook = new ConsoleHook({
				passThrough: true
			});
			
			hook.hook();
			console.log('test');
			
			expect(callCount).toBe(1);
			
			hook.restore();
			console.log = originalLog;
		});

		it('should not call original console when passThrough is false', () => {
			const originalLog = console.log;
			let callCount = 0;
			
			console.log = () => {
				callCount++;
			};
			
			const hook = new ConsoleHook({
				passThrough: false
			});
			
			hook.hook();
			console.log('test');
			
			expect(callCount).toBe(0);
			
			hook.restore();
			console.log = originalLog;
		});
	});

	describe('getLogs()', () => {
		it('should return all captured logs', () => {
			consoleHook.hook();
			
			console.log('test1');
			console.log('test2');
			
			const logs = consoleHook.getLogs();
			expect(logs.length).toBe(2);
		});

		it('should return a copy of logs array', () => {
			consoleHook.hook();
			
			console.log('test');
			
			const logs1 = consoleHook.getLogs();
			const logs2 = consoleHook.getLogs();
			
			expect(logs1).not.toBe(logs2); // Different array instances
			expect(logs1).toEqual(logs2); // Same content
		});
	});

	describe('clearLogs()', () => {
		it('should clear all captured logs', () => {
			consoleHook.hook();
			
			console.log('test1');
			console.log('test2');
			
			expect(consoleHook.getLogs().length).toBe(2);
			
			consoleHook.clearLogs();
			
			expect(consoleHook.getLogs().length).toBe(0);
		});
	});

	describe('isActive()', () => {
		it('should return true when hooked', () => {
			expect(consoleHook.isActive()).toBe(false);
			
			consoleHook.hook();
			
			expect(consoleHook.isActive()).toBe(true);
		});

		it('should return false when not hooked', () => {
			expect(consoleHook.isActive()).toBe(false);
		});

		it('should return false after restore', () => {
			consoleHook.hook();
			expect(consoleHook.isActive()).toBe(true);
			
			consoleHook.restore();
			
			expect(consoleHook.isActive()).toBe(false);
		});
	});
});

describe('Convenience functions', () => {
	afterEach(() => {
		restoreConsole();
	});

	it('hookConsole should create and hook a console hook', () => {
		const hook = hookConsole();
		
		expect(hook.isActive()).toBe(true);
	});

	it('restoreConsole should restore original console', () => {
		hookConsole();
		restoreConsole();
		
		const hook = getConsoleHook();
		expect(hook.isActive()).toBe(false);
	});

	it('getConsoleHook should return the same instance', () => {
		const hook1 = getConsoleHook();
		const hook2 = getConsoleHook();
		
		expect(hook1).toBe(hook2);
	});
});