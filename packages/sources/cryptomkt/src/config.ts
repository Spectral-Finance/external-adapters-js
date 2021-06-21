import { Requester } from '@chainlink/ea-bootstrap'
import { Config } from '@chainlink/types'

export const NAME = 'CRYPTOMKT'

export const DEFAULT_ENDPOINT = 'ticker'
export const DEFAULT_BASE_URL = 'https://api.cryptomkt.com/v1/'

export const makeConfig = (prefix?: string): Config => {
  const config = Requester.getDefaultConfig(prefix)
  config.api.baseURL = config.api.baseURL || DEFAULT_BASE_URL
  config.DEFAULT_ENDPOINT = DEFAULT_ENDPOINT
  return config
}
