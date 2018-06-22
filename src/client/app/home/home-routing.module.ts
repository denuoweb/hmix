import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';

// set the html router, '' default page goes to homeComponent
// this app doesn not have other html paths, it is a one page application

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: HomeComponent }
    ])
  ],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
