import { expose } from '@chainlink/ea-bootstrap'
import { makeExecute, makeWSHandler } from './adapter'
import { NAME, makeConfig } from './config'
import { ResponseSchema } from './endpoint/crypto/top'

const { server } = expose(makeExecute(), makeWSHandler())
export { NAME, makeExecute, makeConfig, server, ResponseSchema }
