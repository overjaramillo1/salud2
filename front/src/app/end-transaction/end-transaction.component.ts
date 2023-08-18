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


@Component({
	selector: 'app-end-transaction',
	templateUrl: './end-transaction.component.html',
	styleUrls: ['./end-transaction.component.scss']
})
export class EndTransactionComponent implements OnInit {

	public reserveId = null;
	public showOverlay = false;
	public mensaje = "";

	public dataReserve = null;
	public dataEcollect = null;
	public user = null;


	/*VARIABLES ECOLLECT PARA VISUALIZACIÓN EN FORMULRIO*/
	public code = "";
	public status = "";
	public bankname = "--";
	public value = "";
	public currency = "";
	public TrazabilityCode = "";
	public date_hour = "";

	//---------- DATOS CLIENTE
	public name = "";
	public document = "";
	public address = "";
	public email = "";
	public cellphone = "";


	constructor(public service: ApirestService,
		private router: Router,
		private toastr: ToastrService,
		public provider: RestProvider,
		public singleton: SingletonService,
		private modalService: BsModalService,
		private route: ActivatedRoute,
		private pageScrollService: PageScrollService,
		private dataService: DataService) { }

	ngOnInit() {
		this.reserveId = this.route.snapshot.queryParams['e541f24f'];

		this.user = JSON.parse(localStorage.getItem('user'));


		if (this.reserveId == undefined) {
			this.router.navigate(['']);
		} else {
			this.findData();
		}
	}

	findData() {

		let body = {
			"area": "1",
			"servicio": "1",
			"subServicio": "1",
			"productoId": this.reserveId + "",
		};

		this.mensaje = "Estamos obteniendo la información de tu transacción";
		this.showOverlay = true;
		let token = localStorage.getItem('ptoken');
		this.provider.queryPasarela('/metodo2', body, token).subscribe(
			response => {
				let result = response.json();

				if (result.respuesta.estado == "OK") {
					this.dataReserve = result.registroPago;
					this.findRegister();
				} else {
					//this.router.navigate(['']);
					this.showOverlay = false;
					//this.toastr.error(result.respuesta.mensaje, 'Error', {enableHtml: true, positionClass: 'toast-middle-right', timeOut:5000});
				}
			},
			err => {
				//console.log(err);
			}
		);
	}

