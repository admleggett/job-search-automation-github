import { Logger } from "../interfaces";

/**
 * Simple console logger adapter for local development
 * Perfect for testing outside GitHub Actions environment
 */
export class ConsoleLogger implements Logger {
  constructor(private enableDebug: boolean = false) {}

  info(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  debug(message: string): void {
    if (this.enableDebug) {
      console.log(`🔍 ${message}`);
    }
  }

  error(message: string): void {
    console.error(`❌ ${message}`);
  }
}
