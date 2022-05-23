import { AdapterRequest } from '@chainlink/types'
import { util } from '@chainlink/ea-bootstrap'
import nock from 'nock'
import * as process from 'process'
import request, { SuperTest, Test } from 'supertest'
import { server as startServer } from '../../src'
import {
  mockFirstHeartbeatMsg,
  mockHandshake,
  mockHeartbeatMsg,
  mockPriceEndpoint,
  mockSubscribe,
  mockUnsubscribe,
} from './fixtures'
import { AddressInfo } from 'net'
import {
  mockWebSocketProvider,
  mockWebSocketServer,
  MockWsServer,
  mockWebSocketFlow,
} from '@chainlink/ea-test-helpers'
import { WebSocketClassProvider } from '@chainlink/ea-bootstrap/dist/lib/middleware/ws/recorder'

describe('dxfeed', () => {
  let fastify: FastifyInstance
  let req: SuperTest<Test>

  beforeAll(async () => {
    fastify = await startServer()
    req = request(`localhost:${(fastify.server.address() as AddressInfo).port}`)
    process.env.API_USERNAME = process.env.API_USERNAME || 'fake-api-username'
    process.env.API_PASSWORD = process.env.API_PASSWORD || 'fake-api-password'
    if (util.parseBool(process.env.RECORD)) {
      nock.recorder.rec()
    }
  })

  afterAll((done) => {
    if (util.parseBool(process.env.RECORD)) {
      nock.recorder.play()
    }
    nock.restore()
    nock.cleanAll()
    fastify.close(done)
  })

  describe('price endpoint', () => {
    const priceRequest: AdapterRequest = {
      id: '1',
      data: {
        base: 'TSLA',
      },
    }

    it('should reply with success', async () => {
      mockPriceEndpoint()
      const response = await req
        .post('/')
        .send(priceRequest)
        .set('Accept', '*/*')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
      expect(response.body).toMatchSnapshot()
    })
  })
})

describe('websocket', () => {
  let mockedWsServer: InstanceType<typeof MockWsServer>
  let fastify: FastifyInstance
  let req: SuperTest<Test>

  let oldEnv: NodeJS.ProcessEnv
  beforeAll(async () => {
    if (!process.env.RECORD) {
      process.env.API_USERNAME = 'fake-api-username'
      process.env.API_PASSWORD = 'fake-api-password'
      process.env.WS_API_ENDPOINT = 'wss://localhost:8080'
      mockedWsServer = mockWebSocketServer(process.env.WS_API_ENDPOINT)
      mockWebSocketProvider(WebSocketClassProvider)
    }

    oldEnv = JSON.parse(JSON.stringify(process.env))
    process.env.WS_ENABLED = 'true'
    process.env.WS_SUBSCRIPTION_TTL = '1000'

    fastify = await startServer()
    req = request(`localhost:${(fastify.server.address() as AddressInfo).port}`)
  })

  afterAll((done) => {
    process.env = oldEnv
    nock.restore()
    nock.cleanAll()
    nock.enableNetConnect()
    fastify.close(done)
  })

  describe('price endpoint', () => {
    const jobID = '1'

    it('should return success', async () => {
      const data: AdapterRequest = {
        id: jobID,
        data: {
          base: 'TSLA',
        },
      }

      let flowFulfilled: Promise<boolean>
      if (!process.env.RECORD) {
        mockPriceEndpoint() // For the first response

        flowFulfilled = mockWebSocketFlow(
          mockedWsServer,
          [mockHandshake, mockFirstHeartbeatMsg, mockHeartbeatMsg, mockSubscribe, mockUnsubscribe],
          {
            enforceSequence: false,
            errorOnUnexpectedMessage: false,
          },
        )
      }

      const makeRequest = () =>
        req
          .post('/')
          .send(data)
          .set('Accept', '*/*')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)

      // We don't care about the first response, coming from http request
      // This first request will start both batch warmer & websocket
      await makeRequest()

      // This final request should disable the cache warmer, sleep is used to make sure that the data is  pulled from the websocket
      // populated cache entries.
      await util.sleep(100)
      const response = await makeRequest()

      expect(response.body).toEqual({
        jobRunID: '1',
        result: 788,
        statusCode: 200,
        maxAge: 30000,
        data: { result: 788 },
      })

      await flowFulfilled
    }, 10000)
  })
})
