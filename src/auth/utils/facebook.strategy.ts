import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';
//aaa

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
  ) {
    super({
      clientID: '385743550645089',
      clientSecret: 'db5af3ac4c7b520cae6ef9051190e637',
      callbackURL: 'https://api-ebay.onrender.com/api/auth/facebook/redirect',
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'email', 'displayName',],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user: any, info?: any) => void): Promise<any> {

    console.log(accessToken);
    console.log(profile);
    const user = await this.authService.validateUser({
        email: profile.emails[0].value,
        displayName: profile.displayName,
      });
      

    const payload = {
      user,
      accessToken,
    };

    done(null, payload);
  }
}
