import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Put, Redirect, Req, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { FacebookAuthGuard, GoogleAuthGuard } from './utils/Guards';
import { JAuthGuard } from './utils/authMiddleWare';
import { AuthService } from './auth.service';
import { RolesGuard } from './utils/role.middleware';
import { GoogleStrategy } from './utils/google.strategy';
import { UpdateUserDto } from './dto/user.dto';
import { UserEntity } from 'src/user/entities';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

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
  handleGoogleLogin() {
    return { msg: 'Google Authentication' };
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleRedirect(@Req() req: Request, @Res() res: Response) {
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
  
  @Put(':id')
  @UseGuards(JAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request,
    @UploadedFile() avatar?: Multer.File,
  ): Promise<UserEntity> {
    const authenticatedUserId = request.user.sub;
    const authenticatedUserRole = request.user.role;
  
    if (authenticatedUserId != id && authenticatedUserRole !== 'admin') {
      throw new UnauthorizedException('You are not authorized to update this resource.');
    }
    return this.authService.updateUser(id, updateUserDto, avatar);
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
