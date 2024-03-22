import { Controller, Get, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
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
    return { msg: 'Google Authentication' };
  }

  // Facebook authentication routes
  @Get('facebook/login')
  @UseGuards(FacebookAuthGuard)
  handleFacebookLogin() {
    return { msg: 'Facebook Authentication' };
  }

  @Get('facebook/redirect')
  @UseGuards(FacebookAuthGuard)
  handleFacebookRedirect(@Res() res: Response) {
    res.redirect('http://localhost:5173'); 
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
