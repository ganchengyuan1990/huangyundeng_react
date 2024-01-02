import { apiRequest, ApiResponse, requestApiWithToken } from '../utils/request';

// 获取热门问题
export async function getHotQuestions(tag: string = ''): Promise<{ questions: string[], tags: string[] } & ApiResponse> {
  return await apiRequest({ path: 'api/qa/hot_questions', method: 'GET', data: { tag } });
}

// 回答问题
export async function qa(question: string): Promise<{ answer: string, recordId: string, relatedQuestions: string[] } & ApiResponse> {
  return await requestApiWithToken({ path: 'api/qa/a', method: 'POST', data: {question} });
}

// 反馈信息
export async function feedback(record_id: string, attitude: string, message: string): Promise<ApiResponse> {
  return await requestApiWithToken({ path: 'api/qa/feedback', method: 'POST', data: {record_id, attitude, message} });
}
