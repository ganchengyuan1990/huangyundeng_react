import { cloud, request } from 'remax/wechat';
import snakeCaseKeys from 'snakecase-keys';
import accountManager from '../pages/account/accountManager';


export enum ApiResponseResultCode {
  Unknown = 0,
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
  constructor(resultCode: ApiResponseResultCode, msg?: string) {
    super(msg)
    this.resultCode = resultCode
  }

  toString() {
    return `UserException ${this.name}(${this.resultCode}): ${this.message}\n${this.stack}`
  }
}

export class SystemException extends Error {
  resultCode: ApiResponseResultCode
  constructor(resultCode: ApiResponseResultCode, msg?: string) {
    super(msg)
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
 // * @param navigate
 */
export function catchUserException(error: any): UserException {
  console.log(error.toString())
  if (error instanceof UserException) {
    return error
  }
  if (error instanceof SystemException) {
    // if (error.resultCode == ApiResponseResultCode.AUTH_REQUIRE) {
    //   navigate('/login')
    // }
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
 */
export async function apiRequest({ method, path, data, header, }: RequestObject): Promise<any & ApiResponse> {
  const result = await request<ApiResponse>({
    // `url` 是用于请求的服务器 URL
    url: 'http://127.0.0.1:8000/' + path,
    url: 'http://127.0.0.1:8000/' + path,

    // `method` 是创建请求时使用的方法
    method,

    // `headers` 是即将被发送的自定义请求头
    header: { 'X-Requested-With': 'XMLHttpRequest', ...header },

    // `data` 是作为请求主体被发送的数据
    // 只适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
    // 在没有设置 `transformRequest` 时，必须是以下类型之一：
    // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
    // - 浏览器专属：FormData, File, Blob
    // - Node 专属： Stream
    data: typeof data === 'object' ? snakeCaseKeys(data) : data,

    // `timeout` 指定请求超时的毫秒数(0 表示无超时时间)
    // 如果请求话费了超过 `timeout` 的时间，请求将被中断
    timeout: 30000,
  })
  if (result.statusCode === 200) {
    return result.data
    // return camelCaseKeys(result.data, { deep: true })
  }
  if (result.statusCode === 403 && result.data.result_code !== ApiResponseResultCode.Success) {
    throw new UserException(result.data.result_code, result.data.msg)
  }
  throw new SystemException(result.data.result_code, result.data.msg)
}

let cloudInstance: any = null;
export async function cloudRequest(obj: RequestObject, number = 0) {
  if (cloudInstance == null) {
    cloudInstance = new cloud.Cloud({
      resourceAppid: 'wxe0eb952ea44cbfa0', // 微信云托管环境所属账号，服务商appid、公众号或小程序appid
      resourceEnv: 'prod-7gxpz24cf0dae1f9', // 微信云托管的环境ID
    })
    await cloudInstance.init(); // init过程是异步的，需要等待init完成才可以发起调用
  }
  let result = null;
  try {
    result = await cloudInstance.callContainer({
      ...obj,
      data: typeof obj.data === 'object' ? snakeCaseKeys(obj.data) : obj.data,
      header: {
        ...obj.header,
        'X-WX-SERVICE': 'django-ru1n'
      },
    })
    console.log(`微信云托管调用结果${result.errMsg} | callid:${result.callID}`)
  } catch (e) {
    const error = e.toString()
    // 如果错误信息为未初始化，则等待300ms再次尝试，因为init过程是异步的
    if (error.indexOf('Cloud API isn\'t enabled') != -1 && number < 3) {
      return new Promise((resolve) => {
        setTimeout(function () {
          resolve(request(obj, number + 1))
        }, 300)
      })
    } else {
      throw new Error(`微信云托管调用失败${error}`)
    }
  }
  if (result.statusCode === 200) {
    return result.data
    // return camelCaseKeys(result.data, { deep: true }); // 业务数据在data中
  }
  if (result.statusCode === 403 && result.data.result_code !== ApiResponseResultCode.Success) {
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
