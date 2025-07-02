import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file'; 

const isProduction = process.env.NODE_ENV === 'production';

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }), 
  winston.format.splat(), 
  winston.format.metadata(), 
  winston.format.json()    
);

export const winstonConfig: winston.LoggerOptions = {
  level: isProduction ? 'info' : 'silly',
  transports: [
    new winston.transports.Console({
      silent: isProduction && !process.env.ENABLE_CONSOLE_LOGGING,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('Phono', { 
          colors: process.stdout.isTTY,
          prettyPrint: true,
        }),
      ),
    }),

    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log', 
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, 
      maxSize: '10m',      // Rotate files every 20 MB
      maxFiles: '7d',     // Keep logs for 14 days
      level: 'info',       // Log info, warn, error
      format: fileFormat,
    }),

    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',     // Keep error logs for longer
      level: 'error',      // Only log errors
      format: fileFormat,
    }),

  ],
  // (e.g., errors outside request-response cycle, though Nest tries to catch most)
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
  exitOnError: false,
};