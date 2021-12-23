import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AutoLoginGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}
  canActivate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          this.router.navigateByUrl('/inside', { replaceUrl: true });
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
