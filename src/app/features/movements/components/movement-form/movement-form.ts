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
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, switchMap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MainLayout } from '../../../../layout/main-layout/main-layout';
import { AccountService } from '../../../accounts/services/account.service';
import { Movement, MovementRequest } from '../../models/movement.interface';
import { MovementService } from '../../services/movement.service';

export interface MovementFormControls {
  movementId: FormControl<number | null>;
  movementType: FormControl<'D' | 'R'>;
  amount: FormControl<number | null>;
  accountNumber: FormControl<number | null>;
}

@Component({
  selector: 'app-movement-form',
  standalone: true,
  templateUrl: './movement-form.html',
  styleUrls: ['./movement-form.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    ProgressSpinnerModule,
    SelectModule,
    ToastModule,
    TranslatePipe,
    MainLayout,
  ],
  providers: [MessageService],
})
export class MovementForm implements OnInit {
  movementForm!: FormGroup<MovementFormControls>;
  readonly movementTypes = [
    { label: 'movements.debit', value: 'D' as const },
    { label: 'movements.withdrawal', value: 'R' as const },
  ];
  isEditMode = false;
  isSubmitting = false;
  isLoading = signal(false);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly movementService = inject(MovementService);
  private readonly accountService = inject(AccountService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const movementId = this.parseId(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = movementId !== null;
    this.initializeForm();
    if (movementId !== null) this.loadMovement(movementId);
    else if (this.route.snapshot.paramMap.has('id')) this.returnToMovementsWithError();
  }

  isFieldInvalid(fieldName: keyof MovementFormControls): boolean {
    const field = this.movementForm.controls[fieldName];
    return field.invalid && (field.dirty || field.touched);
  }

  getFieldError(fieldName: keyof MovementFormControls): string {
    const errors = this.movementForm.controls[fieldName].errors;
    if (!errors) return '';
    if (errors['required']) return this.translate.instant('movements.form.required');
    if (errors['min'])
      return this.translate.instant('movements.form.minValue', { value: errors['min'].min });
    return this.translate.instant('movements.form.invalid');
  }

  onSubmit(): void {
    if (this.movementForm.invalid) {
      this.movementForm.markAllAsTouched();
      return;
    }
    const formValue = this.movementForm.getRawValue();
    const movementId = formValue.movementId;
    const request: MovementRequest = {
      movementType: formValue.movementType,
      movementValue: formValue.movementType === 'D' ? formValue.amount! : -formValue.amount!,
      accountNumber: formValue.accountNumber!,
    };
    this.isSubmitting = true;
    const operation$ =
      this.isEditMode && movementId !== null
        ? this.movementService.updateMovement(movementId, { ...request, movementId })
        : this.movementService.createMovement(request);
    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('common.success'),
          detail: this.translate.instant(
            this.isEditMode ? 'movements.updated' : 'movements.created',
          ),
          life: 2500,
        });
        void this.router.navigate(['/movements']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: error.error?.detail ?? this.translate.instant('movements.saveError'),
          life: 5000,
        });
      },
    });
  }

  onCancel(): void {
    void this.router.navigate(['/movements']);
  }

  private parseId(id: string | null): number | null {
    if (!id || !/^\d+$/.test(id)) return null;
    const parsedId = Number(id);
    return Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private initializeForm(): void {
    this.movementForm = this.fb.group({
      movementId: new FormControl<number | null>(null),
      movementType: this.fb.control<'D' | 'R'>('D', Validators.required),
      amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
      accountNumber: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    });
  }

  private loadMovement(movementId: number): void {
    this.isLoading.set(true);
    this.movementService
      .getMovementById(movementId)
      .pipe(
        switchMap((movement) =>
          this.accountService
            .getAccountById(movement.accountId)
            .pipe(map((account) => ({ movement, account }))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ movement, account }) => {
          this.populateForm(movement, account.accountNumber);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.returnToMovementsWithError();
        },
      });
  }

  private populateForm(movement: Movement, accountNumber: number): void {
    this.movementForm.patchValue({
      movementId: movement.movementId,
      movementType: movement.movementType,
      amount: Math.abs(movement.movementValue),
      accountNumber,
    });
  }

  private returnToMovementsWithError(): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('common.error'),
      detail: this.translate.instant('movements.loadError'),
      life: 5000,
    });
    void this.router.navigate(['/movements']);
  }
}
