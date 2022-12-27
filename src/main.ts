import * as core from '@actions/core'
import { providers, Wallet, utils as ethersUtils } from 'ethers'
import encode from './encode'
import { hash as namehash } from '@ensdomains/eth-ens-namehash'
import getOwner from './getOwner'
// import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// dotenv.config()

async function run(): Promise<void> {
  // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
  function debug(msg: string): void {
    core.debug(msg)
    // console.log(msg)
  }
  function fail(msg: string): void {
    core.setFailed(`Action failed: ${msg}`)
    // console.log(`Action failed: ${msg}`)
  }
  try {
    const privateKey: string = core.getInput('private-key')
    const rpc: string = core.getInput('rpc')
    const name: string = core.getInput('name')
    const hash: string = core.getInput('hash')

    const provider = new providers.JsonRpcProvider(rpc)
    const resolver = await provider.getResolver(name)
    if (!resolver) {
      fail('Failed to fetch a resolver instance for this name and RPC Provider')
      return
    }

    // Create a wallet with private key/passphrase and fail if nonexistant
    let wallet: Wallet
    try {
      wallet = new Wallet(privateKey, provider)
    } catch (error) {
      if (error instanceof Error)
        fail('Failed to create a Wallet instance with this private key')
      return
    }

    const balance = await wallet.getBalance()

    if (!balance.gt('0')) {
      fail("Balance of 0, can't cover gas fees")
      return
    }

    const { address } = wallet
    const nameOwner = await getOwner(provider, name)
    debug(`wallet: ${address}, name owner: ${nameOwner}`)

    if (address !== nameOwner) {
      fail("Wallet is not the owner of this ENS name, can't edit records")
      return
    }

    let contentHash: string
    // Calculate and check if new content hash is same as current to save on gas fees
    // Temporarily commented, ethers.js currently does not support Arweave hashes and throws error if one is found as current content
    // Waiting for an update or to implement a workaround
    /*
    try {
      contentHash = await resolver.getContentHash()
      debug('Current Content: '+ contentHash)

      if (contentHash === hash) {
        debug(`Content hash is already "${contentHash}", exiting...`)
        return
      }
    } catch (error) {
      if (error instanceof Error) fail(error.message)
      return
    }
    */
    const nameHash = namehash(name)

    if(!hash) {
      const transaction = await wallet.sendTransaction({
        to: resolver.address,
        data: ethersUtils.hexConcat([
          '0x304e6ade',
          ethersUtils.defaultAbiCoder.encode(
            ['bytes32', 'bytes'],
            [nameHash, '0x0000000000000000000000000000000000000000']
          )
        ])
      })
  
      core.setOutput('tx-hash', transaction.hash)
      return
    }

    // Calculate hash for content
    contentHash = `0x${encode(hash)}`

    const transaction = await wallet.sendTransaction({
      to: resolver.address,
      data: ethersUtils.hexConcat([
        '0x304e6ade',
        ethersUtils.defaultAbiCoder.encode(
          ['bytes32', 'bytes'],
          [nameHash, contentHash]
        )
      ])
    })

    core.setOutput('tx-hash', transaction.hash)
  } catch (error) {
    if (error instanceof Error) fail(error.message)
  }
}

run()
