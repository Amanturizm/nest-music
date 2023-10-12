import mongoose from 'mongoose';

export interface IArtist {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  info: string;
  image: string | null;
}

export interface IAlbum {
  _id: mongoose.Schema.Types.ObjectId;
  artist: mongoose.Schema.Types.ObjectId;
  name: string;
  date: number;
  image: string | null;
  amount: number;
}

export interface ITrack {
  _id: mongoose.Schema.Types.ObjectId;
  album: mongoose.Schema.Types.ObjectId;
  name: string;
  duration: string;
  number: number;
  youtube: string;
}
