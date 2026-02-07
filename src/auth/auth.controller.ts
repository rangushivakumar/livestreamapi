import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto, VerifyOtpDto } from './dto/signup.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('signup')
  async signup(
    @Body(new ValidationPipe()) body: SignupDto
  ) {
    return this.authService.signup(body);
  }

  @Post('/verify-otp')
  verifyOTP(@Body(ValidationPipe) verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOTP(verifyOtpDto);
  }


  @Post('/signin')
  signIn(
    @Body(new ValidationPipe({ skipMissingProperties: true }))
    signinDto: SignupDto,
  ) {
    return this.authService.signIn(signinDto);
  }

}
