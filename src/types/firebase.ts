import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export interface Event {
  id?: string;
  title: string;
  description: string;
  category: string;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  location: {
    name: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  capacity: number;
  registeredCount: number;
  imageUrl?: string;
  tags: string[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdBy: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface User {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'user' | 'admin' | 'organizer';
  profile?: {
    bio?: string;
    organization?: string;
    website?: string;
  };
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    categories: string[];
  };
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface Registration {
  id?: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  registrationDate: Timestamp | FieldValue;
  attendanceConfirmed: boolean;
  notes?: string;
  metadata?: {
    source?: string;
    referrer?: string;
  };
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface Notification {
  id?: string;
  userId: string;
  type: 'email' | 'push' | 'in-app';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  sentAt: Timestamp | FieldValue;
  readAt?: Timestamp | FieldValue;
}