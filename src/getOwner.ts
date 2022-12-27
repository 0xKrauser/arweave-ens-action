import { constants, Contract, providers, utils } from 'ethers/lib/ethers'

export default async function getOwner(
  provider: providers.JsonRpcProvider,
  name: string
): Promise<string> {
  const ensAddr = (await provider.getNetwork()).ensAddress
  if (!ensAddr) return ''
  const ensAbi = ['function owner(bytes32) view returns (address)']
  const contract = new Contract(ensAddr, ensAbi, provider)
  const addr = await contract.owner(utils.namehash(name))
  if (addr === constants.AddressZero) {
    return ''
  }
  return addr
}
