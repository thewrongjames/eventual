import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import getAccessTokensAndPageIDHandler from './getAccessTokensAndPageIDHandler'
import eventAPIHandlerApp from './eventAPIHandlerApp'

admin.initializeApp()

export const getAccessTokensAndPageID = functions.firestore
  .document('/users/{uid}')
  .onWrite(getAccessTokensAndPageIDHandler)

export const api = functions.https.onRequest(eventAPIHandlerApp)
