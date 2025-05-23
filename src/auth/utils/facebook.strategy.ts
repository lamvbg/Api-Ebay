import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
//aaa

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    super({
      clientID: '385743550645089',
      clientSecret: 'db5af3ac4c7b520cae6ef9051190e637',
      callbackURL: 'https://api-orderus.name.vn/api/auth/facebook/redirect',
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'email', 'displayName'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile){
    try {
    const user = await this.authService.validateUserFromFacebook(profile);
      
      const payload = { 
        sub: user.id, 
        email: user.email, 
        displayName: user.displayName,
        role: user.role
      };

      const token = this.jwtService.sign(payload);
      const redirectURL = `https://orderus.vn?token=${token}`;
      console.log(payload)
      // console.log(token)
      return { accessToken: token, redirectURL };
    } catch (error) {
      throw error;
    }
  }
}