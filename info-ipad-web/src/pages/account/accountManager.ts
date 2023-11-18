import ExpiredStorage from 'expired-storage'
import { AccountModel } from '../../types/account'

const expiredStorage = new ExpiredStorage()
const TOKEN_EXPIRED_SECONDS = 3600 * 24 * 7

const callbackSet = new Set<(account: AccountModel | null) => void>()
export default {
  listenAccountChange(callback: (account: AccountModel | null) => void) {
    callbackSet.add(callback)
  },
  unlistenAccountChange(callback: (account: AccountModel | null) => void) {
    callbackSet.delete(callback)
  },
  setAccount(account: AccountModel | null, token?: string) {
    if (account) {
      expiredStorage.setJson('account@account', account)
      if (token) {
        expiredStorage.setItem('account@token', token, TOKEN_EXPIRED_SECONDS)
      }
    } else {
      expiredStorage.removeItem('account@account')
      expiredStorage.removeItem('account@token')
    }
    callbackSet.forEach(callback => callback(account))
  },
  getAccount(): AccountModel {
    return expiredStorage.getItem('account@token') ? expiredStorage.getJson('account@account') : null
  },
  getToken() {
    return expiredStorage.getItem('account@token')
  },
}
