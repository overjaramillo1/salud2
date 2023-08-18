import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { IMyDpOptions } from "mydatepicker";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as environments from "src/environments/environment";
import * as _globals from "src/app/globals";
import { DocumentTypeService } from "src/app/services/document/document-type.service";
import { UtilitiesService } from "src/app/services/general/utilities.service";
import { UserService } from "src/app/services/user/user.service";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { TermsService } from "src/app/services/user/terms.service";
import * as globals from "../../../globals";
import { DataService } from "src/app/data.service";
import { CookieService } from "ngx-cookie-service";
import { RestProvider } from "../../../providers/rest/rest";
import { first } from "rxjs/operators";
import { NasfaService } from "src/app/services/nasfa/nasfa.service";
import { SaludFemeninaService } from "src/app/services/saludFemenina/saludFemenina.service";
import { removeSummaryDuplicates } from "@angular/compiler";
declare var $;

/* const DEMODATA = {
    document: '75084103',
    documentType: 'E',
    birthday: '1977-06-12'
}; */

// const DEMODATA = {
//     document: '16079546',
//     documentType: 'C',
//     birthday: '1984-01-26'
// };

// const DEMODATA = {
//     document: '1060653310',
//     documentType: 'C',
//     birthday: '1994-09-13'
// };

@Component({
  selector: "app-login-health",
  templateUrl: "./login-health.component.html",
  styleUrls: ["./login-health.component.scss"],
})
export class LoginHealthComponent implements OnInit {
  public documentFieldLogin = globals.documentFieldLogin;
  public documentTypeFieldLogin = globals.documentTypeFieldLogin;
  public birthdayFieldLogin = globals.birthdayFieldLogin;
  public form: string;
  private unsubscribes: Subscription[] = [];

  // private startDate: Object = { date: { year: parseInt(DEMODATA.birthday.split('-')[0]), month: parseInt(DEMODATA.birthday.split('-')[1]), day: parseInt(DEMODATA.birthday.split('-')[2]) } };

  public date = new Date();
  public initDate = {
    year: this.date.getFullYear(),
    month: this.date.getMonth() + 1,
    day: this.date.getDate(),
  };

  public disabledDays = [];
  public disabledUntil = {
    year: this.date.getFullYear(),
    month: this.date.getMonth() + 1,
    day: this.date.getDate(),
  };
  public disableSince = { year: this.date.getFullYear() + 1, month: 2, day: 1 };
  public disableUnitilFinish = this.initDate;

  //Options date start dateOptionsFinish
  public dateOptionsInit: IMyDpOptions = {
    // other options...
    dayLabels: {
      su: "Do",
      mo: "Lu",
      tu: "Ma",
      we: "Mi",
      th: "Ju",
      fr: "Vi",
      sa: "Sa",
    },
    monthLabels: {
      1: "Ene",
      2: "Feb",
      3: "Mar",
      4: "Abr",
      5: "May",
      6: "Jun",
      7: "Jul",
      8: "Ago",
      9: "Sep",
      10: "Oct",
      11: "Nov",
      12: "Dic",
    },
    dateFormat: "yyyy-mm-dd",
    firstDayOfWeek: "mo",
    sunHighlight: true,
    showTodayBtn: true,
    yearSelector: true,
    //minYear: this.date.getFullYear(),
    //maxYear: this.date.getFullYear() + 2,
    todayBtnTxt: "Hoy",
    //disableUntil: this.disabledUntil,
    disableDays: this.disabledDays,
    disableSince: this.disableSince,
    openSelectorOnInputClick: true,
    editableDateField: false,
    inline: false,
    height: "44px",
  };
  public siteKey = environments._site.recaptcha.secretkey;

  /**
   * Data form
   */
  public aFormGroup: FormGroup;

  /**
   * Data for user
   */
  public user: any;
  public loggedin: object = {
    status: false,
    document: "",
    documentType: "",
    birthday: "",
  };

  public documentType = [];

