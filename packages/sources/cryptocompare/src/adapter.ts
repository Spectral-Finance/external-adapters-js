import { Builder, Logger, Requester, Validator } from '@chainlink/ea-bootstrap'
import {
  AdapterRequest,
  Config,
  ExecuteFactory,
  ExecuteWithConfig,
  MakeWSHandler,
  APIEndpoint,
} from '@chainlink/ea-bootstrap'
import { DEFAULT_WS_API_ENDPOINT, makeConfig, NAME } from './config'
import { crypto } from './endpoint'
import * as endpoints from './endpoint'
import overrides from './config/symbols.json'

export const execute: ExecuteWithConfig<Config, endpoints.TInputParameters> = async (
  request,
  context,
  config,
) => {
  return Builder.buildSelector<Config, endpoints.TInputParameters>(
    request,
    context,
    config,
    endpoints,
  )
}

export const endpointSelector = (
  request: AdapterRequest,
): APIEndpoint<Config, endpoints.TInputParameters> =>
  Builder.selectEndpoint<Config, endpoints.TInputParameters>(request, makeConfig(), endpoints)

export const makeExecute: ExecuteFactory<Config, endpoints.TInputParameters> = (config) => {
  return async (request, context) => execute(request, context, config || makeConfig())
}

export interface WSErrorType {
  TYPE: string
  MESSAGE: string
  PARAMETER: string
  INFO: string
}

export const INVALID_SUB = 'INVALID_SUB'

interface Message {
  PRICE: number
  TYPE: number
  MARKET: string
  FLAGS: number
  FROMSYMBOL: string
  TOSYMBOL: string
  VOLUMEDAY: number
  VOLUME24HOUR: number
  VOLUMEDAYTO: number
  VOLUME24HOURTO: number
}

export const makeWSHandler = (config?: Config): MakeWSHandler<Message | any> =>
  // TODO: WS message types
  {
    // https://min-api.cryptocompare.com/documentation/websockets
    const subscriptions = {
      trade: 0,
      ticker: 2,
      aggregate: 5,
    }
    const getPair = (input: AdapterRequest) => {
      const validator = new Validator(
        input,
        crypto.inputParameters,
        {},
        { shouldThrowError: false, overrides },
      )
      if (validator.error) return false
      const endpoint = validator.validated.data.endpoint?.toLowerCase()
      if (endpoint == 'marketcap') return false
      const base = validator.overrideSymbol(NAME, validator.validated.data.base)
      if (Array.isArray(validator.validated.data.quote)) {
        Logger.debug(
          `[WS]: ${validator.validated.data.quote} supplied as quote. Only non-array tickers can be used for WS`,
        )
        return false
      }
      const quote = validator.validated.data.quote.toUpperCase()
      return `${base}~${quote}`
    }
    const getSubscription = (action: 'SubAdd' | 'SubRemove', pair?: string | boolean) => {
      if (!pair) return
      return { action, subs: [`${subscriptions.aggregate}~CCCAGG~${pair}`] }
    }
    const withApiKey = (url: string, apiKey: string) => `${url}?api_key=${apiKey}`
    const shouldNotRetryAfterError = (error: WSErrorType): boolean => {
      return error.MESSAGE === INVALID_SUB
    }
    return () => {
      const defaultConfig = config || makeConfig()
      return {
        connection: {
          url: withApiKey(
            defaultConfig.ws?.baseWsURL || DEFAULT_WS_API_ENDPOINT,
            defaultConfig.apiKey || '',
          ),
        },
        subscribe: (input) => getSubscription('SubAdd', getPair(input)) as any,
        unsubscribe: (input) => getSubscription('SubRemove', getPair(input)) as any,
        subsFromMessage: (message: Message) =>
          getSubscription('SubAdd', `${message?.FROMSYMBOL}~${message?.TOSYMBOL}`) as any,
        isError: (message: Message) => Number(message.TYPE) > 400 && Number(message.TYPE) < 900,
        filter: (message: Message) => {
          // Ignore everything is not from the wanted channels
          const code = Number(message.TYPE)
          const flag = Number(message.FLAGS) // flags = 4 (means price unchanged, PRICE parameter not included)
          return (code === subscriptions.ticker || code === subscriptions.aggregate) && flag !== 4
        },
        toResponse: (message: Message) => {
          const result = Requester.validateResultNumber(message, ['PRICE'])
          return Requester.success('1', { data: { result } })
        },
        shouldNotRetrySubscription: (error) => shouldNotRetryAfterError(error as WSErrorType),
      }
    }
  }
