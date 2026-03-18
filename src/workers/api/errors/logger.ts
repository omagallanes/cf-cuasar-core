/**
 * Structured Logger for VaaIA API Worker
 * 
 * Provides structured logging with severity levels and context.
 * Designed for Cloudflare Workers environment with console-based logging.
 */

import { ErrorSeverity } from './types';

/**
 * Log entry structure for structured logging
 */
export interface LogEntry {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Log level */
  level: string;
  /** Log message */
  message: string;
  /** Error code (if applicable) */
  code?: string;
  /** HTTP status code (if applicable) */
  statusCode?: number;
  /** Request ID or correlation ID */
  requestId?: string;
  /** Additional context */
  context?: Record<string, any>;
  /** Error stack trace (only in development) */
  stack?: string;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Log level threshold */
  level: 'debug' | 'info' | 'warn' | 'error';
  /** Environment name */
  environment: 'development' | 'staging' | 'production';
  /** Whether to include stack traces */
  includeStackTraces: boolean;
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  level: 'info',
  environment: 'production',
  includeStackTraces: false
};

/**
 * Structured Logger class
 */
export class StructuredLogger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Creates a log entry with common fields
   */
  private createLogEntry(
    level: string,
    message: string,
    additionalFields: Record<string, any> = {}
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...additionalFields
    };
  }

  /**
   * Formats a log entry for console output
   */
  private formatLogEntry(entry: LogEntry): string {
    // In production, use JSON format for structured logging
    if (this.config.environment === 'production') {
      return JSON.stringify(entry);
    }
    
    // In development, use readable format
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
      entry.message
    ];
    
    if (entry.code) parts.push(`(code: ${entry.code})`);
    if (entry.statusCode) parts.push(`(status: ${entry.statusCode})`);
    if (entry.requestId) parts.push(`(requestId: ${entry.requestId})`);
    
    return parts.join(' ');
  }

  /**
   * Logs a debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      const entry = this.createLogEntry('debug', message, context);
      console.debug(this.formatLogEntry(entry));
    }
  }

  /**
   * Logs an info message
   */
  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      const entry = this.createLogEntry('info', message, context);
      console.info(this.formatLogEntry(entry));
    }
  }

  /**
   * Logs a warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      const entry = this.createLogEntry('warn', message, context);
      console.warn(this.formatLogEntry(entry));
    }
  }

  /**
   * Logs an error message
   */
  error(message: string, error?: Error | any, context?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      const entry = this.createLogEntry('error', message, {
        ...context,
        stack: this.config.includeStackTraces && error?.stack ? error.stack : undefined
      });
      console.error(this.formatLogEntry(entry));
    }
  }

  /**
   * Logs an error with structured error information
   */
  logError(
    message: string,
    errorCode: string,
    statusCode: number,
    severity: ErrorSeverity,
    error?: Error | any,
    context?: Record<string, any>
  ): void {
    const entry = this.createLogEntry('error', message, {
      code: errorCode,
      statusCode,
      severity,
      ...context,
      stack: this.config.includeStackTraces && error?.stack ? error.stack : undefined
    });
    console.error(this.formatLogEntry(entry));
  }

  /**
   * Checks if a log level should be logged based on configuration
   */
  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevel = levels.indexOf(this.config.level);
    const messageLevel = levels.indexOf(level);
    return messageLevel >= configLevel;
  }

  /**
   * Updates logger configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Default logger instance
 */
export const logger = new StructuredLogger({
  level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
  environment: (process.env.ENVIRONMENT as 'development' | 'staging' | 'production') || 'production',
  includeStackTraces: process.env.ENVIRONMENT === 'development'
});
