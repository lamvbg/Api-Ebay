import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    super({
      clientID: '663430011506-av2org7g915448j33o0ruo58vubmda8v.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: isProduction
        ? 'https://api-ebay.onrender.com/api/auth/google/redirect'
        : 'http://localhost:2001/api/auth/google/redirect',
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    try {
      const user = await this.authService.validateUserFromGoogle(profile);

      const payload = { 
        sub: user.id, 
        email: user.email, 
        displayName: user.displayName,
        role: user.role
      };

      const token = this.jwtService.sign(payload);
      const isLocal = process.env.NODE_ENV !== 'production';
      const redirectURL = isLocal
        ? `${process.env.LOCAL_REDIRECT_URL}?token=${token}`
        : `${process.env.PRODUCTION_REDIRECT_URL}?token=${token}`;
      console.log(payload)
      // console.log(token)
      return { accessToken: token, redirectURL };
    } catch (error) {
      throw error;
    }
  }
}
