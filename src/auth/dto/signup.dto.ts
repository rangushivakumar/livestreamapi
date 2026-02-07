import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MinLength, MaxLength, IsIn } from "class-validator";
import { LoginType, UserRole } from "src/entities/user/enums/user.enum";

export class SignupDto {
  @IsEmail()
  @IsOptional()
  email:string;

  @IsOptional()
  @IsString()
  @Length(10, 15)
  mobile: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @IsOptional()
  userName: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([UserRole.SUPER_ADMIN, UserRole.RESTAURANT_ADMIN])
  role: UserRole;

  @IsOptional()
  @IsNotEmpty()
  @IsIn([LoginType.email, LoginType.mobile])
  loginType: LoginType;
}

export class VerifyOtpDto {
  @IsNotEmpty()
  otp: string;

  @IsOptional()
  email: string;

  @IsOptional()
  mobile: string;

  @IsNotEmpty()
  role: UserRole;
}