import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ArtistDocument = Artist & Document;

@Schema()
export class Artist {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  image: string;

  @Prop()
  info: string;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ ref: 'User', required: true })
  user: mongoose.Schema.Types.ObjectId;
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);
