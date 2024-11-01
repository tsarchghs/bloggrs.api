import * as winston from 'winston';

export function createLogger(context: string) {
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] [${context}] ${level}: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console()
    ]
  });
} 