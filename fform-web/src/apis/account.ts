import { ApiResponse, apiRequest, requestApiWithToken } from '../utils/request';
import { AccountModel } from '../types/account';

// 获取我的信息
export async function getMyInfo() {
  return await requestApiWithToken({ path: 'api/account/my-info', method: 'GET' });
}

// 设置我的信息
export async function postMyInfo(update_keys: string[], avatar_url: string, nickname: string, sex: string, email: string, class_name: string, desc: string) {
  return await requestApiWithToken({
    path: 'api/account/my-info', method: 'POST', data: {
      update_keys, avatar_url, nickname, sex, email, class_name, desc,
    }
  });
}

// 退出登录
export async function postLogout() {
  return await requestApiWithToken({ path: 'api/account/logout', method: 'POST', data: {} });
}

export async function postUpLogin(username: string, password: string)
  : Promise<{ account: AccountModel, sessionid: string } & ApiResponse> {
  return await apiRequest({ path: 'api/account/up-login', method: 'POST', data: { username, password } });
}
