import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MainLayout } from '../../../../layout/main-layout/main-layout';
import { AccountRequest } from '../../models/account.interface';
import { AccountService } from '../../services/account.service';

type AccountFormControls = {
    accountId: FormControl<number | null>;
    accountNumber: FormControl<number | null>;
    accountType: FormControl<string>;
    initialBalance: FormControl<number | null>;
    identification: FormControl<string>;
};

@Component({
    selector: 'app-account-form',
    standalone: true,
    templateUrl: './account-form.html',
    styleUrls: ['./account-form.scss'],
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputNumberModule, InputTextModule,
        ProgressSpinnerModule, SelectModule, ToastModule, TranslatePipe, MainLayout],
    providers: [MessageService],
})
export class AccountForm implements OnInit {
    accountForm!: FormGroup<AccountFormControls>;
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly accountService = inject(AccountService);
    private readonly messageService = inject(MessageService);
    private readonly translate = inject(TranslateService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    readonly accountTypes = [
        { label: 'accounts.savings', value: 'AHORROS' },
        { label: 'accounts.checking', value: 'CORRIENTE' },
    ];
    isEditMode = false;
    isSubmitting = false;
    isLoading = signal(false);
    private accountId: number | null = null;

    ngOnInit(): void {
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            const accountId = this.parseId(params.get('id'));
            this.isEditMode = accountId !== null;
            this.accountId = accountId;
            this.initializeForm();
            if (accountId !== null) this.loadAccount(accountId);
            else if (params.has('id')) this.returnToAccountsWithError();
        });
    }

    private parseId(id: string | null): number | null {
        if (!id || !/^\d+$/.test(id)) return null;
        const parsedId = Number(id);
        return Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null;
    }

    private initializeForm(): void {
        this.accountForm = this.fb.group({
            accountId: new FormControl<number | null>(null),
            accountNumber: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
            accountType: this.fb.control('', [Validators.required, Validators.maxLength(11)]),
            initialBalance: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
            identification: this.fb.control('', [Validators.required, Validators.pattern(/^\d+$/), Validators.maxLength(10)]),
        });
    }

    private loadAccount(accountId: number): void {
        this.isLoading.set(true);
        this.accountService.getAccountById(accountId).subscribe({
            next: (account) => {
                this.accountForm.patchValue({
                    accountId: account.accountId,
                    accountNumber: account.accountNumber,
                    accountType: account.accountType,
                    initialBalance: account.initialBalance,
                });
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.returnToAccountsWithError();
            },
        });
    }

    private returnToAccountsWithError(): void {
        this.messageService.add({
            severity: 'error', summary: this.translate.instant('common.error'),
            detail: this.translate.instant('accounts.loadError'), life: 5000
        });
        void this.router.navigate(['/accounts']);
    }

    isFieldInvalid(fieldName: keyof AccountFormControls): boolean {
        const field = this.accountForm.controls[fieldName];
        return field.invalid && (field.dirty || field.touched);
    }

    getFieldError(fieldName: keyof AccountFormControls): string {
        const errors = this.accountForm.controls[fieldName].errors;
        if (!errors) return '';
        if (errors['required']) return this.translate.instant('accounts.form.required');
        if (errors['pattern']) return this.translate.instant('accounts.form.pattern');
        if (errors['maxlength']) return this.translate.instant('accounts.form.max', { value: errors['maxlength'].requiredLength });
        if (errors['min']) return this.translate.instant('accounts.form.minValue', { value: errors['min'].min });
        return this.translate.instant('accounts.form.invalid');
    }

    onSubmit(): void {
        if (this.accountForm.invalid) {
            this.accountForm.markAllAsTouched();
            return;
        }
        const value = this.accountForm.getRawValue();
        const request: AccountRequest = {
            accountNumber: value.accountNumber!,
            accountType: value.accountType,
            initialBalance: value.initialBalance!,
            identification: value.identification,
        };
        if (this.isEditMode && this.accountId !== null) request.accountId = this.accountId;

        this.isSubmitting = true;
        const operation$ = this.isEditMode && this.accountId !== null
            ? this.accountService.updateAccount(this.accountId, request)
            : this.accountService.createAccount(request);
        operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.messageService.add({
                    severity: 'success', summary: this.translate.instant('common.success'),
                    detail: this.translate.instant(this.isEditMode ? 'accounts.updated' : 'accounts.created'), life: 3000
                });
                void this.router.navigate(['/accounts']);
            },
            error: (error) => {
                this.isSubmitting = false;
                this.messageService.add({
                    severity: 'error', summary: this.translate.instant('common.error'),
                    detail: error.error?.message ?? this.translate.instant('accounts.saveError'), life: 5000
                });
            },
        });
    }

    onCancel(): void {
        void this.router.navigate(['/accounts']);
    }
}