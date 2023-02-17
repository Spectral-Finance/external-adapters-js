import { Requester, AdapterData, AdapterRequest, AdapterResponse } from '@chainlink/ea-bootstrap'
import { utils } from 'ethers'
import { SpectralAdapterConfig } from '../config'

//const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const EndpointName = 'extraData'

export interface IRequestInput extends AdapterData {
  id: string
  data: {
    address: string
    jobRunID: string
  }
}

export const execute = async (
  request: AdapterRequest<IRequestInput>,
  config: SpectralAdapterConfig,
): Promise<AdapterResponse<AdapterData>> => {
  const abiCoder = new utils.AbiCoder()
  const extraData = abiCoder.encode(['string'], ['Hello World'])

  return Requester.success(
    request.data.jobRunID?.toString(),
    {
      data: { result: extraData },
    },
    config.verbose,
  )
}
