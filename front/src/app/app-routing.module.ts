import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { LayoutComponent } from "./layout/layout.component";
import { UsersComponent } from "./users/users.component";
import { PermissionsComponent } from "./permissions/permissions.component";
import { ProfileComponent } from "./profile/profile.component";
//import { DocumentsComponent } from './documents/documents.component';
//import { MapsComponent } from './maps/maps.component';
import { DetailsComponent } from "./details/details.component";
import { FindDatesComponent } from "./find-dates/find-dates.component";
import { MakeBookingComponent } from "./make-booking/make-booking.component";
import { FindReserveComponent } from "./find-reserve/find-reserve.component";
import { ListReservesComponent } from "./list-reserves/list-reserves.component";
import { SearchComponent } from "./search/search.component";
import { ConfirmComponent } from "./confirm/confirm.component";
import { RecoverComponent } from "./recover/recover.component";
import { BillbordComponent } from "./billbord/billbord.component";
import { EndTransactionComponent } from "./end-transaction/end-transaction.component";
import { HomeComponent } from "./components/home/home.component";
import { CheckinHealthComponent } from "./checkin-health/checkin-health.component";

const routes: Routes = [
  { path: "buscador", component: SearchComponent },
  { path: "cartelera", component: BillbordComponent },
  {
    path: "",
    component: LayoutComponent,
    children: [
      { path: "", component: HomeComponent },
      { path: "confirm/:to", component: ConfirmComponent },
      { path: "recover", component: RecoverComponent },

      // // {path: 'find-date/:resort/:datestart/:datefinish', component: FindDatesComponent},
      { path: "alojamiento/make-booking", component: MakeBookingComponent },
      { path: "alojamiento/find-reserve", component: FindReserveComponent },
      // //{path: 'login', component: LoginComponent },
      { path: "alojamiento/list-reserves", component: ListReservesComponent },
      {
        path: "alojamiento/checkin-health/:id",
        component: CheckinHealthComponent,
      },
      { path: "alojamiento/details", component: DetailsComponent },
      {
        path: "alojamiento/end-transaction",
        component: EndTransactionComponent,
      },
      {
        path: "saludFemenina",
        //component: HealthComponent
        loadChildren: "./components/health/health.module#HealthModule",
        //loadChildren: 'com/views/themes/main/theme.module#ThemeModule',
        //canActivate: [AuthGuard]
      },
      { path: "**", redirectTo: "saludFemenina", pathMatch: "full" },
    ],
  },

  //{path: 'salud', component: HealthComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
