import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { User } from '../../models/user.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss'],
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList implements OnInit {
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  isLoading = signal(false);
  isSubmitting = signal(false);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorHandler = inject(ErrorHandlerService);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page = this.currentPage(), size = this.pageSize()): void {
    this.isLoading.set(true);
    this.userService
      .getAllUsers(page, size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pageData) => {
          this.users.set(pageData.content);
          this.filteredUsers.set(pageData.content);
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
            detail: this.translate.instant('users.loadError'),
            life: 5000,
          });
          this.errorHandler.log(error, 'Error loading users');
        },
      });
  }

  onPageChange(event: TablePageEvent): void {
    const page = Math.floor(event.first / event.rows);
    const size = event.rows;
    this.loadUsers(page, size);
  }

  editUser(user: User): void {
    void this.router.navigate(['/users/edit', user.userId]);
  }

  confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: this.translate.instant('users.confirmDelete', { username: user.username }),
      header: this.translate.instant('users.confirmTitle'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUser(user);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: this.translate.instant('users.cancelled'),
          detail: this.translate.instant('users.deleteCancelled'),
          life: 2000,
        });
      },
    });
  }

  deleteUser(user: User): void {
    this.isSubmitting.set(true);
    this.userService
      .deleteUser(user.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant('users.deleted'),
            life: 3000,
          });
          this.loadUsers();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorHandler.log(error, 'Error deleting user');
          const errorMessage = this.errorHandler.getMessage(
            error,
            this.translate.instant('users.deleteError'),
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

  showNewUser(): void {
    void this.router.navigateByUrl('/users/new');
  }
}
