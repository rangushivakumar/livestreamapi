import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { UserRole } from 'src/entities/user/enums/user.enum';
import { User } from 'src/entities/user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() 
  {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'changeme',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { email, mobile, role } = payload;
  
    if (
      role !== UserRole.SUPER_ADMIN &&
      role !== UserRole.RESTAURANT_ADMIN
    ) {
      throw new UnauthorizedException('Invalid role');
    }
  
    let user: User | null = null;
  
    if (email) {
      user = await User.findOne({ where: { email } });
    } else if (mobile) {
      user = await User.findOne({ where: { mobile } });
    }
  
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
  
    return user;
  }
  
}
