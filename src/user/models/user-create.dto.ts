import { IsEmail, IsNotEmpty } from "class-validator";

export class UserCreateDto {
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    @IsEmail()
    email: string;
}