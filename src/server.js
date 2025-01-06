import compression from "compression"
import timeout from "connect-timeout"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import session from "express-session"
import fs from "fs"
import helmet from "helmet"
import http from "http"
import morgan from "morgan"
import path from "path"

import { applyConfig } from "./config.js"
import { createLogger } from "./logger.js"

/**
 * The `Router` interface of the `Express` framework.
 *
 * @module Router
 * @type {import('express').Router}
 */
const Router = express.Router

/**
 * Creates and returns an `Express` server application.
 *
 * @async
 * @method createServer
 * @param {Object} [config={}] Custom configuration object(`CONFIG`) for the `ABExpress` framework.
 * @returns {import('express').Express} Created `Express` server application instance.
 */
const createServer = async (config = {}) => {
  const _tag = "[ABExpress][server][createServer]"

  config = applyConfig(config)

  const log = createLogger(config)
  global.log = log

  log.debug(`${_tag} applied config: %o`, config)
  log.info(`${"-".repeat(80)}`)

  const app = express()
  setExpress(app, config.server)
  useExpress(app, config.server)

  if (config.logger?.stream && log?.stream) {
    log.debug(`${_tag} app use log stream with morgan`)
    app.use(morgan("combined", { stream: log.stream }))
  } else {
    log.debug(`${_tag} app use morgan`)
    app.use(morgan("combined"))
  }

  setRouter(app, config.server)

  const server = http.createServer(app)
  const port = getPort(config.server)
  const bind = typeof port === "string" ? `namepipe ${port}` : `${port} port`

  server.on("error", (error) => {
    const _tag = "[ABExpress][server][onError]"

    switch (error?.code) {
      case "EACCESS":
        log.error(`${_tag} ${bind} requires elevated privileges.`)
        process.exit()
        break
      case "EADDRINUSE":
        log.error(`${_tag} ${bind} is already in use.`)
        process.exit()
        break
      default:
        error?.message && log.error(`${_tag} error.message: ${error.message}`)
        log.error(`${_tag} error: %o`, error)
        throw error
    }
  })

  server.on("listening", () => {
    const _tag = "[ABExpress][server][onListening]"
    log.info(`${_tag} Listen on ${bind}`)
    log.info(`${"=".repeat(80)}`)

    const nodeEnv = process.env.NODE_ENV || "production"
    const NodeEnv = nodeEnv.replace(/\b[a-z]/, (c) => c.toUpperCase())
    log.info(`..... Starting ${NodeEnv} Environment .....`)
  })

  server.listen(port)
  app.server = server

  return app
}

/**
 * Returns the port on which the `Express` server application will listen.
 *
 * @method getPort
 * @param {Object} config Configuration object(`CONFIG.server`) to use when creating a `Express` server application instance.
 * @returns {Number|String} Port on which the `Express` server application will listen.
 */
const getPort = (config) => {
  const port = process.env.PORT || config.port || 80
  return isNaN(port) ? port : parseInt(port, 10)
}

/**
 * Sets up error handlers for an `Express` server application instance.
 *
 * @method setErrorHandler
 * @param {import('express').Express} app `Express` server application instance.
 * @param {Object} config Configuration object(`CONFIG.server`) to use when creating a `Express` server application instance.
 */
