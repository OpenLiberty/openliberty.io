// tag::importOnInitAndAngularCorePackage[]
import { Component, OnInit } from '@angular/core';
// end::importOnInitAndAngularCorePackage[]
// tag::importHttpClient[]
import { HttpClient } from '@angular/common/http';
// end::importHttpClient[]
// tag::importInjectable[]
import { Injectable } from '@angular/core';
// end::importInjectable[]

// tag::atInjectable[]
@Injectable()
// end::atInjectable[]
// tag::artistsServiceClass[]
export class ArtistsService {
  // tag::httpClientInstance[]
  constructor(private http: HttpClient) { }
  // end::httpClientInstance[]

  // tag::artistsUrl[]
  private static ARTISTS_URL = '/artists';
  // end::artistsUrl[]

  // tag::fetchArtistsMethod[]
  // tag::asyncFeature[]
  async fetchArtists() {
  // end::asyncFeature[]
    try {
      // tag::httpInstanceAndAwaitFeatureAndHttpGetAndToPromise[]
      const data: any = await this.http.get(ArtistsService.ARTISTS_URL).toPromise();
      // end::httpInstanceAndAwaitFeatureAndHttpGetAndToPromise[]
      return data;
    } catch (error) {
      console.error('Error occurred: ' + error);
    }
  }
  // end::fetchArtistsMethod[]
}
// end::artistsServiceClass[]

// tag::atComponent[]
@Component({
  selector: 'app-root',
  // tag::templateUrl[]
  templateUrl: './app.component.html',
  // end::templateUrl[]
  // tag::providersProperty[]
  providers: [ ArtistsService ],
  // end::providersProperty[]
  // tag::styleUrls[]
  styleUrls: ['./app.component.css']
  // end::styleUrls[]
})
// end::atComponent[]
// tag::appComponentClass[]
// tag::onInitInterface[]
export class AppComponent implements OnInit {
// end::onInitInterface[]
  // tag::artistsClassMember[]
  artists: any[] = [];
  // end::artistsClassMember[]

  // tag::artistsServiceInstanceDeclaration[]
  constructor(private artistsService: ArtistsService) { }
  // end::artistsServiceInstanceDeclaration[]

  // tag::ngOnInitMethod[]
  ngOnInit() {
    // tag::thenClause[]
    // tag::artistsServiceInstance[]
    this.artistsService.fetchArtists().then(data => {
    // end::artistsServiceInstance[]
      this.artists = data;
    });
    // end::thenClause[]
  }
  // end::ngOnInitMethod[]
}
// end::appComponentClass[]
