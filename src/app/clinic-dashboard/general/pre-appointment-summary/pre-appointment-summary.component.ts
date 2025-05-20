import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PreAppointmentOutreachResourceService } from 'src/app/etl-api/pre-appointment-outreach-resource.service';
import { ClinicDashboardCacheService } from '../../services/clinic-dashboard-cache.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { GridOptions } from 'ag-grid';

interface ReportParams {
  locationUuids: string;
  year: string;
  month: string;
}

interface Data {
  name: number;
  high_risk_client: number;
  high_risk_client_contacted: number;
  phone_follow_up: number;
  home_follow_up: number;
  successful_contact_attempts: number;
  successful_contact_attempts_kept_appointment: number;
  successful_contact_attempts_missed_appointment: number;
  unsuccessful_contact_attempts: number;
  no_contact_attempts: number;
  no_contact_attempts_kept_appointment: number;
  rescheduled_appointment: number;
  unsuccessful_kept_appointment: number;
}

interface RowItem {
  Indicators?: string;
  sub?: string;
  PatientCount: number;
  rowSpan?: number;
}

@Component({
  selector: 'app-pre-appointment-summary',
  templateUrl: './pre-appointment-summary.component.html',
  styleUrls: ['./pre-appointment-summary.component.css']
})
export class PreAppointmentSummaryComponent implements OnInit {
  public locationUuids: string;
  public routeSub: Subscription = new Subscription();
  form: FormGroup;
  public loadingpreAppointmentOutreachSummary = false;
  public preAppointmentSummaryList: Data;
  gridApi: any;
  gridColumnApi: any;
  years: number[] = [];
  selectedMonth: string;
  selectedYear: number;

  months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  rowData: RowItem[] = [
    {
      Indicators:
        'Number of patients listed at high risk of missing appointment',
      PatientCount: 0,
      rowSpan: 1
    },
    {
      Indicators: 'Number of patients whom a contact attempt was made',
      PatientCount: 0,
      rowSpan: 1
    },
    {
      Indicators:
        'Number and type of contact attempts for patients listed as at high risk of missing appointment',
      sub: 'Number of phone contact attempts',
      PatientCount: 0,
      rowSpan: 2
    },
    { sub: 'Number of home visit attempts', PatientCount: 0 },
    {
      Indicators: 'Contact attempts outcome',
      sub: 'Number of successful contact attempts',
      PatientCount: 0,
      rowSpan: 3
    },
    { sub: 'Number of unsuccessful contact attempts', PatientCount: 24 },
    { sub: 'Number of patients with NO contact attempt', PatientCount: 19 },
    {
      Indicators: 'Bi-weekly patient appointment outcome',
      sub: 'Number of patients successfully contacted and kept appointment',
      PatientCount: 0,
      rowSpan: 5
    },
    {
      sub: 'Number of patients successfully contacted but missed appointment',
      PatientCount: 0
    },
    {
      sub: 'Number of patients successfully contacted and wish to reschedule',
      PatientCount: 0
    },
    {
      sub: 'Number of patients unsuccessfully contacted but kept appointment',
      PatientCount: 0
    },
    {
      sub: 'Number of patients with NO contact attempt but kept appointment',
      PatientCount: 0
    }
  ];

  colDefs = [
    {
      headerName: 'Indicators',
      field: 'Indicators',
      rowSpan: (params) => {
        return params.data.rowSpan || 1;
      },
      suppressSizeToFit: true, // Disable automatic fitting
      width: 200, // Initial width
      cellStyle: { 'white-space': 'nowrap' }
    },
    {
      headerName: '',
      field: 'sub'
    },
    {
      headerName: 'Patient Count',
      field: 'PatientCount'
    }
  ];

  gridOptions: GridOptions = {
    overlayNoRowsTemplate:
      '<span class="ag-overlay-loading-center">No rows to display</span>'
  };

  constructor(
    private preAppointmentResourceService: PreAppointmentOutreachResourceService,
    private clinicDashboardCacheService: ClinicDashboardCacheService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.populateYears();
    this.setDefaults();
    this.subscribeToRouteParamsChange();
    this.subScribeToClinicLocationChange();
    this.getSumary();
  }

  populateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      this.years.push(i);
    }
  }

  setDefaults() {
    const now = new Date();
    const previousMonthIndex = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    this.selectedMonth = this.months[previousMonthIndex];
    this.selectedYear = now.getFullYear();

    // Adjust year if previous month is December (when it's January)
    if (now.getMonth() === 0) {
      this.selectedYear = now.getFullYear() - 1;
    }
  }

  public getReportParams(): ReportParams {
    const monthIndex: any = this.months.indexOf(this.selectedMonth) + 1;
    const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`;
    return {
      locationUuids: this.locationUuids,
      year: this.selectedYear.toString(),
      month: formattedMonth
    };
  }

  getSumary() {
    const monthIndex: any = this.months.indexOf(this.selectedMonth) + 1;
    const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`;

    const year = this.selectedYear;
    console.log('MONTH IS: ' + formattedMonth);
    console.log('YEAR IS: ' + this.selectedYear);
    console.log('LOCATIONS: ' + this.locationUuids);
    if (this.locationUuids && this.selectedMonth && this.selectedYear) {
      this.loadingpreAppointmentOutreachSummary = true;
      this.preAppointmentResourceService
        .getPreAppointmentSummary(this.getReportParams())
        .subscribe(
          (result: any) => {
            this.loadingpreAppointmentOutreachSummary = false;
            if (result) {
              this.preAppointmentSummaryList = result[0];
              console.log(
                'DATA IS: ' + JSON.stringify(this.preAppointmentSummaryList)
              );
              this.updateRowDataFromApi();
            }
          },
          (error: any) => {
            this.loadingpreAppointmentOutreachSummary = false;
          }
        );
    }
  }

  onGridReady(params) {
    // Wait briefly to ensure all data is rendered
    setTimeout(() => {
      params.api.sizeColumnsToFit();
      // OR for content-based sizing:
      params.api.autoSizeColumns();
    }, 100);
  }

  updateRowDataFromApi(): void {
    if (!this.preAppointmentSummaryList) {
      return;
    }

    const indicatorMap: { [key: string]: keyof Data } = {
      'Number of patients listed at high risk of missing appointment':
        'high_risk_client',
      'Number of patients whom a contact attempt was made':
        'high_risk_client_contacted',
      'Number of phone contact attempts': 'phone_follow_up',
      'Number of home visit attempts': 'home_follow_up',
      'Number of successful contact attempts': 'successful_contact_attempts',
      'Number of patients successfully contacted and kept appointment':
        'successful_contact_attempts_kept_appointment',
      'Number of patients successfully contacted but missed appointment':
        'successful_contact_attempts_missed_appointment',
      'Number of unsuccessful contact attempts':
        'unsuccessful_contact_attempts',
      'Number of patients with NO contact attempt': 'no_contact_attempts',
      'Number of patients with NO contact attempt but kept appointment':
        'no_contact_attempts_kept_appointment',
      'Number of patients successfully contacted and wish to reschedule':
        'rescheduled_appointment',
      'Number of patients unsuccessfully contacted but kept appointment':
        'unsuccessful_kept_appointment'
    };

    this.rowData = this.rowData.map((row) => {
      const label = row.sub || row.Indicators;
      const dataKey = indicatorMap[label];
      const newCount = dataKey
        ? this.preAppointmentSummaryList[dataKey]
        : row.PatientCount;
      return {
        ...row,
        PatientCount: newCount !== undefined ? newCount : row.PatientCount
      };
    });
  }

  public subScribeToClinicLocationChange(): void {
    this.clinicDashboardCacheService
      .getCurrentClinic()
      .subscribe((currentClinic) => {
        this.locationUuids = currentClinic;
        this.getSumary();
      });
  }

  public subscribeToRouteParamsChange(): void {
    this.routeSub = this.route.parent.parent.params.subscribe((params) => {
      this.locationUuids = params['location_uuid'];
      this.clinicDashboardCacheService.setCurrentClinic(
        params['location_uuid']
      );
    });
  }
}
