import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UtilsService } from './utils.service';
import { ulid } from 'ulid';
import { UsersService } from 'src/users/users.service';
import {
  AuthProvider,
  UserRole,
  UserStatus,
} from 'src/entities/user/enums/user.enum';
import { User } from 'src/entities/user/user.entity';
import * as bcrypt from 'bcrypt';
import { UserSession } from 'src/entities/user/userSession.entity';
import { OAuth2Client } from 'google-auth-library';
import { execSync } from 'child_process';
import { UserAuth } from 'src/entities/user/userAuth.entity';
import { SigninDto, SignupDto } from './dto/signup.dto';

const googleClient = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly utilsService: UtilsService,

    @Inject()
    private readonly userService: UsersService,
  ) {}

  async guestSignup() {
    try {
      const guestProviderId = ulid();

      const dto = {
        publicId: `usr_${guestProviderId}`,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        displayName: `Guest${guestProviderId.slice(-6)}`,
        avatarUrl: null,
      };

      const user = await this.userService.createUser(dto);

      if (!user) {
        throw new Error('Error Creating User Account');
      }

      const userAuthDto = {
        userId: user.id,
        provider: AuthProvider.GUEST,
        providerUserId: guestProviderId,
      };

      await this.userService.createUserAuthType(userAuthDto);

      const accessToken = this.generateToken(user, 'access');
      const refreshToken = this.generateToken(user, 'refresh');

      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const sessionStorage = new UserSession();
      sessionStorage.userId = user.id;
      sessionStorage.refreshTokenHash = refreshTokenHash;
      sessionStorage.expiresAt = expiresAt;

      await sessionStorage.save();

      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error: Error | any) {
      throw new BadRequestException(error.message);
    }
  }


  async googleSignup(idToken: string) {
  try {
    // 1. Verify Google ID token
    const googleUser = await this.verifyGoogleToken(idToken);

    const googleId = googleUser.sub;

    if (!googleId) {
      throw new BadRequestException(
        'Google account ID is missing',
      );
    }

    // 2. Check whether this Google account already exists
    const existingUserAuth = await UserAuth.findOne({
      where: {
        provider: AuthProvider.GOOGLE,
        googleId,
      },
    });

    let user;

    // =====================================================
    // EXISTING GOOGLE USER → LOGIN
    // =====================================================
    if (existingUserAuth) {
      user = await User.findOne({
        where: {
          id: existingUserAuth.userId,
        },
      });

      if (!user) {
        throw new BadRequestException(
          'User account not found',
        );
      }
    }

    // =====================================================
    // NEW GOOGLE USER → SIGNUP
    // =====================================================
    else {
      const googleProviderId = ulid();

      const dto = {
        publicId: `usr_${googleProviderId}`,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        displayName: googleUser.name,
        avatarUrl: googleUser.picture,
      };

      user = await this.userService.createUser(dto);

      if (!user) {
        throw new BadRequestException(
          'Error creating user account',
        );
      }

      const userAuthDto = {
        userId: user.id,
        provider: AuthProvider.GOOGLE,

        // Google's stable user identifier
        providerUserId: googleId,

        email: googleUser.email,
        googleId,
      };

      await this.userService.createUserAuthType(
        userAuthDto,
      );
    }

    // =====================================================
    // CREATE SESSION
    // =====================================================

    const accessToken = this.generateToken(
      user,
      'access',
    );

    const refreshToken = this.generateToken(
      user,
      'refresh',
    );

    const refreshTokenHash =
      await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date(
      Date.now() +
        30 * 24 * 60 * 60 * 1000,
    );

    const sessionStorage = new UserSession();

    sessionStorage.userId = user.id;
    sessionStorage.refreshTokenHash =
      refreshTokenHash;
    sessionStorage.expiresAt = expiresAt;

    await sessionStorage.save();

    // =====================================================
    // RETURN
    // =====================================================

    return {
      accessToken,
      refreshToken,
      user,
    };
  } catch (error: Error | any) {
    console.log(error);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new BadRequestException(
      error.message || 'Google authentication failed',
    );
  }
}

  async verifyGoogleToken(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new UnauthorizedException('Invalid Google token');
    }

    return payload;
  }

async createStreamer(dto: SignupDto) {
  try {
    const existingUser = await UserAuth.findOne({
      where: {
        provider: AuthProvider.EMAIL,
        providerUserId: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Email is already registered',
      );
    }

    const user = await this.userService.createUser({
      displayName: dto.displayName,
      role: UserRole.STREAMER,
      status: UserStatus.ACTIVE,
      publicId: ulid(),
    });

    if (!user) {
      throw new BadRequestException(
        'Error creating streamer account',
      );
    }

    const userAuthDto = {
      userId: user.id,
      provider: AuthProvider.EMAIL,
      providerUserId: dto.email,
      email: dto.email,
      password: dto.password,
    };

    await this.userService.createUserAuthType(userAuthDto);

    return {
      message: 'Streamer account created successfully',
      streamer: {
        id: user.id,
        publicId: user.publicId,
        displayName: user.displayName,
        email: dto.email,
        role: user.role,
      },
    };
  } catch (error: any) {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      error.message,
    );
  }
}

  async validateUserPasswordMail(dto: SigninDto) {
    try {
      const userAuth = await UserAuth.findOne({
      where: {
        provider: AuthProvider.EMAIL,
        providerUserId: dto.email,
      },
    });

    if (!userAuth) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }



    const isPasswordValid = await userAuth.validatePassword(dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    return userAuth;
    } catch (error: Error | any) {
      throw new BadRequestException(error.message)
    }
  }


async signin(dto: SigninDto) {
  try {

    const userAuth = await this.validateUserPasswordMail(dto);
    const user = await User.findOne({
      where: {
        id: userAuth.userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User account not found',
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'User account is not active',
      );
    }

    const accessToken = this.generateToken(
      user,
      'access',
    );

    const refreshToken = this.generateToken(
      user,
      'refresh',
    );

    const refreshTokenHash =
      await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    );

    const session = new UserSession();

    session.userId = user.id;
    session.refreshTokenHash = refreshTokenHash;
    session.expiresAt = expiresAt;

    await session.save();

    return {
      accessToken,
      refreshToken,
      user,
    };
  } catch (error: any) {
    throw new BadRequestException(error.message);
  }
}

  private generateToken(user: User, type: 'access' | 'refresh'): string {
    const payload = {
      id: user.id,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      expiresIn: type === 'access' ? '1m' : '30d',
    });
  }

  async refreshToken(refreshToken: string) {
    let payload: { id: number };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET || 'changeme',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    console.log('sdkfslfdjlsdf', payload, 'skldfjlsdf');
    const session = await UserSession.findOne({
      where: {
        userId: payload.id,
      },
      relations: ['user'],
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    const isValid = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = session.user;

    const newAccessToken = this.generateToken(user, 'access');

    return {
      accessToken: newAccessToken,
    };
  }

  async fetchCurrentUser(user: User) {
    try {
      const fetchUser = await User.findOne({
        where: { id: user.id }
      })
      if (!fetchUser) {
        throw new Error('User Not Found With Given Id');
      }
      return fetchUser;
    } catch (error: Error | any) {
      throw new BadRequestException(error.message);
    }
  }
}
