import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { Account } from '../../models/account.interface';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.html',
  styleUrls: ['./account-list.scss'],
  imports: [
    DecimalPipe,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountList implements OnInit {
  accounts = signal<Account[]>([]);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  isLoading = signal(false);
  isSubmitting = signal(false);
  private readonly accountService = inject(AccountService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorHandler = inject(ErrorHandlerService);

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(page = this.currentPage(), size = this.pageSize()): void {
    this.isLoading.set(true);
    this.accountService
      .getAllAccounts(page, size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pageData) => {
          this.accounts.set(pageData.content);
          this.totalRecords.set(pageData.totalElements);
          this.currentPage.set(pageData.number);
          this.pageSize.set(pageData.size);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('accounts.loadError'),
            life: 5000,
          });
          this.errorHandler.log(error, 'Error loading accounts');
        },
      });
  }

  onPageChange(event: TablePageEvent): void {
    this.loadAccounts(Math.floor(event.first / event.rows), event.rows);
  }

  showNewAccount(): void {
    void this.router.navigateByUrl('/accounts/new');
  }

  editAccount(account: Account): void {
    void this.router.navigate(['/accounts/edit', account.accountId]);
  }

  confirmDelete(account: Account): void {
    this.confirmationService.confirm({
      message: this.translate.instant('accounts.confirmDelete', { number: account.accountNumber }),
      header: this.translate.instant('accounts.confirmTitle'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteAccount(account);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: this.translate.instant('accounts.cancelled'),
          detail: this.translate.instant('accounts.deleteCancelled'),
          life: 2000,
        });
      },
    });
  }

  private deleteAccount(account: Account): void {
    this.isSubmitting.set(true);
    this.accountService
      .deleteAccount(account.accountId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant('accounts.deleted'),
            life: 3000,
          });
          this.loadAccounts();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorHandler.log(error, 'Error deleting account');
          const errorMessage = this.errorHandler.getMessage(
            error,
            this.translate.instant('accounts.deleteError'),
          );

          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: errorMessage,
            life: 5000,
          });
        },
      });
  }
}
