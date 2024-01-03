import { ApiResponse, apiRequest, requestApiWithToken } from '../utils/request';
import { AccountModel } from '../types/account';

// 获取我的信息
export async function getMyInfo(api) {
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

export async function postLogin(miniId, code)
  : Promise<{ account: AccountModel, sessionid: string, need_update_info: boolean } & ApiResponse> {
  return await apiRequest({ path: 'api/account/login', method: 'POST', data: { miniId, code } });
}

// 获取站点基本信息
export async function getBase(miniId)
  : Promise<{ title: string, showLogo: boolean } & ApiResponse> {
  return await apiRequest({ path: 'api/account/base', method: 'GET', data: { miniId } });
}

// 获取腾讯云信息
export async function getTencentInfo(miniId)
  : Promise<{ appid: string, secretid: string, secretkey: string } & ApiResponse> {
  return await apiRequest({ path: 'api/account/tencent-info', method: 'GET', data: { miniId } });
}
