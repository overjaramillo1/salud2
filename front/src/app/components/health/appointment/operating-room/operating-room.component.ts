import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as _globals from "src/app/globals";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { UtilitiesService } from "src/app/services/general/utilities.service";
import { QuirofanosService } from "src/app/services/quirofanos/quirofanos.service";
import { UserService } from "src/app/services/user/user.service";
import * as _ from "lodash";
import { SaludFemeninaService } from "src/app/services/saludFemenina/saludFemenina.service";
import { Subscription } from "rxjs";
import { and } from "@angular/router/src/utils/collection";
declare var $;

@Component({
  selector: "app-operating-room",
  templateUrl: "./operating-room.component.html",
  styleUrls: ["./operating-room.component.scss"],
})
export class OperatingRoomComponent implements OnInit {
  public main_appointments: string = _globals.main_appointments;
  public main_health: string = _globals.main_health;

  formScheduleRoom: FormGroup;
  aseguradoras: String[] = [];
  tiposAseguramiento: String[] = [];
  especialidades: String[] = [];
  especialistas: String[] = [];
  municipios: String[] = [];
  departamentoPrincipal : String ="Caldas";

  public numSteps: number;
  public currentStep: number = 1;
  public step = 0;

  imageError: string;
  isImageSaved: boolean;
  cardImageBase64: string;

  modalSwitch: boolean;
  especialidadValidator: boolean = false;
  especialistaValidator: boolean = false;
  getDiagnosticoMedico: boolean = false;
  getAceptaPagar: boolean = false;
  departamentoValidator:boolean =false;

  public campoDiabetes: string = "0";
  public campoObesidad: string = "0";
  public campoIntCarb: string = "0";
  public campoPrediabetes: string = "0";
  public campoNinguna: string = "0";

  public categoria: string = "";

  public campoDiabetes1: boolean = false;
  public campoObesidad1: boolean = false;
  public campoIntCarb1: boolean = false;
  public campoPrediabetes1: boolean = false;
  public campoNinguna1: boolean = false;

  $subs: Subscription;

  public userData = {
    direccion: "",
    telefono: "",
    telCelular: "",
    email: "",
  };

  public data = {
    documento: "",
    adicional: "",
    tipoDocumento: "",
    nombre: "",
  };

  constructor(
    private formBuilder: FormBuilder,
    private quirofanoService: QuirofanosService,
    private saludFemeninaService: SaludFemeninaService,
    public ut: UtilitiesService,
    private userService: UserService,
    private router: Router
  ) { }



  ngOnInit() {
    this.ut.toggleSplashscreen(true);
    this.$subs = this.ut.receivedMessage().subscribe((data) => {
      this.categoria = data;
    });
    
    this.numSteps = 2;
    this.currentStep = 1;
    this.getDatosForm();
    this.findUserData();
    this.createForm();
    this.ut.setStepBreadCrumbs.subscribe((res) => {
      if (this.currentStep > 1) {
        this.currentStep = this.currentStep - 1;
      }
      if (this.currentStep == 1) {
        this.step = 0;
        this.main_appointments = "/saludFemenina/postulacion";
      }
    });
    this.ut.toggleSplashscreen(false);
  }

  getDatosForm() {
    this.saludFemeninaService.getDataForm().subscribe((success) => {
      let result = success.json();
      
      this.aseguradoras = result.aseguradoras;
      this.tiposAseguramiento = result.tiposAseguramiento;
      this.municipios = result.municipio;
    });
  }

