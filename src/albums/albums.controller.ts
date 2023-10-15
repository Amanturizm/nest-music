import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import mongoose, { Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { ITrack } from '../types';
import { Track, TrackDocument } from '../schemas/track.schema';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RequestWithUser, TokenAuthGuard } from '../auth/token-auth.guard';
import * as stream from 'stream';

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
      const albumsBySpecificArtist = await this.albumModel.find({ artist }).sort({ date: -1 });

      const albumsWithAmountTracks = await Promise.all(
        albumsBySpecificArtist.map(
          async ({ _id, name, artist, date, image, isPublished, user }) => {
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
              isPublished,
              user,
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
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('user')
  @UseInterceptors(FileInterceptor('image', { dest: './public/uploads/albums' }))
  async create(@UploadedFile() file: Express.Multer.File, @Req() req: RequestWithUser) {
    const album = new this.albumModel({
      artist: req.body.artist,
      name: req.body.name,
      date: req.body.date,
      image: file ? '/uploads/artists/' + file.filename : null,
      user: req.user._id,
    });

    return album.save();
  }

  @Delete(':id')
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id') _id: string) {
    await this.albumModel.deleteOne({ _id });

    return { message: 'Album deleted!' };
  }
}
