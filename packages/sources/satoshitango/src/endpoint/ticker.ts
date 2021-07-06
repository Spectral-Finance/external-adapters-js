import { Requester, Validator } from '@chainlink/ea-bootstrap'
import { ExecuteWithConfig, Config } from '@chainlink/types'

export const supportedEndpoints = ['ticker']

const customParams = {
  base: ['base', 'from', 'coin'],
  quote: ['quote', 'to', 'market'],
  field: false,
}

export const execute: ExecuteWithConfig<Config> = async (request, config) => {
  const validator = new Validator(request, customParams)
  if (validator.error) throw validator.error

  const jobRunID = validator.validated.id
  const base = validator.validated.data.base.toUpperCase()
  const quote = validator.validated.data.quote.toUpperCase()
  const url = `ticker/${quote}`
  const field = validator.validated.data.field || 'bid'

  const options = {
    ...config.api,
    url,
  }

  const response = await Requester.request(options)
  response.data.result = Requester.validateResultNumber(response.data, [
    'data',
    'ticker',
    base,
    field,
  ])

  return Requester.success(jobRunID, response, config.verbose)
}
