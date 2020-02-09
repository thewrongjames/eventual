import { RequestHandler } from 'express'

export class ClientError extends Error {
  public statusCode: number

  constructor (statusCode: number, message: string) {
    super(message)

    if (statusCode < 400 || statusCode >= 500) {
      throw new Error(`Status code must be a client error status code (4XX)`)
    }

    this.statusCode = statusCode
  }
}

export const handleClientErrors =
  (requestHandler: RequestHandler): RequestHandler =>
    async (req, res, next) => {
      try {
        return await requestHandler(req, res, next)
      } catch (error) {
        if (!(error instanceof ClientError)) throw error
        res.status(error.statusCode).send({
          status: error.statusCode,
          message: error.message
        })
      }
    }
