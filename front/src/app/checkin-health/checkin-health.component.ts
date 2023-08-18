import { Component, OnInit } from '@angular/core';
import { SingletonService } from '../singleton.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RestProvider } from '../providers/rest/rest';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import swal, { SweetAlertType } from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

declare var $;

@Component({
  selector: 'app-checkin-health',
  templateUrl: './checkin-health.component.html',
  styleUrls: ['./checkin-health.component.scss']
})
export class CheckinHealthComponent implements OnInit {
  public idReserva: String;
  public user = {primerNombre: '', primerApellido: '', segundoApellido: '', documento:''};
	public ReservesList = [];
	public document = "";
  public showOverlay = false;
  public listaAsistentes = [];
  public listaAsistentesCheckin = [];
  // public formChekin: FormGroup;

  

  constructor(
    public singleton:SingletonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public provider: RestProvider,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    ) {
      this.showOverlay = true;
      this.user = JSON.parse(localStorage.getItem('user'));
      this.document = this.user['documento'];
      this.activatedRoute.params
        .subscribe(param => {
          this.idReserva = param.id;
          // this.findMyReserves();
          this.existeReserva(this.idReserva.toString())
          .then(() => {
            let token = localStorage.getItem('ptoken');
			      this.provider.queryGetprovi('/verificadCheckinAlojamientoSalud/' + this.idReserva, token)
				        .subscribe(response =>{
                  //console.log(response);
                    this.listaAsistentesCheckin = [];
                    let result = response.json();
                    // console.log(result);
                    const a = result.respuesta;
                    for (let y = 0; y < a.length; y++) {
                      this.listaAsistentes.push({
                        reservaId: this.idReserva, 
                        personaId:a[y].personaasistente_id,
                        nombre:a[y].nombre, 
                        documento:a[y].documento
                      });
                    }
                    if(a.length === 0){
                      this.router.navigate(['/alojamiento']);
                    }
                    setTimeout(() => {
                      // console.log(this.listaAsistentes);
                      this.listaAsistentes.forEach(resp =>{
                        this.agregarPersona(resp);
                      });
                      setTimeout(() => {
                        this.showOverlay = false;
                      }, 1000);
                      // this.createForm();
                    }, 2000);
                    
                });
					})
          .catch(err => {
            this.router.navigate(['/alojamiento']);
          });
      });
     }

     ngOnInit() {
      
      
    }

    funcionArrow(index: number){
      for(let i = 0; i < this.listaAsistentes.length; i++){
        const element = '#arrow'+ i;
        
        if(i === index){
          if($(element).hasClass("fa-chevron-down")){
            $(element).removeClass("fa-chevron-down");
            $(element).addClass("fa-chevron-right");
            
          }
          else if( $(element).hasClass("fa-chevron-right")){
            $(element).removeClass("fa-chevron-right");
            $(element).addClass("fa-chevron-down");
            
          }
          else{
            $(element).removeClass("fa-chevron-right");
            $(element).addClass("fa-chevron-down");
            
          }
        }
        else{
          $(element).addClass("fa-chevron-right");
          $(element).removeClass("fa-chevron-down");
        }
        }
    }

    private existeReserva(id: string){
      return new Promise((resolve, reject) => {
        let body = {
          'documento': this.document,
        }
        let token = localStorage.getItem('ptoken');
        this.provider.queryJson('/metodo11', body, 3, token)
          .subscribe(response=>{
            let result = response.json();
            result.forEach(resp=>{
              this.ReservesList.push(resp.reservaId.toString());
            });
            // console.log(this.ReservesList);
            let existe = this.ReservesList.includes(id);
            // console.log(existe);
            if(existe){
              resolve();
            }else{
              reject();
            }
          });
      });
    }
  
    


  volver(){
		this.singleton.setPreBookingData(null);
		this.router.navigate(['/alojamiento/list-reserves']);
  }
  
   // inicializa los campos del formulario reactivo y sus validadores
  //  createForm() {
  //   this.
  // }

  formChekin = this.formBuilder.group({
    sintomas: this.formBuilder.array([]),
  });

  sintomasform(){
    return this.formChekin.get('sintomas') as FormArray;
  }

  agregarPersona(persona:any){
    const formSintomasPersona = this.formBuilder.group({
      alojamiento_id: persona.reservaId,
			personaasistente_id: persona.personaId,
			documento: persona.documento,
			nombre: persona.nombre,
			dolorGarganta: ['',[Validators.required]],
			tosSeca: ['',[Validators.required]],
			dificultadRespiratoria: ['',[Validators.required]],
			dolorCabeza: ['',[Validators.required]],
			diarreaVomito: ['',[Validators.required]],
			fiebre: ['',[Validators.required]],
			congestionNasal: ['',[Validators.required]],
			dolorMuscular: ['',[Validators.required]],
			contactoEstrecho: ['',[Validators.required]],
			temperatura: ['',[Validators.required]],

    });
    this.sintomasform().push(formSintomasPersona);
  }

  

  submit() {
    if(this.formChekin.invalid) {      
      return;
    }else{
      let asistentes = this.sintomasform().value;
      let activador = false;
      let str =JSON.stringify(asistentes);

      for (var i = 0; i < asistentes.length; i++) {
        if(
          asistentes[i].dolorGarganta === 'Si' ||
          asistentes[i].tosSeca === 'Si' ||
          asistentes[i].dificultadRespiratoria === 'Si' ||
          asistentes[i].dolorCabeza === 'Si' ||
          asistentes[i].diarreaVomito === 'Si' ||
          asistentes[i].fiebre === 'Si' ||
          asistentes[i].congestionNasal === 'Si' ||
          asistentes[i].dolorMuscular === 'Si' ||
          asistentes[i].contactoEstrecho === 'Si' ||
          asistentes[i].temperatura === '6' 
        ){
          activador = true;
        }
     } 

     setTimeout(() => {
      this.showOverlay = true;
      let token = localStorage.getItem('ptoken');
      this.provider.queryJsonprovi('/checkinAlojamientoSalud', asistentes, 3, token)
			.subscribe(response => {
        if((response.json()).respuesta > 0){
          if(activador){
            $('#modal-medida-preventiva').modal();
            // console.log(JSON.stringify(asistentes));
           }else{
            // console.log(asistentes);
            $('#modal-guardar-checkin').modal();
           }
					
				}
				else {
					swal({
						title: 'Error',
						text: "No se pudo guardar la información porfavor verifique su inicio de sesión",
						type: 'error',
						showCancelButton: false,
						confirmButtonClass: 'btn btn-primary',
						confirmButtonText: 'Continuar',
					  });
				}
				this.showOverlay = false;
      });
     }, 1500);
     
     
           
      
    }
    


    
  }

}
