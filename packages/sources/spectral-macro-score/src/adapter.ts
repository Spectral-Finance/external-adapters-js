import { Requester, Validator, AdapterError } from '@chainlink/ea-bootstrap'
import { ExecuteFactory, AdapterRequest, AdapterContext, AdapterResponse } from '@chainlink/types'
import { makeConfig, DEFAULT_ENDPOINT, SpectralAdapterConfig } from './config'
import { MacroScoreAPI, ExtraDataAPI } from './endpoint'

const inputParams = {
  address: true,
  endpoint: true,
}

export const execute = async (
  request: AdapterRequest,
  _: AdapterContext,
  config: SpectralAdapterConfig,
): Promise<AdapterResponse> => {
  const validator = new Validator(request, inputParams)
  if (validator.error) {
    throw validator.error
  }

  console.log('IM HERE')
  Requester.logConfig(config)

  request.data.jobRunID = validator.validated.id

  const endpoint = validator.validated.data.endpoint || DEFAULT_ENDPOINT

  switch (endpoint) {
    case MacroScoreAPI.MacroScoreAPIName: {
      return await MacroScoreAPI.execute(request, config)
    }
    case ExtraDataAPI.EndpointName: {
      return await ExtraDataAPI.execute(request)
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

export const makeExecute: ExecuteFactory<SpectralAdapterConfig> = (config) => {
  return async (request, context) => execute(request, context, config || makeConfig())
}
