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
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Track, TrackDocument } from '../schemas/track.schema';
import { Model } from 'mongoose';
import { ITrack } from '../types';
import { CreateTrackDto } from './create-track.dto';

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
  async create(@Body() trackData: CreateTrackDto) {
    const track = new this.trackModel({
      name: trackData.name,
      album: trackData.album,
      number: trackData.number,
      duration: trackData.duration,
      youtube: trackData.youtube,
    });

    await track.save();
    return track;
  }

  @Delete(':id')
  async delete(@Param('id') _id: string) {
    this.trackModel.deleteOne({ _id });

    return { message: 'Track deleted!' };
  }
}
