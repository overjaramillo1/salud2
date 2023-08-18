import { Component, OnInit, TemplateRef, ViewChild, ElementRef, Inject } from '@angular/core';
import { ApirestService } from '../apirest.service';
import { DataService } from '../data.service';
import { ToastrService } from 'ngx-toastr';
import { RestProvider } from '../providers/rest/rest';
import { Md5 } from 'ts-md5/dist/md5';
import { SingletonService } from '../singleton.service';
import { IMyDpOptions, MyDatePicker } from 'mydatepicker';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute, NavigationEnd } from '@angular/router';
import * as moment from 'moment';
import { PageScrollConfig, PageScrollService, PageScrollInstance } from 'ngx-page-scroll';
import swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';
import { listLocales } from 'ngx-bootstrap/chronos';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { UtilitiesService } from 'src/app/services/general/utilities.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';

moment.locale('es');

declare var $;

@Component({
  selector: 'app-find-dates',
  templateUrl: './find-dates.component.html',
  styleUrls: ['./find-dates.component.scss']
})
export class FindDatesComponent implements OnInit {

  public loader = false;
  //Variables para el login
  public user = { 'document': '', 'password': '' };

  public messageModal = "Ingresa para disfrutar de todos nuestros servicios";
  public viewPass = true;

  modalRef: BsModalRef;
  modalRegistry: BsModalRef;
  modalValidate: BsModalRef;

  //Multiselect information
  public centroVacacionalId; // id to send in query
  public resortList = []; //array data
  public resortSelect = 0; //ngModel
  public resortSettings = {};

  //Variables para las tabs de cada sección de detalles
  public imagesSection = 'active';
  public detailSection = ''

  //Variables for dates inputs
  public dat1;
  public dat2;
  public startDate = "";
  public finishDate = "";
  public date = new Date();
  public enableDates = new Date(this.date.getFullYear(), 9, 1);
  public enableDatesOctober = this.date >= this.enableDates;
  public initDate = { year: this.date.getFullYear(), month: (this.date.getMonth() + 1), day: this.date.getDate() };

  public disabledDays = [];
  public disabledUntil = { year: this.date.getFullYear(), month: (this.date.getMonth() + 1), day: (this.date.getDate()) };
  public disableSince = { year: this.date.getFullYear() + 1, month: 2, day: 1 };
  public disableUnitilFinish = this.initDate;
  // Array to show housing units
  public housingUnits = [];

  //divs hidden
  public listItemsDiv = true;
  public reserveDiv = true;
  public detailsDiv = -1;

  //attributes
  public document_type = null;
  public document = null;
  public resort;
  public housingUnit;
  public capacity;

  //details housing information
  public detailsHousing = [];

  //user attributes
  public userNameReserve = "";
  public valor;

  public resorts = [];
  public showOverlay = false;

  //filtroos
  public options_TypeUnit = [];
  public option_capacity = [];
  public filter_TypeUnit = 0;
  public filter_capacity = 0;

  //pasamos la clase hidden a los filtros que no se muestran inicialmente
  public otherFilter = "hidden";

  public search = false;

  //Reseves list
  public myreserves = [];

  public placeholderEntry: string = 'Ingreso';
  public placeholderOut: string = 'Salida';

  public ViewRegisterForm = true;

  public imdoption: IMyDpOptions;
  //Options date start dateOptionsFinish
  public dateOptionsInit: IMyDpOptions = {
    // other options...
    dayLabels: { su: "Do", mo: "Lu", tu: "Ma", we: "Mi", th: "Ju", fr: "Vi", sa: "Sa" },
    monthLabels: { 1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun", 7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic" },
    dateFormat: "yyyy-mm-dd",
    firstDayOfWeek: "mo",
    sunHighlight: true,
    showTodayBtn: true,
    yearSelector: false,
    minYear: this.date.getFullYear(),
    maxYear: this.date.getFullYear() + 2,
    todayBtnTxt: "Hoy",
    disableUntil: this.disabledUntil,
    disableDays: this.disabledDays,
    disableSince: this.disableSince,
    openSelectorOnInputClick: true,
    editableDateField: false,
    inline: false
  };

