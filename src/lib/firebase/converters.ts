import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  FirestoreDataConverter,
} from 'firebase/firestore';
import { Event, User, Registration } from '@/types/firebase';

export const eventConverter: FirestoreDataConverter<Event> = {
  toFirestore(event: Event): DocumentData {
    const { id, ...data } = event;
    return data;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Event {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
    } as Event;
  },
};

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(user: User): DocumentData {
    const { id, ...data } = user;
    return data;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): User {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
    } as User;
  },
};

export const registrationConverter: FirestoreDataConverter<Registration> = {
  toFirestore(registration: Registration): DocumentData {
    const { id, ...data } = registration;
    return data;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Registration {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
    } as Registration;
  },
};