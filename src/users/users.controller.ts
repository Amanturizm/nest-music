import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser, TokenAuthGuard } from '../auth/token-auth.guard';
import { OAuth2Client } from 'google-auth-library';
import config from '../config';
import { CreateUserDto } from './create-user.dto';
import * as crypto from 'crypto';

const client = new OAuth2Client(config.google.clientId);

@Controller('users')
export class UsersController {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { dest: './public/uploads/users' }))
  async register(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    try {
      const user = new this.userModel({
        username: req.body.username,
        password: req.body.password,
        displayName: req.body.displayName || '',
        avatar: req.file ? '/uploads/users/' + req.file.filename : null,
      });

      user.generateToken();

      await user.save();
      return user;
    } catch (e) {
      if (e.code === 11000) {
        throw new BadRequestException('A user with the same username already exists.');
      }

      if (e instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(e);
      }

      return e;
    }
  }

  @Post('sessions')
  @UseGuards(AuthGuard('local'))
  login(@Req() req: Request) {
    return { message: 'Username and password correct!', user: req.user };
  }

  @Delete('sessions')
  @UseGuards(TokenAuthGuard)
  async logout(@Req() req: RequestWithUser) {
    const { _id } = req.user;

    const user = await this.userModel.findById(_id);

    user.generateToken();

    await user.save();

    return { message: 'User token changed!' };
  }

  @Post('google')
  async loginGoogle(@Body() googleData: CreateUserDto) {
    const ticket = await client.verifyIdToken({
      idToken: googleData.credential,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new BadRequestException('Google login error!');
    }

    const email = payload['email'];
    const id = payload['sub'];
    const displayName = payload['name'];
    const avatar = payload['picture'];

    if (!email) {
      throw new BadRequestException('Not enough user data to continue');
    }

    let user = await this.userModel.findOne({ googleID: id });

    if (!user) {
      user = new this.userModel({
        username: email,
        password: crypto.randomUUID(),
        displayName,
        avatar,
        googleID: id,
      });
    }

    user.generateToken();

    await user.save();
    return { message: 'Login with Google successful!', user };
  }
}
