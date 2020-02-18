import {
  User,
  LongLivedAccessTokenResponseJSON,
  AccountsResponseJSON,
  ProcessedUser,
  StringKeyedObject
} from './models'

export const isString = (maybeString: any): maybeString is string => {
  return typeof(maybeString) === 'string'
}

export const isBoolean = (maybeBoolean: any): maybeBoolean is boolean => {
  return typeof(maybeBoolean) === 'boolean'
}

export const isStringKeyedObject = (
  maybeStringKeyedObject: any
): maybeStringKeyedObject is StringKeyedObject => {
  // All objects are keyed by strings, really. Though null does also have the
  // type object, so, let's at least make sure it's truthy.
  return typeof(maybeStringKeyedObject) === 'object' && maybeStringKeyedObject
}

export const isUser = (maybeUser: any): maybeUser is User => {
  return maybeUser && isString(maybeUser.accessToken)
}

export const isProcessedUser = (
  maybeProcessedUser: any
): maybeProcessedUser is ProcessedUser => {
  return isUser(maybeProcessedUser) &&
    isBoolean(maybeProcessedUser.attemptedToGetAccessTokensAndPageID) &&
    isString(maybeProcessedUser.longLivedAccessToken) &&
    isString(maybeProcessedUser.pageAccessToken) &&
    isString(maybeProcessedUser.pageID)
}

export const isLongLivedAccessTokenResponseJSON = (
  maybeLongLivedAccessTokenResponseJSON: any
): maybeLongLivedAccessTokenResponseJSON is LongLivedAccessTokenResponseJSON => {
  return maybeLongLivedAccessTokenResponseJSON &&
    isString(maybeLongLivedAccessTokenResponseJSON.access_token)
}

export const isAccountsResponseJSON = (
  maybeAccountsResponseJSON: any
): maybeAccountsResponseJSON is AccountsResponseJSON => {
  return maybeAccountsResponseJSON &&
    maybeAccountsResponseJSON.data &&
    maybeAccountsResponseJSON.data[0] &&
    isString(maybeAccountsResponseJSON.data[0].access_token) &&
    isString(maybeAccountsResponseJSON.data[0].id)
}
