import * as functions from 'firebase-functions'
import fetch from 'node-fetch'

import { User } from './models'
import {
  isUser, isLongLivedAccessTokenResponseJSON, isAccountsResponseJSON
} from './typeGuards'

export const getAccessTokensAndPageID = functions.firestore
  .document('/users/{uid}')
  .onWrite(async change => {
    try {
      const oldUser = change.before.data()
      const user = change.after.data()
      if (!isUser(user) || user.attemptedToGetAccessTokensAndPageID) return
      if (isUser(oldUser) && oldUser.accessToken === user.accessToken) return

      const longLivedAccessTokenURL =
        'https://graph.facebook.com/v6.0/oauth/access_token?' +
        'grant_type=fb_exchange_token&' +
        `client_id=${functions.config().facebook.id}&` +
        `client_secret=${functions.config().facebook.secret}&` +
        `fb_exchange_token=${user.accessToken}`
      const longLivedAccessTokenJSON = await fetch(longLivedAccessTokenURL)
        .then(response => response.json())
      if (!isLongLivedAccessTokenResponseJSON(longLivedAccessTokenJSON)) {
        console.log('Got bad longLivedAccessTokenJSON:')
        console.log(longLivedAccessTokenJSON)
        throw new Error('Unable to get long lived access token')
      }

      // This is called accounts, but for our purposes it is the pages you have
      // access to operate as.
      const accountsURL = 'https://graph.facebook.com/v6.0/me/accounts?' +
        `access_token=${longLivedAccessTokenJSON.access_token}`
      const accountsJSON = await fetch(accountsURL)
        .then(response => response.json())
      if (!isAccountsResponseJSON(accountsJSON)) {
        console.log('Got bad accountsJSON:')
        console.log(accountsJSON)
        throw new Error('Unable to get page access token or id')
      }

      const newUser: User = {
        accessToken: user.accessToken,
        attemptedToGetAccessTokensAndPageID: true,
        longLivedAccessToken: longLivedAccessTokenJSON.access_token,
        pageAccessToken: accountsJSON.data[0].access_token,
        pageID: accountsJSON.data[0].id
      }

      await change.after.ref.set(newUser, { merge: true })
    } catch (error) {
      // Continuing to loop infinitely would be rather bad. We wan't to make
      // sure that certainly doesn't happen.
      await change.after.ref
        .set({ attemptedToGetAccessTokensAndPageID: true}, { merge: true })
      throw error
    }
  })
