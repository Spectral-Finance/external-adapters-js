import { Requester, util } from '@chainlink/ea-bootstrap'
import { Config } from '@chainlink/types'

export const NAME = 'SPECTRAL_MACRO_SCORE'

export const DEFAULT_BASE_URL = 'https://sc.dev.spectral.finance'
export const DEFAULT_ENDPOINT = 'calculate'

export const DEFAULT_TIMEOUT = 120000

export interface SpectralAdapterConfig extends Config {
  BASE_URL_BLADE_API: string
  BLADE_API_KEY: string
  timeout: number
  WARMUP_ENABLED: boolean
}

export const makeConfig = (prefix?: string): SpectralAdapterConfig => {
  const config = <SpectralAdapterConfig>Requester.getDefaultConfig(prefix)
  config.timeout = DEFAULT_TIMEOUT
  config.BASE_URL_BLADE_API = util.getRequiredEnv('BASE_URL_BLADE_API')
  config.BLADE_API_KEY = util.getRequiredEnv('BLADE_API_KEY')
  config.api.headers = {
    'Content-Type': 'application/json',
  }
  config.WARMUP_ENABLED = false
  return config
}
