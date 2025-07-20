// src/common/Logger.ts

/**
 * A simple static logger class to handle different log levels.
 * It initializes its debug state from a config.json file.
 */
export class Logger {
    private static isDebugEnabled = false;

    static async init(): Promise<void> {
        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                console.error("Could not load config.json. Debug logging will be disabled.");
                return;
            }
            const config = await response.json();
            this.isDebugEnabled = !!config.debugLoggingEnabled;
            this.info("Logger initialized.");
            if (this.isDebugEnabled) {
                this.debug("Debug logging is enabled via config.json.");
            }
        } catch (error) {
            console.error("Error initializing logger from config.json:", error);
        }
    }
    
    static info(message: string, ...args: any[]): void {
        console.info(`[INFO] ${message}`, ...args);
    }

    static warn(message: string, ...args: any[]): void {
        console.warn(`[WARN] ${message}`, ...args);
    }

    static error(message: string, ...args: any[]): void {
        console.error(`[ERROR] ${message}`, ...args);
    }

    /**
     * Debug logs are only printed if the debug flag is enabled in config.json.
     */
    static debug(message: string, ...args: any[]): void {
        if (this.isDebugEnabled) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
}