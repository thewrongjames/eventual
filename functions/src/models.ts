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

type nonArrayJSONValue = string | number | jsonObject | boolean | null
interface jsonArray extends Array<jsonArray | nonArrayJSONValue> {}
type jsonValue = nonArrayJSONValue | jsonArray
export interface jsonObject {
  [key: string]: jsonValue
}

export interface StringKeyedObject {
  [key: string]: any
}
