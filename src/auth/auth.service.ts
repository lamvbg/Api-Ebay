import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entities';
import { Profile } from 'passport-google-oauth20';
import { UserDetails } from 'src/utils/type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async validateUserFromGoogle(profile: Profile) {
    const { emails, displayName  } = profile;
    const email = emails[0].value; 
    let user = await this.userRepository.findOne({ where: { email: email } });

    if (!user) {
      user = await this.userRepository.create({
        email,
        displayName 
      });
      user = await this.userRepository.save(user);
    }

    return user;
  }

  async findUser(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }
  async validateUserFromFacebook(details: UserDetails) {
    const email = details.email; 
    let user = await this.userRepository.findOne({ where: { email: email } });

    // Nếu người dùng chưa tồn tại, tạo mới
    if (!user) {
      user = await this.userRepository.create({
        email: email, 
      });
      user = await this.userRepository.save(user);
    }

    return user;
  }

}