  @Output() loaderEvent = new EventEmitter<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private ut: UtilitiesService,
    private userService: UserService,
    private terms: TermsService,
    private documentTypeService: DocumentTypeService,
    private router: Router,
    public dataService: DataService,
    private cookieService: CookieService,
    private provider: RestProvider,
    private nasfaService: NasfaService,
    private saludFemeninaService: SaludFemeninaService
  ) {
    this.documentType = this.documentTypeService.getAll();
  }

  ngOnInit() {
    this.form = "0";
    localStorage.setItem("form", this.form);
    /* this.ut.destroyLocalSession("user_health");
    this.ut.destroyLocalSession("htoken"); */
    this.dataService.user.subscribe((data) => {
      this.checkIfLogin();
    });

    this.checkIfLogin();
  }

  ngOnDestroy() {
    this.unsubscribes.forEach((sb) => sb.unsubscribe());
  }

  /**
   * Funtion for check if login user
   */
  checkIfLogin() {
    this.loadUserInfo().then(() => {
      this.user = this.userService.getSessionUser();

      if (this.user && this.ut.validateToken) {
        this.loggedin = {
          status: true,
          document: this.user.documento,
          documentType: this.user.tipoDocumento,
          birthday: this.user.fechaNacimiento,
        };
      } else {
        this.loggedin = {
          status: false,
          document: "",
          documentType: "",
          birthday: "",
        };
      }
      this.createForm(this.loggedin);
    });
    this.createForm(this.loggedin);
  }

  private loadUserInfo() {
    let token =
      this.cookieService.get("ptoken") !== ""
        ? JSON.parse(this.cookieService.get("ptoken"))
        : null;

    if (token) {
      return new Promise<void>((resolve, reject) => {
        this.provider
          .login(token["token"])
          .pipe(first())
          .subscribe((response) => {
            let user = response.json();
            localStorage.setItem("user", JSON.stringify(user));
            resolve();
          });
      });
    } else {
      return new Promise<void>((resolve, reject) => {
        resolve();
      });
    }
  }

  /**
   * Event for create form
   */
  createForm(data: any) {
    this.aFormGroup = this.formBuilder.group({
      document: [
        data.document,
        //DEMODATA.document,
        Validators.compose([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(15),
        ]),
      ],
      documentType: [
        data.documentType,
        //DEMODATA.documentType,
        Validators.compose([Validators.required]),
      ],
      birthday: [
        data.birthday ? this.ut.convertDateObject(data.birthday) : "",
        //this.ut.convertDateObject(DEMODATA.birthday),
        Validators.compose([Validators.required]),
      ],
      //recaptcha: ['', Validators.required]
    });
  }

  /**
   * Event submit form
   */
  sendData(data: string) {
    this.ut.sendMessage(data);
  }

  submit() {
    const self = this;
    const controls = this.aFormGroup.controls;

    /** check form */
    if (this.aFormGroup.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      return;
    }

    let data = {
      // documento: "1053777460",
      // tipoDocumento: "C",
      // fechaNacimiento: "1987-01-03",
      documento: controls["document"].value.toString(),
      tipoDocumento: controls["documentType"].value,
      fechaNacimiento: this.ut.convertDateFormat(
      controls["birthday"].value.date,
      "YYYY-MM-DD"
      ),
    };
    console.log(controls["documentType"].value);
    this.ut.toggleSplashscreen(true);

    let body = {
      numero_documento: data.documento
    }
    
    this.saludFemeninaService.getNumeroRadicado(body).subscribe((res) => {
      let result = res.json();      
      if (result.secuencia == "") {
        this.nasfaService.consultaNasfa(body).subscribe((res) => {
          try{
          let result = res.json();       
          if (result.estado == "OK") {
            if ((result.categoria == "A" || result.categoria == "B") && result.estadoAfiliado == "A" && result.aplicaBeneficio == true && result.sexo == "F" 
            && result.edad >= 18 && result.edad <=54) {
              this.sendData(result.categoria);
              const checkUserSubs = this.userService
                .checkIfUserHaveServiceHealth(data)
                .subscribe((res) => {
                  let result = res.json();
                  if (result.estado == "OK") {
                    localStorage.setItem("gtoken", result.mensaje);
                    const checkUserSubs = this.userService
                      .getdatos(data)
                      .subscribe((res) => {
                        let result = res.json();
                        if (result.respuesta.estado == "OK") {
                          let adicional = result.unidadesConvenios.length - 1;
                          data["adicional"] =
                            result.unidadesConvenios[adicional].adicional;
                          data["user"] =
                            result.unidadesConvenios[adicional].nombreUsuario;
                          let agreements = [];
                          for (let i = 0; i < result.unidadesConvenios.length; i++) {
                            agreements.push({
                              convenio: result.unidadesConvenios[i].convenioId,
                              value: result.unidadesConvenios[i].nombre,
                              plan: result.unidadesConvenios[i].plan,
                            });
                          }
                          this.ut.setLocalSession(agreements, "user_agreements");

                          if (this.user) {
                            let dataUserUpdate = {
                              documento: data.documento,
                              celular: this.user.celular,
                              direccion: this.user.direccion,
                              fechaNacimiento: data.fechaNacimiento,
                              tipoDocumento: data.tipoDocumento,
                              telefono: this.user.telefono,
                              genero: this.user.sexo,
                            };
                            const userUpdateSubs = this.userService
                              .updateDataUser(dataUserUpdate)
                              .subscribe((resUpd) => {
                                let resultUpd = resUpd.json();

                                if (resultUpd.respuesta) {
                                  this.userService.updatedSessionUser(dataUserUpdate);
                                  this.validationUserSuccess(data, result);
                                }
                              });

                            this.unsubscribes.push(userUpdateSubs);
                          } else {
                            this.validationUserSuccess(data, result);
                          }
                        } else {
                          this.showErrors("Usuario no se encuentra habilitado");
                          this.ut.toggleSplashscreen(false);
                        }
                      });
                  } else {
                    this.showErrors(
                      "Actualmente no contamos con tu información en nuestra base de datos. Te invitamos a registrarte"
                    );
                    this.ut.toggleSplashscreen(false);
                  }
                });
              this.unsubscribes.push(checkUserSubs);
            } else {
              //aca va el else
              if (result.estadoAfiliado != "A" && result.estadoAfiliado != "R" && result.aplicaBeneficio==true) {
                this.showErrorCategoria("El usuario que esta tratando de ingresar no cumple con las condiciones, usuario no afiliado");
                this.ut.toggleSplashscreen(false);
              } else if (result.estadoAfiliado == "R") {
                this.showErrorCategoria("El usuario que esta tratando de ingresar no cumple con las condiciones, usuario no se encuentra activo");
                this.ut.toggleSplashscreen(false);
              }else if(result.aplicaBeneficio == false){
                this.showErrorCategoria("El usuario que esta tratando de ingresar no cumple con las condiciones, no aplica el beneficio para este usuario: " );
                this.ut.toggleSplashscreen(false);
              } else if(result.sexo == "M"){
                this.showErrorCategoria("Apreciado afiliado, lamentablemente no cumples con el criterio para acceder a este beneficio, gracias por utilizar nuestros servicios.");
                this.ut.toggleSplashscreen(false);
              }else if(result.edad < 18 || result.edad > 50){
                this.showErrorCategoria("Apreciada afiliada, lamentablemente no cumples con la edad para acceder a este beneficio, gracias por utilizar nuestros servicios.");
                this.ut.toggleSplashscreen(false);
              }
              else {
                this.showErrorCategoria("El usuario que esta tratando de ingresar no cumple con las condiciones, su categoria es: " + result.categoria);
                this.ut.toggleSplashscreen(false);
              }
            }
          } else {
            this.showErrorCategoria("Usuario no registrado en la caja");
            this.ut.toggleSplashscreen(false);
          }
        }catch{
          this.showErrorCategoria("El usuario no se encuentra registrado, favor dirigirse al área de subsidios para revisar su caso.");
            this.ut.toggleSplashscreen(false);
        }
        });
      } else {
        this.showErrorCategoria("El usuario que esta tratando de ingresar ya tiene una postulación con el numero de radicado: " + result.secuencia);
        this.ut.toggleSplashscreen(false);
      }
    });
  }

  validationUserSuccess(data: object, result: any) {
    this.ut.toggleSplashscreen(false);
    this.terms.callTerms(true);

    const accepTermsSubs = this.terms._acceptTerms.subscribe((res) => {
      if (res) {
        this.userService.createSessionUser(data, "health");
        this.ut.setLocalSession(result.respuesta.mensaje, "htoken");
        this.router.navigate([_globals.main_appointments]);
      }
    });

    this.unsubscribes.push(accepTermsSubs);
  }

  /**
   * Checking control validation
   *
   * @param controlName: string => Equals to formControlName
   * @param validationType: string => Equals to valitors name
   */
  isControlHasError(controlName: string, validationType: string): boolean {
    const control = this.aFormGroup.controls[controlName];
    if (!control) {
      return false;
    }

    const result =
      control.hasError(validationType) && (control.dirty || control.touched);
    return result;
  }

  /**
   * Errors
   */
  showErrors(message) {
    this.ut.showErrorsModal(true, message);
  }

  showErrorCategoria(message) {
    this.ut.showErrorsModalCategoria(true, message);
  }

}
