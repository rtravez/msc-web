import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { User, UserRequest } from '../../models/user.interface';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { MainLayout } from '../../../../layout/main-layout/main-layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type UserFormControls = {
  userId: FormControl<number | null>;
  identification: FormControl<string>;
  username: FormControl<string>;
  password: FormControl<string>;
  name: FormControl<string>;
  lastname: FormControl<string>;
  address: FormControl<string>;
  telephone: FormControl<string>;
  gender: FormControl<string | null>;
  age: FormControl<number | null>;
  status: FormControl<boolean>;
};

/**
 * User form component for creating and editing users
 * Route component for creating and editing users with reactive forms and validation
 */
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ToastModule,
    TooltipModule,
    ProgressSpinnerModule,
    TranslatePipe,
    MainLayout,
  ],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss'],
  providers: [MessageService],
})
export class UserForm implements OnInit {
  userForm!: FormGroup<UserFormControls>;
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  isSubmitting = false;
  isEditMode = false;
  isLoading = signal(false);

  readonly genderOptions = [
    { label: 'users.form.male', value: 'M' },
    { label: 'users.form.female', value: 'F' },
    { label: 'users.form.other', value: 'O' },
  ];

  readonly statusOptions = [
    { label: 'users.active', value: true },
    { label: 'users.inactive', value: false },
  ];

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const userId = this.getUserIdFromRoute(params.get('id'));
      this.isEditMode = userId !== null;
      this.initializeForm();

      if (userId !== null) {
        this.loadUser(userId);
      } else if (params.has('id')) {
        this.returnToUsersWithLoadError();
      }
    });
  }

  private getUserIdFromRoute(id: string | null): number | null {
    if (!id || !/^\d+$/.test(id)) return null;

    const userId = Number(id);
    return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
  }

  private loadUser(userId: number): void {
    this.isLoading.set(true);
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.populateForm(user);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.returnToUsersWithLoadError();
      },
    });
  }

  private returnToUsersWithLoadError(): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('common.error'),
      detail: this.translate.instant('users.loadError'),
      life: 5000,
    });
    void this.router.navigate(['/users']);
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      userId: new FormControl<number | null>(null),
      identification: this.fb.control({ value: '', disabled: this.isEditMode }, [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.maxLength(10),
      ]),
      username: ['', [Validators.required, Validators.maxLength(20)]],
      password: [
        '',
        this.isEditMode
          ? [Validators.minLength(8), Validators.maxLength(60)]
          : [Validators.required, Validators.minLength(8), Validators.maxLength(60)],
      ],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      lastname: ['', [Validators.required, Validators.maxLength(255)]],
      address: ['', [Validators.maxLength(255)]],
      telephone: ['', [Validators.pattern(/^\d{10}$/)]],
      gender: new FormControl<string | null>(null),
      age: new FormControl<number | null>(null, [Validators.min(0), Validators.max(150)]),
      status: [true],
    });
  }

  private populateForm(user: User): void {
    this.userForm.patchValue({
      userId: user.userId,
      identification: user.identification,
      username: user.username,
      name: user.name,
      lastname: user.lastname,
      address: user.address,
      telephone: user.telephone,
      gender: user.gender,
      age: user.age,
      status: user.status,
    });
  }

  isFieldInvalid(fieldName: keyof UserFormControls): boolean {
    const field = this.userForm.controls[fieldName];
    return field.invalid && (field.dirty || field.touched);
  }

  getFieldError(fieldName: keyof UserFormControls): string {
    const field = this.userForm.controls[fieldName];
    if (!field.errors) return '';

    if (field.errors['required']) return this.translate.instant('users.form.required');
    if (field.errors['minlength'])
      return this.translate.instant('users.form.min', {
        value: field.errors['minlength'].requiredLength,
      });
    if (field.errors['maxlength'])
      return this.translate.instant('users.form.max', {
        value: field.errors['maxlength'].requiredLength,
      });
    if (field.errors['pattern']) return this.translate.instant('users.form.pattern');
    if (field.errors['min'])
      return this.translate.instant('users.form.minValue', { value: field.errors['min'].min });
    if (field.errors['max'])
      return this.translate.instant('users.form.maxValue', { value: field.errors['max'].max });

    return this.translate.instant('users.form.invalid');
  }

  onSubmit(): void {
    if (this.isEditMode && this.userForm.getRawValue().userId == null) {
      return;
    }

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();
    const request: UserRequest = {
      username: formValue.username,
      identification: formValue.identification,
      name: formValue.name,
      lastname: formValue.lastname,
      address: formValue.address,
      telephone: formValue.telephone,
      gender: formValue.gender ?? undefined,
      age: formValue.age ?? undefined,
      status: formValue.status,
    };

    if (this.isEditMode && formValue.userId != null) {
      request.userId = formValue.userId;
    }

    if (!this.isEditMode || formValue.password) {
      request.password = formValue.password;
    }

    this.isSubmitting = true;
    const operation$ =
      this.isEditMode && formValue.userId != null
        ? this.userService.updateUser(formValue.userId, request)
        : this.userService.createUser(request);

    operation$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('common.success'),
          detail: this.translate.instant(this.isEditMode ? 'users.updated' : 'users.created'),
          life: 3000,
        });
        //void this.router.navigate(['/users']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error saving user:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail:
            error.error?.errors?.[0] ??
            error.error?.detail ??
            this.translate.instant('users.saveError'),
          life: 5000,
        });
      },
    });
  }

  onCancel(): void {
    void this.router.navigate(['/users']);
  }
}
