import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ElementRef,
  Inject,
} from "@angular/core";
import { ApirestService } from "../apirest.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { RestProvider } from "../providers/rest/rest";
import { Md5 } from "ts-md5/dist/md5";
import { SingletonService } from "../singleton.service";
import swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";
import { IMyDpOptions } from "mydatepicker";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal/bs-modal-ref.service";
import * as moment from "moment";
import { DocumentTypeService } from "../services/document/document-type.service";

declare var $: any;
@Component({
  selector: "app-make-booking",
  templateUrl: "./make-booking.component.html",
  styleUrls: ["./make-booking.component.scss"],
})
export class MakeBookingComponent implements OnInit {
  public loader = false;
  public updateDocument = "";
  public imagenPrincipal;
  public resort_id;
  public resort_name;
  public apartment_name;
  public apartment_id;
  public quantity;
  public dateStart;
  public dateFinish;
  public dateLimit;
  public value;
  public payment;
  public personId;
  public document;
  public typeDocument;
  public name1;
  public name2;
  public lastName1;
  public lastName2;
  public birthday;
  public genre;
  public category;
  public phone;
  public mail;
  public aceptaHabeasData;
  public existeCliente;
  public mensaje;
  public error;
  public valores;
  public address;

  public filterAssintants = [];
  public listAssintants = [];

  public familiGroup = [];
  public search;

  //data to slide
  public slides;
  public myInterval = 1500;
  public activeSlideIndex = 0;
  public showOverlay = false;

  public reserveId = null;
  public showFormNewAssistant = false;

  public date = new Date();
  public initDate = {
    year: this.date.getFullYear(),
    month: this.date.getMonth() + 1,
    day: this.date.getDate(),
  };

