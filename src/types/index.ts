export type MediaType = 'image' | 'video' | null;

export interface User {
  uid: string;
  email: string;
  name: string;
  age?: number;
  bio?: string;
  profilePictureUrl: string;
  profileImage?: string; // Para imágenes base64 durante desarrollo
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
  profileImage?: string; // Para imágenes base64 durante desarrollo
  lastMessage: string;
  time: string;
  online?: boolean;
  lastSeen?: string; // ISO string
}

export interface Message {
  id: string; // Document ID from Firestore
  _id: string; // Unique ID for the message (e.g., uuid)
  text?: string;
  createdAt: any; // Firestore Timestamp
  user: {
    _id: string;
    name: string;
  };
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

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails: {
    [key: string]: {
      name: string;
      avatar: string;
    };
  };
  lastMessage?: string | { text: string; createdAt: any };
  lastActivity?: any; // Firestore Timestamp
  partnerUid: string;
  partnerName: string;
  partnerAvatar: string;
  // Optional fields added by useMessaging hook
  name?: string;
  image?: string;
  time?: string;
}
