import { Injectable } from '@angular/core';
import { ApiRestService } from "../api-rest.service";

@Injectable({
  providedIn: 'root'
})
export class SaludFemeninaService {

  constructor(private rest: ApiRestService) { }

  getDataForm() {
    return this.rest.queryPostFormulario("formularioSaludFemenina/metodo5", "", true);
  }

  sendForm(body: any) {
    return this.rest.queryPostFormulario("formularioSaludFemenina/metodo6", body, true);
  }

  getNumeroRadicado(body: any){
    return this.rest.queryPostFormulario("formularioSaludFemenina/metodo7", body, true);
  }
}
