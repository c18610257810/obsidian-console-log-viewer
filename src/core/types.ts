/**
 * Log level type
 */
export type LogLevel = 'info' | 'warn' | 'error';

/**
 * Log entry interface
 */
export interface LogEntry {
	/** Unique identifier for the log entry */
	id: string;
	/** Timestamp when the log was captured */
	timestamp: Date;
	/** Log level (info, warn, error) */
	level: LogLevel;
	/** Formatted message string */
	message: string;
	/** Original arguments passed to console method */
	args: any[];
	/** Stack trace information (optional) */
	stackTrace?: string;
}

/**
 * Console hook configuration
 */
export interface ConsoleHookConfig {
	/** Maximum number of logs to keep in memory */
	maxLogs?: number;
	/** Whether to capture stack traces */
	captureStackTrace?: boolean;
	/** Callback function when a log is captured */
	onLogCapture?: (entry: LogEntry) => void;
	/** Whether to also call the original console method */
	passThrough?: boolean;
}

/**
 * Console method names
 */
export type ConsoleMethodName = 'log' | 'info' | 'warn' | 'error';

/**
 * Original console methods storage
 */
export interface OriginalConsole {
	log: typeof console.log;
	info: typeof console.info;
	warn: typeof console.warn;
	error: typeof console.error;
}