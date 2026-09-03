import {
  Component,
  OnInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  inject,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { User, UserRequest } from '../../models/user.interface';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

/**
 * User form component for creating and editing users
 * Reusable component with reactive forms and validation
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
    TextareaModule,
    ToastModule,
    TranslatePipe,
  ],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss'],
  providers: [MessageService, ConfirmationService, DialogService],
})
export class UserForm implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Input() isEditMode = false;
  @Input() isLoading = false;
  @Output() submitted = new EventEmitter<UserRequest>();
  @Output() cancelled = new EventEmitter<void>();

  userForm!: FormGroup;
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  readonly genderOptions = [
    { label: 'users.form.male', value: 'M' },
    { label: 'users.form.female', value: 'F' },
    { label: 'users.form.other', value: 'O' }
  ];

  readonly statusOptions = [
    { label: 'users.active', value: true },
    { label: 'users.inactive', value: false }
  ];

  ngOnInit() {
    this.initializeForm();
    if (this.isEditMode && this.user) {
      this.populateForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isEditMode'] || changes['user']) {
      this.initializeForm();
      if (this.isEditMode && this.user) {
        this.populateForm();
      }
    }
  }

  private initializeForm() {
    this.userForm = this.fb.group({
      userId: [null],
      identification: [
        {
          value: '',
          disabled: this.isEditMode
        },
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.maxLength(10)
        ]
      ],
      username: [
        '',
        [
          Validators.required,
          Validators.maxLength(20)
        ]
      ],
      password: [
        '',
        this.isEditMode
          ? [Validators.minLength(8), Validators.maxLength(60)]
          : [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(60)
          ]
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(255)
        ]
      ],
      lastname: [
        '',
        [
          Validators.required,
          Validators.maxLength(255)
        ]
      ],
      address: [
        '',
        [Validators.maxLength(255)]
      ],
      telephone: [
        '',
        [
          Validators.pattern(/^\d{10}$/)
        ]
      ],
      gender: [null],
      age: [
        null,
        [
          Validators.min(0),
          Validators.max(150)
        ]
      ],
      status: [true]
    });
  }

  private populateForm() {
    if (this.user) {
      this.userForm.patchValue({
        userId: this.user.userId,
        identification: this.user.identification,
        username: this.user.username,
        name: this.user.name,
        lastname: this.user.lastname,
        address: this.user.address,
        telephone: this.user.telephone,
        gender: this.user.gender,
        age: this.user.age,
        status: this.user.status
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field?.errors) return '';

    if (field.errors['required']) return this.translate.instant('users.form.required');
    if (field.errors['minlength']) return this.translate.instant('users.form.min', { value: field.errors['minlength'].requiredLength });
    if (field.errors['maxlength']) return this.translate.instant('users.form.max', { value: field.errors['maxlength'].requiredLength });
    if (field.errors['pattern']) return this.translate.instant('users.form.pattern');
    if (field.errors['min']) return this.translate.instant('users.form.minValue', { value: field.errors['min'].min });
    if (field.errors['max']) return this.translate.instant('users.form.maxValue', { value: field.errors['max'].max });

    return this.translate.instant('users.form.invalid');
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      const userRequest: UserRequest = {
        userId: formValue.userId,
        username: formValue.username,
        password: formValue.password,
        identification: formValue.identification,
        name: formValue.name,
        lastname: formValue.lastname,
        address: formValue.address,
        telephone: formValue.telephone,
        gender: formValue.gender,
        age: formValue.age,
        status: formValue.status
      };

      this.submitted.emit(userRequest);
    }
  }

  onCancel() {
    this.cancelled.emit();
  }
}
