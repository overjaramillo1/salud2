import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from ".//app-routing.module";
import { LoginComponent } from "./login/login.component";
import { LayoutComponent } from "./layout/layout.component";
import { UsersComponent } from "./users/users.component";

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpModule } from "@angular/http";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AngularFontAwesomeModule } from "angular-font-awesome";
import { PermissionsComponent } from "./permissions/permissions.component";
import { ProfileComponent } from "./profile/profile.component";

import { UiSwitchModule } from "ngx-ui-switch";
import { AccordionModule } from "ngx-bootstrap/accordion";
import { ToastrModule } from "ngx-toastr";
import { ImageCropperModule } from "ngx-image-cropper";
import { DocumentsComponent } from "./documents/documents.component";

import { DropzoneModule } from "ngx-dropzone-wrapper";
import { DROPZONE_CONFIG } from "ngx-dropzone-wrapper";
import { DropzoneConfigInterface } from "ngx-dropzone-wrapper";

//import { MapsComponent } from './maps/maps.component';
import { RestProvider } from "./providers/rest/rest";
import { DetailsComponent } from "./details/details.component";
import { FindDatesComponent } from "./find-dates/find-dates.component";

import { MyDatePickerModule } from "mydatepicker";
import { MakeBookingComponent } from "./make-booking/make-booking.component";
import { FindReserveComponent } from "./find-reserve/find-reserve.component";
import { CarouselModule } from "ngx-bootstrap";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { TabsModule } from "ngx-bootstrap/tabs";
import { ModalModule } from "ngx-bootstrap";
import { ListReservesComponent } from "./list-reserves/list-reserves.component";

import es from "@angular/common/locales/es-CO";
import { registerLocaleData } from "@angular/common";
import { LOCALE_ID } from "@angular/core";
import { SearchComponent } from "./search/search.component";

import { CollapseModule } from "ngx-bootstrap/collapse";
import { NgxPageScrollModule } from "ngx-page-scroll";
import { ConfirmComponent } from "./confirm/confirm.component";
import { RecoverComponent } from "./recover/recover.component";
import { BillbordComponent } from "./billbord/billbord.component";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { EndTransactionComponent } from "./end-transaction/end-transaction.component";
import { Ng2CarouselamosModule } from "ng2-carouselamos";
import { TooltipModule } from "ngx-bootstrap";
import { LayoutHeaderComponent } from "./layout/layout-header/layout-header.component";
import { HomeComponent } from "./components/home/home.component";
import { WelcomeComponent } from "./components/widgets/welcome/welcome.component";
import { WidgetsModule } from "./components/widgets/widgets.module";
import { AuthModule } from "./components/auth/auth.module";
//import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
//import { ErrorsComponent } from './components/widgets/errors/errors.component';
import { ClickOutsideModule } from "ng-click-outside";
import { CookieService } from "ngx-cookie-service";
import { EliminarNumerosPipe } from "./services/pipes/eliminar-numeros.pipe";
import { CheckinHealthComponent } from "./checkin-health/checkin-health.component";

registerLocaleData(es);

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: "",
  maxFilesize: 50,
  acceptedFiles: null,
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    UsersComponent,
    PermissionsComponent,
    ProfileComponent,
    DocumentsComponent,
    //MapsComponent,
    DetailsComponent,
    FindDatesComponent,
    MakeBookingComponent,
    FindReserveComponent,
    ListReservesComponent,
    SearchComponent,
    ConfirmComponent,
    RecoverComponent,
    BillbordComponent,
    EndTransactionComponent,
    LayoutHeaderComponent,
    HomeComponent,
    EliminarNumerosPipe,
    CheckinHealthComponent,
  ],
  exports: [],
  imports: [
    BrowserModule,
    ClickOutsideModule,
    Ng2CarouselamosModule,
    BrowserAnimationsModule,
    HttpModule,
    AuthModule,
    WidgetsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFontAwesomeModule,
    UiSwitchModule,
    TooltipModule.forRoot(),
    AccordionModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 3000,
      preventDuplicates: true,
    }),
    CollapseModule.forRoot(),
    NgxPageScrollModule,
    ImageCropperModule,
    DropzoneModule,
    CarouselModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    MyDatePickerModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    BsDropdownModule.forRoot(),
  ],
  providers: [
    RestProvider,
    CookieService,
    {
      provide: LOCALE_ID,
      useValue: "es-CO",
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
