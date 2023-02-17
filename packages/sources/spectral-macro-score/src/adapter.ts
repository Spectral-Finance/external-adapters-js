// import { Requester, Validator, AdapterInputError, ExecuteWithConfig } from '@chainlink/ea-bootstrap'
// import {
//   ExecuteFactory,
//   AdapterRequest,
//   AdapterContext,
//   AdapterResponse,
// } from '@chainlink/ea-bootstrap'
// import { makeConfig, DEFAULT_ENDPOINT, SpectralAdapterConfig } from './config/config'
// import { MacroScoreAPI } from './endpoint'

// export const execute: ExecuteWithConfig<
//   SpectralAdapterConfig,
//   MacroScoreAPI.IRequestInput
// > = async (
//   request: AdapterRequest<MacroScoreAPI.IRequestInput>,
//   _: AdapterContext,
//   config: SpectralAdapterConfig,
// ): Promise<AdapterResponse> => {
//   const validator = new Validator(request, MacroScoreAPI.inputParameters)

//   Requester.logConfig(config)

//   request.data.jobRunID = validator.validated.id
//   const endpoint = validator.validated.data.endpoint || DEFAULT_ENDPOINT

//   switch (endpoint.toLowerCase()) {
//     case MacroScoreAPI.MacroScoreAPIName: {
//       return await MacroScoreAPI.execute(request, config)
//     }
//     default: {
//       throw new AdapterInputError({
//         jobRunID: request.data.jobRunID,
//         message: `Endpoint ${endpoint} not supported.`,
//         statusCode: 400,
//       })
//     }
//   }
// }

// export const makeExecute: ExecuteFactory<SpectralAdapterConfig, MacroScoreAPI.IRequestInput> = (
//   config,
// ) => {
//   return async (request, context) => execute(request, context, config || makeConfig())
// }
import { Requester, Validator, AdapterError, ExecuteWithConfig } from '@chainlink/ea-bootstrap'
import {
  ExecuteFactory,
  AdapterRequest,
  AdapterContext,
  AdapterResponse,
} from '@chainlink/ea-bootstrap'
import { makeConfig, DEFAULT_ENDPOINT, SpectralAdapterConfig } from './config'
import { MacroScoreAPI } from './endpoint'
import { ExtraDataAPI } from './endpoint'

// const inputParams = {
//   address: true,
//   endpoint: true,
// }

//STARY
// export const execute = async (
//   request: AdapterRequest,
//   _: AdapterContext,
//   config: SpectralAdapterConfig,
// ): Promise<AdapterResponse> => {

export const execute: ExecuteWithConfig<
  SpectralAdapterConfig,
  MacroScoreAPI.IRequestInput
> = async (
  request: AdapterRequest<MacroScoreAPI.IRequestInput>,
  _: AdapterContext,
  config: SpectralAdapterConfig,
): Promise<AdapterResponse> => {
  const validator = new Validator(request, MacroScoreAPI.inputParameters)
  if (validator.error) {
    throw validator.error
  }

  Requester.logConfig(config)

  request.data.jobRunID = validator.validated.id

  const endpoint = validator.validated.data.endpoint || DEFAULT_ENDPOINT

  switch (endpoint) {
    case MacroScoreAPI.MacroScoreAPIName: {
      return await MacroScoreAPI.execute(request, config)
    }
    case ExtraDataAPI.EndpointName: {
      return await ExtraDataAPI.execute(request, config)
    }
    default: {
      throw new AdapterError({
        jobRunID: request.data.jobRunID,
        message: `Endpoint ${endpoint} not supported.`,
        statusCode: 400,
      })
    }
  }
}

export const makeExecute: ExecuteFactory<SpectralAdapterConfig, MacroScoreAPI.IRequestInput> = (
  config,
) => {
  return async (request, context) => execute(request, context, config || makeConfig())
}
// export const makeExecute: ExecuteFactory<SpectralAdapterConfig, MacroScoreAPI.IRequestInput> = (
//   config,
// ) => {
//   return async (request, context) => execute(request, context, config || makeConfig())
// }
