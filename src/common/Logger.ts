export class Logger {
    private static isDebugEnabled = false;

    static async init() {
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
                this.debug("Debug logging is enabled.");
            }
        } catch (error) {
            console.error("Error initializing logger from config.json:", error);
        }
    }
    
    static info(message: string, ...args: any[]) {
        console.info(`[INFO] ${message}`, ...args);
    }

    static warn(message: string, ...args: any[]) {
        console.warn(`[WARN] ${message}`, ...args);
    }

    static error(message: string, ...args: any[]) {
        console.error(`[ERROR] ${message}`, ...args);
    }

    // O log de debug só é impresso se a flag estiver ativa
    static debug(message: string, ...args: any[]) {
        if (this.isDebugEnabled) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
}