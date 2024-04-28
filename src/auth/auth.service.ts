import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Profile as FacebookProfile } from 'passport-facebook';

import { UserDetails } from 'src/utils/type';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/user.dto';
import { CloudinaryService } from '../setting/utils/file.service';
import { Multer } from 'multer';
import * as bcrypt from 'bcrypt';


type GooglePassportProfile = GoogleProfile;
type FacebookPassportProfile = FacebookProfile;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async validateUserFromGoogle(profile: GoogleProfile) {
    const { emails, displayName } = profile;
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

  async findUserById(id: string): Promise<UserEntity | undefined> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async validateUserFromFacebook(profile: FacebookProfile) {
    const { emails, displayName } = profile;
    const email = emails[0].value;
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

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    const isHashedPassword = user.password.startsWith('$2b$');
  
    if (isHashedPassword) {
      const isPasswordValid = await this.validatePassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }
    } else {
      if (user.password !== password) {
        throw new UnauthorizedException('Invalid password');
      }
    }
    const payload = {
      sub: user.id,
      name: user.displayName,
      role: user.role,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(userDto: UpdateUserDto): Promise<UserEntity> {
    const { email, displayName, phone, birthDate, address, password } = userDto;

    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo mới người dùng với mật khẩu đã hash
    const newUser = this.userRepository.create({
      ...userDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(newUser);
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
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw error; 
    }
  }

  private async validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, avatar?: Multer.File): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      await this.deleteOldImages(user);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
  
      if (updateUserDto.displayName) {
        user.displayName = updateUserDto.displayName;
      }
  
      if (avatar) {
        const avatarUrl = await this.uploadAndReturnUrl(avatar);
        user.avatar = avatarUrl;
      }
  
      if (updateUserDto.birthDate) {
        user.birthDate = updateUserDto.birthDate;
      }
      if (updateUserDto.email) {
        user.email = updateUserDto.email;
      }
      if (updateUserDto.address) {
        user.address = updateUserDto.address;
      }
      if (updateUserDto.phone) {
        user.phone = updateUserDto.phone;
      }
  
      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }
  
  async findAllUsersWithUserRole(): Promise<UserEntity[]> {
    return this.userRepository.createQueryBuilder('user')
      .where('user.role = :role', { role: 'user' })
      .getMany();
  }

  async deleteOldImages(user: UserEntity): Promise<void> {
    if (user.avatar) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(user.avatar);
      await this.cloudinaryService.deleteImage(publicId);
    }
  }  
  

  private async uploadAndReturnUrl(file: Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImage(file);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }
}
