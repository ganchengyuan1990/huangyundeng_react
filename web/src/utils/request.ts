import axios from 'axios'
import snakeCaseKeys from 'snakecase-keys'
import camelCaseKeys from 'camelcase-keys'
import accountManager from '../pages/account/accountManager'
import { NavigateFunction } from 'react-router-dom'

export enum ApiResponseResultCode {
  // Unknown = 0,
  Success = 0,

  BAD_REQUEST = 400,
  AUTH_REQUIRE = 401,
  PAYMENT_REQUIRED = 402,
  PARAM_ERROR = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  REQUEST_TIMEOUT = 408,

  SYSTEM_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

export type ApiResponse = {
  // eslint-disable-next-line camelcase
  result_code: number,
  msg? : string,
}

export class UserException extends Error {
  resultCode: ApiResponseResultCode
  serverMsg: string | undefined
  constructor(resultCode: ApiResponseResultCode, msg?: string) {
    super(msg || '')
    this.resultCode = resultCode
    this.serverMsg = msg
  }

  toString() {
    return `UserException ${this.name}(${this.resultCode}): ${this.message}\n${this.stack}`
  }
}

export class SystemException extends Error {
  resultCode: ApiResponseResultCode
  constructor(resultCode: ApiResponseResultCode, msg?: string) {
    super(msg || '')
    this.resultCode = resultCode
  }

  toString() {
    return `SystemException ${this.name}(${this.resultCode}): ${this.message}\n${this.stack}`
  }
}

/**
 * 检查错误，只返回UserException类型的错误，其他继续throw给外层
 * 并且，临时在这里处理了一下SystemException错误中特定的类型
 * @param error
 * @param navigate
 */
export function catchUserException(error: any, navigate?: NavigateFunction): UserException {
  if (error instanceof UserException) {
    return error
  }
  if (error instanceof SystemException) {
    if (error.resultCode == ApiResponseResultCode.AUTH_REQUIRE && navigate) {
      accountManager.setAccount(null)
      navigate('/login')
    }
    throw error
  }
  throw error
}

export type RequestObject = {
  path: string,
  method: 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT',
  data?: string | object | ArrayBuffer,
  header?: object,
};

/**
 * 请求数据
 * 自动将params、data转化为下划线的格式
 * 自动将返回值转化为骆驼峰的格式
 */
export async function apiRequest({ method, path, data, header, }: RequestObject): Promise<any & ApiResponse> {
  const result = await axios.request<ApiResponse>({
    // `url` 是用于请求的服务器 URL
    url: 'https://aichan.info/' + path,
    // url: '/' + path,

    // `method` 是创建请求时使用的方法
    method,

    // `headers` 是即将被发送的自定义请求头
    // { 'X-Requested-With': 'XMLHttpRequest', ...headers }
    headers: { ...header },

    // `params` 是即将与请求一起发送的 URL 参数
    // 必须是一个无格式对象(plain object)或 URLSearchParams 对象
    // @ts-ignore
    params: method === 'GET' ? (typeof data === 'object' ? snakeCaseKeys(data) : data) : null,

    // `data` 是作为请求主体被发送的数据
    // 只适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
    // 在没有设置 `transformRequest` 时，必须是以下类型之一：
    // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
    // - 浏览器专属：FormData, File, Blob
    // - Node 专属： Stream
    // @ts-ignore
    data: method !== 'GET' ? (typeof data === 'object' ? snakeCaseKeys(data) : data) : null,

    // `timeout` 指定请求超时的毫秒数(0 表示无超时时间)
    // 如果请求话费了超过 `timeout` 的时间，请求将被中断
    timeout: 30000,

    // `withCredentials` 表示跨域请求时是否需要使用凭证
    withCredentials: false, // default

    // // `xsrfCookieName` 是用作 xsrf token 的值的cookie的名称
    // xsrfCookieName: 'XSRF-TOKEN', // default
    //
    // // `xsrfHeaderName` is the name of the http header that carries the xsrf token value
    // xsrfHeaderName: 'X-XSRF-TOKEN', // default

    // `onUploadProgress` 允许为上传处理进度事件
    onUploadProgress: function(progressEvent) {
      // Do whatever you want with the native progress event
    },

    // `onDownloadProgress` 允许为下载处理进度事件
    onDownloadProgress: function(progressEvent) {
      // 对原生进度事件的处理
    },

    // Reject only if the status code is greater than or equal to 500
    validateStatus: function(status) {
      return status < 500
    },
  })
  if (result.status === 200) {
    return camelCaseKeys(result.data, { deep: true })
  }
  if (result.status === 403 && result.data.result_code !== ApiResponseResultCode.Success) {
    throw new UserException(result.data.result_code, result.data.msg)
  }
  throw new SystemException(result.data.result_code, result.data.msg)
}

const tokenHeaderName = 'Authorization'
export async function requestApiWithToken(obj: RequestObject): Promise<any> {
  const token = accountManager.getToken()
  obj.header = {
    ...obj.header,
    [tokenHeaderName]: token
  }
  return await apiRequest(obj)
}
