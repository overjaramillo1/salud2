import { Component, OnInit } from '@angular/core';
import { ApirestService } from '../apirest.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {

	public roles = [];
    public roleSelected = 0;
    public oneAtTime = true;
    public showInputRole = false;
    public roleName = "";
    public sections = [];

  	constructor(public service: ApirestService,
  				private router: Router,
                private toastr: ToastrService,
                private translate: TranslateService) 
  	{ 

  	}

  	ngOnInit() 
  	{
  		this.getRoles();
  	}

  	getRoles()
  	{
  		this.service.queryGet('roles').subscribe(
            response=>
            {      
                this.roles = response.json(); 

                if(this.roles.length > 0)
                {
                    this.roleSelected = this.roles[0]['id'];

                    this.getPermissions();
                }
            },
            err => 
            {
            	console.log(err);
            }
        );
  	}

    selectRole(role_id)
    {
        this.roleSelected = role_id;
        this.getPermissions();
    }

    getPermissions()
    {
        this.service.queryGet('permissions/'+this.roleSelected).subscribe(
            response=>
            {      
                let permissions = response.json(); 

                let sections = [];

                if(permissions.length > 0)
                {
                    this.sections = [];
                    let index = -1;
                    let section = {};

                    for (var i = 0; i < permissions.length; ++i) 
                    {
                        index = sections.indexOf(permissions[i]['section']);
                        if(index == -1)
                        {
                            section = {name: permissions[i]['section_name'], 
                                        permissions: [{id: permissions[i]['id'], 
                                                        name: permissions[i]['permission_name'],
                                                        allowed: permissions[i]['allowed'],
                                                        real_name: permissions[i]['name']}]};
                            sections.push(permissions[i]['section']);

                            this.sections.push(section);
                        }
                        else
                        {
                            section = this.sections[index];
                            section['permissions'].push({id: permissions[i]['id'], 
                                                        name: permissions[i]['permission_name'],
                                                        allowed: permissions[i]['allowed'],
                                                        real_name: permissions[i]['name']});
                            this.sections[index] = section;
                        }
                    }
                }

            },
            err => 
            {
                console.log(err);
            }
        );
    }

    newRole()
    {
        if(!this.showInputRole)
        {
            this.showInputRole = true;
        }
        else if(this.roleName != '')
        {
            let body = new FormData();
            body.append('id', '0');
            body.append('role', this.roleName);

            this.service.queryPost('roles', body).subscribe(
                response=>
                {      
                    this.getRoles();
                    this.showInputRole = false;
                    let result = response.json();

                    this.toastr.success(result.message, this.translate.instant('alerts.congratulations'));
                },
                err => 
                {
                    console.log(err);
                }
            );
        }
    }

    changePermissions(id)
    {
        let sectionPermissions = [];
        let permissions = [];

        if(this.sections.length > 0)
        {
            for (var i = 0; i < this.sections.length; ++i) 
            {
                sectionPermissions = this.sections[i]['permissions'];

                for (var j = 0; j < sectionPermissions.length; ++j) 
                {
                    if(sectionPermissions[j]['allowed'] || sectionPermissions[j]['id'] == id)
                    {
                        permissions.push(sectionPermissions[j]['real_name']);
                    }
                }
            }
        }

        console.log(permissions);

        let permissionsJoin = permissions.join();

        let body = new FormData();
        body.append('role_id', this.roleSelected+'');
        body.append('permissions', permissionsJoin);

        this.service.queryPost('sync-permissions', body).subscribe(
            response=>
            {      
                //this.getRoles();
                //this.showInputRole = false;
                let result = response.json();

                this.toastr.success(result.message, this.translate.instant('alerts.congratulations'));
            },
            err => 
            {
                console.log(err);
            }
        );
    }
}
