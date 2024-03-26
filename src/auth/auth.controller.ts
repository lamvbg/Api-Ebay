import { Controller, Get, NotFoundException, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JWTAuthGuard } from './utils/Guards';
import { JAuthGuard } from './utils/authMiddleWare';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // Google authentication routes
  @Get('google/login')
  @UseGuards(JWTAuthGuard)
  handleGoogleLogin() {
    return { msg: 'Google Authentication' };
  }

  @Get('google/redirect')
  @UseGuards(JWTAuthGuard)
  handleGoogleRedirect() {
    return { msg: 'Google Authentication' };
  }

  @Get('profile')
  @UseGuards(JAuthGuard)
  async findUserProfile(@Req() request) {
    const userId = request.user.sub;
    const user = await this.authService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Facebook authentication routes
  @Get('facebook/login')
  @UseGuards(JWTAuthGuard)
  handleFacebookLogin() {
    return { msg: 'Facebook Authentication' };
  }

  @Get('facebook/redirect')
  @UseGuards(JWTAuthGuard)
  handleFacebookRedirect() {
    return { msg: 'Google Authentication' };; 
  }

  @Get('status')
  user(@Req() request: Request) {
    console.log(request.user);
    if (request.user) {
      return { msg: 'Authenticated' };
    } else {
      return { msg: 'Not Authenticated' };
    }
  }
}
