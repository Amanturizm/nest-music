import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { Model } from 'mongoose';
import { CreateArtistDto } from './create-artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post()
  @UseInterceptors(
    FileInterceptor('image', { dest: './public/uploads/artists' }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistData: CreateArtistDto,
  ) {
    const artist = new this.artistModel({
      name: artistData.name,
      info: artistData.info,
      image: file ? '/uploads/artists/' + file.filename : null,
    });

    return artist.save();
  }

  @Delete(':id')
  async delete(@Param('id') _id: string) {
    return this.artistModel.deleteOne({ _id });
  }

  @Patch(':id/togglePublished')
  async update(@Param('id') _id: string): Promise<{ message: string }> {
    const artist = await this.artistModel.findById(_id);

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    artist.isPublished = !artist.isPublished;

    await artist.save();

    return { message: 'OK' };
  }
}
