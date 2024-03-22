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
      super({
        clientID: '663430011506-av2org7g915448j33o0ruo58vubmda8v.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'http://localhost:2001/api/auth/google/redirect',
        scope: ['profile', 'email'],
      });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile) {
      const user = await this.authService.validateUserFromGoogle(profile);

      const payload = { sub: user.id, email: user.email };

      const token = this.jwtService.sign(payload);

      console.log(token);
      return { accessToken: token };
  }

  }
