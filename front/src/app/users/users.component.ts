import { Component, OnInit } from '@angular/core';
import { ApirestService } from '../apirest.service';
import { SingletonService } from '../singleton.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ToastrService } from 'ngx-toastr';
import swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

	public sessionUser = {};

    //Form variables
    public user = {id: 0, name: '', email: '', password: '', status: true, role_id: ''};
    public roles = [];

    //Variables for users list with (pagination, select rows, search)
    public users = [];
    public pagesNumber = 10; //Default value
    public search = '';
    public pages = [];
    public currentPage = 1;

    //Canvas variables
    public canvasUser = false;
    public showOverlay = false;

  	constructor(public service: ApirestService,
                private router: Router,
                private toastr: ToastrService,
                private translate: TranslateService,
                private singleton: SingletonService) 
  	{ 

  	}

  	ngOnInit() 
  	{
  		this.getUser();

        //Function to get the source data
        this.getUsers('');

        this.getRoles();
  	}

    /**
     * Gets the session user
     */
  	getUser()
  	{
  		this.sessionUser = JSON.parse(localStorage.getItem('user'));
  	}

    /**
     * Obtains the list of data with the paging information and search results
     */
    getUsers(page)
    {
        let url = 'users?rows=' + this.pagesNumber;
        url += '&search=' + this.search;

        if(page != '')
        {
            url += '&page=' + page;            
        }

        this.service.queryGet(url).subscribe(
            response=>
            {      
                let result = response.json(); 
                this.users = result.data;

                this.currentPage = result['current_page'];
                this.pages = this.singleton.pagination(result);
            },
            err => 
            {
                console.log(err);
            }
        );
    }

    /**
     * Calls the elements of the given page
     * @param int page Next page to paginate
     */
    getPage(page)
    {
        if(page != this.currentPage)
        {
            this.getUsers(page);
        }
    }

    /**
     * Gets the roles to show on create form
     */
    getRoles()
    {
        this.service.queryGet('roles').subscribe(
            response=>
            {      
                let result = response.json(); 
                this.roles = result;
            },
            err => 
            {
                console.log(err);
            }
        );
    }

    /**
     * This function opens the create canvas
     */
    openCanvas()
    {
        this.canvasUser = true;
        this.showOverlay = true;
    }

    /**
     * Closes the create canvas
     */
    closeCanvas()
    {
        this.canvasUser = false;
        this.showOverlay = false;
    }

    /**
     * Function that saves or update an user
     */
    saveUser()
    {
        let status = '0';
        if(this.user['status'])
        {
            status = '1';
        }

        let body = new FormData();
        body.append('id', this.user['id']+'');
        body.append('name', this.user['name']);
        body.append('email', this.user['email']);
        body.append('password', this.user['password']);
        body.append('role_id', this.user['role_id']);
        body.append('status', status);

        this.service.queryPost('users', body).subscribe(
            response=>
            {      
                let result = response.json(); 

                if(result.success)
                {
                    //Hide the canvas
                    this.canvasUser = false;
                    this.showOverlay = false;

                    //Reinit the global user variable
                    this.user = {id: 0, name: '', email: '', password: '', status: true, role_id: ''};

                    //Show success message
                    this.toastr.success(result.message, this.translate.instant('alerts.congratulations'));

                    //Reload the list users
                    this.getUsers('');
                }
                else
                {
                    let message = '';
                    if(result.message.length > 0)
                    {
                        result.message.forEach(function(element) {
                            message += element+'<br>';
                        });
                    }

                    this.toastr.error(message, 'Error', {enableHtml: true, positionClass: 'toast-top-center'});
                }
            },
            err => 
            {
                console.log(err);
            }
        );
    }

    /**
     * It searches the user and set to global user variable to edit
     * @param string userId Field to search the user for id
     */
    editUser(userId)
    {
        this.service.queryGet('users/'+userId).subscribe(
            response=>
            {      
                let user = response.json(); 
                this.user['id'] = user.id;
                this.user['name'] = user.name;
                this.user['email'] = user.email;

                if(user.role != undefined)
                {
                    this.user['role_id'] = user.role.id;
                }

                if(user.status == 1)
                {
                    this.user['status'] = true;
                }
                else
                {
                    this.user['status'] = false;
                }

                this.canvasUser = true;
                this.showOverlay = true;
            },
            err => 
            {
                console.log(err);
            }
        );
    }

    /**
     * Deletes the user
     * @param string userId id user to delete
     */
    deleteUser(userId)
    {
        

        this.service.queryDelete('users/'+userId).subscribe(
            response=>
            {      
                let result = response.json(); 

                if(result.success)
                {
                    //Reload the list users
                    this.getUsers('');

                    swal(
                        this.translate.instant('alerts.congratulations'),
                        result.message,
                        'success'
                    );
                }
            },
            err => 
            {
                console.log(err);
            }
        );
    }

    /**
     * Ask for confirmation before to delete the user
     * @param string userId id user to delete
     */
    confirmDelete(userId)
    {
        swal({
            title: this.translate.instant('alerts.confirm'),
            text: this.translate.instant('alerts.sure_to_delete'),
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.translate.instant('alerts.yes'),
            cancelButtonText: this.translate.instant('alerts.cancel')
        }).then((result) => {
            if (result.value) 
            {
                this.deleteUser(userId);
            }
        });
    }

    /**
     * Call the function to export, you must send the same search parameters
     * @param {string} type (pdf or excel)
     */
    exportData(type)
    {
        let url = 'export-users?type=' + type;
        url += '&search=' + this.search;

        this.service.queryGet(url).subscribe(
            response=>
            {      
                let result = response.json(); 
                
                console.log(result);
                window.open(result,'_blank');
            },
            err => 
            {
                console.log(err);
            }
        );
    }
}
