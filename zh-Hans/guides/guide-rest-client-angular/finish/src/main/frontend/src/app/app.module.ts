import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// tag::importHttpClientModule[]
import { HttpClientModule } from '@angular/common/http';
// end::importHttpClientModule[]
import { AppComponent } from './app.component';

// tag::atNgModule[]
@NgModule({
  declarations: [
    AppComponent
  ],
  // tag::importsArray[]
  imports: [
    BrowserModule,
    // tag::httpClientModule[]
    HttpClientModule,
    // end::httpClientModule[]
  ],
  // end::importsArray[]
  providers: [],
  bootstrap: [AppComponent]
})
// end::atNgModule[]
export class AppModule { }
