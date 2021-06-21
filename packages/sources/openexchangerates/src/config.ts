import { Requester } from '@chainlink/ea-bootstrap'
import { Config } from '@chainlink/types'

export const NAME = 'OPEN-EXCHANGE-RATES'

export const DEFAULT_ENDPOINT = 'price'
export const DEFAULT_BASE_URL = 'https://openexchangerates.org/api/'

export const makeConfig = (prefix = ''): Config => {
  const config = Requester.getDefaultConfig(prefix, true)
  config.api.baseURL = config.api.baseURL || DEFAULT_BASE_URL
  config.DEFAULT_ENDPOINT = DEFAULT_ENDPOINT
  return config
}
