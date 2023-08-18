import { Component, OnInit, ViewChild } from '@angular/core';
import { ApirestService } from '../apirest.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RestProvider } from '../providers/rest/rest';
import { Md5 } from 'ts-md5/dist/md5';
import { SingletonService } from '../singleton.service';
import swal from 'sweetalert2';
import { IMyDpOptions } from 'mydatepicker';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ReturnStatement } from '@angular/compiler';
import { UtilitiesService } from 'src/app/services/general/utilities.service'
import { DocumentTypeService } from '../services/document/document-type.service';

@Component({
	selector: 'app-find-reserve',
	templateUrl: './find-reserve.component.html',
	styleUrls: ['./find-reserve.component.scss']
})
export class FindReserveComponent implements OnInit {

	public loader = false;

	//ngModels for inputs to search
	public reserveId = "";
	public document = "";
	public type_document = "";

	//New assintant to booking
	public filterAssintants = [];
	public search;

	//Booking Data
	public bookingId;
	public value;
	public principalName;
	public limitDatePayment;

	public resort;
	public apartment;
	public quantity;
	public dateStart;
	public dateFinish;
	public dateLimit;
	public titular = { nombre1: '', nombre2: '', apellido1: '', apellido2: '' };
	public payStatus;
	public apartment_name;

	public dataReserve;
	public assitants = [];
	public values: any = null;
	public paimentDataReserve = null;

	//variable to ngIf
	public viwed = false;

	public showOverlay = false;
	public showFormNewAssistant = false;
	public paysmethods = [];
	public resort_name = "";
	public name1 = "";
	public name2 = "";
	public lastname = "";

	public slides;
	public myInterval = 1500;
	public activeSlideIndex = 0;


	public newAssitant = {
		"personaId": 0,
		"documento": "",
		"tipoDocumento": "",
		"nombre1": "",
		"nombre2": "",
		"apellido1": "",
		"apellido2": "",
		"fechaNacimiento": "",
		"genero": "",
		"categoria": "",
		"celular": "",
		"correo": "",
		"aceptaHabeasData": false,
		"estado": "NUEVO",
		"mensaje": ""
	}
	public alertMessage = null;

	public idReserva = "";

	public date = new Date();
	public initDate = { year: this.date.getFullYear(), month: (this.date.getMonth() + 1), day: this.date.getDate() };
	public disabledSince = { year: this.date.getFullYear(), month: (this.date.getMonth()), day: this.date.getDate() };;
	public placeholderEntry: string = 'Fecha de nacimiento';
	//Options date start dateOptionsFinish
	public dateOptionsInit: IMyDpOptions = {
		// other options...
		dayLabels: { su: "Do", mo: "Lu", tu: "Ma", we: "Mi", th: "Ju", fr: "Vi", sa: "Sa" },
		monthLabels: { 1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun", 7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic" },
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
		disableSince: this.initDate
	};

	public dt1;


	//Variables para mostrar mensajes de alerta
	public alert_name1 = "";
	public alert_name2 = "";
	public alert_lastname1 = "";
	public alert_lastname2 = "";

	public validate = true;

	public value_to_pay = null;


	/*VARIABLES ECOLLECT PARA VISUALIZACIÓN EN FORMULRIO*/
	public payment_code = "";
	public payment_status = "";
	public payment_bankname = "--";
	public payment_value = "";
	public payment_currency = "";
	public payment_TrazabilityCode = "";
	public payment_date_hour = "";

	public payment_name = "";
	public payment_document = "";
	public payment_address = "";
	public payment_cellphone = "";
	public payment_email = "";
	public user = null;
	public reserStatus = "";
	public showPaymentInfo = false;
	public dat1 = null;

	modalRef: BsModalRef;

	public documentType = [];

	@ViewChild('details') details;
	constructor(public service: ApirestService,
		private router: Router,
		private toastr: ToastrService,
		public provider: RestProvider,
		private translate: TranslateService,
		public singleton: SingletonService,
		private documentTypeService: DocumentTypeService,
		private modalService: BsModalService,
		private ngxXml2jsonService: NgxXml2jsonService,
		private ut: UtilitiesService
	) {

		this.documentType = this.documentTypeService.getAll();


	}

