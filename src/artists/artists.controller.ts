import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RequestWithUser, TokenAuthGuard } from '../auth/token-auth.guard';
import { Track, TrackDocument } from '../schemas/track.schema';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { IAlbum } from '../types';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name)
    private readonly artistModel: Model<ArtistDocument>,
    @InjectModel(Album.name)
    private readonly albumModel: Model<AlbumDocument>,
    @InjectModel(Track.name)
    private readonly trackModel: Model<TrackDocument>,
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
    try {
      const artist = new this.artistModel({
        name: req.body.name,
        info: req.body.info,
        image: file ? '/uploads/artists/' + file.filename : null,
        user: req.user._id,
      });

      await artist.save();

      return artist;
    } catch (e) {
      if (e.code === 11000) {
        throw new BadRequestException('Artist with the same name already exists.');
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
    try {
      const deletedArtist = await this.artistModel.deleteOne({ _id });

      if (deletedArtist.deletedCount < 1) {
        throw new NotFoundException('Artist not found!');
      }

      const albums = (await this.albumModel.find({ artist: _id })) as HydratedDocument<IAlbum[]>;

      await Promise.all(
        albums.map(async ({ _id }) => await this.trackModel.deleteMany({ album: _id })),
      );

      await this.albumModel.deleteMany({ artist: _id });

      return { message: 'Artist deleted!' };
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(e);
      }

      return e;
    }
  }

  @Patch(':id/togglePublished')
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  async updateField(@Req() req: RequestWithUser) {
    const artist = await this.artistModel.findById(req.params.id);

    artist.isPublished = !artist.isPublished;

    await artist.save();
    return { message: 'Field toggled!' };
  }
}
