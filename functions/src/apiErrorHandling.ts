import { AsyncRequestHandler } from './models'

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
  (requestHandler: AsyncRequestHandler): AsyncRequestHandler =>
    async (req, res) => {
      try {
        await requestHandler(req, res)
        return
      } catch (error) {
        if (error instanceof ErrorWithStatusCode) {
          res.status(error.statusCode).send({
            error: { status: error.statusCode, message: error.message }
          })
          return
        }

        console.error('API call failed with an unexpected error:')
        console.error(error)
        res.status(500).send({ error: {
          status: 500,
          message: 'An error we might not want to tell you about occurred. ' +
            'If you are us, check the logs. Otherwise, sorry about this.'
        }})
      }
    }
