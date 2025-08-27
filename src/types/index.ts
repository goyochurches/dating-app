export type MediaType = 'image' | 'video' | null;

export interface Match {
  id: string;
  partnerId: string;
  name: string;
  image: string;
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
