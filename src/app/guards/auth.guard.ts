import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CanActivate, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: Auth,
    private router: Router,
    private toastCtrl: ToastController
  ) {}
  canActivate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          resolve(true);
        } else {
          this.router.navigateByUrl('/', { replaceUrl: true });

          const toast = await this.toastCtrl.create({
            message: 'Your session has expired',
            position: 'bottom',
            duration: 2000,
          });

          await toast.present();

          reject(false);
        }
      });
    });
  }
}
