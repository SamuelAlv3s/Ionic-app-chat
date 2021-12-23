import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { docData } from 'rxfire/firestore';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserData = null;
  public logout$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      console.log('userChanged: ', user);

      if (user) {
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        docData(userDoc, { idField: 'id' })
          .pipe(take(1), takeUntil(this.logout$))
          .subscribe((data) => {
            console.log('userData: ', data);
            this.currentUserData = data;
          });
      } else {
        this.currentUserData = null;
      }
    });
  }

  async signup({ email, password }): Promise<UserCredential> {
    try {
      const credentials = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const userDoc = doc(this.firestore, `users/${credentials.user.uid}`);
      setDoc(userDoc, { email, chats: [] });
      return credentials;
    } catch (error) {
      throw error;
    }
  }

  login({ email, password }) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigateByUrl('/', { replaceUrl: true });
    console.log('Service Destroy');
    this.logout$.next(true);
    this.logout$.unsubscribe();
  }

  getUserId() {
    return this.auth.currentUser.uid;
  }

  getUserEmail() {
    return this.currentUserData.email;
  }
}
