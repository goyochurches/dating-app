export type MediaType = 'image' | 'video' | null;

export interface User {
  uid: string;
  email: string;
  name: string;
  age?: number;
  bio?: string;
  profilePictureUrl: string;
  interests?: string[];
  location?: string;
  createdAt?: string;
}

export interface Match {
  id: string;
  uid: string;
  partnerId: string;
  name: string;
  profilePictureUrl: string;
  lastMessage: string;
  time: string;
  online?: boolean;
  lastSeen?: string; // ISO string
}

export interface Message {
  id: number;
  text?: string;
  sent: boolean; // true if me, false if them
  timestamp?: string; // ISO or human readable
  media?: string; // uri
  mediaType?: 'image' | 'video';
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  bio: string;
  image: string;
}
