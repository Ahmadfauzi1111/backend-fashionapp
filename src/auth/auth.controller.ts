import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Get, NotFoundException, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './models/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class AuthController {

    constructor(
        private UserService: UserService,
        private JwtService: JwtService
    ){
    }

    @Post('register')
    async register(@Body() body: RegisterDto) {

        if(body.password !== body.password_confirm){
            throw new BadRequestException('Password tidak sama');
        }

        const hash = await bcrypt.hash(body.password, 12);
        return this.UserService.create({
            nama: body.nama,
            email: body.email,
            password: hash
        });
    }

    @Post('login')
    async login(
        @Body('email') email:string,
        @Body('password') password:string,
        @Res({passthrough: true}) response: Response
    ){
        const user = await this.UserService.findOne({email});

        if(!user){
            throw new NotFoundException('User tidak ditemukan')
        }

        if(!await bcrypt.compare(password, user.password)){
            throw new BadRequestException('Password tidak sama');
        }

        const jwt = await this.JwtService.signAsync({id: user.id});

        response.cookie('jwt', jwt, {httpOnly: true});

        return user;

    }

    @UseGuards(AuthGuard)
    @Get('user')
    async user(@Req() request: Request){
        const cookie = request.cookies['jwt'];

        const data = await this.JwtService.verifyAsync(cookie);

        return this.UserService.findOne({id: data['id']});
    }

    @UseGuards(AuthGuard)
    @Post('logout')
    async logout(@Res({passthrough: true}) response: Response){
        response.clearCookie('jwt');

        return {
            message: 'Berhasil Logout'
        }
    }
}
