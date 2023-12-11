import { apiRequest, ApiResponse, requestApiWithToken } from '../utils/request';
import { FformModel, FormValueIn, FormValueOut } from '../types/fform';

// 尝试创建表单
export async function apiFformCreateForm(formInterfaceId: string, primaryColumnKey: string, value: string): Promise<{ formId: string, values: Record<string, FormValueOut> } & ApiResponse> {
  return await requestApiWithToken({ path: 'api/fform/create-form', method: 'POST', data: {
    formInterfaceId, primaryColumnKey, value
  } });
}

// 获取表单
export async function apiFformGetForm(formId: string | number): Promise<{ fform: FformModel } & ApiResponse> {
  return await apiRequest({ path: 'api/fform/get-form', method: 'GET', data: { formId } });
}

// 获取表单
export async function apiFformGetForms(
  formInterfaceId: string,
  status?: 'editing' | 'auditing' | 'confirmed',
  auditTimeStart?: Date,
  auditTimeEnd?: Date,
  submitTimeStart?: Date,
  submitTimeEnd?: Date,
  filterValues: Record<string, FormValueIn> = {},
): Promise<{ fforms: FformModel[] } & ApiResponse> {
  return await apiRequest({ path: 'api/fform/get-forms', method: 'POST', data: {
      formInterfaceId,
      status,
      auditTimeStart,
      auditTimeEnd,
      submitTimeStart,
      submitTimeEnd,
      filterValues,
    } });
}

// 更新表单
export async function apiFformUpsertForm(formId: string, values: Record<string, FormValueIn>): Promise<{ formId: string, values: Record<string, FormValueOut> } & ApiResponse> {
  return await requestApiWithToken({ path: 'api/fform/upsert-form', method: 'POST', data: {
      formId, values
    } });
}

// 提交审批
export async function apiFformSubmitAudit(formId: string | number): Promise<ApiResponse> {
  return await requestApiWithToken({ path: 'api/fform/form-submit-audit', method: 'POST', data: { formId } });
}

// 审批表单
export async function apiFformChangeAudit(formId: string | number, targetStatus: 'editing' | 'auditing' | 'confirmed'): Promise<ApiResponse> {
  return await requestApiWithToken({ path: 'api/fform/form-change-audit', method: 'POST', data: { formId, targetStatus } });
}

// 获取上传token
export async function apiFformUploadToken(formId: string): Promise<{ token: string } & ApiResponse> {
  return await apiRequest({ path: 'api/fform/upload-token', method: 'GET', data: { formId } });
}
