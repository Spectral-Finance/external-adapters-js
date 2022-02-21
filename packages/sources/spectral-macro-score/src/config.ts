import { Requester, util } from '@chainlink/ea-bootstrap'
import { Config } from '@chainlink/types'

export const NAME = 'SPECTRAL_MACRO_SCORE'

export const DEFAULT_BASE_URL = 'https://macro-api-test.spectral.finance/api'
export const DEFAULT_ENDPOINT = 'calculate'

export const DEFAULT_TIMEOUT = 120000

export interface SpectralAdapterConfig extends Config {
  BASE_URL_MACRO_API: string
  BASE_URL_FAST_API: string
  MACRO_API_KEY: string
  FAST_API_KEY: string
  PROVIDER_URL: string
  PROVIDER_API_KEY: string
  NFC_ADDRESS: string
  timeout: number
  WARMUP_ENABLED: boolean
}

export const makeConfig = (prefix?: string): SpectralAdapterConfig => {
  const config = <SpectralAdapterConfig>Requester.getDefaultConfig(prefix)
  config.timeout = DEFAULT_TIMEOUT
  config.BASE_URL_MACRO_API = util.getRequiredEnv('BASE_URL_MACRO_API')
  config.BASE_URL_FAST_API = util.getRequiredEnv('BASE_URL_FAST_API')
  config.MACRO_API_KEY = util.getRequiredEnv('MACRO_API_KEY')
  config.FAST_API_KEY = util.getRequiredEnv('FAST_API_KEY')
  config.PROVIDER_URL = util.getRequiredEnv('PROVIDER_URL')
  config.PROVIDER_API_KEY = util.getRequiredEnv('PROVIDER_API_KEY')
  config.NFC_ADDRESS = util.getRequiredEnv('NFC_ADDRESS')
  config.api.headers = {
    'Content-Type': 'application/json',
  }
  config.WARMUP_ENABLED = false
  return config
}
