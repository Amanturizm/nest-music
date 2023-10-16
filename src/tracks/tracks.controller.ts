import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Track, TrackDocument } from '../schemas/track.schema';
import mongoose, { Model } from 'mongoose';
import { ITrack } from '../types';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RequestWithUser, TokenAuthGuard } from '../auth/token-auth.guard';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name)
    private readonly trackModel: Model<TrackDocument>,
  ) {}

  @Get()
  async getAll(@Query('album') album: string) {
    if (album) {
      return this.trackModel.find({ album }).sort({ number: 1 });
    }

    return this.trackModel.find().sort({ number: 1 });
  }

  @Get(':id')
  async getAllBySpecificAlbum(@Param('id') _id: string) {
    const albums = await this.trackModel.find({ artist: _id });

    const artistTracks: ITrack[] = [];

    void (await Promise.all(
      albums.map(async (album) => {
        const currentAlbumTrack = (await this.trackModel
          .find({
            album: album._id,
          })
          .populate('album', 'name date image')) as ITrack[];

        currentAlbumTrack.forEach((track) => {
          artistTracks.push(track);
        });
      }),
    ));

    return artistTracks;
  }

  @Post()
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('user')
  async create(@Req() req: RequestWithUser) {
    try {
      const track = new this.trackModel({
        name: req.body.name,
        album: req.body.album,
        number: req.body.number,
        duration: req.body.duration,
        youtube: req.body.youtube,
        user: req.user._id,
      });

      await track.save();

      return track;
    } catch (e) {
      if (e.code === 11000) {
        throw new BadRequestException('Track with the same name already exists.');
      }

      if (e instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(e);
      }

      return e;
    }
  }

  @Delete(':id')
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id') _id: string) {
    await this.trackModel.deleteOne({ _id });

    return { message: 'Track deleted!' };
  }

  @Patch(':id/togglePublished')
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  async updateField(@Req() req: RequestWithUser) {
    const track = await this.trackModel.findById(req.params.id);

    track.isPublished = !track.isPublished;

    await track.save();
    return { message: 'Field toggled!' };
  }
}
