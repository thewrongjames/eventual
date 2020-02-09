import * as express from 'express'
import * as cors from 'cors'
import * as admin from 'firebase-admin'
import fetch from 'node-fetch'

import { isProcessedUser } from './typeGuards'
import { handleClientErrors, ClientError } from './clientErrorHandling'

const eventAPIHandlerApp = express()
eventAPIHandlerApp.use(cors({ origin: true }))

const getProcessedUser = async (uid: string) => {
  const user =
    (await admin.firestore().collection('users').doc(uid).get()).data()
  if (!isProcessedUser(user)) throw new ClientError(404, 'User not found')
  return user
}

const eventsHandler: express.RequestHandler = async (req, res) => {
  const user = await getProcessedUser(req.params.uid)

  const url = `https://graph.facebook.com/v6.0/${user.pageID}/events?` +
    `access_token=${user.pageAccessToken}`
  const json = await fetch(url).then(response => response.json())
  res.send(json)
}
const eventHandler: express.RequestHandler = async (req, res) => {
  const user = await getProcessedUser(req.params.uid)

  const url = `https://graph.facebook.com/v6.0/${req.params.eventID}?` +
    `access_token=${user.pageAccessToken}`
  const json = await fetch(url).then(response => response.json())
  res.send(json)
}

eventAPIHandlerApp.get('/:uid', handleClientErrors(eventsHandler))
eventAPIHandlerApp.get('/:uid/:eventID', handleClientErrors(eventHandler))

export default eventAPIHandlerApp
