import { Controller, Get, NotFoundException, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { FacebookAuthGuard, GoogleAuthGuard } from './utils/Guards';
import { JAuthGuard } from './utils/authMiddleWare';
import { AuthService } from './auth.service';
import { RolesGuard } from './utils/role.middleware';
import { GoogleStrategy } from './utils/google.strategy';
interface AuthenticatedUser {
  accessToken: string;
  redirectURL: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleStrategy: GoogleStrategy) {}
  // Google authentication routes
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleLogin(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as AuthenticatedUser;

      if (!user) {
        throw new Error('User not found');
      }


      const accessToken = user;

      res.json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  
  @Get('profile')
  @UseGuards(JAuthGuard, RolesGuard)
  async findUserProfile(@Req() request) {
    const userId = request.user.sub;
    const user = await this.authService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('facebook/login')
  @UseGuards(FacebookAuthGuard)
  handleFacebookLogin() {
    return { msg: 'Facebook Authentication' };
  }

  @Get('facebook/redirect')
  @UseGuards(FacebookAuthGuard)
  async handleFacebookRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as AuthenticatedUser;
      const { accessToken, redirectURL } = user;
  
      if (!redirectURL) {
        throw new Error("Redirect URL is undefined");
      }
  
      res.redirect(redirectURL);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

}
