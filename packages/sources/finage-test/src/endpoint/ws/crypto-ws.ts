import { WebsocketReverseMappingTransport } from '@chainlink/external-adapter-framework/transports/websocket'
import { SingleNumberResultResponse } from '@chainlink/external-adapter-framework/util'
import { PriceEndpointParams } from '@chainlink/external-adapter-framework/adapter'
import { customSettings } from '../../config'

interface Message {
  s: string
  p: string
  q: string
  t: number
}

type EndpointTypes = {
  Request: {
    Params: PriceEndpointParams
  }
  Response: SingleNumberResultResponse
  CustomSettings: typeof customSettings
  Provider: {
    WsMessage: Message
  }
}

export const wsTransport: WebsocketReverseMappingTransport<EndpointTypes, string> =
  new WebsocketReverseMappingTransport<EndpointTypes, string>({
    url: (context) => {
      return `${context.adapterConfig.CRYPTO_WS_API_ENDPOINT}/?token=${context.adapterConfig.WS_SOCKET_KEY}`
    },
    handlers: {
      message(message) {
        const pair = wsTransport.getReverseMapping(message.s.toLowerCase())
        if (!message.p || !pair) {
          return []
        }

        const result = Number(message.p)
        return [
          {
            params: pair,
            response: {
              data: {
                result,
              },
              result,
              timestamps: {
                providerIndicatedTimeUnixMs: message.t,
              },
            },
          },
        ]
      },
    },

    builders: {
      subscribeMessage: (params) => {
        wsTransport.setReverseMapping(`${params.base}${params.quote}`.toLowerCase(), params)
        return { action: 'subscribe', symbols: `${params.base}${params.quote}`.toUpperCase() }
      },
      unsubscribeMessage: (params) => {
        return { action: 'unsubscribe', symbols: `${params.base}${params.quote}`.toUpperCase() }
      },
    },
  })
