import { Requester } from '@chainlink/ea-bootstrap'
import { Config } from '@chainlink/types'

export const NAME = 'COINAPI'

export const DEFAULT_ENDPOINT = 'price'
export const DEFAULT_BASE_URL = 'https://rest.coinapi.io/v1/'
export const DEFAULT_WS_API_ENDPOINT = 'wss://ws.coinapi.io/v1/'

export const makeConfig = (prefix?: string): Config => {
  const config = Requester.getDefaultConfig(prefix, true)
  config.api = {
    ...config.api,
    baseURL: config.api.baseURL || DEFAULT_BASE_URL,
    params: {
      apikey: config.apiKey,
    },
  }
  config.DEFAULT_ENDPOINT = DEFAULT_ENDPOINT
  return config
}