  findUserData() {
    let dataSession = this.ut.getLocalSession();
    this.data = {
      documento: dataSession["documento"],
      adicional: dataSession["adicional"],
      tipoDocumento: dataSession["tipoDocumento"],
      nombre: dataSession["user"],
    };

    this.userService.getDataUserHealth(this.data).subscribe(
      (success) => {
        let response = success.json();
        if (response.contactoUsuario) {
          this.userData.direccion = response.contactoUsuario["direccion"];
          this.userData.telefono = response.contactoUsuario["telefono"];
          this.userData.telCelular = response.contactoUsuario["telCelular"];
          this.userData.email = response.contactoUsuario["email"];
          localStorage.setItem("userInfo", JSON.stringify(this.userData));
          this.ut.toggleSplashscreen(false);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  createForm() {
    let userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo == null) {
      this.findUserData();
    }

    this.formScheduleRoom = this.formBuilder.group({
      numeroDocumento: [
        this.data["documento"],
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(15),
          Validators.pattern("^[0-9]+"),
        ],
      ],
      tipoDocumento: [this.data["tipoDocumento"], [Validators.required]],
      nombre: [this.data["nombre"]],
      email: [
        userInfo.email,
        [
          Validators.required,
          Validators.pattern(
            "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@" +
            "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$"
          ),
          Validators.email,
        ],
      ],

      telefono: [
        userInfo.telefono,
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(15),
          Validators.pattern("^[0-9]+"),
        ],
      ],
      celular: [
        userInfo.telCelular,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern("^[0-9]+"),
        ],
      ],
      nombreNotificacion: [this.data["nombre"], [Validators.required]],
      telefonoAcudiente: [
        userInfo.telCelular,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(10),
          Validators.pattern(/^-?(0|[1-9]\d*)?$/),
        ],
      ],

      aseguradora: ["", [Validators.required]],
      tipoAseguramiento: ["", [Validators.required]],
      numeroAutorizacion: ["", [Validators.required, Validators.maxLength(20)]],
      nombreProcedimiento: [
        "",
        [Validators.required, Validators.maxLength(500)],
      ],
      especialidad: ["", [Validators.required]],
      nombreEspecialista: ["", [Validators.required]],
      backUpEspecialidad: [""],
      backUpnombreEspecialista: ["", [Validators.maxLength(30)]],

      cedulaAdicional: [
        "",
        [Validators.required],
        Validators.pattern(/^-?(0|[1-9]\d*)?$/),
      ],

      documentoIdentidad: ["", [Validators.required]],
      autorizacion: ["", [Validators.required]],
      historiaClinica: ["", [Validators.required]],
      municipio: ["", [Validators.required]],
      otrosDocumentos: [""],
      observacionAdicional: [""],
      checkbox1: [false],
      checkbox2: [false],
      checkbox3: [false],
      checkbox4: [false],
      checkbox5: [false],
    });
  }

  // validarAseguradora(): void {
  //   if (this.f.aseguradora.value == "Policía y Batallón") {
  //     this.formScheduleRoom
  //       .get("documentoIdentidad")
  //       .setValidators(Validators.required);
  //   } else {
  //     this.formScheduleRoom.get("documentoIdentidad").setValidators(null);
  //   }
  //   this.formScheduleRoom.get("documentoIdentidad").updateValueAndValidity();
  // }



  onSubmit() {
    this.ut.toggleSplashscreen(true);
    const self = this;
    const controls = this.formScheduleRoom.controls;
    var element1 = <HTMLInputElement>document.getElementById("customCheckSi");
    var customCheckSi = element1.checked;
    var element2 = <HTMLInputElement>document.getElementById("customCheckNo");
    var customCheckNo = element2.checked;
    var asumeValor = "0";
    if (customCheckSi == true) {
      asumeValor = "1";
    } else {
      asumeValor = "0";
    }
    if(customCheckSi == false && customCheckNo == false){
      this.ut.toggleSplashscreen(false);
      Object.keys(controls).forEach((controlName) => {
          this.getAceptaPagar = true;
      });
    }
    else if (customCheckNo == true) {
      this.ut.toggleSplashscreen(false);
      this.ut.messageTitleModal = `¡INFORMACIÓN! `;
      this.ut.messageModal = ` Dado que no estarías dispuesto a pagar el monto propuesto, no podemos continuar con el proceso de postulación al subsidio de salud femenina. \n Si cambias tu decisión, puedes volver a postularte.`;
      $(".btn-modal-error").click();
      this.router.navigate["/saludFemenina/postulacion"];
      localStorage.removeItem("userInfo");
    }
    else if (customCheckSi == true){
      let consulta = {
        numero_documento: this.f.numeroDocumento.value
      }
      this.saludFemeninaService.getNumeroRadicado(consulta).subscribe((res) => {
        let result = res.json();
        if (result.secuencia == "") {
          let body = {
            tipo_doc: this.f.tipoDocumento.value,
            documento: this.f.numeroDocumento.value,
            nombre_completo: this.f.nombre.value,
            adicional: "01",
            aseguradora: this.f.aseguradora.value,
            correo_electronico: this.f.email.value,
            numero_telefono: this.f.telefono.value.toString(),
            numero_celular: this.f.celular.value.toString(),
            nombre_contacto: this.f.nombreNotificacion.value,
            telefono_contacto: this.f.telefonoAcudiente.value.toString(),
            historia_clinica: this.f.historiaClinica.value,
            observacion_adicional: this.f.observacionAdicional.value,
            campo_diabetes: this.campoDiabetes,
            campo_obesidad: this.campoObesidad,
            campo_int_carb: this.campoIntCarb,
            campo_pre_diabetes: this.campoPrediabetes,
            campo_ninguno: this.campoNinguna,
            campo_asume_valor: asumeValor,
            campo_categoria: this.categoria,
            departamento:"Caldas",
            municipio:this.f.municipio.value,
          };
          console.log(body);
          this.saludFemeninaService.sendForm(body).subscribe((res) => {
            let result = res.json();
            if (result.estado == "OK") {
              this.ut.toggleSplashscreen(false);
              this.ut.messageTitleModal = `Gracias por tu postulación. Tu radicado es ${result.secuencia}. `;
              this.ut.messageModal = ` Recuerda `;
              this.ut.messageModal2 = `Por correo electrónico o mensaje de texto te estaremos enviando la respuesta a tu solicitud en un plazo de 3 días hábiles. \n`;
              this.ut.messageModal3 = `Este beneficio está vigente hasta el 28 de diciembre de 2023 o hasta agotar existencias. \n`;
              this.ut.messageModal4 = `Si tienes dudas escríbenos al correo centro.investigacion@confa.co o al WhatsApp 310&nbsp;2091135.`;
              $(".btn-modal-success").click();
              this.router.navigate["/saludFemenina/postulacion"];
              localStorage.removeItem("userInfo");
            } else {
              this.ut.toggleSplashscreen(false);
              this.ut.messageTitleModal = "Algo ha salido mal";
              this.ut.messageModal = result.mensaje;
              $(".btn-modal-error").click();
            }
          });
        } else {
          this.ut.toggleSplashscreen(false);
          this.ut.messageTitleModal = `¡INFORMACIÓN! `;
          this.ut.messageModal = ` El usuario que esta tratando de postular ya tiene una postulación con el numero de radicado: ${result.secuencia} `;
          $(".btn-modal-error").click();
          this.router.navigate["/saludFemenina/postulacion"];
          localStorage.removeItem("userInfo");
        }
      });
    }
  }

  submitPersonalInfo() {
    const self = this;
    const controls = this.formScheduleRoom.controls;

    if (
      this.f.numeroDocumento.invalid ||
      this.f.nombre.invalid ||
      this.f.email.invalid ||
      this.f.telefono.invalid ||
      this.f.celular.invalid ||
     /* this.f.nombreNotificacion.invalid ||
      this.f.telefonoAcudiente.invalid ||*/ 
      this.f.municipio.invalid
    ) {
      Object.keys(controls).forEach((controlName) => {
        if (
          controlName == "numeroDocumento" ||
          controlName == "nombre" ||
          controlName == "email" ||
          controlName == "telefono" ||
          controlName == "celular" ||
         /* controlName == "nombreNotificacion" ||
          controlName == "telefonoAcudiente"  || */
          controlName == "municipio"
        ) {
          controls[controlName].markAsTouched();
        }
      });
    } else {
      this.nextStep();
    }
  }

  nextStep() {
    if (this.currentStep + 1 <= this.numSteps) {
      this.currentStep = this.currentStep + 1;
      this.step = this.step + 1;
      if (this.currentStep > 1) {
        this.main_appointments = "/quirofano/citas/agendarCita";
      }
    }
  }

  getFile(fileInput: any, campo: any) {
    this.imageError = null;
    if (fileInput.target.files && fileInput.target.files[0]) {
      // Size Filter Bytes
      const max_size = 5000000;
      const allowed_types = ["image/png", "image/jpeg", "application/pdf"];
      const max_height = 15200;
      const max_width = 25600;

      console.log(fileInput.target.files[0].size);

      if (fileInput.target.files[0].size > max_size) {
        this.imageError = "Maximum size allowed is " + max_size / 1000 + "Mb";
        campo.invalid;
        campo.value = '';
        campo._pendingValue = null;
        campo.status = "INVALID";
        return false;
      }

      if (!_.includes(allowed_types, fileInput.target.files[0].type)) {
        this.imageError = "Only Images are allowed ( JPG | PNG )";
        campo.invalid;
        campo.value = '';
        campo._pendingValue = null;
        campo.status = "INVALID";
        return false;
      } else {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (e.total < max_size) {
            const imgBase64Path = e.target.result;
            campo.value = imgBase64Path;
            this.cardImageBase64 = imgBase64Path;
            this.isImageSaved = true;
          }
        };

        reader.readAsDataURL(fileInput.target.files[0]);
      }
    }
  }

  capturarAseguradora(event) {
    this.formScheduleRoom.get("aseguradora").setValue(event);
  }

  capturarTipo(event) {
    this.formScheduleRoom.get("tipoAseguramiento").setValue(event);
  }

  capturarEspecialidad(event) {
    if (event == "Otra") {
      this.formScheduleRoom.get("nombreEspecialista").setValidators(null);
      this.formScheduleRoom.get("especialidad").setValidators(null);
      this.formScheduleRoom
        .get("backUpEspecialidad")
        .setValidators([Validators.required, Validators.maxLength(30)]);
      this.formScheduleRoom
        .get("backUpnombreEspecialista")
        .setValidators(Validators.maxLength(30));
      this.formScheduleRoom.get("backUpnombreEspecialista").setValue("");
      this.especialidadValidator = true;
      this.especialistaValidator = false;
    } else {
      this.especialidades.forEach((esp) => {
        if (esp["cod_esp"] == event) {
          this.especialistas = esp["especialistas"];
          this.formScheduleRoom.get("especialidad").setValue(event);
          this.formScheduleRoom.get("nombreEspecialista").setValue("");
        }
      });

      this.formScheduleRoom
        .get("nombreEspecialista")
        .setValidators(Validators.required);
      this.formScheduleRoom
        .get("especialidad")
        .setValidators(Validators.required);
      this.formScheduleRoom.get("backUpEspecialidad").setValidators(null);
      this.formScheduleRoom.get("backUpnombreEspecialista").setValue("");
      this.formScheduleRoom.get("backUpEspecialidad").setValue("");
      this.especialidadValidator = false;
      this.especialistaValidator = false;
    }
    this.formScheduleRoom.get("nombreEspecialista").updateValueAndValidity();
    this.formScheduleRoom.get("especialidad").updateValueAndValidity();
    this.formScheduleRoom.get("backUpEspecialidad").updateValueAndValidity();
    this.formScheduleRoom
      .get("backUpnombreEspecialista")
      .updateValueAndValidity();
  }

  capturarEspecialista(event) {
    if (event == "Otro") {
      this.formScheduleRoom.get("nombreEspecialista").setValue(event);
      this.formScheduleRoom.get("nombreEspecialista").setValidators(null);
      this.formScheduleRoom
        .get("backUpnombreEspecialista")
        .setValidators([Validators.required, Validators.maxLength(30)]);
      this.especialistaValidator = true;
    } else {
      this.formScheduleRoom.get("nombreEspecialista").setValue(event);
      this.formScheduleRoom
        .get("nombreEspecialista")
        .setValidators(Validators.required);
      this.formScheduleRoom
        .get("backUpnombreEspecialista")
        .setValidators(Validators.maxLength(30));
      this.especialistaValidator = false;
    }
    this.formScheduleRoom.get("nombreEspecialista").updateValueAndValidity();
    this.formScheduleRoom
      .get("backUpnombreEspecialista")
      .updateValueAndValidity();
  }

  capturarMunicipio(event) {
    this.formScheduleRoom.get("municipio").setValue(event);
  }

  // hace la activacion del inputfile desde los iconos laterales
  loadfile(id: String) {
    $("#" + id).click();
  }

  get f() {
    return this.formScheduleRoom.controls;
  }

  get getAseguradora() {
    return (
      this.formScheduleRoom.get("aseguradora").invalid &&
      this.formScheduleRoom.get("aseguradora").touched
    );
  }

  get getTipoAseguramiento() {
    return (
      this.formScheduleRoom.get("tipoAseguramiento").invalid &&
      this.formScheduleRoom.get("tipoAseguramiento").touched
    );
  }

  get getNumeroAutorizacion() {
    return (
      this.formScheduleRoom.get("numeroAutorizacion").invalid &&
      this.formScheduleRoom.get("numeroAutorizacion").touched
    );
  }

  get getNombreProcedimiento() {
    return (
      this.formScheduleRoom.get("nombreProcedimiento").invalid &&
      this.formScheduleRoom.get("nombreProcedimiento").touched
    );
  }

  get getEspecialidad() {
    return (
      this.formScheduleRoom.get("especialidad").invalid &&
      this.formScheduleRoom.get("especialidad").touched
    );
  }

  get getNombreEspecialista() {
    return (
      this.formScheduleRoom.get("nombreEspecialista").invalid &&
      this.formScheduleRoom.get("nombreEspecialista").touched
    );
  }
  get getCorreoNotificacion() {
    return (
      this.formScheduleRoom.get("correoNotificacion").invalid &&
      this.formScheduleRoom.get("correoNotificacion").touched
    );
  }

  get getTelefonoNotificacion() {
    return (
      this.formScheduleRoom.get("telefonoNotificacion").invalid &&
      this.formScheduleRoom.get("telefonoNotificacion").touched
    );
  }

  get getNombreNotificacion() {
    return (
      this.formScheduleRoom.get("nombreNotificacion").invalid &&
      this.formScheduleRoom.get("nombreNotificacion").touched
    );
  }

  get getTelefonoAcudiente() {
    return (
      this.formScheduleRoom.get("telefonoAcudiente").invalid &&
      this.formScheduleRoom.get("telefonoAcudiente").touched
    );
  }

  get getDocumentoIdentidad() {
    return (
      this.formScheduleRoom.get("documentoIdentidad").invalid &&
      this.formScheduleRoom.get("documentoIdentidad").touched
    );
  }

  get getAutorizacion() {
    return (
      this.formScheduleRoom.get("autorizacion").invalid &&
      this.formScheduleRoom.get("autorizacion").touched
    );
  }

  get getHistoriaClinica() {
    return (
      this.formScheduleRoom.get("historiaClinica").invalid &&
      this.formScheduleRoom.get("historiaClinica").touched
    );
  }

  get getBackUpEspecialidad() {
    return (
      this.formScheduleRoom.get("backUpEspecialidad").invalid &&
      this.formScheduleRoom.get("backUpEspecialidad").touched
    );
  }

  get getBackUpEspecialista() {
    return (
      this.formScheduleRoom.get("backUpnombreEspecialista").invalid &&
      this.formScheduleRoom.get("backUpnombreEspecialista").touched
    );
  }

  get getMunicipio() {
    return (
      this.formScheduleRoom.get("municipio").invalid &&
      this.formScheduleRoom.get("municipio").touched
    );
  }
}
