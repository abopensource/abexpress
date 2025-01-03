import fs from "fs"
import path from "path"
import split from "split"
import winston from "winston"
import winstonDaily from "winston-daily-rotate-file"

import { applyConfig } from "./config.js"

/**
 * @constant {Array} LEVELS List of log levels.
 */
const LEVELS = ["error", "warn", "info", "http", "verbose", "debug", "silly"]

/**
 * Creates and returns a `winston` logger instance with the custom configuration object applied.
 *
 * @method createLogger
 * @param {Object} [custom={}] Custom configuration object(`CONFIG`) for the `ABExpress` framework.
 * @returns {import('winston').Logger} Created `winston` logger instance.
 */
const createLogger = (config = {}) => {
  config = applyConfig(config)
  config = config?.logger

  const logger = winston.createLogger({ transports: setTransports(config) })

  if (config.stream !== false) {
    logger.stream = split().on("data", (message) => logger.http(message))
  }

  return logger
}

/**
 * Creates and returns a log output format(`winston.Format`) using the passed configuration object.
 *
 * @method logFormat
 * @param {Object} config Configuration object(`CONFIG.logger`) to use when creating a `winston.Logger` instance.
 * @returns {import('winston').Logform.Format} Log output format to use in `winston.Logger`.
 */
const logFormat = (config) => {
  const { combine, printf, splat, timestamp } = winston.format
  const formats = []

  const format = config?.timestamp || "YYYY-MM-DD HH:mm:ss.SSS"
  formats.push(timestamp({ format }))

  config?.splat !== false && formats.push(splat())

  formats.push(
    printf(({ level, message, timestamp }) => {
      return `[${timestamp} ${level.toUpperCase()}] ${message}`
    }),
  )

  return combine(...formats)
}

/**
 * Creates and returns `Transports` objects for log transporting using the passed configuration object.
 *
 * @method setTransports
 * @param {Object} config Configuration object(`CONFIG.logger`) to use when creating a `winston.Logger` instance.
 * @returns {import('winston/lib/winston/transports').Transports[]} List of created `Transports` instance objects.
 */
const setTransports = (config) => {
  const option = {}

  const pathLog = path.resolve(config?.file?.path || "logs")
  !fs.existsSync(pathLog) && fs.mkdirSync(pathLog)

  option.datePattern = config?.file?.date || "YYYYMMDD"
  option.dirname = pathLog
  option.format = logFormat(config)
  option.maxFiles = config?.file?.maxAge || "90d"
  option.maxSize = config?.file?.maxSize || "30m"

  let level = 3
  if (!isNaN(config?.level)) {
    level =
      config.level > 6 ? 6
      : config.level < 0 ? 0
      : config.level
  }

  const transports = []
  for (let i = 0; i <= level; i++) {
    transports.push(
      new winstonDaily({
        ...option,
        filename: `%DATE%-${LEVELS[i]}.log`,
        level: LEVELS[i],
      }),
    )
  }

  transports.push(new winston.transports.Console({ ...option, level: "silly" }))

  return transports
}

export { createLogger }
