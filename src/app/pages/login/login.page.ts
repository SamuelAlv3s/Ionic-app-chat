import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public credentialsForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.credentialsForm = this.fb.group({
      email: ['hello@email.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
    });
  }

  async login() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    this.authService.login(this.credentialsForm.value).then(
      (user) => {
        loading.dismiss();
        this.router.navigateByUrl('/inside', { replaceUrl: true });
        console.log(user);
      },
      async (err) => {
        await loading.dismiss();

        const alert = await this.alertCtrl.create({
          header: 'Login failed',
          message: 'Please try again later, Reason:' + err,
          buttons: ['ok'],
        });

        await alert.present();
      }
    );
  }

  async register() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.authService.signup(this.credentialsForm.value).then(
      (_) => {
        loading.dismiss();
        this.router.navigateByUrl('/inside', { replaceUrl: true });
      },
      async (err) => {
        await loading.dismiss();

        const alert = await this.alertCtrl.create({
          header: 'Signup failed',
          message: 'Please try again later, Reason:' + err,
          buttons: ['ok'],
        });

        await alert.present();
      }
    );
  }
}
