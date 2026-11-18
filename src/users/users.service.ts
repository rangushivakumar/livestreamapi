import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthProvider } from 'src/entities/user/enums/user.enum';
import { User } from 'src/entities/user/user.entity';
import { UserAuth } from 'src/entities/user/userAuth.entity';

@Injectable()
export class UsersService {
    constructor() {

    }
    async createUser(dto) {
        try {
            const {
                publicId,
                role,
                status,
                displayName,
            } = dto;
            const user = new User();
            user.displayName = displayName;
            user.role = role;
            user.status = status;
            user.publicId = publicId;
            await user.save();
            return user;
        } catch (error : Error | any) {
            throw new BadRequestException(error.message);
        }
    }

    async createUserAuthType(dto) {
        try {
            const { userId, providerUserId, provider, googleId, email, password } = dto;
            const authProvider = new UserAuth()
            authProvider.userId = userId;
            authProvider.providerUserId = providerUserId;
            authProvider.provider = provider;
            authProvider.googleId = googleId;
            authProvider.email = email;

            if(password) {
               await authProvider.createPassword(password);
            }
            
            await authProvider.save();
            return authProvider;
        } catch (error: Error | any) {
            throw new BadRequestException(error.message);
        }
    }
}
