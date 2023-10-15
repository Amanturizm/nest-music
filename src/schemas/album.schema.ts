import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AlbumDocument = Album & Document;

@Schema()
export class Album {
  @Prop({ ref: 'Artist', required: true })
  artist: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  date: number;

  @Prop()
  image: string;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ ref: 'User', required: true })
  user: mongoose.Schema.Types.ObjectId;
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
