# bundlr-action
GitHub action to update content for an ENS name with an Arweave transaction hash

## Basic usage
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: |
          yarn build
      - uses: bundlr-action@v1
        with:
          name: "example.eth"
          hash: "_8I1hddMD0cFz32-k48dwS52PSPAMLh9K_oeiHiYRgw"
          private-key: ${{ secrets.PK }}
```

## Advanced usage
Use this together with other actions, this is an example with my own [bundlr-action](https://github.com/marketplace/actions/bundlr-action).
P.s. Check it out if you want to streamline build uploads to Arweave!

```yaml
jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v2
      - run: |
          yarn build
      - name: upload to arweave
        id: arweave_upload
        uses: bundlr-action@v1
        with:
          path: "./dist"
          private-key: ${{ secrets.PK }}
      - name: update ENS
        uses: arweave-ens-action@v1
        with:
          name: "example.eth"
          hash: ${{ steps.arweave_upload.outputs.transaction-id}}
          private-key: ${{ secrets.PK }}

```

## Inputs
#### private-key (required)
`private-key` is a required string input, accepts private keys and passphrases, while it is strongly suggested to follow correct opsec practices and use this private key and its wallet only for this endeavor, bear in mind that the wallet needs to have ownership of the ENS name you want to update.

```
  private-key:
    description: "Private Key of the account that will fund the gas costs - Please use an address limited to this purpose, use Github secrets and use good opsec in general"
    required: true
```

#### name (required)
`name` is a required string input, it should reference the ENS name you want to target and change its content. Please remember to include `.eth`.

```
  name:
    description: 'ENS Name, e.g. "name.eth"'
    required: true
```

#### hash (required)
`hash` is a required string input, it should be a arweave transaction hash or an empty string to unset it.

```
  hash:
    description: 'Arweave hash to set as content'
    required: true
```

#### rpc (optional)
`rpc` is the RPC url the ethers library should get the provider from, network and resolver are derived from it. It's set by default as `https://rpc.flashbots.net`, you can also change it in order to switch network.

```
  rpc:
    description: 'RPC Url to use instead of the default Flashbots one, the Network and the corresponding EnsResolver is derived from the RPC Url you use'
    required: false
    default: 'https://rpc.flashbots.net'
```

## Outputs

#### tx-hash
`tx-hash` returns the transaction hash for the setContentHash function called by the action.

## Known issues
- At the time of writing `resolver.getContentHash()` does not support the `arweave-ns` codec and throws an error, will need to wait for an update or a workaround to check if old and new content are the same in order to exit the action and save gas fees.