const setErrorHandler = (app, config) => {
  const _tag = "[ABExpress][server][setErrorHandler]"
  log.debug(`${_tag} Register error handlers`)

  const routers = app._router.stack
  routers.forEach((route, i, routers) => {
    // log.debug(`${_tag} route.name: %o`, route.name)
    switch (route.name) {
      case "ignore404":
      case "handle404":
      case "bound dispatch":
      case "handleError":
        routers.splice(i, 1)
    }
  })

  /**
   * `404`(Not Found) error handler.
   *
   * @method handle404
   * @param {import('express').Request} req HTTP `Request`.
   * @param {import('express').Response} res HTTP `Response`.
   * @param {import('express').NextFunction} next Next middleware call function.
   */
  const handle404 = (req, res, next) => {
    const _tag = "[ABExpress][server][handle404]"
    log.error(`${_tag} req.url: %o`, req.url)

    res.locals.errorCode = 404
    res.locals.errorMessage = "Not found"
    res.locals.error = new Error(res.locals.errorMessage)
    res.status(res.locals.errorCode)

    const ext = config.view?.engine
    const viewError = path.resolve(path.join(config.view?.path, `error.${ext}`))
    fs.existsSync(viewError) ? res.render("error") : next()
  }

  /**
   * Asynchronous routing error handler.
   *
   * @method handleAsyncError
   * @param {import('express').Request} req HTTP `Request`.
   * @param {import('express').Response} res HTTP `Response`.
   */
  const handleAsyncError = async (req, res) => {
    const _tag = "[ABExpress][server][handleAsyncError]"
    log.error(
      `${_tag} req.url: %o, res.statusCode: %o`,
      req.url,
      res.statusCode,
    )

    await new Promise((resolve) => setTimeout(() => resolve(), 50))
    throw new Error("Async error")
  }

  /**
   * Error handler.
   *
   * @method handleError
   * @param {import('express').Error} err `Error`.
   * @param {import('express').Request} req HTTP `Request`.
   * @param {import('express').Response} res HTTP `Response`.
   * @param {import('express').NextFunction} next Next middleware call function.
   */
  const handleError = (err, req, res, next) => {
    const _tag = "[ABExpress][server][handleError]"
    err?.status !== 404 &&
      log.error(`${_tag} req.url: %o, err.message: %o`, req.url, err.message)

    res.locals.errorCode = err?.status || 500
    res.locals.errorMessage = err?.message
    res.locals.error = process.env.NODE_ENV === "development" ? err?.stack : {}
    res.status(res.locals.errorCode)

    const ext = config.view?.engine
    const viewError = path.resolve(path.join(config.view?.path, `error.${ext}`))
    fs.existsSync(viewError) ? res.render("error") : next()
  }

  /**
   * Set to send the default page when a `404`(Not found) error occurs.
   *
   * @method ignore404
   * @param {import('express').Request} req HTTP `Request`.
   * @param {import('express').Response} res HTTP `Response`.
   */
  const ignore404 = (req, res) => {
    const _tag = "[ABExpress][server][ignore404]"
    log.error(`${_tag} req.url: %o`, req.url)

    res.sendFile("/", { root: config.static })
  }

  const wrapAsync = (callback) => (req, res, next) => {
    const _tag = "[ABExpress][server][wrapAsync]"
    log.error(`${_tag} req.url: %o`, req.url)

    callback(req, res, next).catch(next)
  }

  if (config.error?.ignore404) {
    log.debug(`${_tag} ignore 404 error`)
    app.get("*", ignore404)
  } else {
    app.use(handle404)
  }

  app.get("*", wrapAsync(handleAsyncError))
  app.use(handleError)
}

/**
 * Setting up an `Express` server application instance.
 *
 * @method setExpress
 * @param {import('express').Express} app `Express` server application instance.
 * @param {Object} config Configuration object(`CONFIG.server`) to use when creating a `Express` server application instance.
 */
const setExpress = (app, config) => {
  const _tag = "[ABExpress][server][setExpress]"

  const port = getPort(config)
  log.debug(`${_tag} app set port: %o`, port)
  app.set("port", port)

  log.debug(`${_tag} app set trust proxy: %o`, config.trustProxy)
  app.set("trust proxy", config.trustProxy)

  log.debug(`${_tag} app set view engine: %o`, config.view?.engine)
  config.view?.engine && app.set("view engine", config.view.engine)

  const pathViews = path.resolve(config.view?.path)
  log.debug(`${_tag} app set views: %o`, pathViews)
  if (fs.existsSync(pathViews)) {
    app.set("views", pathViews)
  } else {
    log.error(`${_tag} directory not exists for view pages: %o`, pathViews)
  }
}

/**
 * Sets the `Router` instance to be used by the `Express` server application instance.
 *
 * @method setRouter
 * @param {import('express').Express} app `Express` server application instance.
 * @param {Object} config Configuration object(`CONFIG.server`) to use when creating a `Express` server application instance.
 */
const setRouter = (app, config) => {
  const _tag = "[ABExpress][server][setRouter]"

  if (config.router) {
    log.debug(`${_tag} set router by configuration`)
    app.use("/", config.router)
  }
  setErrorHandler(app, config)

  if (!app.setRouter) {
    /**
     * Sets up a `Router` instance to be used by the `Express` server application instance.
     *
     * @static
     * @method setRouter
     * @param {import('express').Router} router `Router` instance to apply to the `Express` server application instance.
     */
    app.setRouter = (router) => {
      log.debug(`${_tag} set router by method`)
      app.use("/", router)
      setErrorHandler(app, config)
    }
  }
}

