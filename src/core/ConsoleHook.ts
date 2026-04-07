import { LogEntry, LogLevel, ConsoleHookConfig, ConsoleMethodName, OriginalConsole } from './types';

/**
 * Console API Hook
 * Intercepts all console.log/info/warn/error calls and captures them
 */
export class ConsoleHook {
	private originalConsole: OriginalConsole;
	private config: Required<ConsoleHookConfig>;
	private isHooked: boolean = false;
	private logs: LogEntry[] = [];
	private logCounter: number = 0;

	/**
	 * Create a new ConsoleHook instance
	 * @param config Configuration options
	 */
	constructor(config: ConsoleHookConfig = {}) {
		// Store original console methods before hooking
		// Check if console exists and has the required methods (might not exist on mobile)
		this.originalConsole = {
			log: (typeof console !== 'undefined' && typeof console.log === 'function') ? console.log.bind(console) : (() => {}),
			info: (typeof console !== 'undefined' && typeof console.info === 'function') ? console.info.bind(console) : (() => {}),
			warn: (typeof console !== 'undefined' && typeof console.warn === 'function') ? console.warn.bind(console) : (() => {}),
			error: (typeof console !== 'undefined' && typeof console.error === 'function') ? console.error.bind(console) : (() => {})
		};

		// Set default configuration
		this.config = {
			maxLogs: config.maxLogs ?? 100,
			captureStackTrace: config.captureStackTrace ?? true,
			onLogCapture: config.onLogCapture ?? (() => {}),
			passThrough: config.passThrough ?? true
		};
		
		// Log whether console is available
		const consoleAvailable = typeof console !== 'undefined' && typeof console.log === 'function';
		console.log(`Console API available: ${consoleAvailable}`);
	}

	/**
	 * Hook console methods to intercept calls
	 */
	hook(): void {
		if (this.isHooked) {
			return;
		}

		// Hook each console method
		this.hookMethod('log', 'info');
		this.hookMethod('info', 'info');
		this.hookMethod('warn', 'warn');
		this.hookMethod('error', 'error');

		this.isHooked = true;
	}

	/**
	 * Restore original console methods
	 */
	restore(): void {
		if (!this.isHooked) {
			return;
		}

		// Restore original console methods
		console.log = this.originalConsole.log;
		console.info = this.originalConsole.info;
		console.warn = this.originalConsole.warn;
		console.error = this.originalConsole.error;

		this.isHooked = false;
	}

	/**
	 * Get all captured logs
	 */
	getLogs(): LogEntry[] {
		return [...this.logs];
	}

	/**
	 * Add a manual log entry (useful for mobile where console might be disabled)
	 * @param level Log level
	 * @param message Log message
	 * @param args Additional arguments
	 */
	addManualLog(level: LogLevel, message: string, args: any[] = []): void {
		const entry: LogEntry = {
			id: this.generateId(),
			timestamp: new Date(),
			level: level,
			message: message,
			args: args,
			stackTrace: ''
		};
		this.addLog(entry);
	}

	/**
	 * Clear all captured logs
	 */
	clearLogs(): void {
		this.logs = [];
		this.logCounter = 0;
	}

	/**
	 * Check if console is currently hooked
	 */
	isActive(): boolean {
		return this.isHooked;
	}

	/**
	 * Hook a specific console method
	 * @param methodName Console method name
	 * @param level Log level to use
	 */
	private hookMethod(methodName: ConsoleMethodName, level: LogLevel): void {
		const self = this;
		const originalMethod = this.originalConsole[methodName];

		// Replace console method with interceptor
		(console as any)[methodName] = function(...args: any[]) {
			// Create log entry
			const entry = self.createLogEntry(level, args);

			// Store log
			self.addLog(entry);

			// Call callback
			self.config.onLogCapture(entry);

			// Optionally pass through to original console
			if (self.config.passThrough) {
				originalMethod.apply(console, args);
			}
		};
	}

	/**
	 * Create a log entry
	 * @param level Log level
	 * @param args Arguments passed to console method
	 */
	private createLogEntry(level: LogLevel, args: any[]): LogEntry {
		const entry: LogEntry = {
			id: this.generateId(),
			timestamp: new Date(),
			level: level,
			message: this.formatMessage(args),
			args: args,
			stackTrace: this.config.captureStackTrace ? this.captureStackTrace() : undefined
		};

		return entry;
	}

	/**
	 * Generate a unique ID for each log entry
	 */
	private generateId(): string {
		return `log-${Date.now()}-${this.logCounter++}`;
	}

	/**
	 * Format log arguments into a message string
	 * @param args Arguments to format
	 */
	private formatMessage(args: any[]): string {
		return args.map(arg => {
			if (typeof arg === 'string') {
				return arg;
			} else if (arg instanceof Error) {
				return `${arg.name}: ${arg.message}`;
			} else {
				try {
					return JSON.stringify(arg);
				} catch (e) {
					return String(arg);
				}
			}
		}).join(' ');
	}

	/**
	 * Capture stack trace information
	 */
	private captureStackTrace(): string {
		const stack = new Error().stack;
		if (!stack) {
			return '';
		}

		// Remove the first few lines (Error creation and this method)
		const lines = stack.split('\n');
		// Skip lines related to Error construction and this method
		const relevantLines = lines.filter(line => 
			!line.includes('ConsoleHook.captureStackTrace') &&
			!line.includes('at new Error') &&
			!line.includes('Error')
		);

		return relevantLines.slice(0, 5).join('\n').trim();
	}

	/**
	 * Add a log entry to the logs array
	 * @param entry Log entry to add
	 */
	private addLog(entry: LogEntry): void {
		this.logs.push(entry);

		// Enforce max logs limit
		if (this.logs.length > this.config.maxLogs) {
			this.logs.shift();
		}
	}
}

/**
 * Singleton instance for convenience
 */
let defaultInstance: ConsoleHook | null = null;

/**
 * Get or create the default ConsoleHook instance
 * @param config Configuration options
 */
export function getConsoleHook(config?: ConsoleHookConfig): ConsoleHook {
	if (!defaultInstance) {
		defaultInstance = new ConsoleHook(config);
	}
	return defaultInstance;
}

/**
 * Hook console methods (convenience function)
 */
export function hookConsole(config?: ConsoleHookConfig): ConsoleHook {
	const hook = getConsoleHook(config);
	hook.hook();
	return hook;
}

/**
 * Restore original console methods (convenience function)
 */
export function restoreConsole(): void {
	if (defaultInstance) {
		defaultInstance.restore();
	}
}