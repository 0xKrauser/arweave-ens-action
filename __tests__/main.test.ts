import { expect, test } from '@jest/globals'
import * as contentHash from '@ensdomains/content-hash'

const input_hash = '_8I1hddMD0cFz32-k48dwS52PSPAMLh9K_oeiHiYRgw'
const encoded_hash =
  '90b2ca05ffc23585d74c0f4705cf7dbe938f1dc12e763d23c030b87d2bfa1e887898460c'

test('resolve provider', () => {})

test('encode arweave hash', () => {
  const actual = contentHash.encode('arweave-ns', input_hash)
  expect(actual).toEqual(encoded_hash)
})

test('get codec', () => {
  const actual = contentHash.getCodec(encoded_hash)
  expect(actual).toEqual('arweave-ns')
})
test('decode', () => {
  const actual = contentHash.decode(encoded_hash)
  expect(actual).toEqual(input_hash)
})
