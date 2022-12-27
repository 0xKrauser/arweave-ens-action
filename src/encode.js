const contentHash = require('@ensdomains/content-hash')

export default function encode(hash) {
  try {
    return contentHash.fromArweave(hash)
  } catch (error) {
    throw error
  }
}
