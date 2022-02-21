import { Requester } from '@chainlink/ea-bootstrap'
import { AxiosResponse } from '@chainlink/types'
import { utils } from 'ethers'

//const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const EndpointName = 'extraData'

export interface IRequestInput {
  id: string
  data: {
    address: string
    jobRunID: string
  }
}

export const execute = async (request: IRequestInput) => {
  const abiCoder = new utils.AbiCoder()
  const extraData = abiCoder.encode(['string'], ['Hello World'])

  const endpointResponse: Partial<AxiosResponse> = {
    data: {
      result: extraData,
    },
    status: '200',
  }

  return Requester.success(request.data.jobRunID, endpointResponse)
}
