import { expose, ServerInstance } from '@chainlink/external-adapter-framework'
import { PriceAdapter } from '@chainlink/external-adapter-framework/adapter'
import { globalMarketCap, dominance, historical, crypto, marketcap, volume } from './endpoint'
import { customSettings } from './config'
import overrides from './config/overrides.json'

export const adapter = new PriceAdapter({
  defaultEndpoint: crypto.name,
  name: 'COINMARKETCAP',
  customSettings,
  rateLimiting: {
    tiers: {
      free: {
        rateLimit1m: 30,
        rateLimit1h: 13.698630137,
        note: "10k credits/month, 730h in a month, ignoring daily limits since they're soft caps",
      },
      hobbyist: {
        rateLimit1m: 30,
        rateLimit1h: 54.794520548,
      },
      startup: {
        rateLimit1m: 30,
        rateLimit1h: 164.383561644,
      },
      standard: {
        rateLimit1m: 60,
        rateLimit1h: 684.931506849,
      },
      professional: {
        rateLimit1m: 90,
        rateLimit1h: 4109.589041096,
      },
    },
  },
  overrides: overrides.coinmarketcap,
  endpoints: [globalMarketCap, dominance, historical, crypto, marketcap, volume],
})

export const server = (): Promise<ServerInstance | undefined> => expose(adapter)
