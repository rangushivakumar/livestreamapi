import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDto, VerifyOtpDto } from './dto/signup.dto';
import { AdminRepository } from 'src/admin/admin.repository';
import { LoginType, UserRole } from 'src/entities/user/enums/user.enum';
import { UtilsService } from './utils.service';
import { User } from 'src/entities/user/user.entity';
import { Otp } from 'src/entities/otp/otp.entity';
import { JwtPayload } from './jwt-payload.interface';


@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly utilsService: UtilsService,
    private readonly adminRepository: AdminRepository, // ✅ inject
  ) {}

  async signup(dto: SignupDto) {
    try {

      const user = await this.adminRepository.createUser(dto); // ✅ instance call

      if (!user) {
        throw new Error('Error while creating user');
      }

      if (user.sendVerification === true && dto.loginType === LoginType.email) {
        await this.utilsService.SendEmailByCode(user);
      } else if (user.sendVerification === true && dto.loginType === LoginType.mobile) {
        await this.utilsService.sendCodeBySMS(user);
      } else {
        throw new Error('Send verification is not true or login type error');
      }

      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyOTP(verifyOtpDto: VerifyOtpDto) {
    try {
      const { otp, email, role, mobile } = verifyOtpDto;
      let user;
      if (role === UserRole.RESTAURANT_ADMIN || role === UserRole.SUPER_ADMIN) {
        if (mobile) {
          user = await User.findOne({
            where: [{ mobile: mobile }],
          });
        } else {
          user = await User.findOne({
            where: [{ email: email }],
          });
        }
      }
      if (!user) {
        throw new Error('User not found');
      }
      let userOtp;

      if (
        user.role == UserRole.RESTAURANT_ADMIN ||
        user.role == UserRole.SUPER_ADMIN
      ) {
        userOtp = await Otp.findOne({
          where: [{ user: { id: user.id } }],
        });
      }

      if (!userOtp) {
        throw new Error('OTP not found');
      }

      const date = new Date();
      if (mobile && userOtp.otp == otp) {
        if (userOtp.codeExpiry > date) {
          user.mobileVerified = true;
          user.is_verified = true;
          await user.save();
        } else {
          throw new Error('OTP expired');
        }
        await userOtp.remove();
        return user;
      }
      if (email && userOtp.otp == otp) {
        try {
          if (userOtp.codeExpiry > date) {
            user.emailVerified = true;
            user.is_verified = true;
            await user.save();
          } else {
            throw new Error('OTP expired');
          }
          await userOtp.remove();
          return user;
        } catch (e: any) {
          throw new Error(e.message);
        }
      } else {
        throw new Error('please provide valid OTP');
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async signIn(dto: SignupDto) {
    try {
      const { email, role, mobile } = dto;
      let user;
      if (role == undefined) {
        throw new Error('role should be defined');
      }

      if (
        role === UserRole.RESTAURANT_ADMIN ||
        role === UserRole.SUPER_ADMIN
      ) {
        user = await this.adminRepository.validateUserPasswordMail(dto);
      }

      if (user) {
        // if (role === UserRoleType.parent) {
        //   // if (!user.mobileVerified) {
        //   //   await this.utilsService.sendCodeBySMS(user);
        //   //   throw new BadRequestException('MOBILE_NOT_VERIFIED');
        //   // }
        // } else {
        if (!user.emailVerified && email) {
          await this.utilsService.SendEmailByCode(user);
          throw new BadRequestException('EMAIL_NOT_VERIFIED');
        }

        if (user.is_verified !== true) {
          throw new BadRequestException('Inactive User');
        }

        let payload: JwtPayload;
        if (role === UserRole.SUPER_ADMIN || role === UserRole.RESTAURANT_ADMIN) {
          if (email) {
            payload = { email, role };
          } else if (mobile) {
            payload = { mobile, role };
          } else {
            throw new Error('Email or mobile is required');
          }
        } 
        else {
          throw new Error('Invalid role');
        }
        let accessToken: string = await this.jwtService.sign(payload);

        if (role === UserRole.RESTAURANT_ADMIN || role === UserRole.SUPER_ADMIN) {
          return {
            accessToken,
            role: user.role,
            email: user.email,
            id: user.id,
            name: user.name,
          };
        }

      } else {
        throw new UnauthorizedException('Invalid password');
      }
    } catch (error) {
      console.log('Error in sign in:', error.message);
      throw new BadRequestException(error.message);
    }
  }


}
