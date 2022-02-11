# Chainlink External Adapter for Spectral-MACRO-Score

Used to retrieve a MACRO Score for an Ethereum address

### Environment Variables

| Required? |        Name        |             Description              | Options | Defaults to |
| :-------: | :----------------: | :----------------------------------: | :-----: | :---------: |
|    ✅     | BASE_URL_MACRO_API |       MACRO Score API base URL       |         |             |
|    ✅     | BASE_URL_FAST_API  |          Fast API Base URL           |         |             |
|    ✅     |   MACRO_API_KEY    |         MACRO Score API Key          |         |             |
|    ✅     |    FAST_API_KEY    |             FAST API Key             |         |             |
|    ✅     |    PROVIDER_URL    |      Base URL of Web3 Provider       |         |             |
|    ✅     |  PROVIDER_API_KEY  |           Provider API key           |         |             |
|    ✅     |    NFC_ADDRESS     | Address of the NFC registry contract |         |             |

---

## Spectral-MACRO-Score Endpoint

Default endpoint used to retrieve a MACRO score for a given address.

### Input Params

| Required? |   Name    |               Description               | Options | Defaults to |
| :-------: | :-------: | :-------------------------------------: | :-----: | :---------: |
|    ✅     | `address` | The address we want to get a score from |         |             |

### Sample Input

```json
{
  "jobRunID": "1",
  "data": {
    "address": "0x4B11B9A1582E455c2C5368BEe0FF5d2F1dd4d28e"
  }
}
```

### Sample Output

```json
{
  "jobRunID": "1",
  "data": {
    "result": 514 // this will be the resulting MACRO Score tick
  },
  "statusCode": 200
}
```

### Chainlink Node Job example

```json
type = "directrequest"
schemaVersion = 1
name = "Source Tick Into NFC"
contractAddress = "ADDRESS"
maxTaskDuration = "0s"
observationSource = """
    decode_log   [type=ethabidecodelog
                  abi="OracleRequest(bytes32 indexed specId, address requester, bytes32 requestId, uint256 payment, address callbackAddr, bytes4 callbackFunctionId, uint256 cancelExpiration, uint256 dataVersion, bytes data)"
                  data="$(jobRun.logData)"
                  topics="$(jobRun.logTopics)"]
    decode_cbor [type=cborparse data="$(decode_log.data)"]
    macro_score_adapter        [type=bridge name="spectral-macro-score-adapter" requestData="{\\"data\\":{\\"tokenIdHash\\": $(decode_cbor.tokenIdHash), \\"tickSetId\\": $(decode_cbor.tickSetId)}}"]
    parse        [type=jsonparse path="result"]
    encode_data  [type=ethabiencode abi="(uint256 tickResponse)" data="{\\"tickResponse\\":$(parse)}"]
    encode_tx    [type=ethabiencode
                  abi="fulfillOracleRequest(bytes32 requestId, uint256 payment, address callbackAddress, bytes4 callbackFunctionId, uint256 expiration, bytes32 data)"
                  data="{\\"requestId\\": $(decode_log.requestId),\\"payment\\": $(decode_log.payment),\\"callbackAddress\\": $(decode_log.callbackAddr),\\"callbackFunctionId\\": $(decode_log.callbackFunctionId),\\"expiration\\": $(decode_log.cancelExpiration),\\"data\\": $(encode_data)}"]
    submit_tx    [type=ethtx to="ADDRESS" data="$(encode_tx)"]

    decode_log -> decode_cbor -> macro_score_adapter -> parse -> encode_data -> encode_tx -> submit_tx
"""
```
