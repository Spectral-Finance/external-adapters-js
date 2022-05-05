import { AdapterError, Requester } from '@chainlink/ea-bootstrap'
import { AdapterResponse, InputParameters, RequestConfig } from '@chainlink/types'
import { utils } from 'ethers'
import { SpectralAdapterConfig } from '../config'

export const MacroScoreAPIName = 'calculate'

export interface ICustomError {
  Response: string
}

const customError = (data: ICustomError) => {
  if (data.Response === 'Error') return true
  return false
}

export interface IResolveResult {
  message: string
}

const customErrorResolve = (data: IResolveResult) => {
  if (data.message === 'calculating') return true
  return false
}

export interface IRequestInput {
  id: string
  data: {
    address: string
    jobRunID: string
  }
}

export interface CalculationResponse {
  primary_address: string
  job_id: string
}
export interface ResolveResponse {
  job: string
  score: string // numeric,
}

export const inputParameters: InputParameters = {
  address: {
    required: true,
    description: 'The users address',
    type: 'string',
  },
}

export const execute = async (
  request: IRequestInput,
  config: SpectralAdapterConfig,
): Promise<AdapterResponse> => {
  const address = request.data.address

  if (!utils.isAddress(address)) {
    throw new AdapterError({
      message: 'Adapter Error: Invalid address',
      cause: 'Invalid address',
    })
  }

  const calculateOptions: RequestConfig = {
    baseURL: `${config.BASE_URL_FAST_API}`,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: config.timeout,
    url: '/calculate/',
    method: 'POST',
    data: {
      key: `${config.FAST_API_KEY}`,
      primary_address: `${request.data.address}`,
    },
  }
  const resolveJobId = await Requester.request<CalculationResponse>(calculateOptions, customError)
  const jobId = Requester.getResult(resolveJobId.data as { [key: string]: any }, ['job_id'])

  if (!jobId) {
    throw new AdapterError({
      message: 'Calculate Error Fast API',
      cause: 'Could not obtain a jobId',
    })
  }

  const resolveOptions: RequestConfig = {
    baseURL: `${config.BASE_URL_FAST_API}`,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: config.timeout,
    url: `/resolve/job/`,
    method: 'POST',
    data: {
      primaryAddress: address,
      job_id: jobId,
      key: `${config.FAST_API_KEY}`,
    },
  }

  const resolve = await Requester.request<ResolveResponse>(
    resolveOptions,
    customErrorResolve,
    25,
    4000,
  )

  const score = Requester.validateResultNumber(resolve.data, ['score'])

  if (!score) {
    const message = Requester.getResult(resolve.data as { [key: string]: any }, ['message'])

    if (message === 'Failed') {
      console.log(`Calculation failed at the fast-api level`)
      return Requester.success(
        request.data.jobRunID,
        Requester.withResult(resolve, `Calculation failed at the fast-api level`),
      )
    } else {
      return Requester.success(
        request.data.jobRunID,
        Requester.withResult(resolve, `Calculation failed at the fast-api level with no message`),
      )
    }
  }

  console.log(`Score of ${score} fulfilled!`)
  return Requester.success(request.data.jobRunID, Requester.withResult(resolve, score))
}
