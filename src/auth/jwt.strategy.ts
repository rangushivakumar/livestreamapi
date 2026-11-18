import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { UserRole } from 'src/entities/user/enums/user.enum';
import { User } from 'src/entities/user/user.entity';
import { UserAuth } from 'src/entities/user/userAuth.entity';

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
      console.log('JwtStrategy initialized');
    const { email, mobile, role, id } = payload;
    if (
      role !== UserRole.SUPER_ADMIN &&
      role !== UserRole.USER && role !== UserRole.STREAMER &&
      role !== UserRole.ADMIN
    ) {
      throw new UnauthorizedException('Invalid role');
    }
  
    let user;
    let userAuth;
  
    if (email) {
      userAuth = await UserAuth.findOne({ where: { email } });
      user = User.findOne({
        where: {id: userAuth?.userId}
      })
    } else if (mobile) {
      userAuth = await UserAuth.findOne({ where: { phoneNumber: mobile } });
      user = User.findOne({
        where: {id: userAuth?.userId}
      })
    } else if (id && role) {
      user = User.findOne({ where: { id: id, role: role } })
    }
  
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
  
}
