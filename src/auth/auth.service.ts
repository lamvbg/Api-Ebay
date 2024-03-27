import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entities';
import { Profile } from 'passport-google-oauth20';
import { UserDetails } from 'src/utils/type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
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

  async findUserById(id: number): Promise<UserEntity | undefined> {
    return await this.userRepository.findOne({where: {id}});
  }
  
  async validateUserFromFacebook(details: UserDetails) {
    const email = details.email; 
    const displayName = details.displayName;
    let user = await this.userRepository.findOne({ where: { email: email } });

    if (!user) {
      user = await this.userRepository.create({ 
        email: email, 
        displayName
      });
      user = await this.userRepository.save(user);
    }

    return user;
  }
  
  async validateUserFromToken(token: string): Promise<UserEntity> {
    try {
      const decodedToken = this.jwtService.verify(token);
      
      if (!decodedToken || !decodedToken.id) {
        throw new UnauthorizedException('Invalid token');
      }
      const user = await this.userRepository.findOne({
        where: { id: decodedToken.id },
      });
  
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
  
      return user;
    } catch (error) {
      // Xử lý lỗi decode token
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw error; // Ném lại lỗi để NestJS xử lý
    }
  }
}
