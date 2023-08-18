import { HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/internal/Observable";
import * as _globals from "../../environments/environment";
import { UtilitiesService } from "./general/utilities.service";

@Injectable({
  providedIn: "root",
})
export class ApiRestService {
  constructor(public http: Http, private ut: UtilitiesService) {
    this.http = http;
  }

  queryPost(route: string, body, token) {
    let headers = new Headers();
    if (token) {
      let tokenData = localStorage.getItem("gtoken");
      headers = new Headers({ Authorization: tokenData });
    }
    let options = new RequestOptions({ headers: headers });
    let repos = this.http.post(
      _globals.api.urlHealth.concat(route),
      body,
      options
    );

    return repos;
  }

  queryPostFormulario(route: string, body, token) {
    let headers = new Headers();
    if (token) {
      let tokenData = localStorage.getItem("gtoken");
      headers = new Headers({ Authorization: tokenData });
    }
    let options = new RequestOptions({ headers: headers });
    let repos = this.http.post(
      _globals.api.urlHealth.concat(route),
      body,
      options
    );

    return repos;
  }
}
