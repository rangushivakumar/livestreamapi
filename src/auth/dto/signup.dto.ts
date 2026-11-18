import { IsEmail, IsIn, IsNotEmpty, IsString } from "class-validator";
import { UserRole } from "src/entities/user/enums/user.enum";

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class googleLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([UserRole.STREAMER])
  role!: UserRole;
}

export class SigninDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([UserRole.STREAMER])
  role!: UserRole;
}