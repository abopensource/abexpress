/**
 * @constant {Object} CONFIG Basic configuration object of `logger` and `server` in the `ABExpress` framework.
 */
const CONFIG = {
  /**
   * @property {Object} logger Default configuration object for `logger` in the `ABExpress` framework.
   * @see {@link https://github.com/winstonjs/winston}
   * @see {@link https://github.com/winstonjs/winston-daily-rotate-file}
   */
  logger: {
    /**
     * @property {Object} file Configuration object related to the log file.
     */
    file: {
      /**
       * @property {String} date Date format string to use in the filename of the log file.
       * @default "YYYYMMDD" Use the year-month-date(`"YYYYMMDD"`, example: 20241205-error.log) format in the log file name.
       */
      data: "YYYYMMDD",
      /**
       * @property {String} maxAge Maximum period of time to keep log files.
       * @default "90d" Keep log files for up to 90 days.
       */
      maxAge: "90d",
      /**
       * @property {String} maxSize Maximum size of a single log file.
       * @default "30m" If the size of a single log file exceeds 30MB, the log is written to a new log file.
       */
      maxSize: "30m",
      /**
       * @property {String} path Directory path where log files will be stored.
       * @default "logs" Log files are stored in a `logs` directory under the project root directory.
       */
      path: "logs",
    },
    /**
     * @property {Number} level Specifies the log level.
     * | Level | Method  |
     * |------:|:--------|
     * |     0 | error   |
     * |     1 | warn    |
     * |     2 | info    |
     * |     3 | http    |
     * |     4 | verbose |
     * |     5 | debug   |
     * |     6 | silly   |
     * @default 3 HTTP log.
     */
    level: 3,
    /**
     * @property {Boolean} splat Whether to use substitutions(`%d`, `%s`, etc.) when logging.
     * @default true Use substitutions(`%d`, `%s`, etc.) when logging.
     */
    splat: true,
    /**
     * @property {Boolean} stream Whether to log `HTTP` streams(`Request` and `Response`) using the `Morgan` middleware.
     * @default true Logging `HTTP` streams(`Request` and `Response`) using `Morgan` middleware.
     */
    stream: true,
    /**
     * @property {String} timestamp Datetime format string to use when printing the logging reception time in log messages.
     * @default "YYYY-MM-DD HH:mm:ss.SSS" Year-Month-Day hour:minute:second.millisecond format(e.g. 2024-12-05 13:21:59.924).
     */
    timestamp: "YYYY-MM-DD HH:mm:ss.SSS",
  },
  /**
   * @property {Object} server Default configuration object for `server` in the `ABExpress` framework.
   */
  server: {
    /**
     * @property {Object} compression Configuration object related to compression of `Response` to `Request`.
     * @see {@link https://expressjs.com/en/resources/middleware/compression.html}
     * @see {@link https://github.com/expressjs/compression}
     */
    compression: {
      /**
       * @property {Boolean} use Whether to use compression of `Response` to `Request`.
       * @default true Use compression of of `Response` to `Request`.
       */
      use: true,
    },
    /**
     * @property {Object} cors Configuration object related to `CORS`(Cross-Origin Resource Sharing) for `Express` server applications.
     * @see {@link https://expressjs.com/en/resources/middleware/cors.html}
     * @see {@link https://github.com/expressjs/cors}
     */
    cors: {
      /**
       * @property {Array} allowList List of domains for which `CORS`(Cross-Origin Resource Sharing) will be allowed.
       * @default [] There are no domains that allow `CORS`(Cross-Origin Resource Sharing).
       */
      allowList: [],
      /**
       * @property {Object} option Settings object to pass to the `cors` module.
       * @see {@link https://github.com/expressjs/cors}
       */
      option: {
        /**
         * @property {Boolean|String|RegExp|Array|Function} origin `Access-Control-Allow-Origin` header for `CORS` (Cross-Origin Resource Sharing).
         * @default false `CORS`(Cross-Origin Resource Sharing) is not allowed.
         */
        origin: false,
        /**
         * @property {Number} optionsSuccessStatus Specifies the `HTTP` status code that will be considered successful for the request, as some legacy browsers(e.g. IE11, SmartTV) block the `HTTP` status code `204`.
         * @default 200 `HTTP` status code `200`.
         */
        optionsSuccessStatus: 200,
      },
      /**
       * @property {Boolean} use Whether to use the `cors` module to allow `CORS`(Cross-Origin Resource Sharing).
       * @default false Not using the `cors` module.
       */
      use: false,
      /**
       * @property {Array} userAgent List of `userAgent` strings that will allow `CORS`(Cross-Origin Resource Sharing).
       * @default [] No `userAgent` is found that allows `CORS`(Cross-Origin Resource Sharing).
       */
      userAgent: [],
    },
    /**
     * @property {Object} error Configuration object related to `Express` server application errors.
     */
    error: {
      /**
       * @property {Boolean} ignore404 Whether to ignore the error and use the default page when a `404`(Not Found) error occurs.
       * @default false Use `404`(Not Found) error.
       */
      ignore404: false,
    },
    /**
     * @property {Object} helmet Configuration object related to `helmet` that middleware hardens the security of `Express` server applications by setting HTTP Response headers.
     * @see {@link https://github.com/helmetjs/helmet}
     */
    helmet: {
      /**
       * @property {Object|null} option Configuration object for the `helmet` middleware for enhanced security.
       * @default null Use the default configuration of the `helmet` middleware.
       */
      option: null,
      /**
       * @property {Boolean} use Whether to use `helmet` middleware for enhanced security.
       * @default true Use the `helmet` middleware.
       */
      use: true,
    },
    /**
     * @property {Express.Router} router `Router` instance object to use in `Express` server application instance.
     * @default null Not using a `Router` instance object.
     */
    router: null,
    /**
     * @property {Object} parser Configuration object for the `Request` data parser.
     */
    parser: {
      /**
       * @property {Boolean} cookie Whether to parse `Cookie` and convert it into an object.
       * @default true Parse `Cookie` and convert it into an object.
       * @see {@link https://expressjs.com/en/resources/middleware/cookie-parser.html}
       * @see {@link https://github.com/expressjs/cookie-parser}
       */
      cookie: true,
      /**
       * @property {Boolean} extendedURLEncoded Whether to parse `URL` query string data using the `qs` library.
       * @default true Parse `URL` query string data using the `qs` library.
       * @see {@link https://expressjs.com/en/api.html#express.urlencoded}
       * @see {@link https://github.com/ljharb/qs}
       */
      extendedURLEncoded: true,
      /**
       * @property {Boolean} json Whether to convert `Request` data received in `JSON` format to `JSON`.
       * @default true Converts `Request` data received in `JSON` format to `JSON`.
       * @see {@link https://expressjs.com/en/api.html#express.json}
       */
      json: true,
    },
    /**
     * @property {Number|String} port Port on which the `Express` server application will listen.
     * @default 80 `80` Port.
     */
    port: 80,
    /**
     * @property {Object} session Configuration object related to `express-session` module used for the `Session` of `Express` server application.
     * @see {@link https://expressjs.com/en/resources/middleware/cookie-session.html}
     * @see {@link https://github.com/expressjs/session}
     */
    session: {
      /**
       * @property {Object} cookie Configuration object related to `Cookie` from the `express-session` module to be used in `Express` server applications.
       */
      cookie: {
        /**
         * @property {String|null} domain Domain for `Cookie`.
         * By default, no domain is set, and most clients assume that the cookie applies only to the current domain.
         * @default null No domain is set(`Cookie` will only be usable on that domain).
         */
        domain: null,
        /**
         * @property {Boolean} httpOnly Whether `Cookie` should be transmitted only via `HTTP` and not via client JavaScript to protect against `XSS`(Cross-Site Scripting) attacks.
         * @default true Set `Cookie` to be transmitted only via `HTTP`.
         */
        httpOnly: true,
        /**
         * @property {Number|Null} maxAge The number(in milliseconds) to use when calculating the `Cookie` expiration time.
         * @default null No expiration time specified(`Cookie` will be deleted when the client application exits).
         */
        maxAge: null,
        /**
         * @property {String} path Path to apply to `Cookie`.
         * @default "/" The root path(`"/"`) of the domain(`Cookie` is accessible from all paths in that domain).
         */
        path: "/",
        /**
         * @property {Boolean} secure Whether to transmit `Cookie` only over `HTTPS` connections.
         * `secure` option is the recommended option is `true`(cookie security), but requires an `HTTPS` connection.
         * If your `Express` server application is served behind a proxy and you set the `secure` option to `true`,
         * you will need to set `trust proxy`(@see trustProxy configuration) in `Express`.
         * @default false Pass `Cookie` even if it is not an `HTTPS` connection.
         */
        secure: false,
      },
      /**
       * @property {Boolean} resave Whether to force the `Session` to be saved back to the `Session` store even if the `Session` was not modified during the `Request`.
       * @default false If `Session` is not modified, `Session` is not saved again.
       */
      resave: false,
      /**
       * @property {Boolean} saveUninitialized Whether to store uninitialized `Session`s in storage.
       * @default false Uninitialized `Session`s are not stored in the storage.
       */
      saveUninitialized: false,
      /**
       * @property {String} secret Secret string to use when signing `Session` `Cookie`s.
       * @default "9929562E21BBA24FD572C5EED42A41C3457D56852A5E5AF067071956FF878A01" encrypted by SHA256
       */
      secret:
        "9929562E21BBA24FD572C5EED42A41C3457D56852A5E5AF067071956FF878A01",
    },
    /**
     * @property {String} static Directory path for static files.
     * @default "public" The `public` directory in the project root directory.
     * @see {@link https://expressjs.com/en/api.html#express.static}
     */
    static: "public",
    /**
     * @property {String} timeout Amount of time to use as the `Request` `timeout`.
     * @default "10s" 10 seconds.
     * @see {@link https://expressjs.com/en/resources/middleware/timeout.html}
     * @see {@link https://github.com/expressjs/timeout}
     */
    timeout: "10s",
    /**
     * @property {Boolean} trustProxy If your `Express` server application is served behind a proxy, you must set `trust proxy` in `Express`.
     * @default true Use `trust proxy`.
     * @see {@link https://expressjs.com/en/5x/api.html#app.set}
     */
    trustProxy: true,
    /**
     * @property {Object} view Configuration object related to the view engine of an `Express` server application.
     */
    view: {
      /**
       * @property {String} engine View engine to use in `Express` server applications.
       * @default "pub" Using `pug` as the view engine.
       * @see {@link https://expressjs.com/en/guide/using-template-engines.html}
       * @see {@link https://pugjs.org/api/getting-started.html}
       */
      engine: "pug",
      /**
       * @property {String|Array} views Path to the view pages to be used in the `Express` server application.
       * @default "views" The `views` directory in the project root directory.
       * @see {@link https://expressjs.com/en/guide/using-template-engines.html}
       */
      path: "views",
    },
  },
}

/**
 * Returns a configuration object that reflects a custom configuration object(`custom`) for the `ABExpress` framework.
 *
 * @method applyConfig
 * @param {Object} [custom={}] Custom configuration object for the `ABExpress` framework.
 * @param {Object} [basic=CONFIG] Basic configuration object for the `ABExpress` framework.
 * @returns {Object} Configuration object that applied a `custom` configuration object for the `ABExpress` framework.
 */
const applyConfig = (custom = {}, basic = CONFIG) => {
  for (const key in basic) {
    if (basic[key]?.constructor.name === "Object") {
      if (custom[key]?.constructor.name === "Object") {
        custom[key] = applyConfig(custom[key] || {}, basic[key])
      } else {
        custom[key] = basic[key]
      }
    } else {
      custom[key] = custom[key] !== undefined ? custom[key] : basic[key]
    }
  }

  return custom
}

export { applyConfig }
