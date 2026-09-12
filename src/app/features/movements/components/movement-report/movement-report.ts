import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule, TablePageEvent } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MainLayout } from '../../../../layout/main-layout/main-layout';
import { MovementReportResponse } from '../../models/movement.interface';
import { MovementService } from '../../services/movement.service';

type ReportFormControls = {
  initialDate: FormControl<string>;
  finalDate: FormControl<string>;
  identification: FormControl<string>;
  accountType: FormControl<string>;
};

@Component({
  selector: 'app-movement-report',
  standalone: true,
  templateUrl: './movement-report.html',
  styleUrls: ['./movement-report.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    SelectModule,
    TableModule,
    ToastModule,
    TranslatePipe,
    MainLayout,
  ],
  providers: [MessageService],
})
export class MovementReport implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly movementService = inject(MovementService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  reportForm!: FormGroup<ReportFormControls>;
  reports = signal<MovementReportResponse[]>([]);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(20);
  isLoading = signal(false);
  hasSearched = signal(false);
  readonly accountTypes = [
    { label: 'accounts.savings', value: 'AHORROS' },
    { label: 'accounts.checking', value: 'CORRIENTE' },
  ];

  ngOnInit(): void {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    this.reportForm = this.fb.group({
      initialDate: this.fb.control(this.toDateTimeLocal(monthStart), Validators.required),
      finalDate: this.fb.control(this.toDateTimeLocal(today), Validators.required),
      identification: this.fb.control('', [Validators.required, Validators.pattern(/^\d+$/)]),
      accountType: this.fb.control('', Validators.required),
    });
  }

  search(page = 0, size = this.pageSize()): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }
    const filters = this.reportForm.getRawValue();
    if (filters.initialDate > filters.finalDate) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('movements.reportDateError'),
        life: 4000,
      });
      return;
    }
    this.isLoading.set(true);
    this.movementService
      .getMovementReport(
        filters.initialDate,
        filters.finalDate,
        filters.identification,
        filters.accountType,
        page,
        size,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pageData) => {
          this.reports.set(pageData.content);
          this.totalRecords.set(pageData.totalElements);
          this.currentPage.set(pageData.number);
          this.pageSize.set(pageData.size);
          this.hasSearched.set(true);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('movements.reportError'),
            life: 5000,
          });
        },
      });
  }

  onPageChange(event: TablePageEvent): void {
    this.search(Math.floor(event.first / event.rows), event.rows);
  }
  backToMovements(): void {
    void this.router.navigate(['/movements']);
  }
  isFieldInvalid(fieldName: keyof ReportFormControls): boolean {
    const field = this.reportForm.controls[fieldName];
    return field.invalid && (field.dirty || field.touched);
  }

  private toDateTimeLocal(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  }
}
