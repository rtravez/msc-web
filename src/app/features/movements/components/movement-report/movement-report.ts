import { DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule, TablePageEvent } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { MovementReportResponse } from '../../models/movement.interface';
import { MovementService } from '../../services/movement.service';

export interface ReportFormControls {
  initialDate: FormControl<string>;
  finalDate: FormControl<string>;
  identification: FormControl<string>;
  accountType: FormControl<string | null>;
}

const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const initialDate = control.get('initialDate')?.value as string | undefined;
  const finalDate = control.get('finalDate')?.value as string | undefined;

  if (!initialDate || !finalDate) return null;

  return initialDate <= finalDate ? null : { dateRange: true };
};

@Component({
  selector: 'app-movement-report',
  templateUrl: './movement-report.html',
  styleUrls: ['./movement-report.scss'],
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    SelectModule,
    TableModule,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovementReport implements OnInit {
  reportForm!: FormGroup<ReportFormControls>;
  reports = signal<MovementReportResponse[]>([]);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  isLoading = signal(false);
  hasSearched = signal(false);
  readonly accountTypes = [
    { label: 'accounts.savings', value: 'AHORROS' },
    { label: 'accounts.checking', value: 'CORRIENTE' },
  ];
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly movementService = inject(MovementService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    this.reportForm = this.fb.group(
      {
        initialDate: this.fb.control(this.toDateTimeLocal(monthStart), Validators.required),
        finalDate: this.fb.control(this.toDateTimeLocal(today), Validators.required),
        identification: this.fb.control('', [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.maxLength(10),
          Validators.minLength(10),
        ]),
        accountType: this.fb.control<string | null>(null),
      },
      { validators: dateRangeValidator },
    );
  }

  search(page = 0, size = this.pageSize()): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      if (this.reportForm.hasError('dateRange')) {
        this.showDateRangeError();
      }
      return;
    }
    const filters = this.reportForm.getRawValue();
    this.isLoading.set(true);
    this.movementService
      .getMovementReport(
        filters.initialDate,
        filters.finalDate,
        filters.identification,
        filters.accountType ?? '',
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

  isDateRangeInvalid(): boolean {
    return this.reportForm.hasError('dateRange') && this.reportForm.touched;
  }

  getFieldError(fieldName: keyof ReportFormControls): string {
    const field = this.reportForm.controls[fieldName];
    if (!field.errors) return '';

    if (field.errors['required']) return this.translate.instant('movements.form.required');
    if (field.errors['minlength'])
      return this.translate.instant('movements.form.min', {
        value: field.errors['minlength'].requiredLength,
      });
    if (field.errors['maxlength'])
      return this.translate.instant('movements.form.max', {
        value: field.errors['maxlength'].requiredLength,
      });
    if (field.errors['pattern']) return this.translate.instant('movements.form.pattern');
    if (field.errors['min'])
      return this.translate.instant('movements.form.minValue', { value: field.errors['min'].min });
    if (field.errors['max'])
      return this.translate.instant('movements.form.maxValue', { value: field.errors['max'].max });

    return this.translate.instant('movements.form.invalid');
  }

  private toDateTimeLocal(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  }

  private showDateRangeError(): void {
    this.messageService.add({
      severity: 'warn',
      summary: this.translate.instant('common.error'),
      detail: this.translate.instant('movements.reportDateError'),
      life: 4000,
    });
  }
}
