import {
  User, LongLivedAccessTokenResponseJSON, AccountsResponseJSON, ProcessedUser
} from './models'

export function isString (maybeString: any): maybeString is string {
  return typeof(maybeString) === 'string'
}

export function isBoolean (maybeBoolean: any): maybeBoolean is boolean {
  return typeof(maybeBoolean) === 'boolean'
}

export function isUser (maybeUser: any): maybeUser is User {
  return maybeUser && isString(maybeUser.accessToken)
}

export function isProcessedUser (
  maybeProcessedUser: any
): maybeProcessedUser is ProcessedUser {
  return isUser(maybeProcessedUser) &&
    isBoolean(maybeProcessedUser.attemptedToGetAccessTokensAndPageID) &&
    isString(maybeProcessedUser.longLivedAccessToken) &&
    isString(maybeProcessedUser.pageAccessToken) &&
    isString(maybeProcessedUser.pageID)
}

export function isLongLivedAccessTokenResponseJSON (
  maybeLongLivedAccessTokenResponseJSON: any
): maybeLongLivedAccessTokenResponseJSON is LongLivedAccessTokenResponseJSON {
  return maybeLongLivedAccessTokenResponseJSON &&
    isString(maybeLongLivedAccessTokenResponseJSON.access_token)
}

export function isAccountsResponseJSON (
  maybeAccountsResponseJSON: any
): maybeAccountsResponseJSON is AccountsResponseJSON {
  return maybeAccountsResponseJSON &&
    maybeAccountsResponseJSON.data &&
    maybeAccountsResponseJSON.data[0] &&
    isString(maybeAccountsResponseJSON.data[0].access_token) &&
    isString(maybeAccountsResponseJSON.data[0].id)
}