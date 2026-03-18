/**
 * Structured Logger for VaaIA API Worker
 * 
 * Provides structured logging with severity levels and context.
 * Designed for Cloudflare Workers environment with console-based logging.
 * 
 * Log levels:
 * - error: Critical errors that need immediate attention
 * - warn: Warning messages for potentially harmful situations
 * - info: Informational messages about normal operations
 * - debug: Detailed debugging information for development
 * 
 * @module utils/logger
 */

/**
 * Log level type
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Environment type
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Log entry structure for structured logging
 */
export interface LogEntry {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Log level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Error code (if applicable) */
  code?: string;
  /** HTTP status code (if applicable) */
  statusCode?: number;
  /** Request ID or correlation ID */
  requestId?: string;
  /** User ID (if applicable) */
  userId?: string;
  /** Additional context */
  context?: Record<string, any>;
  /** Error stack trace (only in development) */
  stack?: string;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Log level threshold - only logs at or above this level will be output */
  level: LogLevel;
  /** Environment name */
  environment: Environment;
  /** Whether to include stack traces in error logs */
  includeStackTraces: boolean;
  /** Whether to use JSON format for structured logging */
  useJsonFormat: boolean;
}

/**
 * Log level priority for filtering (higher = more severe)
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  level: 'info',
  environment: 'production',
  includeStackTraces: false,
  useJsonFormat: true
};

/**
 * Structured Logger class
 * 
 * Provides configurable logging with structured output for Cloudflare Workers.
 * Supports log levels, context, and different output formats for different environments.
 */
export class StructuredLogger {
  private config: LoggerConfig;

  /**
   * Creates a new StructuredLogger instance
   * 
   * @param config - Partial configuration (merged with defaults)
   */
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Creates a log entry with common fields
   * 
   * @param level - Log level
   * @param message - Log message
   * @param additionalFields - Additional fields to include in the log entry
   * @returns Complete log entry
   */
  private createLogEntry(
    level: LogLevel,
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
   * 
   * Uses JSON format in production for structured logging,
   * and readable format in development for easier debugging.
   * 
   * @param entry - Log entry to format
   * @returns Formatted log string
   */
  private formatLogEntry(entry: LogEntry): string {
    // Use JSON format for structured logging in production
    if (this.config.useJsonFormat) {
      return JSON.stringify(entry);
    }
    
    // Use readable format in development
    const parts: string[] = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
      entry.message
    ];
    
    if (entry.code) parts.push(`(code: ${entry.code})`);
    if (entry.statusCode) parts.push(`(status: ${entry.statusCode})`);
    if (entry.requestId) parts.push(`(requestId: ${entry.requestId})`);
    if (entry.userId) parts.push(`(userId: ${entry.userId})`);
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(`(context: ${JSON.stringify(entry.context)})`);
    }
    
    return parts.join(' ');
  }

  /**
   * Checks if a log level should be logged based on configuration
   * 
   * @param level - Log level to check
   * @returns True if the log should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const configLevel = LOG_LEVEL_PRIORITY[this.config.level];
    const messageLevel = LOG_LEVEL_PRIORITY[level];
    return messageLevel >= configLevel;
  }

  /**
   * Logs a debug message
   * 
   * @param message - Log message
   * @param context - Additional context
   */
  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      const entry = this.createLogEntry('debug', message, context);
      console.debug(this.formatLogEntry(entry));
    }
  }

  /**
   * Logs an info message
   * 
   * @param message - Log message
   * @param context - Additional context
   */
  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      const entry = this.createLogEntry('info', message, context);
      console.info(this.formatLogEntry(entry));
    }
  }

  /**
   * Logs a warning message
   * 
   * @param message - Log message
   * @param context - Additional context
   */
  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      const entry = this.createLogEntry('warn', message, context);
      console.warn(this.formatLogEntry(entry));
    }
  }

  /**
   * Logs an error message
   * 
   * @param message - Log message
   * @param error - Error object (optional)
   * @param context - Additional context
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
   * 
   * @param message - Log message
   * @param code - Error code
   * @param statusCode - HTTP status code
   * @param error - Error object (optional)
   * @param context - Additional context
   */
  logError(
    message: string,
    code: string,
    statusCode: number,
    error?: Error | any,
    context?: Record<string, any>
  ): void {
    const entry = this.createLogEntry('error', message, {
      code,
      statusCode,
      ...context,
      stack: this.config.includeStackTraces && error?.stack ? error.stack : undefined
    });
    console.error(this.formatLogEntry(entry));
  }

  /**
   * Logs an HTTP request
   * 
   * @param method - HTTP method
   * @param path - Request path
   * @param statusCode - Response status code
   * @param duration - Request duration in milliseconds
   * @param requestId - Request ID
   * @param userId - User ID (optional)
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    requestId?: string,
    userId?: string
  ): void {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const entry = this.createLogEntry(level, `${method} ${path}`, {
      statusCode,
      duration,
      requestId,
      userId
    });
    this[level](entry.message, entry);
  }

  /**
   * Logs a database operation
   * 
   * @param operation - Database operation type
   * @param table - Table name
   * @param duration - Operation duration in milliseconds
   * @param context - Additional context
   */
  logDatabase(
    operation: string,
    table: string,
    duration: number,
    context?: Record<string, any>
  ): void {
    this.debug(`Database ${operation} on ${table}`, {
      ...context,
      duration
    });
  }

  /**
   * Logs a storage operation
   * 
   * @param operation - Storage operation type
   * @param key - Storage key
   * @param duration - Operation duration in milliseconds
   * @param context - Additional context
   */
  logStorage(
    operation: string,
    key: string,
    duration: number,
    context?: Record<string, any>
  ): void {
    this.debug(`Storage ${operation} on ${key}`, {
      ...context,
      duration
    });
  }

  /**
   * Updates logger configuration
   * 
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets current logger configuration
   * 
   * @returns Current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

/**
 * Creates a logger instance with request context
 * 
 * @param requestId - Request ID for correlation
 * @param userId - User ID (optional)
 * @returns Logger with pre-configured request context
 */
export function createRequestLogger(requestId: string, userId?: string): StructuredLogger {
  const logger = new StructuredLogger();
  const originalMethods = {
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger)
  };

  // Override methods to include request context
  logger.debug = (message: string, context?: Record<string, any>) => {
    originalMethods.debug(message, { ...context, requestId, userId });
  };

  logger.info = (message: string, context?: Record<string, any>) => {
    originalMethods.info(message, { ...context, requestId, userId });
  };

  logger.warn = (message: string, context?: Record<string, any>) => {
    originalMethods.warn(message, { ...context, requestId, userId });
  };

  logger.error = (message: string, error?: Error | any, context?: Record<string, any>) => {
    originalMethods.error(message, error, { ...context, requestId, userId });
  };

  return logger;
}

/**
 * Default logger instance
 * 
 * Configuration is read from environment variables:
 * - LOG_LEVEL: Log level threshold (debug, info, warn, error)
 * - ENVIRONMENT: Environment name (development, staging, production)
 */
export const logger = new StructuredLogger({
  level: (process.env.LOG_LEVEL as LogLevel) || 'info',
  environment: (process.env.ENVIRONMENT as Environment) || 'production',
  includeStackTraces: process.env.ENVIRONMENT === 'development',
  useJsonFormat: process.env.ENVIRONMENT !== 'development'
});
