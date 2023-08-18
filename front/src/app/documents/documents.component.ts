import { Component, OnInit, ViewChild } from '@angular/core';
import { ApirestService } from '../apirest.service';
import { SingletonService } from '../singleton.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ToastrService } from 'ngx-toastr';
import swal from 'sweetalert2';
import { DropzoneModule ,DropzoneComponent , DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {

	public sessionUser = {};

    //Form variables
    public document = {id: 0, title: '', url_file: ''};
    public addedFile = false;

    //Variables for documents list with (pagination, select rows, search)
    public documents = [];
    public pagesNumber = 10; //Default value
    public search = '';
    public pages = [];
    public currentPage = 1;

    //Canvas variables
    public canvasDocument = false;
    public showOverlay = false;

    @ViewChild(DropzoneComponent) drpzone: DropzoneComponent;

    public config: DropzoneConfigInterface = {
		url: '#',
		clickable: true,
		maxFiles: 1,
		autoReset: 1000,
		errorReset: null,
		cancelReset: null,
		autoProcessQueue:false
		// init: function() {
	 //        this.on("addedfile", function(file) { 
	 //            console.log("Added file.");
  //               //this.addedFunction();
	 //            this.addedFile = true;
  //               console.log(this.addedFile);
	 //        });
	 //    }
	};


  	constructor(public service: ApirestService,
                private router: Router,
                private toastr: ToastrService,
                public translate: TranslateService,
                private singleton: SingletonService) 
  	{ 

  	}

  	ngOnInit() 
  	{
  		this.getUser();

        //Function to get the source data
        this.getDocuments('');
  	}

    addedFunction()
    {
       
    }

  	/**
     * Gets the session user
     */
  	getUser()
  	{
  		this.sessionUser = JSON.parse(localStorage.getItem('user'));
  	}

  	/**
  	 * Get the documents list to show in the table
  	 * @param {string} page
  	 */
  	getDocuments(page)
  	{
  		let url = 'documents?rows=' + this.pagesNumber;
        url += '&search=' + this.search;

        if(page != '')
        {
            url += '&page=' + page;            
        }

        this.service.queryGet(url).subscribe(
            response=>
            {      
                let result = response.json(); 
                this.documents = result.data;

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
     * This function opens the create canvas
     */
    openCanvas()
    {
        this.canvasDocument = true;
        this.showOverlay = true;
    }

  	/**
     * Closes the create canvas
     */
    closeCanvas()
    {
        this.canvasDocument = false;
        this.showOverlay = false;

        this.document = {id: 0, title: '', url_file: ''};
    }

    /**
     * Function that saves or update an user
     */
    sendForm()
    {
        var files = this.drpzone.directiveRef.dropzone().getQueuedFiles().length;
        console.log(files);
    	if(files > 0)
    	{
    		this.drpzone.directiveRef.dropzone().processQueue();
    	}
    	else
    	{
    		let body = new FormData();
    		this.saveDocument(body);
    	}
    }

    onUploadSuccess(event)
    {
    	console.log(event);
    }

    onUploadError(event)
    {
    	console.log(event);
    }

    onSending(data): void 
    {
    	// data [ File , xhr, formData]
		let body = new FormData();
		body.append('file', data[0]);
		this.saveDocument(body);
	}	

	/**
	 * Function that saves or update a document
	 * @param {FormData} body
	 */
	saveDocument(body)
	{
		//let body = new FormData();
        body.append('id', this.document['id']+'');
        body.append('title', this.document['title']+'');

        this.service.queryPost('documents', body).subscribe(
            response=>
            {      
                let result = response.json(); 

                if(result.success)
                {
                    //Hide the canvas
                    this.canvasDocument = false;
                    this.showOverlay = false;

                    //Reinit the global user variable
                    this.document = {id: 0, title: '', url_file: ''};

                    //Show success message
                    this.toastr.success(result.message, this.translate.instant('alerts.congratulations'));

                    //Reload the list users
                    this.getDocuments('');
                    this.drpzone.directiveRef.dropzone().removeAllFiles();
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
	 * [editDocument description]
	 * @param {[type]} documentId [description]
	 */
	editDocument(documentId)
	{
		if(this.documents.length > 0)
		{
			for (var i = 0; i < this.documents.length; ++i) 
			{
				if(this.documents[i]['id'] == documentId)
				{
					this.document['id'] = documentId;
					this.document['title'] = this.documents[i]['title'];
					this.document['url_file'] = this.documents[i]['url_file'];

					console.log(this.document);
					this.openCanvas();
					break;
				}
			}
		}
	}

	/**
     * Deletes the document
     * @param string documentId
     */
    deleteDocument(documentId)
    {
        this.service.queryDelete('documents/'+documentId).subscribe(
            response=>
            {      
                let result = response.json(); 

                if(result.success)
                {
                    //Reload the list users
                    this.getDocuments('');

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
    confirmDelete(documentId)
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
                this.deleteDocument(documentId);
            }
        });
    }
}
