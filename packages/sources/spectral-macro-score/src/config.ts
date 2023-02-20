// import { Requester, util } from '@chainlink/ea-bootstrap'
// import { Config } from '@chainlink/ea-bootstrap'

// export const NAME = 'SPECTRAL_MACRO_SCORE'

// export const ENV_ETHEREUM_RPC_URL = 'ETHEREUM_RPC_URL'
// export const ENV_RPC_URL = 'RPC_URL'

// export const ENV_ETHEREUM_CHAIN_ID = 'ETHEREUM_CHAIN_ID'
// export const ENV_FALLBACK_CHAIN_ID = 'CHAIN_ID'
// export const DEFAULT_CHAIN_ID = '1'

// export const DEFAULT_ENDPOINT = 'spectral-proxy'
// export const DEFAULT_BASE_URL = 'https://xzff24vr3m.execute-api.us-east-2.amazonaws.com/default/'
// export const DEFAULT_TIMEOUT = 60000

// export interface SpectralAdapterConfig extends Config {
//   rpcUrl: string
//   nfcAddress: string
// }

// export const makeConfig = (prefix?: string): SpectralAdapterConfig => {
//   const config = <SpectralAdapterConfig>Requester.getDefaultConfig(prefix)
//   config.api = {
//     ...config.api,
//     baseURL: config.api?.baseURL || DEFAULT_BASE_URL,
//     timeout: DEFAULT_TIMEOUT,
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': config.apiKey ?? '',
//     },
//   }
//   // config.rpcUrl = util.getRequiredEnvWithFallback(ENV_ETHEREUM_RPC_URL, [ENV_RPC_URL], prefix)
//   config.rpcUrl = 'localhost:8546'
//   config.chainId =
//     parseInt(
//       util.getEnvWithFallback(ENV_ETHEREUM_CHAIN_ID, [ENV_FALLBACK_CHAIN_ID]) || DEFAULT_CHAIN_ID,
//     ) || util.getEnvWithFallback(ENV_ETHEREUM_CHAIN_ID, [ENV_FALLBACK_CHAIN_ID])
//   // config.nfcAddress = util.getRequiredEnv('NFC_ADDRESS')
//   config.nfcAddress = '0x91e1156d5Fba6b1B251f396e96aFAaCE91394283'
//   return config
// }
import { Requester, util } from '@chainlink/ea-bootstrap'
import { Config } from '@chainlink/ea-bootstrap'

export const NAME = 'SPECTRAL_MACRO_SCORE'

export const DEFAULT_BASE_URL = 'https://fast-api-test.spectral.finance/v1/addressBatch'
export const DEFAULT_ENDPOINT = 'calculate'

export const DEFAULT_TIMEOUT = 120000

export interface SpectralAdapterConfig extends Config {
  BASE_URL: string
  API_KEY: string
  timeout: number
  WARMUP_ENABLED: boolean
}

export const makeConfig = (prefix?: string): SpectralAdapterConfig => {
  const config = <SpectralAdapterConfig>Requester.getDefaultConfig(prefix)
  config.timeout = DEFAULT_TIMEOUT
  config.BASE_URL = util.getRequiredEnv('BASE_URL')
  config.API_KEY = util.getRequiredEnv('API_KEY')
  config.api = {}
  config.api.headers = {
    'Content-Type': 'application/json',
  }
  config.WARMUP_ENABLED = false
  return config
}
