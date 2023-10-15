import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post, Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { Model } from 'mongoose';
import { CreateArtistDto } from './create-artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RequestWithUser, TokenAuthGuard } from '../auth/token-auth.guard';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name)
    private readonly artistModel: Model<ArtistDocument>,
  ) {}

  @Get()
  async getAll() {
    return this.artistModel.find();
  }

  @Get(':id')
  async getOne(@Param('id') _id: string) {
    return this.artistModel.findById(_id);
  }

  @Post()
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('user')
  @UseInterceptors(FileInterceptor('image', { dest: './public/uploads/artists' }))
  async create(@UploadedFile() file: Express.Multer.File, @Req() req: RequestWithUser) {
    const artist = new this.artistModel({
      name: req.body.name,
      info: req.body.info,
      image: file ? '/uploads/artists/' + file.filename : null,
      user: req.user._id,
    });

    return artist.save();
  }

  @Delete(':id')
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id') _id: string) {
    return this.artistModel.deleteOne({ _id });
  }
}
