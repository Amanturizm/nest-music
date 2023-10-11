import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import mongoose, { Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlbumDto } from './create-album.dto';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name)
    private readonly albumModel: Model<AlbumDocument>,
  ) {}

  @Get()
  async getAll(@Query('artist') artist: mongoose.Schema.Types.ObjectId) {
    if (artist) {
      const albumsBySpecificArtist = this.albumModel
        .find({ artist })
        .sort({ date: -1 });

      return albumsBySpecificArtist;
    }

    return this.albumModel.find().sort({ date: -1 });
  }

  @Get(':id')
  async getOne(@Param('id') _id: string) {
    return this.albumModel.findById(_id).populate('artist');
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', { dest: './public/uploads/albums' }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumData: CreateAlbumDto,
  ) {
    const album = new this.albumModel({
      artist: albumData.artist,
      name: albumData.name,
      date: albumData.date,
      image: file ? '/uploads/artists/' + file.filename : null,
    });

    return album.save();
  }

  @Delete(':id')
  async delete(@Param('id') _id: string) {
    this.albumModel.deleteOne({ _id });

    return { message: 'Album deleted!' };
  }

  @Patch(':id/togglePublished')
  async update(@Param('id') _id: string): Promise<{ message: string }> {
    const album = await this.albumModel.findById(_id);

    if (!album) {
      throw new NotFoundException('Artist not found');
    }

    album.isPublished = !album.isPublished;

    await album.save();

    return { message: 'OK' };
  }
}