  public placeholderEntry: string = "Fecha de nacimiento";
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
    maxYear: this.date.getFullYear(),
    todayBtnTxt: "Hoy",
    openSelectorOnInputClick: true,
    editableDateField: false,
    inline: false,
    disableSince: this.initDate,
  };

  public dt1;

  public newAssitant = {
    personaId: 0,
    documento: "",
    tipoDocumento: "",
    nombre1: "",
    nombre2: "",
    apellido1: "",
    apellido2: "",
    fechaNacimiento: "",
    genero: "",
    categoria: "",
    celular: "",
    correo: "",
    aceptaHabeasData: false,
    estado: "NUEVO",
    mensaje: "",
  };
  public alertMessage = null;

  //Variables para mostrar mensajes de alerta
  public alert_name1 = "";
  public alert_name2 = "";
  public alert_lastname1 = "";
  public alert_lastname2 = "";

  public showReserveButton = false;

  public validate = true;
  public disableUnitilFinish = this.initDate;
  public placeholderOut: string = "Fecha de cumpleaños";
  public birthdayUpdate = null;
  public birthdaySelector;

  public dateOptionsBirthDay: IMyDpOptions = {
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
    minYear: 1910,
    maxYear: this.date.getFullYear(),
    disableSince: this.initDate,
    todayBtnTxt: "Hoy",
    openSelectorOnInputClick: true,
    editableDateField: false,
    inline: false,
  };
  public dat1 = null;

  public validateDocumentModal: boolean = false;
  public validateBithdayModal: boolean = false;

  public documentType = [];

  modalRef: BsModalRef;
  modalRegistry: BsModalRef;
  @ViewChild("documentModal") documentModal;
  @ViewChild("termsModl") termsModl;
  modalTerms: BsModalRef;

  constructor(
    public service: ApirestService,
    private router: Router,
    private toastr: ToastrService,
    public provider: RestProvider,
    private translate: TranslateService,
    public singleton: SingletonService,
    private documentTypeService: DocumentTypeService,
    private modalService: BsModalService
  ) {
    this.documentType = this.documentTypeService.getAll();
  }

  ngOnInit() {
    //Validamos si existen datos de pre-reserva
    let result = this.singleton.getBookingData();
    //console.log("datos",result)

    if (result == null) {
      this.router.navigate(["/alojamiento"]);
    } else {
      $(".modal-acompanantes").click();
      //Validamos si el usuario se encuentra logueado en la plataforma
      let user = JSON.parse(localStorage.getItem("user"));
      this.singleton.loggedIn = true;
      if (user == null) {
        this.singleton.loggedIn = false;
        this.router.navigate(["/alojamiento"]);
      }
      this.slides = [
        { imagen: this.singleton.housingUnitToBook["imagenPrincipal"] },
      ];

      let images = this.singleton.housingUnitToBook["imagenes"];

      for (let i = 0; i < images.length; i++) {
        this.slides.push(images[i]);
      }

      this.familiGroup = result.asistentes;

      for (let i = 0; i < this.familiGroup.length; i++) {
        this.familiGroup[i].show = true;
      }

      this.resort_name = result.nombreCentroVacacional;
      this.resort_id = result.centroVacacionalId;
      this.apartment_id = result.unidadHabitacionalId;
      this.apartment_name = result.numeroUnidad;
      this.quantity = result.capacidad;
      this.dateStart = result.fechaIngreso;
      this.dateFinish = result.fechaSalida;
      this.dateLimit = result.fechaLimitePago;

      this.valores = result.valor;
      this.value = result.valor.valorTotal;
      this.payment = result.pago;
      this.personId = result.titularReserva.personaId;
      this.document = result.titularReserva.documento;

      this.address = user["direccion"];

      if (user["fechaNacimiento"] != "" && user["fechaNacimiento"] != null) {
        let year = moment(user["fechaNacimiento"]).format("YYYY");
        let month = moment(user["fechaNacimiento"]).format("M");
        let day = moment(user["fechaNacimiento"]).format("D");
        this.birthdayUpdate = moment(user["fechaNacimiento"]).format(
          "YYYY-MM-DD"
        );

        let initDate = { date: { year: year, month: month, day: day } };

        this.birthdaySelector = initDate;
      } else if (result.titularReserva.fechaNacimiento != "") {
        let year = moment(result.titularReserva.fechaNacimiento).format("YYYY");
        let month = moment(result.titularReserva.fechaNacimiento).format("M");
        let day = moment(result.titularReserva.fechaNacimiento).format("D");
        this.birthdayUpdate = moment(
          result.titularReserva.fechaNacimiento
        ).format("YYYY-MM-DD");

        let initDate = { date: { year: year, month: month, day: day } };

        this.birthdaySelector = initDate;
      }

      this.phone = user["celular"];
      this.updateDocument = user["tipoDocumento"]
        ? user["tipoDocumento"]
        : result.titularReserva.tipoDocumento;
      this.typeDocument = result.titularReserva.tipoDocumento
        ? result.titularReserva.tipoDocumento
        : user["tipoDocumento"];

      if (!this.updateDocument) {
        this.updateDocument = "";
      }

      if (this.updateDocument != "") {
        this.validateDocumentModal = true;
      }

      if (result.titularReserva.fechaNacimiento != "") {
        this.validateBithdayModal = true;
      }

      if (
        user["tipoDocumento"] == "" ||
        user["fechaNacimiento"] == "" ||
        user["direccion"] == "" ||
        user["celular"] == ""
      ) {
        // this.Modaldocument();
        $(".modalUpdateDatos").click();
      }

      this.name1 = result.titularReserva.nombre1;
      this.name2 = result.titularReserva.nombre2;
      this.lastName1 = result.titularReserva.apellido1;
      this.lastName2 = result.titularReserva.apellido2;
      this.birthday = user["fechaNacimiento"];

      this.genre = result.titularReserva.genero;
      this.category = result.titularReserva.categoria;
      //this.phone = result.titularReserva.celular;
      this.mail = result.titularReserva.correo;
      this.aceptaHabeasData = result.titularReserva.aceptaHabeasData;
      this.mensaje = result.titularReserva.mensaje;
      this.error = result.titularReserva.estado;
    }
  }

  Modaldocument() {
    this.modalRef = this.modalService.show(this.documentModal, {
      class: "modal-md",
      ignoreBackdropClick: true,
    });
  }

  ModalTerms(terms) {
    this.modalTerms = this.modalService.show(terms, {
      class: "modal-lg",
      ignoreBackdropClick: true,
    });
  }

  closeTerms() {
    this.modalTerms.hide();
  }

  updateBirthday(event) {
    this.birthdayUpdate = event.formatted + "";
    if (event.formatted == "") {
      this.birthdayUpdate = null;
    }
  }

  updteDocument() {
    let validate = true;
    if (this.updateDocument != "" && this.birthdayUpdate != null) {
      this.typeDocument = this.updateDocument;
      this.birthday = this.birthdayUpdate;
    }

    if (this.updateDocument == "") {
      let mensaje = "Debes seleccionar tu tipo de documento";
      this.toastr.error(mensaje, "Recuerda", {
        enableHtml: true,
        positionClass: "toast-middle-right",
        timeOut: 5000,
      });
      validate = false;
    } else if (this.birthdayUpdate == null) {
      let mensaje = "Debes Ingresar tu fecha de nacimiento";
      this.toastr.error(mensaje, "Recuerda", {
        enableHtml: true,
        positionClass: "toast-middle-right",
        timeOut: 5000,
      });
      validate = false;
    } else if (this.phone == null || this.phone == "") {
      let mensaje = "Debes Ingresar tu número de celular";
      this.toastr.error(mensaje, "Recuerda", {
        enableHtml: true,
        positionClass: "toast-middle-right",
        timeOut: 5000,
      });
      validate = false;
    } else if (this.address == null || this.address == "") {
      let mensaje = "Debes Ingresar tu dirección";
      this.toastr.error(mensaje, "Recuerda", {
        enableHtml: true,
        positionClass: "toast-middle-right",
        timeOut: 5000,
      });
      validate = false;
    } else if (this.phone.length > 10) {
      let mensaje = "El número de celular debe ser menor o igual 10 caracteres";
      this.toastr.error(mensaje, "Recuerda", {
        enableHtml: true,
        positionClass: "toast-middle-right",
        timeOut: 5000,
      });
      validate = false;
    } else if (this.phone.length < 7) {
      let mensaje = "El número de celular debe ser  superior a 7 caracteres";
      this.toastr.error(mensaje, "Recuerda", {
        enableHtml: true,
        positionClass: "toast-middle-right",
        timeOut: 5000,
      });
      validate = false;
    } else if (this.address.length > 100) {
      let mensaje = "La dirección debe contener menor de 100 caracteres";
      this.toastr.error(mensaje, "Recuerda", {
        enableHtml: true,
        positionClass: "toast-middle-right",
        timeOut: 5000,
      });
      validate = false;
    }

    if (validate) {
      //this.modalRef.hide();
      $(".btnclosemodal").click();
      this.updateContactDataUser();
    }
  }

  searchAssintants() {
    let validate = true;

    let user = JSON.parse(localStorage.getItem("user"));
    let mensaje = "";
    if (user.documento == this.search) {
      mensaje = "El documento ingresado ya fue añadido a la reserva";

      this.toastr.error(mensaje, "Recuerda", {
        enableHtml: true,
        positionClass: "toast-middle-right",
        timeOut: 5000,
      });
      validate = false;
    } else {
      for (let i = 0; i < this.listAssintants.length; i++) {
        if (this.listAssintants[i].documento == this.search) {
          validate = false;
          mensaje = "El documento ingresado ya fue añadido a la reserva";
          this.toastr.error(mensaje, "Recuerda", {
            enableHtml: true,
            positionClass: "toast-middle-right",
            timeOut: 5000,
          });
        }
      }
    }

    if (this.search == null || String(this.search).length > 15) {
      mensaje =
        "El documento debe contener mas de un caracteres y menos de quince caracteres";
      this.toastr.error(mensaje, "Recuerda", {
        enableHtml: true,
        positionClass: "toast-middle-right",
        timeOut: 5000,
      });
      validate = false;
    }

    if (validate) {
      this.showFormNewAssistant = false;
      this.filterAssintants = [];
      let body = {
        documento: this.search + "",
        tipoDocumento: "C",
        centroVacacionalId: this.resort_id,
        unidadHabitacionalId: this.apartment_id,
        capacidad: this.quantity,
        fechaIngreso: this.dateStart,
        fechaSalida: this.dateFinish,
      };

      this.showOverlay = true;
      let token = localStorage.getItem("ptoken");
      this.provider.queryJson("/metodo3", body, 3, token).subscribe(
        (response) => {
          let result = response.json();

          if (result.estado == "OK") {
            this.filterAssintants.push(result);
          }
          if (result.estado == "NO") {
            let mensaje = "Recuerda";
            this.toastr.error(result.mensaje, "Recuerda", {
              enableHtml: true,
              positionClass: "toast-middle-right",
              timeOut: 5000,
            });
          }
          if (result.estado == "NUEVO") {
            let mensaje =
              "Este asistente no está registrado en nuestras bases de datos. Por favor ingresa sus datos. ";
            this.toastr.error(mensaje, "", {
              enableHtml: true,
              positionClass: "toast-middle-right",
              timeOut: 5000,
            });
            this.showFormNewAssistant = true;
            this.newAssitant.documento = this.search;
          }
          this.showOverlay = false;
        },
        (err) => {}
      );
    }
  }

  calValue() {
    //Sumamos 1 persona a la lista de asistentes ya que el titular de la reserva cuenta como asistente
    let cantidad = this.listAssintants.length + 1;
    let body = {
      documento: this.document + "",
      centroVacacionalId: this.resort_id,
      unidadHabitacionalId: this.apartment_id,
      capacidad: this.quantity,
      fechaIngreso: this.dateStart,
      fechaSalida: this.dateFinish,
      cantidadInvitados: cantidad,
    };
    let token = localStorage.getItem("ptoken");
    this.provider.queryJson("/metodo16", body, 3, token).subscribe(
      (response) => {
        let result = response.json();
        this.valores = result;
        this.value = result.valorTotal;
      },
      (err) => {}
    );
  }

  addAssistance(pos) {
    this.loader = true;
    // se puede añadir asistentes siempre que la cantidad total de asistentes no sea mayor a la cantidad(que permite la unidad)+1
    // if (this.listAssintants.length + 2 > this.quantity + 1) {
    if (this.listAssintants.length + 2 > this.quantity) {
      this.loader = false;
      let mensaje = "Superaste la cantidad de invitados";
      this.toastr.error(mensaje, "Recuerda", {
        enableHtml: true,
        positionClass: "toast-middle-right",
        timeOut: 5000,
      });
    } else {
      // Buscamos que el asistente no se encuentre ya añadido a la lista
      let validation = true;
      for (let i = 0; i < this.listAssintants.length; i++) {
        if (
          this.listAssintants[i].documento ==
          this.filterAssintants[pos].documento
        ) {
          validation = false;
        }
      }

      this.loader = false;
      //Si el asistente no se ha agregado a la lista se agrega, de lo contrario se muestra mensaje de error
      if (validation) {
        //añadimos el asistente a la lista
        this.listAssintants.push(this.filterAssintants[pos]);
        //limpiamos el filtro de busqueda
        this.filterAssintants.splice(pos, 1);
        this.search = "";
        this.calValue();
      } else {
        let mensaje =
          "La persona ingresada ya se encuentra agregada a la reserva";
        this.toastr.error(mensaje, "Recuerda", {
          enableHtml: true,
          positionClass: "toast-middle-right",
          timeOut: 5000,
        });
      }
    }
  }

  addAssistanceFamilygroup(pos) {
    // se puede añadir asistentes siempre que la cantidad total de asistentes no sea mayor a la cantidad(que permite la unidad)+1
    if (this.listAssintants.length + 2 > this.quantity) {
      let mensaje = "Superaste la cantidad de invitados";
      this.toastr.error(mensaje, "Recuerda", {
        enableHtml: true,
        positionClass: "toast-middle-right",
        timeOut: 5000,
      });
    } else {
      // Buscamos que el asistente no se encuentre ya añadido a la lista
      let validation = true;
      for (let i = 0; i < this.listAssintants.length; i++) {
        if (
          this.listAssintants[i].documento == this.familiGroup[pos].documento
        ) {
          validation = false;
        }
      }
      //Si el asistente no se ha agregado a la lista se agrega, de lo contrario se muestra mensaje de error
      if (validation) {
        this.search = "";
        //añadimos el asistente a la lista
        this.listAssintants.push(this.familiGroup[pos]);
        //cambiamos e estado de item show del elemento a false para que no se visualice
        this.familiGroup[pos].show = false;

        this.calValue();
      } else {
        let mensaje =
          "La persona ingresada ya se encuentra agregada a la reserva";
        this.toastr.error(mensaje, "Recuerda", {
          enableHtml: true,
          positionClass: "toast-middle-right",
          timeOut: 5000,
        });
      }
    }
  }

  validateInputs(type) {
    let values = /^[A-zÀ-ú ]+\s?[A-zÀ-ú ]*?$/;

    switch (type) {
      case "name1":
        if (String(this.newAssitant.nombre1).length > 20) {
          this.alert_name1 = "El nombre debe ser menor a 20 caracteres";
          this.validate = false;
          return;
        } else {
          this.alert_name1 = "";
          this.validate = true;
        }

        if (
          !values.test(this.newAssitant.nombre1) &&
          String(this.newAssitant.nombre1).length > 0
        ) {
          this.alert_name1 = "El nombre no debe incluir números";
          this.validate = false;
          return;
        } else {
          this.alert_name1 = "";
          this.validate = true;
        }

        break;
      case "name2":
        if (String(this.newAssitant.nombre2).length > 30) {
          this.alert_name2 = "El nombre debe ser menor a 30 caracteres";
          this.validate = false;
          return;
        } else {
          this.alert_name2 = "";
          this.validate = true;
        }

        if (
          !values.test(this.newAssitant.nombre2) &&
          String(this.newAssitant.nombre2).length > 0
        ) {
          this.alert_name2 = "El segundo nombre no debe incluir números";
          this.validate = false;
          return;
        } else {
          this.alert_name2 = "";
          this.validate = true;
        }

        break;
      case "lastname1":
        if (String(this.newAssitant.apellido1).length > 20) {
          this.alert_lastname1 =
            "El primer apellido debe ser menor a 20 caracteres";
          this.validate = false;
          return;
        } else {
          this.alert_lastname1 = "";
          this.validate = true;
        }

        if (
          !values.test(this.newAssitant.apellido1) &&
          String(this.newAssitant.apellido1).length > 0
        ) {
          this.alert_lastname1 = "El apellido no debe incluir números";
          this.validate = false;
          return;
        } else {
          this.alert_name1 = "";
          this.validate = true;
        }

        break;
      case "lastname2":
        if (String(this.newAssitant.apellido2).length > 30) {
          this.alert_lastname2 =
            "El segundo apellido debe ser menor a 30 caracteres";
          this.validate = false;
          return;
        } else {
          this.alert_lastname2 = "";
          this.validate = true;
        }

        if (
          !values.test(this.newAssitant.apellido2) &&
          String(this.newAssitant.apellido2).length > 0
        ) {
          this.alert_lastname2 = "El segundo apellido no debe incluir números";
          this.validate = false;
          return;
        } else {
          this.alert_lastname2 = "";
          this.validate = true;
        }

        break;
    }
  }

  //When date changed, we format input date and save in global variables
  dateChange(event) {
    this.newAssitant.fechaNacimiento = event.formatted;
    if (event.formatted == "") {
      this.newAssitant.fechaNacimiento = "";
    }
  }

  AgregarAssitente() {
    this.alertMessage = null;
    //this.validate = true;
    let values = /^[A-zÀ-ú ]+\s?[A-zÀ-ú ]*?$/;

    if (
      this.newAssitant["tipoDocumento"] === "" &&
      this.newAssitant["tipoDocumento"] == "" &&
      this.newAssitant["nombre1"] == "" &&
      this.newAssitant["apellido1"] == "" &&
      this.newAssitant["fechaNacimiento"] == "" &&
      this.newAssitant["genero"] == ""
    ) {
      this.alertMessage = "Debes ingresar todos los datos del asistente";
      this.validate = false;
      return;
    }

    if (
      this.newAssitant["documento"] == "" ||
      this.newAssitant["tipoDocumento"] == ""
    ) {
      this.alertMessage =
        "Debes ingresar el tipo y número de documento del asistente";
      this.validate = false;
      return;
    }

    if (
      this.newAssitant["nombre1"] == "" ||
      this.newAssitant["apellido1"] == ""
    ) {
      this.alertMessage =
        "Debes ingresar el primer nombre y apellido del asistente";
      this.validate = false;
      return;
    }

    if (
      this.newAssitant["fechaNacimiento"] == "" ||
      this.newAssitant["genero"] === ""
    ) {
      this.alertMessage =
        "Debes ingresar la fecha de nacimiento y el género del asistente";
      this.validate = false;
      return;
    }

    if (
      !values.test(this.newAssitant.apellido2) &&
      String(this.newAssitant.apellido2).length > 0
    ) {
      this.alert_lastname2 = "El segundo apellido no debe incluir números";
      this.validate = false;
      return;
    }

    if (
      !values.test(this.newAssitant.apellido1) &&
      String(this.newAssitant.apellido1).length > 0
    ) {
      this.alert_lastname1 = "El apellido no debe incluir números";
      this.validate = false;
      return;
    }

    if (
      !values.test(this.newAssitant.nombre2) &&
      String(this.newAssitant.nombre2).length > 0
    ) {
      this.alert_name2 = "El segundo nombre no debe incluir números";
      this.validate = false;
      return;
    }

    if (
      !values.test(this.newAssitant.nombre1) &&
      String(this.newAssitant.nombre1).length > 0
    ) {
      this.alert_name1 = "El nombre no debe incluir números";
      this.validate = false;
      return;
    }
    this.validate = true;

    if (this.validate) {
      this.showOverlay = true;
      this.search = "";
      this.listAssintants.push(this.newAssitant);
      this.calValue();
      this.newAssitant = {
        personaId: 0,
        documento: "",
        tipoDocumento: "",
        nombre1: "",
        nombre2: "",
        apellido1: "",
        apellido2: "",
        fechaNacimiento: "",
        genero: "",
        categoria: "",
        celular: "",
        correo: "",
        aceptaHabeasData: false,
        estado: "NUEVO",
        mensaje: "",
      };
      this.dat1 = null;
      this.showFormNewAssistant = false;
      this.showOverlay = false;
      let mensaje = "Hemos agregado tu asistente con éxito.";
      this.toastr.success(mensaje, "Buen trabajo", {
        enableHtml: true,
        positionClass: "toast-middle-right",
        timeOut: 5000,
      });
    }
  }

  deleteAssintant(position) {
    //buscamos si el usuario que se encuentra en esa posición es un familiar y lo volvemos a listar en grupo familiar
    for (let i = 0; i < this.familiGroup.length; i++) {
      if (
        this.listAssintants[position].documento == this.familiGroup[i].documento
      ) {
        this.familiGroup[i].show = true;
      }
    }
    this.listAssintants.splice(position, 1);

    this.calValue();
  }

  activateModalalert() {
    $(".modal-alert-reserve").click();
  }

  reserve() {
    let user = JSON.parse(localStorage.getItem("user"));
    this.mail = user["correo"];

    let reserva = {
      reservaId: 0,
      centroVacacionalId: this.resort_id,
      unidadHabitacionalId: this.apartment_id,
      capacidad: this.quantity,
      fechaIngreso: this.dateStart,
      fechaSalida: this.dateFinish,
      fechaLimitePago: this.dateLimit,
      valor: this.valores,
      pago: this.payment,
      titularReserva: {
        personaId: this.personId,
        documento: this.document,
        tipoDocumento: this.typeDocument,
        nombre1: this.name1,
        nombre2: this.name2,
        apellido1: this.lastName1,
        apellido2: this.lastName2,
        fechaNacimiento: this.birthday,
        genero: this.genre,
        categoria: this.category,
        celular: this.phone,
        correo: this.mail,
        aceptaHabeasData: this.aceptaHabeasData,
        mensaje: this.mensaje,
      },
      asistentes: this.listAssintants,
      estado: "",
      mensaje: "",
    };
    let body = {
      reserva: reserva,
    };

    this.showOverlay = true;
    let token = localStorage.getItem("ptoken");
    this.provider.queryJson("/metodo5", body, 3, token).subscribe(
      (response) => {
        this.showOverlay = false;
        let result = response.json();

        if (result.reserva.estado != "NO") {
          //Show success message
          let mensaje = "Tu reserva ha sido realizada correctamente.";
          this.reserveId = result.reservaId;
          this.singleton.reserve_id = this.reserveId;

          swal({
            title: "Buen trabajo.",
            text: mensaje,
            type: "success",
            showCancelButton: false,
            confirmButtonClass: "btn btn-primary",
            confirmButtonText: "Continuar",
          });
          this.router.navigate(["alojamiento/find-reserve"]);
        } else {
          let mensaje = result.reserva.mensaje;
          this.toastr.error(mensaje, "Recuerda", {
            enableHtml: true,
            positionClass: "toast-middle-right",
            timeOut: 5000,
          });
        }
      },
      (err) => {}
    );
  }

  volver() {
    this.singleton.setPreBookingData(null);
    let id = this.singleton.id_resort_prereserve;
    let start = this.singleton.search_date_start;
    let finish = this.singleton.search_date_finish;
    this.router.navigate(["/alojamiento"], {
      queryParams: { e541f24f: id, c9cfb4: start, "699da5": finish },
    });
  }

  validateDocument() {
    let values = /^[0-9]+$/;
    if (!values.test(this.search) || this.search.length > 15) {
      // this.userlogin.document = "";
      let text = this.search;
      this.search = text.slice(0, -1);
    }
  }

  validateNumber() {
    let values = /^[0-9]+$/;
    if (!values.test(this.phone)) {
      // this.userlogin.document = "";
      let text = this.phone;
      this.phone = text.slice(0, -1);
    }
  }

  updateContactDataUser() {
    let body = {
      documento: this.document,
      celular: this.phone,
      direccion: this.address,
      fechaNacimiento: this.birthdayUpdate,
      tipoDocumento: this.typeDocument,
      telefono: "",
      genero: this.genre,
    };

    let token = localStorage.getItem("ptoken");
    this.provider.queryJson("/confa/metodo22", body, 1, token).subscribe(
      (response) => {
        this.showOverlay = false;
        let result = response.json();
        if (result.respuesta) {
          let user = JSON.parse(localStorage.getItem("user"));
          user["celular"] = this.phone;
          user["direccion"] = this.address;
          user["fechaNacimiento"] = this.birthday;
          //user['telefono'] = this.phone;
          user["tipoDocumento"] = this.typeDocument;

          localStorage.setItem("user", JSON.stringify(user));
        }
      },
      (err) => {}
    );
  }
}
