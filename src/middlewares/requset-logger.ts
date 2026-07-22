import morgan from "morgan";
import { logger } from "../lib/logger";

const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

const requestLogger = morgan("combined", { stream });

export { requestLogger };