/**
 * Apply `CORS`(Cross-Origin Resource) configuration to be used by `Express` server application instances.
 *
 * @method useCORS
 * @param {import('express').Express} app `Express` server application instance.
 * @param {Object} config Configuration object(`CONFIG.server`) to use when creating a `Express` server application instance.
 */
const useCORS = (app, config) => {
  const _tag = "[ABExpress][server][useCORS]"

  const { allowList, option, userAgent } = config.cors
  log.debug(`${_tag} allow list: %o`, allowList)
  log.debug(`${_tag} allow userAgent: %o`, userAgent)
  log.debug(`${_tag} option: %o`, option)

  const allowAgentCORS = (req, callback) => {
    log.debug(`${_tag} allowAgentCORS(req: %o, callback: %o)`, req, callback)
    log.debug(`${_tag} allowAgentCORS User-Agent: %o`, req.header("User-Agent"))

    let origin = userAgent.some(
      (agent) => req.header("User-Agent")?.indexOf(agent) !== -1,
    )
    callback(null, { optionsSuccessStatus: 200, origin })
  }

  const allowListCORS = (req, callback) => {
    log.debug(`${_tag} allowListCORS(req: %o, callback: %o)`, req, callback)
    log.debug(`${_tag} allowListCORS Origin: %o`, req.header("Origin"))

    let origin = allowList.some(
      (allow) => req.header("Origin")?.indexOf(allow) !== -1,
    )

    callback(null, { optionsSuccessStatus: 200, origin })
  }

  if (userAgent.constructor.name === "Array" && userAgent.length) {
    app.use(cors(allowAgentCORS))
  } else if (allowList.constructor.name === "Array" && allowList.length) {
    app.use(cors(allowListCORS))
  } else {
    if (option.origin === true) {
      app.use(cors())
    } else {
      app.use(cors(option))
    }
  }
}

/**
 * Apply `helmet` middleware to enhance security by using HTTP response header settings.
 *
 * @method useCORS
 * @param {import('express').Express} app `Express` server application instance.
 * @param {Object} config Configuration object(`CONFIG.server`) to use when creating a `Express` server application instance.
 */
const useHelmet = (app, config) => {
  const _tag = "[ABExpress][server][useHelmet]"

  const { option } = config.helmet
  log.debug(`${_tag} option: %o`, option)

  if (option) {
    app.use(helmet(option))
  } else {
    app.use(helmet())
  }
}

/**
 * Configure middleware to be used in an `Express` server application instance.
 *
 * @method useExpress
 * @param {import('express').Express} app `Express` server application instance.
 * @param {Object} config Configuration object(`CONFIG.server`) to use when creating a `Express` server application instance.
 */
const useExpress = (app, config) => {
  const _tag = "[ABExpress][server][useExpress]"

  log.debug(`${_tag} app use compression: %o`, config.compression)
  config.compression?.use && app.use(compression())

  const parser = config.parser
  const { cookie, json, extendedURLEncoded } = parser

  log.debug(`${_tag} app use cookieParser: %o`, cookie)
  cookie && app.use(cookieParser())

  log.debug(`${_tag} app use express json: %o`, json)
  json && app.use(express.json())

  log.debug(`${_tag} app use urlencoded extended: %o`, extendedURLEncoded)
  extendedURLEncoded && app.use(express.urlencoded({ extended: true }))

  log.debug(`${_tag} app use express-session: %o`, config.session)
  config.session && app.use(session(config.session))

  const pathStatic = path.resolve(config.static)
  if (fs.existsSync(pathStatic)) {
    log.debug(`${_tag} app use static: %o`, pathStatic)
    app.use(express.static(pathStatic))
  } else {
    log.error(`${_tag} directory not exists for static files: %o`, pathStatic)
  }

  log.debug(`${_tag} app use timeout: %o`, config.timeout)
  config.timeout && app.use(timeout(config.timeout))

  log.debug(`${_tag} app use CORS: %o`, config.cors)
  config.cors && config.cors.use && useCORS(app, config)

  log.debug(`${_tag} app use helmet: %o`, config.helmet)
  config.helmet && config.helmet.use && useHelmet(app, config)
}

export { createServer, Router }
