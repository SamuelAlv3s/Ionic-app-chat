import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  collectionData,
  doc,
  documentId,
  Firestore,
  orderBy,
  query,
  serverTimestamp,
  where,
  docData,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from '@angular/fire/firestore';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadString,
} from '@angular/fire/storage';
import { Subject } from 'rxjs';
import { map, switchMap, take, takeUntil } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public logout$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private storage: Storage,
    private auth: Auth
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (!user) this.logout$.next(true);
    });
  }

  getAllUsers() {
    const userId = this.authService.getUserId();
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'id' }).pipe(
      takeUntil(this.logout$),
      take(1),
      map((users) => {
        return users.filter((user) => user.id !== userId);
      })
    );
  }

  startChat(user) {
    const userId = this.authService.getUserId();
    const userEmail = this.authService.getUserEmail();
    const chatUsers = [
      { id: userId, email: userEmail },
      { id: user.id, email: user.email },
    ];

    return this.addChat(chatUsers, user.email);
  }

  startGroup(name, users: []) {
    const userId = this.authService.getUserId();
    const userEmail = this.authService.getUserEmail();
    const cleanedUsers = users.map((user: any) => {
      return {
        id: user.id,
        email: user.email,
      };
    });
    const chatUsers = [{ id: userId, email: userEmail }, ...cleanedUsers];

    return this.addChat(chatUsers, name);
  }

  private addChat(chatUsers, name) {
    const chatsRef = collection(this.firestore, 'chats');
    const chat = {
      users: chatUsers,
      name,
    };

    return addDoc(chatsRef, chat).then((res) => {
      console.log('created chat: ', res);
      const groupId = res.id;
      const promises = [];

      for (let user of chatUsers) {
        const userChatsRef = doc(this.firestore, `users/${user.id}`);
        const update = updateDoc(userChatsRef, {
          chats: arrayUnion(groupId),
        });
        promises.push(update);
      }

      return Promise.all(promises);
    });
  }

  getUsersChats() {
    const userId = this.authService.getUserId();
    const userRef = doc(this.firestore, `users/${userId}`);
    return docData(userRef).pipe(
      takeUntil(this.logout$),
      switchMap((data) => {
        console.log('user data: ', data);

        const userChats = data.chats;

        const chatsRef = collection(this.firestore, 'chats');
        const q = query(chatsRef, where(documentId(), 'in', userChats));
        return collectionData(q, { idField: 'id' });
      })
    );
  }

  getChatInfo(chatId) {
    const chat = doc(this.firestore, `chats/${chatId}`);
    return docData(chat).pipe(takeUntil(this.logout$));
  }

  getChatMessages(chatId) {
    const messages = collection(this.firestore, `chats/${chatId}/messages`);
    const q = query(messages, orderBy('createdAt'));
    return collectionData(q, { idField: 'id' }).pipe(takeUntil(this.logout$));
  }

  addMessage(chatId, msg) {
    const userId = this.authService.getUserId();
    const messages = collection(this.firestore, `chats/${chatId}/messages`);
    return addDoc(messages, {
      from: userId,
      msg,
      createdAt: serverTimestamp(),
    });
  }

  async addFileMessage(base64, chatId) {
    const userId = this.authService.getUserId();
    let newName = `${new Date().getTime()}-${userId}.jpeg`;

    const storageRef = ref(this.storage, newName);
    const uploadResult = await uploadString(storageRef, base64, 'base64', {
      contentType: 'image/jpeg',
    });

    console.log('uploadResult: ', uploadResult);

    const url = await getDownloadURL(uploadResult.ref);

    const messages = collection(this.firestore, `chats/${chatId}/messages`);
    return addDoc(messages, {
      from: userId,
      file: url,
      createdAt: serverTimestamp(),
    });
  }

  leaveChat(chatId) {
    const userId = this.authService.getUserId();
    const userEmail = this.authService.getUserEmail();

    const chatReference = doc(this.firestore, `chats/${chatId}`);
    return updateDoc(chatReference, {
      users: arrayRemove({ id: userId, email: userEmail }),
    }).then((res) => {
      console.log('after remove: ', res);

      const userRef = doc(this.firestore, `users/${userId}`);
      return updateDoc(userRef, {
        chats: arrayRemove(chatId),
      });
    });
  }
}
