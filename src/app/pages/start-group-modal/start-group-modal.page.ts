import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-start-group-modal',
  templateUrl: './start-group-modal.page.html',
  styleUrls: ['./start-group-modal.page.scss'],
})
export class StartGroupModalPage implements OnInit {
  public users = [];
  public group = false;
  public groupName = '';
  constructor(
    private chatService: ChatService,
    private modalCtrl: ModalController
  ) {}
  ngOnInit() {
    this.chatService.getAllUsers().subscribe((res) => {
      console.log('users: ', res);
      this.users = res;
    });
  }

  startGroup() {
    console.log('group: ', this.users);

    const selected = this.users.filter((user) => user.selected);
    if (selected.length === 0) return;

    this.modalCtrl.dismiss({
      action: 'group',
      name: this.groupName,
      users: selected,
    });
  }

  startChat(user) {
    if (this.group) return;
    console.log('Start: ', user);
    this.modalCtrl.dismiss({
      action: 'single',
      user: { email: user.email, id: user.id },
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
