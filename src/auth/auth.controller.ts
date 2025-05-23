import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Put, Redirect, Req, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, Headers, Post, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { FacebookAuthGuard, GoogleAuthGuard } from './utils/Guards';
import { JAuthGuard } from './utils/authMiddleWare';
import { AuthService } from './auth.service';
import { RolesGuard } from './utils/role.middleware';
import { GoogleStrategy } from './utils/google.strategy';
import { UpdateUserDto } from './dto/user.dto';
import { UserEntity } from '../user/entities';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { ForgotPasswordDto } from './dto/forgot.dto';
import { ResetPasswordDto } from './dto/reset.dto';

interface AuthenticatedUser {
  accessToken: string;
  redirectURL: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleStrategy: GoogleStrategy) { }
  // Google authentication routes
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleGoogleLogin() {
    return { msg: 'Google Authentication' };
  }

  @Post('signin')
  async signIn(@Body('email') email: string, @Body('password') password: string): Promise<any> {
    try {
      const token = await this.authService.signIn(email, password);
      return { token };
    } catch (error) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  @Post('register')
  async register(@Body(ValidationPipe) createUserDto: UpdateUserDto): Promise<UserEntity> {
    return await this.authService.register(createUserDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    await this.authService.forgotPassword(email);
    return { message: 'If an account with that email exists, a password reset email has been sent.' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password has been reset successfully' };
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

  @Get('validate-token')
  async validateToken(@Headers('Authorization') token: string): Promise<{ isValid: boolean }> {
    try {
      if (!token) {
        throw new UnauthorizedException('Token is missing');
      }

      const user = await this.authService.validateUserFromToken(token.replace('Bearer ', ''));
      return { isValid: !!user };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
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

  @Get()
  @UseGuards(JAuthGuard, RolesGuard)
  async findAllUsersWithUserRole(): Promise<UserEntity[]> {
    return this.authService.findAllUsersWithUserRole();
  }

}
