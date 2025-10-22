import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import authService from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from '../types/auth.schemas';

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data: RegisterInput = req.body;
      const result = await authService.register(data);

      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data: LoginInput = req.body;
      const result = await authService.login(data);

      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await authService.getProfile(userId);

      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: UpdateProfileInput = req.body;
      const user = await authService.updateProfile(userId, data);

      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: ChangePasswordInput = req.body;
      const result = await authService.changePassword(userId, data);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