  //Options date start
  public dateOptionsFinish: IMyDpOptions = {
    // other options...
    dayLabels: { su: "Do", mo: "Lu", tu: "Ma", we: "Mi", th: "Ju", fr: "Vi", sa: "Sa" },
    monthLabels: { 1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun", 7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic" },
    dateFormat: "yyyy-mm-dd",
    firstDayOfWeek: "mo",
    sunHighlight: true,
    showTodayBtn: true,
    yearSelector: false,
    minYear: this.date.getFullYear(),
    maxYear: this.date.getFullYear() + 1,
    todayBtnTxt: "Hoy",
    disableUntil: this.disableUnitilFinish,
    disableDays: this.disabledDays,
    disableSince: this.disableSince,
    openSelectorOnInputClick: true,
    editableDateField: false,
    inline: false,
  };

  public welcome;
  public showWelcome = false;
  public userlogin = null;
  // Initialized to specific date (09.10.2018).

  public model: any = { date: { year: 2018, month: 10, day: 9 } };


  public userRegistry = {
    'tipoDocumento': '',
    'document': '',
    'address': '',
    'phone': '',
    'cellphone': '',
    'email': '',
    'confirm_email': '',
    'password': '',
    'confirm_password': '',
    'first_name': '',
    'second_name': '',
    'first_last_name': '',
    'second_last_name': '',
    'accept_terms': false,
    'accept_habeas': false,
    "fechaNacimiento": "",
    "category": "",
    "gender": ""
  };

  @ViewChild('information')
  @ViewChild('login') login;
  @ViewChild('mydp') mydp: MyDatePicker;
  public information: ElementRef;

  public disabled_inputs = false;

  public recomendacionesChecked = false;

  constructor(public service: ApirestService,
    private router: Router,
    private toastr: ToastrService,
    public provider: RestProvider,
    public singleton: SingletonService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private pageScrollService: PageScrollService,
    private dataService: DataService,
    private auth: AuthService,
    private cookieService: CookieService,
    @Inject(DOCUMENT) private doc: any
  ) {

  }

  ngOnInit() {
    // $(window).on('load', function () {
    //   $('#modalInfoAlojamiento').modal('show');
    // });

    if (this.enableDatesOctober) {
      this.disableSince.year += 1;
      this.dateOptionsFinish.maxYear += 1;
    }

    this.generateGToken();
    let resort = this.route.snapshot.queryParams['e541f24f'];
    let datestart = this.route.snapshot.queryParams['c9cfb4'];
    let datefinish = this.route.snapshot.queryParams['699da5'];
    

    if (resort) {
      this.recomendacionesChecked =true;
      this.resortSelect = resort;
      let monthStart = parseInt(datestart.split("-")[1]);
      let monthFinish = parseInt(datefinish.split("-")[1]);


      this.dat1 = { date: { year: datestart.split("-")[0], month: monthStart, day: parseInt(datestart.split("-")[2]) } };
      this.dat2 = { date: { year: datefinish.split("-")[0], month: monthFinish, day: parseInt(datefinish.split("-")[2]) } };

      this.startDate = datestart;
      this.finishDate = datefinish;
      this.centroVacacionalId = resort;

      this.getClosedDays();
      this.getTypeUnitsFilter();
      this.getCapacityFilter();
      this.filterHousingUnit();
      this.getResorts();

    } else {
      // this.getResorts();
      this.resortSettings = {
        singleSelection: true,
        idField: 'identificadorCentro',
        textField: 'nombre',
        selectAllText: 'Todos',
        unSelectAllText: 'Ninguno',
        searchPlaceholderText: 'Buscar...',
        itemsShowLimit: 3,
        allowSearchFilter: true,
        closeDropDownOnSelection: true
      };

      this.userlogin = JSON.parse(localStorage.getItem('user'));
      if (this.userlogin != null) {
        this.singleton.loggedIn = true;
        this.document = this.userlogin['documento'];
        this.findMyReserves();
      }
      //validate if exist prebooking information
      if (this.singleton.getPreBookingData() != null) {

        let data = this.singleton.getPreBookingData();

        this.document = this.userlogin['documento'];
        this.document_type = data['tipo'];
        this.resort = data['centroVacacionalId'];
        this.housingUnit = data['unidadHabitacional'];
        this.capacity = data['capacidad'];
        this.startDate = data['fechaIngreso'];
        this.finishDate = data['fechaSalida'];

        this.searcHeadline();
      }
    }

    this.dataService.user.subscribe(data => {
      this.getUser();
      if (this.userlogin && this.singleton.getPreBookingData()) {
        this.searcHeadline();
      }
    });

  }

