import mongoose from 'mongoose';

export interface IArtist {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  info: string;
  isPublished: boolean;
  image: string | null;
}

export interface IAlbum {
  _id: mongoose.Schema.Types.ObjectId;
  artist: mongoose.Schema.Types.ObjectId;
  name: string;
  date: number;
  isPublished: boolean;
  image: string | null;
  amount: number;
}
