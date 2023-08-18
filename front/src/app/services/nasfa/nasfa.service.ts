import { Injectable } from '@angular/core';
import { ApiRestService } from "../api-rest.service";

@Injectable({
  providedIn: 'root'
})
export class NasfaService {

  constructor(private rest: ApiRestService) { }

  consultaNasfa(body: any) {
    return this.rest.queryPostFormulario("servicioConsultaNasfa/metodo1", body, true);
  }
}
