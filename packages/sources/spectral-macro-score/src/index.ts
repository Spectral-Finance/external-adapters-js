import { expose } from '@chainlink/ea-bootstrap'
import { makeExecute } from './adapter'
import { makeConfig, NAME } from './config'

// Original changes
const adapterContext = { name: NAME }

const { server } = expose(adapterContext, makeExecute())
export { NAME, makeExecute, makeConfig, server }

//Daniel's changes
//export = { NAME, makeExecute, makeConfig, ...expose(NAME, makeExecute()) }
