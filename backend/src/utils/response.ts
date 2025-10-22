import { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: string,
  message: string,
  statusCode = 500
): Response => {
  const response: ErrorResponse = {
    success: false,
    error,
    message,
  };

  return res.status(statusCode).json(response);
};