	ngOnInit() {
		this.showOverlay = true;
		this.user = JSON.parse(localStorage.getItem('user'));
		this.searchReserve(true);
	}

	calValue() {

		if (this.payStatus == 'SI') {
			return;
		}
		//Sumamos 1 persona a la lista de asistentes ya que el titular de la reserva cuenta como asistente
		let cantidad = this.assitants.length + 1;
		let body = {
			"documento": this.document + "",
			"centroVacacionalId": this.resort,
			"unidadHabitacionalId": this.apartment,
			"capacidad": this.quantity,
			"fechaIngreso": this.dateStart,
			"fechaSalida": this.dateFinish,
			"cantidadInvitados": cantidad
		}

		let token = localStorage.getItem('ptoken');
		this.provider.queryJson('/metodo16', body, 3, token).subscribe(
			response => {
				let result = response.json();
				this.values = result;

				this.value = result.valorTotal;

			},
			err => {
				//console.log(err);
			}
		);
	}

	/*
	* We need to find this reserve by id
	*/
	searchReserve(getPaymentData = false) {

		let body = {
			"reservaId": this.singleton.reserve_id
		}
		this.idReserva = this.singleton.reserve_id;
		if (this.singleton.reserve_id != null) {


			if (this.assitants.length > 0) {
				for (let i = 0; i < this.assitants.length; i++) {
					this.assitants.splice(i);
				}
			}


			let token = localStorage.getItem('ptoken');
			this.provider.queryJson('/metodo6', body, 3, token).subscribe(
				response => {

					this.showOverlay = false;
					let result = response.json();

					this.resort_name = result.reserva.nombreCentroVacacional;
					this.titular = result.reserva.titularReserva;

					this.resort = result.reserva.centroVacacionalId;
					this.apartment = result.reserva.unidadHabitacionalId;
					this.quantity = result.reserva.capacidad;
					this.dateStart = result.reserva.fechaIngreso;
					this.dateFinish = result.reserva.fechaSalida;
					this.dateLimit = result.reserva.fechaLimitePago;
					this.document = result.reserva.titularReserva.documento;
					this.assitants = result.reserva.asistentes;
					this.bookingId = result.reserva.reservaId;
					this.type_document = result.reserva.titularReserva.tipoDocumento;

					this.value = result.reserva.valor.valorTotal;
					this.values = result.reserva.valor;
					this.payStatus = result.reserva.pago;
					if (this.payStatus == "SI") {
						this.showPaymentInfo = true;
					}


					this.reserStatus = result.reserva.estado;
					this.limitDatePayment = result.reserva.fechaLimitePago;
					this.principalName = result.reserva.titularReserva.nombre1 + " " + result.reserva.titularReserva.nombre2 + " " + result.reserva.titularReserva.apellido1 + " " + result.reserva.titularReserva.apellido2;

					this.slides = result.reserva.imagenes;


					this.paysmethods = result.formasPago;

					if (getPaymentData) {
						this.findData(this.idReserva);
						this.calValue();
					}
					if (result.reserva.reservaId != 0) {
						this.viwed = true;

					} else {
						let message = "No existe una reserva asociada a los datos ingresados."
						this.toastr.error(message, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
					}


				},
				err => {
					//console.log(err);
				}
			);
		} else {
			this.router.navigate(['/alojamiento/list-reserves']);
			this.showOverlay = true;
		}

	}

	/*
	* When date changed, we format input date and save in global variables
	*/
	dateChange(event) {
		this.newAssitant.fechaNacimiento = event.formatted;
		if (event.formatted == '') {
		this.newAssitant.fechaNacimiento = '';
		}
	}

	dateChangeTitular(event) {
		this.titular['fechaNacimiento'] = event.formatted;
	}

	deleteAssintant(document) {
		let body = {
			"reservaId": this.bookingId,
			"documento": document
		};

		this.showOverlay = true;
		let token = localStorage.getItem('ptoken');
		this.provider.queryJson('/metodo8', body, 3, token).subscribe(
			response => {
				this.showOverlay = false;
				let result = response.json();
				this.toastr.success(result.mensaje, 'Buen trabajo', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
				this.dataReserve = result;
				this.searchReserve(false);

			},
			err => {
				//console.log(err);
			}
		);
	}

	cancelBooking() {
		let body = {
			"reservaId": this.bookingId
		};

		this.showOverlay = true;
		let token = localStorage.getItem('ptoken');
		this.provider.queryJson('/metodo7', body, 3, token).subscribe(
			response => {
				this.showOverlay = false;
				let result = response.json();

				//this.dataReserve = JSON.stringify(result);
				this.dataReserve = result;
				if (result['estado'] == "OK") {
					if (this.payStatus == "SI") {
						swal({
							title: "Ten en cuenta.",
							html: "La reserva ha sido cancelada con éxito. Para solicitar la devolución del dinero acércate a nuestros puntos de atención o enviar al correo <a href='mailto:alojamiento@confa.co' style='color: #000'>alojamiento@confa.co</a> el motivo por el cual cancelas la reserva, fotocopia de la cédula y certificación bancaria del titular de la reserva.",
							type: 'warning',
							showCancelButton: false,
							confirmButtonClass: "btn-success",
							confirmButtonText: "Continuar"
						}).then((result) => {
							if (result.value) {
								this.router.navigate(['/alojamiento/list-reserves']);
							}
						});
					} else {
						let mensaje = "Tu reserva fue cancelada con éxito."
						this.toastr.success(mensaje, 'Buen trabajo', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
						this.router.navigate(['/alojamiento/list-reserves']);
					}

				} else if (result['estado'] == "NO") {
					this.toastr.error(result.mensaje, "Recuerda.", { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });

					this.router.navigate(['/alojamiento/list-reserves']);
				}

			},
			err => {
				//console.log(err);
			}
		);
	}

	validateInputs(type) {
		let values = /^[A-zÀ-ú ]+\s?[A-zÀ-ú ]*?$/;

		switch (type) {
			case "name1":
				if (String(this.newAssitant.nombre1).length > 20) {
					this.alert_name1 = "El nombre debe ser menor a 20 caracteres. ";
					this.validate = false;
					return;
				} else {
					this.alert_name1 = "";
					this.validate = true;
				}

				if (!values.test((this.newAssitant.nombre1)) && String(this.newAssitant.nombre1).length > 0) {
					this.alert_name1 = "El nombre no debe incluir números. ";
					this.validate = false;
					return;
				}
				else {
					this.alert_name1 = "";
					this.validate = true;
				}

				break;
			case "name2":
				if (String(this.newAssitant.nombre2).length > 30) {
					this.alert_name2 = "El segundo nombre debe ser menor a 30 caracteres. ";
					this.validate = false;
					return;
				} else {
					this.alert_name2 = "";
					this.validate = true;
				}

				if (!values.test((this.newAssitant.nombre2)) && String(this.newAssitant.nombre2).length > 0) {
					this.alert_name2 = "El segundo nombre no debe incluir números. ";
					this.validate = false;
					return;
				}
				else {
					this.alert_name2 = "";
					this.validate = true;
				}

				break;
			case "lastname1":
				if (String(this.newAssitant.apellido1).length > 20) {
					this.alert_lastname1 = "El primer apellido debe ser menor a 20 caracteres. ";
					this.validate = false;
					return;
				} else {
					this.alert_lastname1 = "";
					this.validate = true;
				}

				if (!values.test((this.newAssitant.apellido1)) && String(this.newAssitant.apellido1).length > 0) {
					this.alert_lastname1 = "El apellido no debe incluir números. ";
					this.validate = false;
					return;
				}
				else {
					this.alert_name1 = "";
					this.validate = true;
				}

				break;
			case "lastname2":
				if (String(this.newAssitant.apellido2).length > 30) {
					this.alert_lastname2 = "El segundo apellido debe ser menor a 30 caracteres. ";
					this.validate = false;
					return;
				} else {
					this.alert_lastname2 = "";
					this.validate = true;
				}

				if (!values.test((this.newAssitant.apellido2)) && String(this.newAssitant.apellido2).length > 0) {
					this.alert_lastname2 = "El segundo apellido no debe incluir números. ";
					this.validate = false;
					return;
				}
				else {
					this.alert_lastname2 = "";
					this.validate = true;
				}

				break;
		}
	}

	/**
 * Ask for confirmation before to delete the user
 * @param string userId id user to delete
 */
	confirmDelete() {
		swal({
			title: this.translate.instant('alerts.confirm'),
			text: "¿Estás seguro que deseas cancelar tu reserva?",
			type: 'warning',
			reverseButtons: true,
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#ff2742',
			cancelButtonText: this.translate.instant('alerts.cancel'),
			confirmButtonText: this.translate.instant('alerts.yes')
		}).then((result) => {
			if (result.value) {
				this.cancelBooking();
			}
		});
	}

	addAssintant(pos) {

		let user = JSON.parse(localStorage.getItem('user'));

		this.loader = true;
		if (this.search != user.documento) {
			let body = {
				"reservaId": this.bookingId,
				"asistente": this.filterAssintants[pos]
			};

			// if (this.assitants.length + 2 > this.quantity + 1) {
			if (this.assitants.length + 2 > this.quantity) {
				this.loader = false;
				let mensaje = "Superaste la cantidad de invitados. ";
				this.toastr.error(mensaje, 'Lo sentimos', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
			} else {
				this.showOverlay = true;
				let token = localStorage.getItem('ptoken');
				this.provider.queryJson('/metodo9', body, 3, token).subscribe(
					response => {
						this.showOverlay = false;
						let result = response.json();

						this.loader = false;

						if (result.estado != "NO") {

							this.search = "";
							this.filterAssintants = [];
							this.toastr.success(result.mensaje, 'Buen trabajo', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
						} else {
							this.filterAssintants = [];
							this.toastr.error(result.mensaje, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
						}
						this.search = "";
						this.dataReserve = JSON.stringify(result);
						this.searchReserve(false);
					},
					err => {
						console.log(err);
					}
				);
			}
		} else {
			let mensaje = "El documento ingresado ya fue añadido a la reserva. "
			this.toastr.error(mensaje, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
		}


	}

	AgregarAssitente() {
		this.alertMessage = null;
		//this.validate = true;
		let values = /^[A-zÀ-ú ]+\s?[A-zÀ-ú ]*?$/;

		if (
			this.newAssitant['tipoDocumento'] === '' &&
			this.newAssitant['tipoDocumento'] == '' &&
			this.newAssitant['nombre1'] == '' &&
			this.newAssitant['apellido1'] == '' &&
			this.newAssitant['fechaNacimiento'] == '' &&
			this.newAssitant['genero'] == ''
		) {
			this.alertMessage = 'Debes ingresar todos los datos del asistente';
			this.validate = false;
			return;
		}

		if (
			this.newAssitant['documento'] == '' ||
			this.newAssitant['tipoDocumento'] == ''
		) {
			this.alertMessage =
				'Debes ingresar el tipo y número de documento del asistente';
			this.validate = false;
			return;
		}

		if (
			this.newAssitant['nombre1'] == '' ||
			this.newAssitant['apellido1'] == ''
		) {
			this.alertMessage =
				'Debes ingresar el primer nombre y apellido del asistente';
			this.validate = false;
			return;
		}

		if (
			this.newAssitant['fechaNacimiento'] == '' ||
			this.newAssitant['genero'] === ''
		) {
			this.alertMessage =
				'Debes ingresar la fecha de nacimiento y el género del asistente';
			this.validate = false;
			return;
		}

		if (
			!values.test(this.newAssitant.apellido2) &&
			String(this.newAssitant.apellido2).length > 0
		) {
			this.alert_lastname2 = 'El segundo apellido no debe incluir números';
			this.validate = false;
			return;
		}

		if (
			!values.test(this.newAssitant.apellido1) &&
			String(this.newAssitant.apellido1).length > 0
		) {
			this.alert_lastname1 = 'El apellido no debe incluir números';
			this.validate = false;
			return;
		}

		if (
			!values.test(this.newAssitant.nombre2) &&
			String(this.newAssitant.nombre2).length > 0
		) {
			this.alert_name2 = 'El segundo nombre no debe incluir números';
			this.validate = false;
			return;
		}

		if (
			!values.test(this.newAssitant.nombre1) &&
			String(this.newAssitant.nombre1).length > 0
		) {
			this.alert_name1 = 'El nombre no debe incluir números';
			this.validate = false;
			return;
		}
		this.validate = true;

		if (this.validate) {
			this.showOverlay = true;
			let body = {
				"reservaId": this.bookingId,
				"asistente": this.newAssitant
			};

			let token = localStorage.getItem('ptoken');
			this.provider.queryJson('/metodo9', body, 3, token).subscribe(
				response => {
					this.showOverlay = false;
					let result = response.json();

					this.search = "";
					this.toastr.success(result.mensaje, 'Buen trabajo', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
					this.dataReserve = JSON.stringify(result);
					this.searchReserve();

					this.newAssitant = {
						"personaId": 0,
						"documento": "",
						"tipoDocumento": "",
						"nombre1": "",
						"nombre2": "",
						"apellido1": "",
						"apellido2": "",
						"fechaNacimiento": "",
						"genero": "",
						"categoria": "",
						"celular": "",
						"correo": "",
						"aceptaHabeasData": false,
						"estado": "NUEVO",
						"mensaje": ""
					};
					this.dat1 = null;
					this.showFormNewAssistant = false;
				

				},
				err => {
					//console.log(err);
				}
			);


		}
	}

	searchAssintants() {
		let validate = true;

		let user = JSON.parse(localStorage.getItem('user'));
		let mensaje = "";
		if (user.documento == this.search) {
			mensaje = "El documento ingresado ya fue añadido a la reserva. ";
			this.toastr.error(mensaje, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
			validate = false;
		} else {
			for (let i = 0; i < this.assitants.length; i++) {
				if (this.assitants[i].documento == this.search) {
					validate = false;
					mensaje = "El documento ingresado ya fue añadido a la reserva. ";
					this.toastr.error(mensaje, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
				}
			}
		}

		if (this.search == null || String(this.search).length > 15) {
			mensaje = "El documento debe contener más de un caracter y menos de quince caracteres. ";
			this.toastr.error(mensaje, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
			validate = false;
		}


		if (validate) {
			this.showFormNewAssistant = false;
			this.filterAssintants = [];
			let body = {
				"documento": this.search + "",
				"tipoDocumento": "C",
				"centroVacacionalId": this.resort,
				"unidadHabitacionalId": this.apartment,
				"capacidad": this.quantity,
				"fechaIngreso": this.dateStart,
				"fechaSalida": this.dateFinish
			};


			this.showOverlay = true;
			let token = localStorage.getItem('ptoken');
			this.provider.queryJson('/metodo3', body, 3, token).subscribe(
				response => {
					this.showOverlay = false;
					let result = response.json();

					if (result.estado == "OK") {
						this.filterAssintants.push(result);
					}
					if (result.estado == "NO") {
						let mensaje = "Recuerda";
						this.toastr.error(result.mensaje, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
						this.search = "";
					}

					if (result.estado == "NUEVO") {
						let mensaje = "Este asistente no está registrado en nuestras bases de datos. Por favor ingresa sus datos. ";
						this.toastr.error(mensaje, '', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
						this.showFormNewAssistant = true;
						this.newAssitant['documento'] = this.search;
					}
				},
				err => {
					//console.log(err);
				}
			);
		}
	}

	return() {
		this.singleton.setPreBookingData(null);
		this.router.navigate(['/alojamiento']);
	}

	openModal(idformaPago) {
		this.ut.toggleSplashscreen(true);
		this.value_to_pay = idformaPago;

		let user = JSON.parse(localStorage.getItem('user'));

		this.titular['celular'] = user.celular;
		this.titular['correo'] = user.correo;
		this.titular['direccion'] = user.direccion;
		this.titular['fechaNacimiento'] = user.fechaNacimiento

		this.validateExistTransaction();

	}

	closeModal() {
		this.modalRef.hide()
	}

    /*
    * Validate if some transaction exist
    */
	validateExistTransaction() {
		let body = {
			"area": "1",
			"servicio": "1",
			"subServicio": "1",
			"productoId": this.idReserva + ''
		}

		let token = localStorage.getItem('ptoken');
		this.provider.queryPasarela('/metodo2', body, token).subscribe(
			response => {
				let result = response.json();

				let transState = result.registroPago.estadoTransaccion.estadoTransaccionId;


				if (transState != 1 && transState != 2 && transState != 6 && transState != 7) {
					this.payReseve();
				} else {
					this.ut.toggleSplashscreen(false);

					let message = "Existe una transacción en curso con la entidad financiera";
					this.toastr.error(message, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
				}

			},
			err => {
				this.ut.toggleSplashscreen(false);
				console.log(err);
			}
		);
	}

    /*
    * Function to create ecollect Request
    */
	payReseve() {
		this.ut.toggleSplashscreen(true);
		let ValorTotal = 0;
		let ValorBono = 0;
		for (let i = 0; i < this.paysmethods.length; i++) {
			if (this.paysmethods[i].formaPagoId == this.value_to_pay) {
				//Si es mayor a 1 es porque tiene bono
				if (this.paysmethods[i].medioPago.length > 1) {
					let methods = this.paysmethods[i].medioPago;
					for (let j = 0; j < methods.length; j++) {
						if (methods[j].codigo == 27) {
							ValorTotal = methods[j].valor;
						} else {
							ValorBono = methods[j].valor;
						}
					}
				} else {
					ValorTotal = this.paysmethods[i].valorTotal;
				}
			}
		}

		let url = this.singleton.url;
		url += "alojamiento/end-transaction?e541f24f=" + this.idReserva;

		let body = {
			"CreateTransactionPayment": {
				"entityCode": "10577",
				"srvCode": "10001",
				"transValue": ValorTotal,
				"urlRedirect": url,
				"numeroIdentificacion": this.document,
				"identificadorProducto": this.idReserva,
				"nombreApellido": this.principalName,
				"tipoDocumento": this.type_document,
				"direccionResidencia": this.titular['direccion'],
				"celular": this.titular['celular'],
				"emailConfirmacion": this.titular['correo'],
				"codigoArea": "1",
				"codigoServicio": "1",
				"codigoSubservicio": "1",
				"invoice": ""
			}
		};

		let token = localStorage.getItem('ptoken');
		this.provider.queryPasarela('/metodo5', body, token).subscribe(
			response => {

				let result = response.json();

				this.validateResponse(result, ValorTotal, ValorBono);
			},
			err => {
				//console.log(err);
			}
		);

	}

	/*
	* Function to validate ecollect response
	*/
	validateResponse(data, ValorTotal, ValorBono) {

		this.ut.toggleSplashscreen(true);
		let code = data['returnCode'];
		let ticket = data['ticketId'];
		let url = data['eCollectUrl']
		let total = ValorTotal + ValorBono;
		let bono = true;

		if (ValorBono == 0) {
			bono = false;
		}

		let validate = true;

		switch (code) {
			case "SUCCESS":
				validate = true;
				code = 1;
				break;

			case "OK":
				validate = true;
				code = 2;
				break;

			case "NOT_AUTHORIZED":
				validate = false;
				code = 3;
				break;

			case "EXPIRED":
				validate = true;
				code = 4;
				break;

			case "FAILED":
				validate = false;
				code = 5;
				break;

			case "PENDING":
				validate = true;
				code = 6;
				break;

			case "BANK":
				validate = true;
				code = 7;
				break;
		}

		if (validate) {

			/**********CREAMOS REGISTRO INICIAL DE LA TRANSACCIÓN EN CONFA****************/
			let body = {
				"area": "1",
				"servicio": "1",
				"subServicio": "1",
				"productoId": this.idReserva + "",
				"identificacion": this.document + "",
				"bonoPactoColectivo": bono + "",
				"valorTotal": total + "",
				"valorPago": ValorTotal + "",
				"valorBono": ValorBono + "",
				"ticketId": ticket + "",
				"estadoTransaccion": code + "",
				"urlPago": url + "",
			};



			let token = localStorage.getItem('ptoken');
			this.provider.queryPasarela('/metodo1', body, token).subscribe(
				response => {

					let result = response.json();

					if (result.estado == "OK") {

						window.open(url, '_parent');
					} else {
						this.ut.toggleSplashscreen(false);
						this.toastr.error(result.mensaje, 'Recuerda', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
					}

				},
				err => {
					console.log(err);
				}
			);
		}


		if (this.modalRef) {
			this.modalRef.hide();
		}
	}

	validateDocument() {
		let values = /^[0-9]+$/;
		if (!values.test((this.search)) || this.search.length > 15) {
			// this.userlogin.document = "";
			let text = this.search;
			this.search = text.slice(0, -1);
		}
	}

	findData(id) {

		this.showOverlay = true;
		let body = {
			"area": "1",
			"servicio": "1",
			"subServicio": "1",
			"productoId": id + "",
		};

		let mensaje = "Estamos obteniendo la información de tu transacción";

		let token = localStorage.getItem('ptoken');
		this.provider.queryPasarela('/metodo2', body, token).subscribe(
			response => {
				let result = response.json();
				this.showOverlay = false;

				if (result.respuesta.estado == "OK") {
					let data_payment_reserve = result.registroPago;
					this.findRegister(data_payment_reserve);
				} else {
					//this.router.navigate(['']);

					//this.toastr.error(result.respuesta.mensaje, 'Error', {enableHtml: true, positionClass: 'toast-middle-right', timeOut:5000});
				}
			},
			err => {
				//console.log(err);
			}
		);
	}

	findRegister(data_payment_reserve) {

		let body = {
			"GetTransactionInformation": {
				"entityCode": "10577",
				"ticketId": data_payment_reserve.ticketId
			}
		};
		this.showOverlay = true;
		let token = localStorage.getItem('ptoken');
		this.provider.queryPasarela('/metodo6', body, token).subscribe(
			response => {

				let result = response.json();
				this.showOverlay = false;
				let cod = result['tranState'];
				this.payment_value = result['transValue'];
				this.payment_currency = result['payCurrency'];
				this.payment_bankname = result.bankName;
				this.payment_TrazabilityCode = result.trazabilityCode;
				this.payment_date_hour = result.bankProcessDate;
				//this.name = this.dataEcollect.ReferenceArray[2]['#text'];
				this.payment_name = decodeURIComponent(result.nombreApellido);
				this.payment_document = result.numeroIdentificacion;
				this.payment_address = result.direccionResidencia;
				this.payment_cellphone = result.celular;
				this.payment_email = result.emailConfirmacion;

				if (this.payStatus == "SI") {
					this.showPaymentInfo = true;
				}

				switch (cod) {
					case "OK":
						this.payment_code = `Tu reserva de alojamiento # ${this.idReserva}  ha finalizado su proceso de pago. La transacción se encuentra aprobada en tu entidad financiera.`;
						this.showPaymentInfo = true;
						break;

					case "NOT_AUTHORIZED":
						this.payment_code = `Transacción no aprobada por la entidad financiera`;
						this.showPaymentInfo = true;
						break;

					case "EXPIRED":
						this.payment_code = `Transacción expirada`;
						this.showPaymentInfo = true;
						break;

					case "PENDING":
						this.payment_code = `En este momento tu reserva de alojamiento # ${this.idReserva} presenta un proceso de pago, cuya transacción se encuentra pendiente de recibir confirmación por parte de tu entidad financiera. Por favor espera unos minutos y vuelve a consultar más tarde para verificar si tu pago fue confirmado con éxito.`;
						this.showPaymentInfo = true;
						break;

					case "BANK":
						this.payment_code = `En este momento tu reserva de alojamiento # ${this.idReserva} presenta un proceso de pago, cuya transacción se encuentra pendiente de recibir confirmación por parte de tu entidad financiera. Por favor espera unos minutos y vuelve a consultar más tarde para verificar si tu pago fue confirmado con éxito.`;
						this.showPaymentInfo = true;
						break;

					case "FAILED":
						this.payment_code = `Se ha presentado un fallo en la comunicación con la entidad financiera`;
						this.showPaymentInfo = true;
						break;
					default:
						this.payment_code = "";
						break;
				}

			},
			err => {
				//console.log(err);
			}
		);
	}

}
