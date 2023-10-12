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
import { ITrack } from '../types';
import { Track, TrackDocument } from '../schemas/track.schema';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name)
    private readonly albumModel: Model<AlbumDocument>,
    @InjectModel(Track.name)
    private readonly trackModel: Model<TrackDocument>,
  ) {}

  @Get()
  async getAll(@Query('artist') artist: mongoose.Schema.Types.ObjectId) {
    if (artist) {
      const albumsBySpecificArtist = await this.albumModel
        .find({ artist })
        .sort({ date: -1 });

      const albumsWithAmountTracks = await Promise.all(
        albumsBySpecificArtist.map(
          async ({ _id, name, artist, date, image }) => {
            const tracks = (await this.trackModel.find({
              album: _id,
            })) as ITrack[];

            return {
              _id,
              name,
              artist,
              date,
              image,
              amount: tracks.length,
            };
          },
        ),
      );

      return albumsWithAmountTracks;
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
}
