import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entities';
import { UserDetails } from 'src/utils/type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
  ) {}

  async validateUser(details: UserDetails) {
    console.log('AuthService');
    console.log(details);
  
    // Kiểm tra nếu email không tồn tại hoặc bằng null
    if (!details.email) {
      console.log('User email is missing or null. Cannot create user.');
      return null;
    }
  
    const user = await this.userRepository.findOneBy({ email: details.email });
    console.log(user);
  
    if (user) {
      // Nếu người dùng tồn tại, trả về người dùng này
      return user;
    }
  
    // Nếu người dùng không tồn tại, tạo mới người dùng
    console.log('User not found. Creating...');
    const newUser = this.userRepository.create(details);
    return this.userRepository.save(newUser);
  }

  async findUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }
}