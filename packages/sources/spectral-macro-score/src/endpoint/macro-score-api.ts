// import {
//   AdapterData,
//   AdapterRequest,
//   AdapterResponse,
//   // AxiosRequestConfig,
//   Requester,
//   // Validator,
// } from '@chainlink/ea-bootstrap'
// import { InputParameters } from '@chainlink/ea-bootstrap'
// import { BigNumber } from 'ethers'
// import { SpectralAdapterConfig } from '../config/config'

// export const MacroScoreAPIName = 'spectral-proxy'

// export interface ICustomError {
//   Response: string
// }

// export const supportedEndpoints = ['spectral-proxy']

// // const customError = (data: ICustomError | ScoreResponse[]) => {
// //   if (Array.isArray(data)) return false
// //   if (data.Response === 'Error') return true
// //   return false
// // }

// export interface IRequestInput extends AdapterData {
//   id: string // numeric
//   data: {
//     tokenIdInt: string // numeric
//     tickSetId: string // numeric
//     jobRunID: string // numeric
//   }
// }

// export interface ScoreResponse {
//   address: string
//   score_aave: string // numeric
//   score_comp: string // numeric
//   score: string // numeric
//   updated_at: string // ISO UTC string
//   is_updating_aave: boolean
//   is_updating_comp: boolean
//   result: number
// }

// export const description = 'Default endpoint used to retrieve a MACRO Score for a given token ID.'

// export type TInputParameters = { tokenIdInt: string; tickSetId: string }
// export const inputParameters: InputParameters<TInputParameters> = {
//   tokenIdInt: {
//     required: true,
//     description: 'The tokenID for the user as an integer value',
//     type: 'string',
//   },
//   tickSetId: {
//     required: true,
//     description: 'The set of ticks used to compute the MACRO Score as in integer value',
//     type: 'string',
//   },
// }

// export const computeTickWithScore = (score: number, tickSet: BigNumber[]): number => {
//   for (const [index, tick] of tickSet.entries()) {
//     if (tick.toNumber() > score) return index + 1
//   }
//   return tickSet.length // returns the last (greatest) tick
// }

// export const execute = async (
//   request: AdapterRequest<IRequestInput>,
//   config: SpectralAdapterConfig,
// ): Promise<AdapterResponse<AdapterData>> => {
//   // const validator = new Validator(request, inputParameters)

//   // const tokenIdInt = validator.validated.data.tokenIdInt

//   // const options: AxiosRequestConfig = {
//   //   ...config.api,
//   //   url: '/spectral-proxy',
//   //   method: 'POST',
//   //   data: {
//   //     tokenInt: `${tokenIdInt}`,
//   //   },
//   // }
//   // const response = await Requester.request<ScoreResponse[]>(options, customError)
//   // const score = Requester.validateResultNumber(response.data[0], ['score'])
//   return Requester.success(
//     request.data.jobRunID?.toString(),
//     {
//       data: { result: '613' },
//     },
//     config.verbose,
//   )
// }
import { AdapterData, AdapterRequest, Requester } from '@chainlink/ea-bootstrap'
import { AdapterResponse, InputParameters } from '@chainlink/ea-bootstrap'
import { SpectralAdapterConfig } from '../config'

export const MacroScoreAPIName = 'calculate'

export interface ICustomError {
  Response: string
}

// const customError = (data: ICustomError) => {
//   if (Array.isArray(data)) return false
//   if (data.Response === 'Error') return true
//   return false
// }

export interface IResolveResult {
  message: string
}

// const customErrorResolve = (data: IResolveResult) => {
//   if (data.message === 'calculating') return true
//   return false
// }

export interface CalculationResponse {
  primary_address: string
  job_id: string
}
export interface ResolveResponse {
  job: string
  score: string // numeric,
}

export interface IRequestInput extends AdapterData {
  id: string // numeric
  data: {
    address: string // numeric
    jobRunID: string // numeric
  }
}
export type TInputParameters = { address: string }

export const inputParameters: InputParameters<TInputParameters> = {
  address: {
    required: true,
    description: 'The users address',
    type: 'string',
  },
}

export const execute = async (
  request: AdapterRequest<IRequestInput>,
  config: SpectralAdapterConfig,
): Promise<AdapterResponse<AdapterData>> => {
  // const address = request.data.address?.toString() || ""

  // if (!utils.isAddress(address)) {
  //   throw new AdapterError({
  //     message: 'Adapter Error: Invalid address',
  //     cause: 'Invalid address',
  //   })
  // }

  // const calculateOptions: AxiosRequestConfig = {
  //   baseURL: `${config.BASE_URL_FAST_API}`,
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   timeout: config.timeout,
  //   url: '/calculate/',
  //   method: 'POST',
  //   data: {
  //     key: `${config.FAST_API_KEY}`,
  //     primary_address: `${request.data.address}`,
  //   },
  // }
  // const resolveJobId = await Requester.request<CalculationResponse>(calculateOptions, customError)
  // const jobId = Requester.getResult(resolveJobId.data as { [key: string]: any }, ['job_id'])

  // if (!jobId) {
  //   throw new AdapterError({
  //     message: 'Calculate Error Fast API',
  //     cause: 'Could not obtain a jobId',
  //   })
  // }

  // const resolveOptions: AxiosRequestConfig = {
  //   baseURL: `${config.BASE_URL_FAST_API}`,
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   timeout: config.timeout,
  //   url: `/resolve/job/`,
  //   method: 'POST',
  //   data: {
  //     primaryAddress: address,
  //     job_id: jobId,
  //     key: `${config.FAST_API_KEY}`,
  //   },
  // }

  // const resolve = await Requester.request<ResolveResponse>(
  //   resolveOptions,
  //   customErrorResolve,
  //   25,
  //   4000,
  // )

  // const score = Requester.validateResultNumber(resolve.data, ['score'])

  // if (!score) {
  //   const message = Requester.getResult(resolve.data as { [key: string]: any }, ['message'])

  //   if (message === 'Failed') {
  //     console.log(`Calculation failed at the fast-api level`)
  //     return Requester.success(
  //       request.data.jobRunID?.toString(),
  //       Requester.withResult(resolve, `Calculation failed at the fast-api level`),
  //     )
  //   } else {
  //     return Requester.success(
  //       request.data.jobRunID?.toString(),
  //       Requester.withResult(resolve, `Calculation failed at the fast-api level with no message`),
  //     )
  //   }
  // }

  console.log(`Score of dupa fulfilled!`)
  return Requester.success(
    request.data.jobRunID?.toString(),
    {
      data: { result: '616' },
    },
    config.verbose,
  )
  // return Requester.success(request.data.jobRunID?.toString(), Requester.withResult(resolve, score))
}
