import { apiRequest, ApiResponse, requestApiWithToken } from '../utils/request';

export type FormValueIn = string | boolean
export type FormValueOut = string | boolean | { id: string, fname: string, url: string }

// 尝试创建表单
export async function apiFformCreateForm(formInterfaceId: string, primaryColumnKey: string, value: string): Promise<{ formId: string, values: Record<string, FormValueOut> } & ApiResponse> {
  return await requestApiWithToken({ path: 'api/fform/create-form', method: 'POST', data: {
    formInterfaceId, primaryColumnKey, value
  } });
}

// 获取表单
export async function apiFformGetForm(formId: string): Promise<{ formId: string, values: Record<string, FormValueOut> } & ApiResponse> {
  return await apiRequest({ path: 'api/fform/get-form', method: 'GET', data: { formId } });
}

// 更新表单
export async function apiFformUpsertForm(formId: string, values: Record<string, FormValueIn>): Promise<{ formId: string, values: Record<string, FormValueOut> } & ApiResponse> {
  return await requestApiWithToken({ path: 'api/fform/upsert-form', method: 'POST', data: {
      formId, values
    } });
}

// 更新表单
export async function apiFformSubmitAudit(formId: string): Promise<{ formId: string, values: Record<string, FormValueOut> } & ApiResponse> {
  return await requestApiWithToken({ path: 'api/fform/form-submit-audit', method: 'POST', data: { formId } });
}

// 获取上传token
export async function apiFformUploadToken(formId: string): Promise<{ token: string } & ApiResponse> {
  return await apiRequest({ path: 'api/fform/upload-token', method: 'GET', data: { formId } });
}
