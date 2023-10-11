import mongoose from 'mongoose';

export class CreateAlbumDto {
  artist: mongoose.Schema.Types.ObjectId;
  name: string;
  date: number;
}
