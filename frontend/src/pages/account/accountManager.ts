import ExpiredStorage from 'expired-storage'
import { AccountModel } from '../../types/account'
import { setStorageSync, getStorageSync, clearStorageSync, removeStorageSync, getStorageInfoSync } from 'remax/wechat';

const wxStorage = {
  getItem: getStorageSync,
  setItem: setStorageSync,
  removeItem: removeStorageSync,
  clear: clearStorageSync,
  keys() {
    const res = getStorageInfoSync()
    return res.keys;
  }
};
const expiredStorage = new ExpiredStorage(wxStorage)
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
