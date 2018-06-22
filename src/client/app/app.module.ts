import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HomeModule } from './home/home.module';
import { SharedModule } from './shared/shared.module';

/**
 * all the modules that the app component can use are imported here
 * will bootstrap their modules for the app component to use
 * these all mostly take care of html intercewpting and routing
*/

@NgModule({
  imports: [BrowserModule, HttpClientModule, AppRoutingModule, HomeModule, SharedModule.forRoot()],
  declarations: [AppComponent],
  providers: [{
    provide: APP_BASE_HREF,
    useValue: '<%= APP_BASE %>'
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
