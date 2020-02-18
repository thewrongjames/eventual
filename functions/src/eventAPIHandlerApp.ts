import * as express from 'express'
import * as cors from 'cors'
import * as admin from 'firebase-admin'
import fetch from 'node-fetch'

import { isProcessedUser, isStringKeyedObject } from './typeGuards'
import { handleAPIErrors, ClientError, ServerError } from './apiErrorHandling'
import { jsonObject } from './models'

const eventAPIHandlerApp = express()
eventAPIHandlerApp.use(cors({ origin: true }))

const eventFields =
  'cover,name,description,start_time,end_time,place,event_times'

const getProcessedUser = async (uid: string) => {
  const user =
    (await admin.firestore().collection('users').doc(uid).get()).data()
  if (!isProcessedUser(user)) throw new ClientError(404, 'User not found')
  return user
}

/**
 * Make a call to the facebook graph API and return the results.
 * @param path The path within the API to call, omit the hostname, api version,
 * and any query paramaters
 * @param accessToken The access token to use with the API.
 * @param fields A string to pass to the API fields query paramater.
 */
const getGraphAPIData =
  async (path: string, accessToken: string, fields: string) => {
    const url = 'https://graph.facebook.com/v6.0/' +
      path + `?access_token=${accessToken}&fields=${fields}`
    const response = await fetch(url)
    let json: jsonObject | undefined = undefined
    try {
      json = await response.json()
    } catch (error) {}
    if (!response.ok || !json) {
      console.error('Graph API get failed with response and json:')
      console.error(response)
      console.error(json)
      throw new ServerError(500, 'Failed to get data from graph API.')
    }
    return json
  }

const eventsHandler: express.RequestHandler = async (req, res) => {
  const uid = req.params.uid

  const user = await getProcessedUser(uid)

  const json = await getGraphAPIData(
    `${user.pageID}/events`, user.pageAccessToken, eventFields
  )
  res.send(json)
}

const eventHandler: express.RequestHandler = async (req, res) => {
  const [uid, eventID] = [req.params.uid, req.params.eventID]

  const user = await getProcessedUser(uid)

  const eventIDsJSON = await getGraphAPIData(
    `${user.pageID}/events`, user.pageAccessToken, 'id'
  )

  const badEventError = new ClientError(404, 'Event not found')
  const eventIDData = eventIDsJSON.data
  if (!isStringKeyedObject(eventIDData)) throw badEventError
  let found = false
  for (const eventIDDatum of Object.values(eventIDData)) {
    if (!isStringKeyedObject(eventIDDatum) || Array.isArray(eventIDDatum)) {
      throw badEventError
    }
    if (eventIDDatum.id === eventID) {
      found = true
      break
    }
  }
  if (!found) throw badEventError

  const eventJSON =
    await getGraphAPIData(eventID, user.pageAccessToken, eventFields)
  res.send(eventJSON)
}

eventAPIHandlerApp.get('/:uid', handleAPIErrors(eventsHandler))
eventAPIHandlerApp.get('/:uid/:eventID', handleAPIErrors(eventHandler))

export default eventAPIHandlerApp
