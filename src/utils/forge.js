import Forge from 'node-forge'
import store from '@/store'

export function Encrypt(inputString) {
  const publicKeyPem = store.getters.publicKeyPem
  const prefix = store.getters.prefix
  try {
    const pubKey = Forge.pki.publicKeyFromPem(publicKeyPem)
    const buf = Forge.util.createBuffer(inputString, 'utf8')
    const encrypted = pubKey.encrypt(buf.bytes(), 'RSAES-OAEP', {
      md: Forge.md.sha256.create(),
      mgf1: {
        md: Forge.md.sha1.create()
      }
    })
    return prefix + Forge.util.bytesToHex(encrypted)
  } catch (e) {
    console.log(e)
  }
}
