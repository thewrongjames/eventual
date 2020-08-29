export interface User {
  accessToken: string
  attemptedToGetAccessTokensAndPageID?: boolean
  longLivedAccessToken?: string
  pageAccessToken?: string
  pageID?: string
}

export interface ProcessedUser {
  accessToken: string
  attemptedToGetAccessTokensAndPageID: boolean
  longLivedAccessToken: string
  pageAccessToken: string
  pageID: string
}

export interface LongLivedAccessTokenResponseJSON {
  access_token: string
}

export interface AccountsResponseJSON {
  data: [{
    access_token: string
    id: string
  }]
}

type NonArrayJSONValue = string | number | JSONObject | boolean | null
export interface JSONArray extends Array<JSONArray | NonArrayJSONValue> {}
type JSONValue = NonArrayJSONValue | JSONArray
export interface JSONObject {
  [key: string]: JSONValue
}

export interface StringKeyedObject {
  [key: string]: any
}
