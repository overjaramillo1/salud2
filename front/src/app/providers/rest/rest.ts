import { Http, Headers, RequestOptions } from "@angular/http";
import { Injectable } from "@angular/core";
import * as _globals from "src/environments/environment";
import { map } from "rxjs/operators";
/*
  Generated class for the RestProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RestProvider {
  //----------------RUTAS PRUEBAS------------------------
  //Ruta eventos confa
  //private apiEventUrl: string = 'https://app.confa.co:8876/eventoConfaWSS/rest/evento';
  private apiEventUrl: string = _globals.pathEvents.urlHealth;

  //Ingreso Confa
  //private apiUrl: string = 'https://app.confa.co:8687/ingresoConfaWSSpruebas/rest';
  private apiUrl: string = _globals.api.authConfa;
  //private apiUrl: string = _globals.api.prueba;

  //Alojamientos url
  //private apiAcommodtions: string = 'https://app.confa.co:8687/alojamientoWS/rest/alojamiento';
  private apiAcommodtions: string = _globals.api.acommodation;

  //Pagos
  //private pagosPasarela: string = 'https://app.confa.co:8687/pagosPasarelaWS/rest/pagos';
  private pagosPasarela: string = _globals.api.payments;

  //----------------RUTAS PRODUCCIÓN------------------------
  //Ruta eventos confa
  //public apiEventUrl: string = 'https://app.confa.co:8876/eventoConfaWSS/rest/evento';

  //Ingreso Confa
  //public apiUrl: string = 'https://app.confa.co:8876/ingresoConfaWSS/rest';

  //Alojamientos url
  //public apiAcommodtions: string = 'https://app.confa.co:8876/alojamientoWS/rest/alojamiento';

  //Pagos
  //public pagosPasarela: string = 'https://app.confa.co:8876/pagosPasarelaWS/rest/pagos';

  constructor(public http: Http) {
    this.http = http;
  }

  queryGet(ruta: string) {
    let headers = new Headers();
    let options = new RequestOptions({ headers: headers });
    let repos = this.http.get(this.apiUrl.concat(ruta), options);
    return repos;
  }

  queryPost(ruta: string, body) {
    let headers = new Headers();
    let options = new RequestOptions({ headers: headers });
    let repos = this.http.post(this.apiUrl.concat(ruta), body, options);
    return repos;
  }

  queryAuth(ruta: string, body, apiType, token) {
    console.log(this.apiUrl + ruta);
    let url = this.apiUrl;
    if (apiType == 2) {
      // If the apiType is '2' we need to take the event url
      url = this.apiEventUrl;
    }

    let headers = new Headers({ Authorization: token });
    headers = new Headers({ "Content-Type": "application/json" });
    //let headers = new Headers({ 'Content-Type': 'application/json' });
    //headers.append('Accept', 'application/json, text/plain, */*');
    //headers.append("Content-Type", "application/json");
    let options = new RequestOptions({ headers: headers });
    let repos = this.http.post(url.concat(ruta), body, options);
    return repos;
  }

  queryJson(ruta: string, body, apiType, token = null) {
    let url = this.apiUrl; //'https://app.confa.co:8876/ingresoConfaWSSPortal/rest';
    if (apiType == 2) {
      // If the apiType is '2' we need to take the event url
      url = this.apiEventUrl;
    } else if (apiType == 3) {
      url = this.apiAcommodtions;
    }

    let headers = new Headers({ "Content-Type": "application/json" });

    headers = new Headers({ Authorization: token });
    //headers = new Headers({'strictSSL': false});
    let options = new RequestOptions({ headers: headers });
    let repos = this.http.post(url.concat(ruta), body, options);

    return repos;
  }

  queryJsonprovi(ruta: string, body, apiType, token = null) {
    let url = this.apiUrl; //'https://app.confa.co:8876/ingresoConfaWSSPortal/rest';
    if (apiType == 2) {
      // If the apiType is '2' we need to take the event url
      url = this.apiEventUrl;
    } else if (apiType == 3) {
      //url = 'http://localhost:8080/alojamientoWSOriginal/rest/alojamiento';
      url = this.apiAcommodtions;
    }

    let headers = new Headers({ "Content-Type": "application/json" });

    headers = new Headers({ Authorization: token });
    //headers = new Headers({'strictSSL': false});
    let options = new RequestOptions({ headers: headers });
    let repos = this.http.post(url.concat(ruta), body, options);

    return repos;
  }

  queryGetprovi(ruta: string, token = null) {
    //let url = 'http://localhost:8080/alojamientoWSOriginal/rest/alojamiento';
    let url = this.apiAcommodtions;
    let headers = new Headers({ "Content-Type": "application/json" });

    headers = new Headers({ Authorization: token });
    let options = new RequestOptions({ headers: headers });
    let repos = this.http.get(url.concat(ruta), options);
    return repos;
  }

  queryPasarela(ruta: string, body, token) {
    let headers = new Headers();
    headers.append("Authorization", token);
    //headers = new Headers({'strictSSL': false});
    let options = new RequestOptions({ headers: headers });
    let repos = this.http.post(this.pagosPasarela.concat(ruta), body, options);
    return repos;
  }

  private getQuery(query: string, body: any) {
    const url = `${this.apiUrl}${query}`;

    return this.http.post(url, body);
  }

  login(token: string) {
    let bodyToken = {
      token: token.toString(),
    };

    return this.getQuery("/confa/metodo23", bodyToken).pipe(
      map((response) => {
        return response;
      })
    );
  }

  validateToken(token: string) {
    let bodyValidateToken = {
      token: token.toString(),
    };

    return this.getQuery("/validarToken", bodyValidateToken).pipe(
      map((response) => {
        return response;
      })
    );
  }
}
