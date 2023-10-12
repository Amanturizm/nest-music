import mongoose from 'mongoose';

export class CreateTrackDto {
  album: mongoose.Schema.Types.ObjectId;
  name: string;
  duration: string;
  number: number;
  youtube: string;
}
