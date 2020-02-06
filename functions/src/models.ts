export interface User {
  accessToken: string
  attemptedToGetAccessTokensAndPageID?: boolean
  longLivedAccessToken?: string
  pageAccessToken?: string
  pageID?: string
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
