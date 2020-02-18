import { RequestHandler } from 'express'

class ErrorWithStatusCode extends Error {
  public statusCode: number

  constructor (statusCode: number, message: string) {
    super (message)
    this.statusCode = statusCode
  }
}

export class ClientError extends ErrorWithStatusCode {
  constructor (statusCode: number, message: string) {
    super(statusCode, message)
    if (statusCode < 400 || statusCode > 499) {
      throw new Error(`Status code must be a client error status code (4XX)`)
    }
  }
}

export class ServerError extends ErrorWithStatusCode {
  constructor (statusCode: number, message: string) {
    super(statusCode, message)
    if (statusCode < 500 || statusCode >= 599) {
      throw new Error(`Status code must be a server error status code (5XX)`)
    }
  }
}

export const handleAPIErrors =
  (requestHandler: RequestHandler): RequestHandler =>
    async (req, res, next) => {
      try {
        return await requestHandler(req, res, next)
      } catch (error) {
        if (error instanceof ErrorWithStatusCode) {
          return res.status(error.statusCode).send({
            error: { status: error.statusCode, message: error.message }
          })
        }

        console.error('API call failed with unexpected error:')
        console.error(error)
        return res.status(500).send({ error: {
          status: 500,
          message: 'An error we might not want to tell you about occured. If ' +
            'you are us, check the logs. Otherwise, sorry about this.'
        }})
      }
    }
