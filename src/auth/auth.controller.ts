import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { FacebookAuthGuard, GoogleAuthGuard } from './utils/Guards';

@Controller('auth')
export class AuthController {
  // Google authentication routes
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleGoogleLogin() {
    return { msg: 'Google Authentication' };
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  handleGoogleRedirect() {
    return { msg: 'OK' };
  }

  // Facebook authentication routes
  @Get('facebook/login')
  @UseGuards(FacebookAuthGuard)
  handleFacebookLogin() {
    return { msg: 'Facebook Authentication' };
  }

  @Get('facebook/redirect')
  @UseGuards(FacebookAuthGuard)
  handleFacebookRedirect() {
    return { msg: 'OK' };
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
