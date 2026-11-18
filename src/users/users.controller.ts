import { ClassSerializerInterceptor, Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/entities/user/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
    constructor(
        private userService: UsersService,
    ) {}

    @Get('/sample')
    @UseGuards(AuthGuard())
    async getsample(
        @GetUser() user: User
    ) {
        console.log(user)
        return "sample data"
    }
}
