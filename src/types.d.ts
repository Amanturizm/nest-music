import mongoose from 'mongoose';

export interface IArtist {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  info: string;
  image: string | null;
  isPublished: boolean;
  user: mongoose.Schema.Types.ObjectId;
}

export interface IAlbum {
  _id: mongoose.Schema.Types.ObjectId;
  artist: mongoose.Schema.Types.ObjectId;
  name: string;
  date: number;
  image: string | null;
  amount: number;
  isPublished: boolean;
  user: mongoose.Schema.Types.ObjectId;
}

export interface ITrack {
  _id: mongoose.Schema.Types.ObjectId;
  album: mongoose.Schema.Types.ObjectId;
  name: string;
  duration: string;
  number: number;
  youtube: string;
  isPublished: boolean;
  user: mongoose.Schema.Types.ObjectId;
}

export interface IUser {
  username: string;
  password: string;
  token: string;
  role: string;
  displayName?: string;
  avatar?: string | null;
  googleID?: string;
}