  getUser() {
    this.userlogin = JSON.parse(localStorage.getItem('user'));
  }

  // this function get resorst data to add in ng select
  getTypeUnitsFilter() {
    let body = {
      "identificadorCentro": this.centroVacacionalId
    }

    let token = localStorage.getItem('gtoken');
    this.provider.queryJson('/metodo14', body, 3, token).subscribe(
      response => {
        //codigo provisional que elimina la opcion CAMPING
        this.options_TypeUnit = response.json().filter(option => option.nombre !== 'CAMPING');
      },
      err => {
        console.log(err);
      }
    );
  }

  getCapacityFilter() {
    this.option_capacity = [];
    let body = {
      "identificadorCentro": this.centroVacacionalId,
      "identificadorUnidad": this.filter_TypeUnit,
    }

    let token = localStorage.getItem('gtoken');
    this.provider.queryJson('/metodo15', body, 3, token).subscribe(
      response => {
        let result = response.json();
        this.option_capacity = result;

      },
      err => {
        console.log(err);
      }
    );
  }

  //Obtenemos el id del centro vacacional y consultamos
  onItemSelect() {
    this.housingUnits = [];
    this.otherFilter = "hidden";
    this.centroVacacionalId = this.resortSelect;
    this.filter_TypeUnit = 0;
    this.filter_capacity = 0;
    //this.dat1 = null;
    //this.dat2 = null;
    this.getClosedDays();
    this.getTypeUnitsFilter();
    this.getCapacityFilter();
  }


  // this function get resorst data to add in ng select
  async getResorts() {
    let token = localStorage.getItem('gtoken');
    if (null == localStorage.getItem('token') || 'null' == localStorage.getItem('token') || undefined == localStorage.getItem('token')) {
      await this.generateGToken();
      token = localStorage.getItem('gtoken');
    }

    let body = {
      "consultar": true
    }

    this.provider.queryJson('/metodo10', body, 3, token).subscribe(
      response => {
        let result = response.json();
        this.resortList = result;
      },
      err => {
        console.log(err);
      }
    );
  }

  generateGToken() {
    let bodyToken = {
      "parametro1": this.singleton.parametro1,
      "parametro2": this.singleton.parametro2,
      "parametro3": "Web"
    };

    this.provider.queryJson('/auth', bodyToken, 1)
      .subscribe(response => {
        let result = response.json();

        if (undefined !== result) {
          let token: string = 'Bearer ' + result.token;
          localStorage.setItem('gtoken', token);
        }
      });
  }

  // this function get the closed day of resort
  getClosedDays() {
    this.listItemsDiv = false;
    this.reserveDiv = true;
    let body = {
      "centroVacacionalId": this.centroVacacionalId
    }

    //if disabled days is greater than 0, we delete all information
    if (this.disabledDays.length > 0) {
      for (let i = 0; i < this.disabledDays.length; i++) {
        this.disabledDays.splice(i);
      }
    }
    let token = localStorage.getItem('gtoken');
    //Method responsible for consulting the days when the resort is not open or available
    this.provider.queryJson('/metodo4', body, 3, token).subscribe(
      response => {
        let result = response.json();

        //we get the array, and  split data to format
        for (let i = 0; i < result.length; i++) {
          let temp = result[i];
          let datos = temp.split("-");
          let days = { year: parseInt(datos[0]), month: parseInt(datos[1]), day: parseInt(datos[2]) };
          //Add days to array closed days
          this.disabledDays.push(days);
        }

      },
      err => {
        console.log(err);
      }
    );
  }

