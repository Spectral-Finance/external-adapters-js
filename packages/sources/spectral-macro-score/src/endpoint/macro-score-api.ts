import { Requester, AdapterError } from '@chainlink/ea-bootstrap'
import { InputParameters, RequestConfig } from '@chainlink/types'
import { BigNumber } from 'ethers'
// import { getPublicBundle } from '../web3/NFC'
import { SpectralAdapterConfig } from '../config'

export interface AddressesResponse {
  primary_address: string
  signed_addresses: string[]
  unsigned_addresses: string[]
}
//const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

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
  message: string
}
export interface ResolveResponse {
  score: string // numeric,
  message: string
}

export const inputParameters: InputParameters = {
  address: {
    required: true,
    description: 'The users address',
    type: 'string',
  },
}

export const computeTickWithScore = (score: number, tickSet: BigNumber[]): number => {
  for (const [index, tick] of tickSet.entries()) {
    if (tick.toNumber() > score) return index + 1
  }
  return tickSet.length // returns the last (greatest) tick
}

// Aave -> use anyone's address -> Scoracle -> Adapter

export const execute = async (request: IRequestInput, config: SpectralAdapterConfig) => {
  // const RPCProvider = `${config.PROVIDER_URL}${config.PROVIDER_API_KEY}`

  // request.data.address

  const addressOptions: RequestConfig = {
    baseURL: `${config.BASE_URL_FAST_API}`,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: config.timeout,
    url: '/availAddressesEA/',
    method: 'POST',
    data: {
      key: `${config.FAST_API_KEY}`,
      primary_address: `${request.data.address}`,
    },
  }
  console.log('\n', config.BASE_URL_FAST_API, '\n')

  const addressResponse = await Requester.request<AddressesResponse>(addressOptions, customError)
  console.log('\n', addressResponse, '\n')
  const unsignedAddresses = addressResponse.data.unsigned_addresses
  const addresses = addressResponse.data.signed_addresses
  const primaryAddress = addressResponse.data.primary_address

  if (!primaryAddress) {
    throw new AdapterError({
      message: 'FastAPI Error: Primary address does not exist on FAST API',
      cause: 'Primary address does not exist on FAST API',
    })
  }

  if (unsignedAddresses.length > 0) {
    throw new AdapterError({
      message: 'FastAPI Error: The bundle contains unsigned addresses',
      cause: 'The bundle contains unsigned addresses',
    })
  }

  // const bundle: string[] = await getPublicBundle(
  //   config.NFC_ADDRESS,
  //   request.data.address,
  //   RPCProvider,
  // )

  // if (!(bundle.length > 0)) {
  //   throw new AdapterError({
  //     message: 'No bundle found',
  //     cause: 'Error when fetching the bundle from the public NFC',
  //   })
  // }

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
      addresses,
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
