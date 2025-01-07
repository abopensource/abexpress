import ABExpress from "abexpress"

ABExpress.createServer()
  .then((app) => {
    log.debug(`Starting app: %o`, app?.name)
  })
  .catch((error) => {
    log.error(`Start error: %o`, error?.message)
  })
