import { NgModule } from '@angular/core';
import { GroupManagerModule } from '../../group-manager/group-manager.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular/main';

import { ClinicLabOrdersComponent } from './clinic-lab-orders/clinic-lab-orders.component';
import { PatientProgramEnrollmentModule } from '../../patients-program-enrollment/patients-program-enrollment.module';
import { PreAppointmentSummaryComponent } from './pre-appointment-summary/pre-appointment-summary.component';
@NgModule({
  imports: [
    GroupManagerModule,
    CommonModule,
    FormsModule,
    PatientProgramEnrollmentModule,
    AgGridModule,
    FormsModule
  ],
  exports: [ClinicLabOrdersComponent, PreAppointmentSummaryComponent],
  declarations: [ClinicLabOrdersComponent, PreAppointmentSummaryComponent],
  providers: []
})
export class GeneralModule {}
