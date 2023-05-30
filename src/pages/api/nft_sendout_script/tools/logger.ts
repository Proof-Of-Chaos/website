import log4js from "log4js";

const logLevel = process.env.LOG_LEVEL || "debug";
const isProduction = process.env.NODE_ENV === "production";

const apiFileCategory = "api";

log4js.configure({
  appenders: {
    [apiFileCategory]: { type: "file", filename: `log/error.log` },
    errorFile: {
      type: "file",
      filename: `log/errors.log`,
    },
    errors: {
      type: "logLevelFilter",
      level: "ERROR",
      appender: "errorFile",
    },
    out: { type: "stdout" },
    // all: {
    //   type: "file",
    //   filename: "log/all.log"
    // }
  },
  categories: {
    default: {
      appenders: [isProduction ? apiFileCategory : "out", "errors"],
      level: logLevel,
    }
  },
});

export const logger = log4js.getLogger(apiFileCategory);
