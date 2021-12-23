import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StartGroupModalPageRoutingModule } from './start-group-modal-routing.module';

import { StartGroupModalPage } from './start-group-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StartGroupModalPageRoutingModule
  ],
  declarations: [StartGroupModalPage]
})
export class StartGroupModalPageModule {}
