import { Requester, AdapterError } from '@chainlink/ea-bootstrap'
import { InputParameters, RequestConfig } from '@chainlink/types'
import { BigNumber } from 'ethers'
import { getPublicBundle } from '../abi/NFC'
import { SpectralAdapterConfig } from '../config'

//const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const MacroScoreAPIName = 'submit'

export interface ICustomError {
  Response: string
}

export const supportedEndpoints = ['spectral-proxy']

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

export interface AddressesResponse {
  signed_addresses: string[]
  unsigned_addresses: string[]
  primary_address: string
}
export interface CalculationResponse {
  primary_address: string
  message: string
}
export interface ResolveResponse {
  score: string // numeric,
  message: string
}

export const inputParameters: InputParameters = {
  tokenIdInt: {
    required: true,
    description: 'The tokenID for the user as an integer value',
    type: 'string',
  },
  tickSetId: {
    required: true,
    description: 'The set of ticks used to compute the MACRO Score as in integer value',
    type: 'string',
  },
}

export const computeTickWithScore = (score: number, tickSet: BigNumber[]): number => {
  for (const [index, tick] of tickSet.entries()) {
    if (tick.toNumber() > score) return index + 1
  }
  return tickSet.length // returns the last (greatest) tick
}

export const execute = async (request: IRequestInput, config: SpectralAdapterConfig) => {
  const RPCProvider = `${config.INFURA_URL}${config.INFURA_API_KEY}`

  const bundle: string[] = await getPublicBundle(
    config.NFC_ADDRESS,
    request.data.address,
    RPCProvider,
  )

  console.log({ bundle })

  if (!(bundle.length > 0)) {
    throw new AdapterError({
      message: 'No bundle found',
      cause: 'Error when fetching the bundle from the public NFC',
    })
  }

  const calculateOptions: RequestConfig = {
    baseURL: `${config.BASE_URL_MACRO_API}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${config.MACRO_API_KEY}`,
    },
    timeout: config.timeout,
    url: '/calculate/',
    method: 'POST',
    data: {
      addresses: bundle,
    },
  }
  const resolveJobId = await Requester.request<CalculationResponse>(calculateOptions, customError)
  const jobId = Requester.getResult(resolveJobId.data as { [key: string]: any }, ['job'])

  if (!jobId) {
    throw new AdapterError({
      message: 'Calculate Error MACRO API',
      cause: 'Could not obtain a jobId',
    })
  }

  const resolveOptions: RequestConfig = {
    baseURL: `${config.BASE_URL_MACRO_API}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${config.MACRO_API_KEY}`,
    },
    timeout: config.timeout,
    url: `/resolve/job/${jobId}/`,
    method: 'GET',
  }

  let resolve = await Requester.request<ResolveResponse>(
    resolveOptions,
    customErrorResolve,
    25,
    4000,
  )

  const score = Requester.validateResultNumber(resolve.data, ['score'])

  if (!score) {
    const message = Requester.getResult(resolve.data as { [key: string]: any }, ['message'])

    if (message === 'Failed') {
      console.log(`Calculation failed at the macro-api level`)
      return Requester.success(
        request.data.jobRunID,
        Requester.withResult(resolve, `Calculation failed at the macro-api level`),
      )
    } else {
      return Requester.success(
        request.data.jobRunID,
        Requester.withResult(resolve, `Calculation failed at the macro-api level with no message`),
      )
    }
  }

  console.log(`Score of ${score} fulfilled!`)
  return Requester.success(request.data.jobRunID, Requester.withResult(resolve, score))
}