	findRegister() {
		let body = {
			"GetTransactionInformation": {
				"entityCode": "10577",
				"ticketId": this.dataReserve['ticketId']
			}
		};

		let token = localStorage.getItem('ptoken');
		this.provider.queryPasarela('/metodo6', body, token).subscribe(
			response => {
				this.showOverlay = false;
				let result = response.json();


				this.value = result.transValue;
				this.currency = result.payCurrency;
				this.bankname = result.bankName;
				this.TrazabilityCode = result.trazabilityCode;
				this.date_hour = result.bankProcessDate;
				//this.name = this.dataEcollect.ReferenceArray[2]['#text'];
				this.name = decodeURIComponent(result.nombreApellido);
				this.document = result.numeroIdentificacion;
				this.address = result.direccionResidencia;
				this.cellphone = result.celular;
				this.email = result.emailConfirmacion;

				switch (result.tranState) {
					case "OK":
						this.code = "Transacción aprobada por la entidad financiera";
						this.updateStatus(result.tranState, result.ticketId);
						break;

					case "NOT_AUTHORIZED":
						this.code = "Transacción no aprobada por la entidad financiera";
						this.toastr.error(this.code, '', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
						this.showOverlay = false;
						this.updateStatus(result.tranState, result.ticketId);
						break;

					case "EXPIRED":
						this.code = "Transacción expirada";
						this.toastr.error(this.code, '', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
						this.showOverlay = false;
						this.updateStatus(result.tranState, result.ticketId);
						break;

					case "PENDING":
						this.code = "La transacción esta pendiente de aprobación";
						this.toastr.success(this.code, '', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
						this.showOverlay = false;
						this.updateStatus(result.tranState, result.ticketId);
						break;

					case "FAILED":
						this.code = "Se ha presentado un fallo en la comunicación con la entidad financiera";
						this.toastr.error(this.code, '', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
						this.showOverlay = false;
						this.updateStatus(result.tranState, result.ticketId);
						break;

					case "BANK":
						this.code = "La transacción esta pendiente de aprobación";
						this.toastr.error(this.code, '', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
						this.showOverlay = false;
						this.updateStatus(result.tranState, result.ticketId);
						break;
				}

			},
			err => {
				//console.log(err);
			}
		);
	}

	updateStatus(transState, ticket) {

		let code = 0;
		switch (transState) {
			case "SUCCESS":
				code = 1;
				break;

			case "OK":
				code = 2;
				break;

			case "NOT_AUTHORIZED":
				code = 3;
				break;

			case "EXPIRED":
				code = 4;
				break;

			case "FAILED":
				code = 5;
				break;

			case "PENDING":
				code = 6;
				break;

			case "BANK":
				code = 7;
				break;
		}

		let body = {
			"ticketId": ticket,
			"estadoTransaccionId": code + ""
		};
		let token = localStorage.getItem('ptoken');
		this.provider.queryPasarela('/metodo3', body, token).subscribe(
			response => {
				let result = response.json();
				this.showOverlay = false;

				if (result.estado == "OK" && transState == 'OK') {
					//We go to create a bill
					this.createBill();
				} else {
					//this.router.navigate(['']);
					//this.toastr.error(result.mensaje, 'Error', {enableHtml: true, positionClass: 'toast-middle-right', timeOut:5000});
				}
			},
			err => {
				//console.log(err);
			}
		);

	}

	createBill() {
		this.mensaje = "Estamos actualizando tu estado de reserva";
		this.showOverlay = true;

		let body = {
			"area": 1 + "",
			"servicio": 1 + "",
			"subservicio": 1 + "",
			"identificacion": this.dataReserve['identificacion'],
			"productoId": this.dataReserve['productoId'],
			"bono": this.dataReserve['bonoPactoColectivo'],
			"valorTotal": this.dataReserve['valorTotal'],
			"valorTarjeta": this.dataReserve['valorPago'],
			"valorBono": this.dataReserve['valorBono'],
			"aceptaFacturaElectronica": true,
			"correo": this.user['correo']
		};

		let token = localStorage.getItem('ptoken');
		this.provider.queryJson('/metodo17', body, 3, token).subscribe(
			response => {
				let result = response.json();

				this.showOverlay = false;

				if (result.estado == "OK") {
					let mensaje = "Tu transacción ha sido aprobada con éxito";
					this.toastr.success(mensaje, 'Buen trabajo', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
					this.updateBillStatus(result.mensaje);
				} else {

					this.toastr.success(result.mensaje, '', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
				}
			},
			err => {
				//console.log(err);
			}
		);
	}

	updateBillStatus(billnumber) {
		let body = {
			"area": 1 + "",
			"servicio": 1 + "",
			"subServicio": 1 + "",
			"productoId": this.dataReserve['productoId'],
			"estadoFacturaId": 2,
			"numeroFactura": billnumber
		};
		let token = localStorage.getItem('ptoken');
		this.provider.queryPasarela('/metodo4', body, token).subscribe(
			response => {
				let result = response.json();

				this.showOverlay = false;

				if (result.estado == "OK") {
					let mensaje = "Tu transacción ha sido aprobada con éxito";
					//this.toastr.success(result.mensaje, 'Buen trabajo', {enableHtml: true, positionClass: 'toast-middle-right', timeOut:5000});
					//this.router.navigate(['list-reserves']);
				} else {
					//this.router.navigate(['']);
					this.toastr.success(result.mensaje, '', { enableHtml: true, positionClass: 'toast-middle-right', timeOut: 5000 });
				}
			},
			err => {
				//console.log(err);
			}
		);
	}

}
