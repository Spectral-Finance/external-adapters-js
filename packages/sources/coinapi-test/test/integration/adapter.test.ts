import request, { SuperTest, Test } from 'supertest'
import {
  mockWebSocketProvider,
  mockWebSocketServer,
  setEnvVariables,
  setupExternalAdapterTest,
  SuiteContext,
  createAdapter,
} from './setup'
import { expose, ServerInstance } from '@chainlink/external-adapter-framework'
import { mockAssetEndpoint, mockCryptoEndpoint } from './fixtures'
import process from 'process'
import { AddressInfo } from 'net'
import { WebSocketClassProvider } from '@chainlink/external-adapter-framework/transports'
import { sleep } from '@chainlink/external-adapter-framework/util'
import { Server } from 'mock-socket'

describe('execute', () => {
  describe('http', () => {
    let spy: jest.SpyInstance
    beforeAll(async () => {
      const mockDate = new Date('2022-01-01T11:11:11.111Z')
      spy = jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())
    })

    afterAll((done) => {
      spy.mockRestore()
      done()
    })

    const id = '1'

    const context: SuiteContext = {
      req: null,
      server: async () => {
        process.env['RATE_LIMIT_CAPACITY_SECOND'] = '6'
        process.env['METRICS_ENABLED'] = 'false'
        const server = (await import('../../src')).server
        return server() as Promise<ServerInstance>
      },
    }

    const envVariables = {
      API_KEY: process.env.API_USERNAME || 'fake-api-key',
    }

    setupExternalAdapterTest(envVariables, context)
    describe('crypto endpoint', () => {
      const data = {
        id,
        data: {
          base: 'BTC',
          quote: 'EUR',
        },
      }

      it('should return success', async () => {
        mockCryptoEndpoint()

        const response = await (context.req as SuperTest<Test>)
          .post('/')
          .send(data)
          .set('Accept', '*/*')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
        expect(response.body).toMatchSnapshot()
      })
    })

    describe('assets endpoint', () => {
      const data = {
        id,
        data: {
          endpoint: 'assets',
          base: 'ETH',
        },
      }

      it('should return success', async () => {
        mockAssetEndpoint()

        const response = await (context.req as SuperTest<Test>)
          .post('/')
          .send(data)
          .set('Accept', '*/*')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
        expect(response.body).toMatchSnapshot()
      })
    })
  })

  describe('websocket crypto endpoint', () => {
    let fastify: ServerInstance | undefined
    let req: SuperTest<Test>
    let mockWsServer: Server | undefined
    let spy: jest.SpyInstance
    const wsEndpoint = 'ws://localhost:9090'

    jest.setTimeout(100000)

    const data = {
      data: {
        base: 'BTC',
        quote: 'USD',
      },
    }

    let oldEnv: NodeJS.ProcessEnv
    beforeAll(async () => {
      oldEnv = JSON.parse(JSON.stringify(process.env))
      process.env['WS_SUBSCRIPTION_TTL'] = '10000'
      process.env['CACHE_MAX_AGE'] = '10000'
      process.env['CACHE_POLLING_MAX_RETRIES'] = '0'
      process.env['METRICS_ENABLED'] = 'false'
      process.env['WS_ENABLED'] = 'true'
      process.env['WS_API_ENDPOINT'] = wsEndpoint
      process.env['API_KEY'] = 'fake-api-key'
      const mockDate = new Date('2022-11-11T11:11:11.111Z')
      spy = jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      mockWebSocketProvider(WebSocketClassProvider)
      mockWsServer = mockWebSocketServer(wsEndpoint)

      fastify = await expose(createAdapter())
      req = request(`http://localhost:${(fastify?.server.address() as AddressInfo).port}`)

      // Send initial request to start background execute
      await req.post('/').send(data)
      await sleep(5000)
    })

    afterAll((done) => {
      spy.mockRestore()
      setEnvVariables(oldEnv)
      mockWsServer?.close()
      fastify?.close(done())
    })

    it('should return success', async () => {
      const makeRequest = () =>
        req
          .post('/')
          .send(data)
          .set('Accept', '*/*')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)

      const response = await makeRequest()
      expect(response.body).toMatchSnapshot()
    }, 30000)
  })
})
