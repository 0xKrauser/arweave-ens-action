declare module '@ensdomains/eth-ens-namehash' {
  function normalize(input: string): string
  function hash(name: string): string
}

declare module '@ensdomains/content-hash' {
  function encode(codec: string, hash: string): string
  function getCodec(hash: string): string
  function decode(hash: string): string
  function fromArweave(hash: string): string
}