import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { StartGroupModalPage } from '../start-group-modal/start-group-modal.page';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
})
export class OverviewPage implements OnInit, OnDestroy {
  public chats = [];
  public subscriptions = new Subscription();
  constructor(
    private authService: AuthService,
    private modalCtrl: ModalController,
    private routerOutlet: IonRouterOutlet,
    private chatService: ChatService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadChats();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadChats() {
    const chatSub = this.chatService.getUsersChats().subscribe((res: any) => {
      console.log('user chats: ', res);
      this.chats = res;
    });
    this.subscriptions.add(chatSub);
    this.changeDetectorRef.detectChanges();
  }

  logout() {
    this.authService.logout();
  }

  async startGroup() {
    const modal = await this.modalCtrl.create({
      component: StartGroupModalPage,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log('After close: ', data);
    if (data) {
      if (data.action === 'single') {
        this.chatService.startChat(data.user);
      } else if (data.action === 'group') {
        this.chatService.startGroup(data.name, data.users);
      }
    }
  }
}
