# Chainlink External Adapter for Spectral-MACRO-Score

Used to retrieve a MACRO Score for an Ethereum address

### Environment Variables

| Required? |       Name        |             Description             | Options | Defaults to |
| :-------: | :---------------: | :---------------------------------: | :-----: | :---------: |
|    ✅     | BASE_URL_FAST_API |          Fast API Base URL          |         |             |
|    ✅     |   FAST_API_KEY    |            FAST API Key             |         |             |
|    ✅     |  WARMUP_ENABLED   | Warmup feature of chainlink adapter |         |    false    |

---

## Spectral-MACRO-Score Endpoint

The default endpoint to retrieve a score is the calculate endpoint (written as Sample Input below)
The adapter is prepared to retrieve an extra data field by writting `extraData` as the endpoint input.

### Input Params

| Required? |    Name    |               Description               |        Options        | Defaults to |
| :-------: | :--------: | :-------------------------------------: | :-------------------: | :---------: |
|    ✅     | `address`  | The address we want to get a score from |                       |             |
|    ✅     | `endpoint` |     The adapter endpoint to be used     | calculate / extraData |  calculate  |

### Sample Input

```json
{
  "jobRunID": "1",
  "data": {
    "address": "0x4B11B9A1582E455c2C5368BEe0FF5d2F1dd4d28e",
    "endpoint": "calculate"
  }
}
```

### Sample Output

```json
{
  "jobRunID": "1",
  "data": {
    "result": 514 // this will be the resulting MACRO Score
  },
  "statusCode": 200
}
```

### Chainlink Node Job example

```json
type = "directrequest"
schemaVersion = 1
name = "Source Score Into Scoracle"
contractAddress = "0x4B1581eFa58C2245B401cA4C88f29D46d8420cc1"
maxTaskDuration = "0s"
observationSource = """
    decode_log   [type=ethabidecodelog
                  abi="OracleRequest(bytes32 indexed specId, address requester, bytes32 requestId, uint256 payment, address callbackAddr, bytes4 callbackFunctionId, uint256 cancelExpiration, uint256 dataVersion, bytes data)"
                  data="$(jobRun.logData)"
                  topics="$(jobRun.logTopics)"]
    decode_cbor [type=cborparse data="$(decode_log.data)"]
    macro_score        [type=bridge name="spectral-macro-adapter-test-secure" requestData="{\\"data\\":{\\"address\\": $(decode_cbor.address),\\"endpoint\\": \\"calculate\\"}}"]
    parse_score        [type=jsonparse path="result"]
    extra_data        [type=bridge name="spectral-macro-adapter-test-secure" requestData="{\\"data\\":{\\"address\\": $(decode_cbor.address),\\"endpoint\\": \\"extraData\\"}}"]
    parse_extra        [type=jsonparse path="result"]
    encode_data  [type=ethabiencode abi="(bytes32 requestId, uint256 scoreResponse, bytes calldata extraData)" data="{\\"requestId\\": $(decode_log.requestId), \\"scoreResponse\\":$(parse_score), \\"extraData\\":$(parse_extra)}"]
    encode_tx  [type="ethabiencode"
                abi="fulfillOracleRequest2(bytes32 requestId, uint256 payment, address callbackAddress, bytes4 callbackFunctionId, uint256 expiration, bytes calldata data)"
                data="{\\"requestId\\": $(decode_log.requestId), \\"payment\\":   $(decode_log.payment), \\"callbackAddress\\": $(decode_log.callbackAddr), \\"callbackFunctionId\\": $(decode_log.callbackFunctionId), \\"expiration\\": $(decode_log.cancelExpiration), \\"data\\": $(encode_data)}"
                ]
    submit_tx    [type=ethtx to="0x4B1581eFa58C2245B401cA4C88f29D46d8420cc1" data="$(encode_tx)"]

    decode_log -> decode_cbor
    decode_cbor -> macro_score -> parse_score
    decode_cbor -> extra_data -> parse_extra
    parse_score -> encode_data
    parse_extra -> encode_data
    encode_data -> encode_tx -> submit_tx
"""
externalJobID = "9348f5ba-3f57-4f65-958a-675e468da9c8"

```
