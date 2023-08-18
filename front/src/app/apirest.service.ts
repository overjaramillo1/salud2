import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class ApirestService {

  //public apiUrl: string = 'http://localhost:8000/api/v1/';  //Url test api
  public apiUrl: string = 'http://app.confa.co:8321/';  //Url production api

  constructor(private http: Http) {
    this.http = http;
  }

  /**
  *
  **/
  queryPostRegular(route: string, body) {
    let repos = this.http.post(this.apiUrl.concat(route), body);
    return repos;
  }

  queryGet(route: string) {
    let token = localStorage.getItem('token');
    let headers = new Headers({ 'Authorization': token });
    let options = new RequestOptions({ headers: headers });
    let repos = this.http.get(this.apiUrl.concat(route), options);
    return repos;
  }

  queryPost(route: string, body) {
    let token = localStorage.getItem('token');
    let headers = new Headers({ 'Authorization': token });
    let options = new RequestOptions({ headers: headers });
    let repos = this.http.post(this.apiUrl.concat(route), body, options);
    return repos;
  }

  queryDelete(route: string) {
    let token = localStorage.getItem('token');
    let headers = new Headers({ 'Authorization': token });
    let options = new RequestOptions({ headers: headers });
    let repos = this.http.delete(this.apiUrl.concat(route), options);
    return repos;
  }

  queryExternalApi(route) {
    let repos = this.http.get(route);
    return repos;
  }
}
