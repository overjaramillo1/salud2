import { Component, OnInit } from '@angular/core';
import { ApirestService } from '../apirest.service';
import { SingletonService } from '../singleton.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ToastrService } from 'ngx-toastr';
import swal from 'sweetalert2';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

	public user;

  constructor(public service: ApirestService,
                private router: Router,
                private toastr: ToastrService,
                private translate: TranslateService,
                private singleton: SingletonService) 
  	{ 

  	}

  ngOnInit() {
  	this.user = JSON.parse(localStorage.getItem('user'));
    let result = this.singleton.getBookingData();
    if(result != undefined){
      this.router.navigate(['/make-booking']);
    }
  }

}
