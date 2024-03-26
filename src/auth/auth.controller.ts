import { Controller, Get, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JWTAuthGuard } from './utils/Guards';
import { JAuthGuard } from './authMiddleWare';

@Controller('auth')
export class AuthController {
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
  getProfile(@Req() request) {
    return request.user; 
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
