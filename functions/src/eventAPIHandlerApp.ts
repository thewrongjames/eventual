import * as express from 'express'
import * as cors from 'cors'
import * as admin from 'firebase-admin'
import fetch from 'node-fetch'

import { isProcessedUser, isStringKeyedObject, isString } from './typeGuards'
import { handleAPIErrors, ClientError, ServerError } from './apiErrorHandling'
import { JSONObject, JSONArray, AsyncRequestHandler } from './models'

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
const getGraphAPIData = async (
  path: string, accessToken: string, fields: string, otherParamaters?: string
) => {
  const url = 'https://graph.facebook.com/v6.0/' + path +
    `?access_token=${accessToken}&fields=${fields}` +
    (otherParamaters ? '&' + otherParamaters : '')
  const response = await fetch(url)
  let json: JSONObject | undefined = undefined
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

const getPageOfGraphAPIData = async (
  path: string, accessToken: string, fields: string, after?: string
): Promise<{data: JSONArray, after?: string}> => {
  // Encode URI component to prevent user input from being injected into the
  // query to the Graph API, which is rather important.
  const otherParameters = after ? `after=${encodeURIComponent(after)}` : ''
  const json = await getGraphAPIData(path, accessToken, fields, otherParameters)
  if (!Array.isArray(json.data)) {
    console.error('Graph API gave the following JSON with non-array data:')
    console.error(json)
    throw new ServerError(500, 'Got bad data from graph API.')
  }
  if (
    !isStringKeyedObject(json.paging)
    || Array.isArray(json.paging)
    || !isStringKeyedObject(json.paging.cursors)
    || Array.isArray(json.paging.cursors)
  ) {
    console.error('Could not extract cursors from following Graph API JSON:')
    console.error(json)
    throw new ServerError(500, 'Got bad cursors from graph API.')
  }

  return {
    data: json.data,
    after: typeof json.paging.cursors.after === 'string'
      ? json.paging.cursors.after
      : undefined
  }
}

const eventsHandler: AsyncRequestHandler = async (req, res) => {
  const uid = req.params.uid
  const after = req.query.after

  if (after !== undefined && !isString(after)) {
    throw new ClientError(404, 'Expected after cursor to be a string.')
  }

  const user = await getProcessedUser(uid)

  const json = await getPageOfGraphAPIData(
    `${user.pageID}/events`, user.pageAccessToken, eventFields, after
  )
  res.send(json)
}

const eventHandler: AsyncRequestHandler = async (req, res) => {
  const [uid, eventID] = [req.params.uid, req.params.eventID]

  const user = await getProcessedUser(uid)

  const eventIDsJSON =
    await getGraphAPIData(`${user.pageID}/events`, user.pageAccessToken, 'id')

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

eventAPIHandlerApp.get('/v1.0/:uid', handleAPIErrors(eventsHandler))
eventAPIHandlerApp.get('/v1.0/:uid/:eventID', handleAPIErrors(eventHandler))

export default eventAPIHandlerApp
