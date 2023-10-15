import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userModel.findOne({ username });

    if (user && (await user.checkPassword(password))) {
      user.generateToken();
      return user.save();
    }

    return null;
  }
}
