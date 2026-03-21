import { Response } from 'express';

interface ApiResponseData {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

export function sendSuccess(res: Response, message: string, data: any = {}, statusCode: number = 200) {
  const response: ApiResponseData = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
}

export function sendError(res: Response, message: string, errors: string[] = [], statusCode: number = 400) {
  const response: ApiResponseData = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(response);
}
