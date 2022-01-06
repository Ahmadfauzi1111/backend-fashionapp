import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from './models/user.entity';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import { UserCreateDto } from './models/user-create.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserUpdateDto } from './models/user-update.dto';


@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@Controller('users')
export class UserController {

    constructor(private UserService: UserService){}

    @Get()
    async all(): Promise<User[]> {
        return this.UserService.all();
    }

    @Post()
    async create(@Body() body: UserCreateDto): Promise<User>{
        const password = await bcrypt.hash('1234', 12);
        return this.UserService.create({
            name: body.name,
            email: body.email,
            password
        });
    }

    @Get(':id')
    async get(@Param('id') id:number){
        return this.UserService.findOne({id});
    }

    @Put(':id')
    async update(
        @Param('id') id:number,
        @Body() body: UserUpdateDto
    ){
        await this.UserService.update(id, body);

        return this.UserService.findOne({id});
    }

    @Delete(':id')
    async delete(@Param('id') id:number){
        return this.UserService.delete(id);
    }
}
