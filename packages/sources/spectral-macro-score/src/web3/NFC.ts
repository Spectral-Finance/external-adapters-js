import { ethers } from 'ethers'
import NFCAbi from './NFC.json'

export const getPublicBundle = async (
  nfcAddress: string,
  userAddress: string,
  rpcUrl: string,
): Promise<string[]> => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const nfcContract = new ethers.Contract(
    nfcAddress,
    <ethers.ContractInterface>NFCAbi.abi,
    provider,
  )
  const nfcId = await nfcContract.getNFCId(userAddress)

  return await nfcContract.getAddresses(nfcId)
}
