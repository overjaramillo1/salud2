import { Component, OnInit, TemplateRef, ViewChild  } from '@angular/core';
import { ApirestService } from '../apirest.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RestProvider } from '../providers/rest/rest';
import {Md5} from 'ts-md5/dist/md5';
import { SingletonService } from '../singleton.service';
import {IMyDpOptions} from 'mydatepicker';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { esLocale } from 'ngx-bootstrap/locale';
import swal, { SweetAlertType } from 'sweetalert2';

declare var $:any;

@Component({
  selector: 'app-list-reserves',
  templateUrl: './list-reserves.component.html',
  styleUrls: ['./list-reserves.component.scss']
})
export class ListReservesComponent implements OnInit {
	public user = {primerNombre: '', primerApellido: '', segundoApellido: '', documento:''};
	public ReservesList = [];
	public document = "";
	public showOverlay = false;
	public nombreTitular: string;
	public documentoTitular:string;
	public listAsistentes: any[] = [];
	private dolorGarganta:string = '';
	private tosSeca:string = '';
	private dificultadRespirar:string = '';
	private dolorCabeza:string = '';
	private diarreaVomito:string = '';
	private fiebre:string = '';
	private congestionNasal:string = '';
	private dolorMuscular:string = '';
	private contactoEstrecho:string = '';
	private temperatura:string = '';
	public canAsistentes: number = 0;
	public iterador: number;
	private listaAsistentesCheckin: any[] = [];

	locale = 'es';
	mensajeModal = '';
	modalType: SweetAlertType;
	modalTitle = '';

	constructor(public service: ApirestService,
		private router: Router,
		private toastr: ToastrService,
		public provider: RestProvider,
		public singleton:SingletonService,
		private modalService: BsModalService
		) 
	{ 
		
	}

	ngOnInit() {
		this.user = JSON.parse(localStorage.getItem('user'));
		this.document = this.user['documento'];
		this.findMyReserves();
	}

	findMyReserves(){
		this.showOverlay = true;
		let body = {
			'documento': this.document,
		}
		let token = localStorage.getItem('ptoken');
		this.provider.queryJson('/metodo11', body, 3, token).subscribe(
			response=>
			{
				this.showOverlay = false;
				let result = response.json();	
				//we get the array, and  split data to format
				this.ReservesList = result;
				
			},
			err=>
			{
				console.log(err);
			}
		);
	}

	FindReserve(reserve_id){
		this.singleton.reserve_id = reserve_id;
		this.router.navigate(['alojamiento/find-reserve']);
	}

	volver(){
		this.singleton.setPreBookingData(null);
		this.router.navigate(['/alojamiento']);
	}

	// muestra el modal de checkin
	checkin(reserve_id){
			// activa el cargando
			this.showOverlay = true;

			let token = localStorage.getItem('ptoken');
			this.provider.queryGetprovi('/verificadCheckinAlojamientoSalud/' + reserve_id, token)
				.subscribe(response =>{
					let result = response.json();
					const a = result.respuesta;
					
					this.canAsistentes = this.listAsistentes.length;
					this.showOverlay = false;
					if(a.length > 0){
						this.router.navigate(['/alojamiento/checkin-health/'+ reserve_id]);
					}else{						
						this.mensajeModal = "Usted ya realizó el check-in anteriormente para los asistentes registrados";
						swal({
							title: 'Atención',
							text: this.mensajeModal,
							type: 'warning',
							showCancelButton: false,
							confirmButtonClass: 'btn btn-primary',
							confirmButtonText: 'Continuar',
						});
						
					}
					
				});

				
		
			
	}

	
	

	


	


	// desabilita el boton siguiente y guardar
	get getDisable(){
		let respuesta = false;
		if(this.dolorGarganta ==='' || this.tosSeca === '' || this.dificultadRespirar === '' || this.dolorCabeza === '' || this.diarreaVomito === '' || this.fiebre === '' || this.congestionNasal === '' || this.dolorMuscular === '' || this.contactoEstrecho === '' || this.temperatura === ''){
			respuesta = true;
		}
		return respuesta;
	}


	// valida que la fecha sea un dia antes o el mismo dia del ingreso 
	// para activar el checkin
	getactiveCheckin(fecha:string){
		let respuesta = false;

		var date = new Date();
		var dia = date.getDate();
		var mes = date.getMonth();
		var yyy = date.getFullYear();		

		let hoy = yyy +'-'+(mes+1)+'-'+dia;
		let fechaInicio = new Date(hoy).getTime();
		let fechaFin    = new Date(fecha).getTime();

		

		//console.log(fecha);
		// console.log("hoy",fechaInicio);
		// console.log("fecha",fechaFin);
		let diff = fechaFin - fechaInicio;

		let dias = diff/(1000*60*60*24);

		// console.log(diff/(1000*60*60*24) );
		if(dias >= -0.5 && dias <= 1){
			respuesta = true;
		}
		return respuesta;
		
	}

	
}
