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
import { UserForm } from '../user-form/user-form';

/**
 * User list component with CRUD operations
 * Displays users in a p-table with create, edit, and delete functionality
 * PrimeNG 22 migration: Updated to use p-button, p-tag, and improved table features
 */
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
    UserForm,
    IconFieldModule,
    InputIconModule,
    TranslatePipe,
  ],
  providers: [MessageService, ConfirmationService],
})
export class UserList implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  showFormDialog = signal(false);
  isEditMode = signal(false);
  selectedUser = signal<User | null>(null);
  searchValue = '';

  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.userService
      .getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.users.set(data);
          this.filteredUsers.set(data);
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

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();

    if (!searchTerm) {
      this.filteredUsers.set(this.users());
      return;
    }

    const filtered = this.users().filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.lastname.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm) ||
        user.identification.toLowerCase().includes(searchTerm),
    );

    this.filteredUsers.set(filtered);
  }

  showNewUserDialog() {
    this.isEditMode.set(false);
    this.selectedUser.set(null);
    this.showFormDialog.set(true);
  }

  editUser(user: User) {
    this.isEditMode.set(true);
    this.selectedUser.set({ ...user });
    this.showFormDialog.set(true);
  }

  closeDialog() {
    this.showFormDialog.set(false);
    this.selectedUser.set(null);
  }

  onUserFormSubmitted(userRequest: UserRequest) {
    this.isSubmitting.set(true);

    const operation$ = this.isEditMode()
      ? this.userService.updateUser(userRequest)
      : this.userService.createUser(userRequest);

    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.closeDialog();
        this.messageService.add({
          severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant(this.isEditMode() ? 'users.updated' : 'users.created'),
          life: 3000,
        });
        this.loadUsers();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error saving user:', error);

        const errorMessage =
          error.error?.errors?.[0] || error.error?.message || 'Error al guardar el usuario';

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: errorMessage,
          life: 5000,
        });
      },
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
}
