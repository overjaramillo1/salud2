import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { ApirestService } from '../apirest.service';
import { ToastrService } from 'ngx-toastr';
import { RestProvider } from '../providers/rest/rest';
import {Md5} from 'ts-md5/dist/md5';
import { SingletonService } from '../singleton.service';
import {IMyDpOptions} from 'mydatepicker';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute, NavigationEnd } from '@angular/router';
import * as moment from 'moment';
import { PageScrollConfig, PageScrollService, PageScrollInstance } from 'ngx-page-scroll';
import swal from 'sweetalert2';


@Component({
  selector: 'app-billbord',
  templateUrl: './billbord.component.html',
  styleUrls: ['./billbord.component.scss']
})
export class BillbordComponent implements OnInit {
	public bilboardList = [];
	public items = [];


	public carouselTileTwoItems: Array<any> = [];
   	itemsMovies: Array<any> = []

	constructor(public service: ApirestService,
		private router: Router,
		private toastr: ToastrService,
		public provider: RestProvider,
		public singleton:SingletonService,
		private modalService: BsModalService,
		private route: ActivatedRoute,
		private pageScrollService: PageScrollService,
		) 
	{ 

	}

	ngOnInit() {
		this.getBillboard();
	}

	getBillboard(){
		let body = {
		   "usuario":  "Kiosko_Confa",
		   "password": "C_KIOSKO*2017$"
		}

		this.provider.queryJson('/metodo1', body, 2).subscribe(
			response=>
			{
				let result = response.json();
				
				this.bilboardList = result.objetoPeliculaKiosko;
				if(this.bilboardList.length > 0){
					this.carouselTileTwoLoad();
				}
			},
			err=>
			{
				console.log(err);
			}
		);
	}

	async carouselTileTwoLoad() 
    {    
       if(this.bilboardList.length > 0)
       {
       		let movies = [];
           	for (let i = 0; i < this.bilboardList.length; i++) 
           	{    
	           	let image = "";
	           	image = this.bilboardList[i]['rutaImagen'];
	           	let title = this.bilboardList[i]['titulo'];
	           	let genre = this.bilboardList[i]['generos'];
	           	let score = this.bilboardList[i]['clasificacion'];
	           	let next_date = this.bilboardList[i]['fechaMasCercana']; 

	           	await this.imageExists(image, function(exists) {
				 	if(!exists){
				 		image = "../../assets/images/defaultcine.jpg";
				 	}
				 	let item = {name: ''+ image +'', titulo:''+ title +'', generos:''+ genre +'', clasificacion:''+ score +'', fechaMasCercana: ''+ next_date +''};
	               	movies.push(item);
				});
           	}
           this.itemsMovies = movies;
       }
    }

   	imageExists(url, callback) {
	  var img = new Image();
	  img.onload = function() { callback(true); };
	  img.onerror = function() { callback(false); };
	  img.src = url;
	}
}
