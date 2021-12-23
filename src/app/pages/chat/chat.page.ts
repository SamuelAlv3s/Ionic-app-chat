import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  public chatId = null;
  public currentUserId = null;
  public users = null;
  public chatInfo = null;
  public msg = '';
  public messages = [];
  public scrollPercentage = 0;
  @ViewChild(IonContent) content: IonContent;
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('chatid');
    this.currentUserId = this.authService.getUserId();

    console.log('My Chat: ', this.chatId);

    this.chatService
      .getChatInfo(this.chatId)
      .pipe(
        switchMap((info) => {
          this.users = {};
          this.chatInfo = info;
          for (let user of info.users) {
            this.users[user.id] = user.email;
          }
          console.log('info: ', this.users);

          return this.chatService.getChatMessages(this.chatId);
        }),
        map((messages) => {
          return messages.map((msg) => {
            msg.fromUser = this.users[msg.from] || 'Deleted';
            return msg;
          });
        })
      )
      .subscribe((res) => {
        console.log('res: ', res);
        for (let m of res) {
          if (this.messages.filter((msg) => msg.id === m.id).length === 0) {
            this.messages.push(m);
          }
        }

        setTimeout(() => {
          this.content.scrollToBottom(400);
        }, 400);
      });
  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      source: CameraSource.Photos,
      resultType: CameraResultType.Base64,
    });

    if (image) {
      console.log('image: ', image);
      this.chatService.addFileMessage(image.base64String, this.chatId);
    }
  }

  sendMessage() {
    this.chatService.addMessage(this.chatId, this.msg).then((_) => {
      this.msg = '';
      this.content.scrollToBottom(300);
    });
  }

  async contentScrolled(ev) {
    const scrollElement = await this.content.getScrollElement();
    const scrollPosition = ev.detail.scrollTop;
    const totalContentHeight = scrollElement.scrollHeight;

    this.scrollPercentage =
      scrollPosition / (totalContentHeight - ev.target.clientHeight) + 0.001;
  }

  scrollDown() {
    this.content.scrollToBottom(300);
  }

  leaveChat() {
    this.chatService.leaveChat(this.chatId).then((_) => {
      this.router.navigateByUrl('/inside');
    });
  }
}
