import { Component, OnInit } from '@angular/core';
import { ApirestService } from '../apirest.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RestProvider } from '../providers/rest/rest';
import { Md5 } from 'ts-md5/dist/md5';
import { SingletonService } from '../singleton.service';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public user = { 'document': '', 'password': '' };
  constructor(
    public service: ApirestService,
    private router: Router,
    private toastr: ToastrService,
    public provider: RestProvider,
    public singleton: SingletonService,
    private cookieService: CookieService
  ) {

  }

  ngOnInit() {
    //console.log(localStorage.getItem('token'));
    if ('null' != localStorage.getItem('token') && null != localStorage.getItem('token') && undefined != localStorage.getItem('token')) {
      this.router.navigate(['/users']);
    }
  }

  login() {
    let body = {
      "documento": this.user.document + "",
      "clave": this.user.password
    }

    let bodyToken = {
      "parametro1": "209fb77b7a1b36c8d0139cfa43ed7e29",
      "parametro2": "87c2264a3c4a03c716b012ceac0b0e66",
      "parametro3": "Web"
    };

    if (this.user.document !== "" && this.user.password !== "") {

      let token = localStorage.getItem('gtoken')
      //we get the user information
      this.provider.queryAuth('/confa/metodo11', body, 1, token).subscribe(
        response => {
          let result = response.json();

          if (result.documento != "") {
            let user = response.json();

            localStorage.setItem('user', JSON.stringify(user));


            bodyToken = {
              "parametro1": "" + Md5.hashStr(this.user.document),
              "parametro2": "" + Md5.hashStr(this.user.password),
              "parametro3": "Web"
            };

            this.provider.queryJson('/auth', bodyToken, 1).subscribe(
              response => {
                let result = response.json();

                if (undefined !== result) {
                  let token = 'Bearer '+ result['token'];
                  localStorage.setItem('ptoken', token);
                  this.cookieService.set('ptoken', JSON.stringify(result));
                  this.singleton.loggedIn = true;
                  this.router.navigate(['/']);
                }
              },
              err => {
                localStorage.setItem('user', null);
                localStorage.setItem('token', null);
                //this.router.navigate(['/']);
              }
            );
          }
          else {
            let message = "Credenciales incorrectas";
            this.toastr.error(message, 'Lo sentimos', { enableHtml: true, positionClass: 'toast-top-center' });
          }
        },
        err => {

          if (err.status == 401) {
            let message = "ALGO NO VA BIEN La sesión ha expirado";
            this.toastr.error(message, 'Lo sentimos', { enableHtml: true, positionClass: 'toast-top-center' });
          }
          if (err.status == 503 || err.status == 0) {
            let message = "ALGO NO VA BIEN Parece que no tienes conexión";
            this.toastr.error(message, 'Lo sentimos', { enableHtml: true, positionClass: 'toast-top-center' });
          }
          if (err.status == 500) {
            let message = "ALGO NO VA BIEN No es posible conectarse con confa en estos momentos";
            this.toastr.error(message, 'Lo sentimos', { enableHtml: true, positionClass: 'toast-top-center' });
          }
          if (err.status != 500 && err.status != 503 && err.status != 0 && err.status != 401) {
            let message = "ALGO NO VA BIEN El usuario no existe";
            this.toastr.error(message, 'Lo sentimos', { enableHtml: true, positionClass: 'toast-top-center' });
          }

        }
      );

    } else {
      let message = "Debe ingresar documento y contraseña";
      this.toastr.error(message, 'Lo sentimos', { enableHtml: true, positionClass: 'toast-top-center' });
    }
  }
}