  //When date changed, we format input date and save in global variables
  dateChange(event, tipe) {

    let maxYear;
    if (this.enableDatesOctober) {
      maxYear = this.date.getFullYear() + 2;
    }
    else {
      maxYear = this.date.getFullYear() + 1;
    }

    if (tipe == 1) {
      if (event.formatted != '') {
        this.startDate = event.formatted + "";
        this.initDate = event.date;

        this.disableUnitilFinish = this.initDate;
        this.dateOptionsFinish = {
          // other options...
          minYear: this.date.getFullYear(),
          maxYear: maxYear,
          todayBtnTxt: "Hoy",
          disableUntil: this.disableUnitilFinish,
          disableDays: this.disabledDays,
          disableSince: this.disableSince,
          openSelectorOnInputClick: true,
          editableDateField: false,
          inline: false
        }


        let date = moment(this.startDate).add(1, 'days').format("YYYY-MM-DD");

        this.finishDate = date;

        this.dat2 = {
          date: { year: parseInt(moment(date).format('YYYY')), month: parseInt(moment(date).format('M')), day: parseInt(moment(date).format('D')) },
          //epoc: new Date(this.finishDate).getTime(),
          formatted: this.finishDate,
          jsdate: new Date(this.finishDate)
        };

        this.mydp.openBtnClicked();
      } else {
        this.dat2 = null;
      }
    } else {
      this.finishDate = event.formatted + "";
    }
  }

