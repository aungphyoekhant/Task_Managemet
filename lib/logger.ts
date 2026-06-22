import winston from "winston";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

//Log file save to => foler path/logs/error.log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

//Development For color => log
const prettyFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
  }),
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,

  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === "production" ? prettyFormat : logFormat,
    }),

    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, //5MB
      maxFiles: 5,
    }),

    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, //5MB
      maxFiles: 5,
    }),
  ],

  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.debug("Logger is running in development mode");
}

export { logger };
