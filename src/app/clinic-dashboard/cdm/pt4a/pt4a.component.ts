import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { PreAppointmentOutreachResourceService } from 'src/app/etl-api/pre-appointment-outreach-resource.service';
import { Pt4aService } from 'src/app/etl-api/pt4a-resource.service';
import { Patient } from 'src/app/models/patient.model';
import { RoutesProviderService } from 'src/app/shared/dynamic-route/route-config-provider.service';
import { SessionStorageService } from 'src/app/utils/session-storage.service';

interface ReportParams {
  creator: string;
}

@Component({
  selector: 'app-pt4a',
  templateUrl: './pt4a.component.html',
  styleUrls: ['./pt4a.component.css']
})
export class Pt4aComponent implements OnInit {
  public patient: any;
  public uuid: string;
  rowData: any[] = [];

  columnDefs = [
    { headerName: 'NAME', field: 'name' },
    { headerName: 'IDENTIFIER', field: 'identifier' },
    { headerName: 'TCA', field: 'tca' },
    { headerName: 'DRUG', field: 'drug' }
  ];

  constructor(
    private routesProviderService: RoutesProviderService,
    private sessionStorageService: SessionStorageService,
    private preAppointmentOutreachResourceService: PreAppointmentOutreachResourceService,
    public router: Router
  ) {}
  ngOnInit() {
    this.fetchUser();
  }

  public getReportParams(): ReportParams {
    return {
      creator: this.uuid
    };
  }

  public fetchUser() {
    this.patient = this.sessionStorageService.getItem('user');
    console.log('PATIENT IS: ' + JSON.stringify(JSON.parse(this.patient)));

    this.getReportParams();

    this.preAppointmentOutreachResourceService
      .getPeerPatients(this.getReportParams())
      .subscribe(
        (result: any) => {
          this.rowData = result;
        },
        (error: any) => {}
      );
  }

  startVisit(event: any) {
    const dashboardRoutesConfig: any = this.routesProviderService
      .patientDashboardConfig;
    const route: any = _.find(
      dashboardRoutesConfig.programs,
      (_r: any) => _r['programUuid'] === 'fd7e9fc1-690d-4179-b630-1d292beb2006'
    );
    const _route =
      '/patient-dashboard/patient/' +
      event.data.patient_uuid +
      '/' +
      route.alias +
      '/' +
      route.baseRoute +
      '/visit';
    this.router.navigate([_route], {});
  }
}