  //Function to find all housing units with form information (date start, date finish and resortId)
  getAvailabilityHousingUnits() {

    //If start date is grater than finish date, the function cand find information, and return alert message
    if (this.startDate > this.finishDate) {
      let mensaje = "La fecha de salida debe ser posterior a la fecha de ingreso.";
      this.toastr.error(mensaje, 'Recuerda', { enableHtml: true, positionClass: 'Bottom Right', timeOut: 5000 });
      this.finishDate = "";
    } else {
      if (this.startDate != "" && this.finishDate != "") {
        this.listItemsDiv = false;
        this.reserveDiv = true;

        let body = {
          "fechaIngreso": this.startDate + "",
          "fechaSalida": this.finishDate + "",
          "identificadorCentro": this.centroVacacionalId
        }
        //Open show overlay while the query is being made
        this.showOverlay = true;
        let token = localStorage.getItem('gtoken');
        //Method responsible for consulting the availability of housing units in the resorts.
        this.provider.queryJson('/metodo1', body, 3, token).subscribe(
          response => {
            let result = response.json();
            //We validate result.mensaje to save information or show message alert
            if (result.mensaje != "") {
              this.toastr.error(result.mensaje, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
            }
            this.housingUnits = result.unidadesHabitacionales;
            //Close overlay
            this.showOverlay = false;
            this.search = true;
          },
          err => {
            console.log(err);
          }
        );
      } else {
        let mensaje = "Debes ingresar una fecha de inicio y una fecha de fin.";
        this.toastr.error(mensaje, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
      }
    }
  }

  //Function to find all Housing units with filters
  filterHousingUnit() {

    let validate = true;
    
    if(!this.recomendacionesChecked) {
      $('#modal-alert-recomendaciones').modal();
      var elmnt = document.getElementById("recomendaciones");
      elmnt.scrollIntoView();
      validate = false;
      return;
    }

    if (this.centroVacacionalId == undefined) {
      this.toastr.error("Debes seleccionar un Centro Recreacional. ", 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
      validate = false;
      return;
    }

    if (this.startDate == "") {
      this.toastr.error("Debes seleccionar una fecha de ingreso. ", 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
      validate = false;
      return;
    }

    if (this.finishDate == "") {
      this.toastr.error("Debes seleccionar una fecha de salida. ", 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
      validate = false;
      return;
    }

    if(this.centroVacacionalId == 4 || this.centroVacacionalId == 3) {
      $('#modal-rochela-santagueda').modal();
    }

    if (validate) {
      let body = {
        "fechaIngreso": this.startDate + "",
        "fechaSalida": this.finishDate + "",
        "identificadorCentro": this.centroVacacionalId,
        "filtroCapacidad": this.filter_capacity,
        "filtroTipoUnidad": this.filter_TypeUnit
      }
      let token = localStorage.getItem('gtoken');
      //Open show overlay while the query is being made
      this.showOverlay = true;
      //Method responsible for consulting the availability of housing units in the resorts.
      this.provider.queryJson('/metodo13', body, 3, token).subscribe(
        response => {
          let result = response.json();

          //cambio provisional, filtro para no mostrar las zonas de camping
          this.housingUnits = result.unidadesHabitacionales.filter(option => option.numeroUnidad.indexOf('CAMPING') == -1);
          //Close overlay
          this.showOverlay = false;
          this.search = true;

          //We validate result.mensaje to save information or show message alert
          if (result.mensaje != "" && this.housingUnits.length == 0) {
            this.toastr.error(result.mensaje, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
          } else if (result.estado == "OTRO") {
            let mensaje = "No hemos encontrado disponibilidad en las fechas ingresadas, a continuación te mostramos las fechas más cercanas."
            swal({
              title: "Lo sentimos.",
              text: result.mensaje,
              type: 'warning',
              showCancelButton: false,
              confirmButtonClass: "btn-success",
              confirmButtonText: "Continuar"
            }).then((result) => {
              if (result.value) {
                let pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.document, '#information');
                this.pageScrollService.start(pageScrollInstance);
                this.otherFilter = "";
              }
            });
          }

          if (this.housingUnits.length > 0) {
            let pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.document, '#information');
            this.pageScrollService.start(pageScrollInstance);
            this.otherFilter = "";
          }
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  // Function to show the details of a housing unit, an asynchronous function is used to
  // keep a time between the closing transition of the div and the scroll to the new item
  async getDetails(resort_id, housing_id, pos) {

    this.detailsDiv = pos;

    let id = null;
    let div_id = "detailsDiv" + pos;

    //we neeed the information about housing unit in the position pos
    if (this.detailsHousing.length == 0) {
      let temp: any = [];
      temp.push(this.housingUnits[pos]);
      //temp[0]['imagenes'].push({imagen: this.housingUnits[pos].imagenPrincipal});
      this.detailsHousing = temp;
    }

    id = "#tab" + pos;

    await this.sleep(200);
    let pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.doc, id);
    this.pageScrollService.start(pageScrollInstance);
  }

  async viewless(resort_id, housing_id, pos) {
    this.detailsHousing = [];

    //pasamos detailsDiv para ocultar el div con los detalles de cada tarjeta
    this.detailsDiv = -1;
    await this.sleep(200);
    let id = "#head" + pos;
    let pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.doc, id);
    PageScrollConfig.defaultScrollOffset = 5;
    this.pageScrollService.start(pageScrollInstance);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async welcomefunc() {
    this.showWelcome = true;
    let user = JSON.parse(localStorage.getItem('user'));
    if (user['sexo'] == 'M') {
      this.welcome = "Bienvenido " + user.primerNombre + " " + user.segundoNombre + ".";
    }
    else if (user['sexo'] == 'F') {
      this.welcome = "Bienvenida " + user.primerNombre + " " + user.segundoNombre + ".";
    } else {
      this.welcome = "Bienvenido " + user.primerNombre + " " + user.segundoNombre + ".";
    }
    this.showOverlay = true;
    await this.sleep(5000);
    this.showOverlay = false;
    this.showWelcome = false;
  }

  // Function to get dato from housing unit list and save prebooking
  reserve(resort_id, housing_id, pos) {
    this.listItemsDiv = true;
    this.reserveDiv = true;
    this.detailsDiv = -1;
    this.resort = resort_id;
    this.housingUnit = housing_id;

    let housingUnit;

    housingUnit = this.housingUnits[pos];
    this.capacity = this.housingUnits[pos].capacidad;
    //Guardamos la información de la unidad a reservar

    this.singleton.housingUnitToBook = housingUnit;
    this.getUserInfo();
  }

  getUserInfo() {
    this.singleton.id_resort_prereserve = this.resortSelect;
    this.singleton.search_date_start = this.startDate;
    this.singleton.search_date_finish = this.finishDate;
    if (null == localStorage.getItem('user') || 'null' == localStorage.getItem('user') || undefined == localStorage.getItem('user')) {

      let date_start = this.singleton.housingUnitToBook['fechaIngreso'];
      let date_finish = this.singleton.housingUnitToBook['fechaSalida'];
      let data = { documento: this.document, tipo: "CC", centroVacacionalId: this.resort, unidadHabitacional: this.housingUnit, capacidad: this.capacity, fechaIngreso: date_start, fechaSalida: date_finish };

      this.singleton.setPreBookingData(data);

      this.openLoginModal();

    } else {

      this.searcHeadline();

    }
  }

  openLoginModal() {
    this.auth.openLoginModal(true);
  }

  searcHeadline() {
    let date_start = this.singleton.housingUnitToBook['fechaIngreso'];
    let date_finish = this.singleton.housingUnitToBook['fechaSalida'];

    let user = JSON.parse(localStorage.getItem('user'));
    this.document = user.documento;
    this.document_type = "CC";

    let body = {
      "documento": this.document,
      "tipoDocumento": this.document_type,
      "centroVacacionalId": this.resort,
      "unidadHabitacionalId": this.housingUnit,
      "capacidad": this.capacity,
      "fechaIngreso": date_start + "",
      "fechaSalida": date_finish + ""
    }

    this.showOverlay = true;
    let token = localStorage.getItem('ptoken');
    this.provider.queryJson('/metodo2', body, 3, token).subscribe(
      response => {
        let result = response.json();

        this.showOverlay = false;
        this.valor = result.valor;
        if (result.titularReserva.estado == "OK") {
          this.singleton.setBookingData(result);
        } else {
          let user = JSON.parse(localStorage.getItem('user'));
          result.titularReserva.personaId = user.usuarioId;
          result.titularReserva.documento = user.documento;
          result.titularReserva.tipoDocumento = false;
          result.titularReserva.nombre1 = user.primerNombre;
          result.titularReserva.nombre2 = user.segundoNombre;
          result.titularReserva.apellido1 = user.primerApellido;
          result.titularReserva.apellido2 = user.segundoApellido;
          result.titularReserva.fechaNacimiento = user.fechaNacimiento;
          result.titularReserva.genero = user.sexo;
          result.titularReserva.categoria = user.categoria;
          result.titularReserva.celular = user.celular;
          result.titularReserva.correo = user.correo;
          result.titularReserva.aceptaHabeasData = user.aceptaHabeas;
          result.titularReserva.estado = "NUEVO";
          this.singleton.setBookingData(result);
        }
        this.userNameReserve = result.titularReserva.nombre1 + " " + result.titularReserva.nombre2 + " " + result.titularReserva.apellido1;

        if (result.estado == "OK") {
          if (result.mensaje) {
            this.toastr.warning(result.mensaje, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
          }
          this.preBooking();
        } else {
          this.toastr.error(result.mensaje, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
        }


      },
      err => {
        console.log(err);
      }
    );
  }


  preBooking() {
    if (this.singleton.loggedIn != true) {
      this.router.navigate(['/login']);
    }
    this.router.navigate(['alojamiento/make-booking']);
  }


  FindReserve(reserve_id) {
    this.singleton.reserve_id = reserve_id;
    this.router.navigate(['alojamiento/find-reserve']);
  }

  findMyReserves() {
    let body = {
      'documento': this.document,
    }

    let tokenCookie = (this.cookieService.get('ptoken') !== '') ? JSON.parse(this.cookieService.get('ptoken')) : null;

    let token = 'Bearer ' + tokenCookie['token'];
    localStorage.setItem('ptoken', token);
    // let token = localStorage.getItem('ptoken');
    this.provider.queryJson('/metodo11', body, 3, token)
      .subscribe(response => {
          let result = response.json();
          //we get the array, and  split data to format
          this.myreserves = result;
        },
        err => {
          console.log(err);
        }
      );
  }

  clearFilters() {
    this.startDate = "";
    this.finishDate = "";
    this.housingUnits = [];
    this.dat1 = null;
    this.dat2 = null;
    this.listItemsDiv = true;
  }

  returnList() {
    this.detailsHousing = [];
    this.listItemsDiv = false;
    this.reserveDiv = true;
    this.detailsDiv = -1;
  }

  dataViwed(data) {
    switch (data) {
      case 1:
        this.imagesSection = 'active';
        this.detailSection = '';
        break;

      case 2:
        this.imagesSection = '';
        this.detailSection = 'active';
        break;
    }
  }

}
