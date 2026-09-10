import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User, UserRequest } from '../../models/user.interface';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { MainLayout } from '../../../../layout/main-layout/main-layout';


@Component({
  selector: 'app-user-list',
  standalone: true,
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss'],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    InputTextModule,
    ToolbarModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    TranslatePipe,
    MainLayout
  ],
  providers: [MessageService, ConfirmationService],
})
export class UserList implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  selectedUser = signal<User | null>(null);

  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(page = this.currentPage(), size = this.pageSize()) {
    this.isLoading.set(true);
    this.userService
      .getAllUsers(page, size)
      .pipe(takeUntil(this.destroy$))
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
          console.error('Error loading users:', error);
        },
      });
  }

  onPageChange(event: any) {
    const page = event.page ?? 0;
    const size = event.rows ?? this.pageSize();
    this.loadUsers(page, size);
  }

  editUser(user: User) {
    this.isEditMode.set(true);
    this.selectedUser.set({ ...user });
    void this.router.navigate(['/users/edit', user.userId], {
      state: { user: { ...user } },
    });
  }
  

  confirmDelete(user: User) {
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

  deleteUser(user: User) {
    this.isSubmitting.set(true);
    this.userService
      .deleteUser(user.userId)
      .pipe(takeUntil(this.destroy$))
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
          console.error('Error deleting user:', error);

          const errorMessage =
            error.error?.errors?.[0] || error.error?.message || 'Error al eliminar el usuario';

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
    this.isEditMode.set(false);
    this.selectedUser.set(null);
    void this.router.navigateByUrl('/users/new');
  }


  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
