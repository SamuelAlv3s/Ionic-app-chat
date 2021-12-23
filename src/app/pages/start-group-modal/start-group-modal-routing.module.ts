import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StartGroupModalPage } from './start-group-modal.page';

const routes: Routes = [
  {
    path: '',
    component: StartGroupModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StartGroupModalPageRoutingModule {}
