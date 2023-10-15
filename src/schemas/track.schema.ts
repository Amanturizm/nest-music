import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TrackDocument = Track & Document;

@Schema()
export class Track {
  @Prop({ ref: 'Album', required: true })
  album: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  duration: string;

  @Prop({ required: true, min: [1, 'Min number - 1'] })
  number: number;

  @Prop({ required: true })
  youtube: string;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ ref: 'User', required: true })
  user: mongoose.Schema.Types.ObjectId;
}

export const TrackSchema = SchemaFactory.createForClass(Track);
