import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { User } from 'src/entities/user/user.entity';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async createUser(dto: SignupDto): Promise<User> {
    try {
      const { email, mobile, password, userName, role } = dto;
      const oldUser = await User.findOne({ where: { email } });
      if (oldUser) {
        throw new Error('User already exists');
      }

      const user = new User();
      user.email = email ?? null;
      user.mobile = mobile ?? null;
      user.name = userName ?? email ?? mobile ?? '';
      user.role = role;
      user.is_verified = false;
      user.sendVerification = true;
      user.emailVerified = false;
      user.mobileVerified = false;

      await user.createPassword(password);

      return this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateUserPasswordMail(dto: SignupDto) {
    try {
      const { email, password } = dto;
      const user = await User.findOne({ where: { email: email } });
      if (!user) throw new BadRequestException('User not found');
  
      if (await user.validatePassword(password)) {
          return user;
      } else {
          throw new Error('Invalid password');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
