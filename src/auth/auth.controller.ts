import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenDto, SigninDto, SignupDto } from './dto/signup.dto';
import { GetUser } from './get-user.decorator';
import { User } from 'src/entities/user/user.entity';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('/admin/streamer')
  async signup(
    @Body(new ValidationPipe()) body: SignupDto
  ) {
    return this.authService.createStreamer(body);
  }

  @Post('/signin')
async signin(
  @Body(new ValidationPipe()) body: SigninDto,
) {
  return this.authService.signin(body);
}

  @Post('/guest')
  async guestSignup() {
    return this.authService.guestSignup();
  }

  @Post('/google')
  async googleSignup(
    @Body("idToken") idToken: string
  ) {
    return this.authService.googleSignup(idToken);
  }

  @Get('/sample')
  @UseGuards(AuthGuard())
  async guestsampledata() {
    return "sample data for testing"
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  async fetchCurrentUser(
    @GetUser() user: User
  ) {
    return this.authService.fetchCurrentUser(user);
  }

  @Post('/refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

}
