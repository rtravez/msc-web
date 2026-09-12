import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule, TablePageEvent } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MainLayout } from '../../../../layout/main-layout/main-layout';
import { Movement } from '../../models/movement.interface';
import { MovementService } from '../../services/movement.service';

@Component({
  selector: 'app-movement-list',
  standalone: true,
  templateUrl: './movement-list.html',
  styleUrls: ['./movement-list.scss'],
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    ProgressSpinnerModule,
    TranslatePipe,
    MainLayout,
  ],
  providers: [MessageService, ConfirmationService],
})
export class MovementList implements OnInit {
  movements = signal<Movement[]>([]);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(20);
  isLoading = signal(false);
  isSubmitting = signal(false);
  private readonly movementService = inject(MovementService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(page = this.currentPage(), size = this.pageSize()): void {
    this.isLoading.set(true);
    this.movementService
      .getAllMovements(page, size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pageData) => {
          this.movements.set(pageData.content);
          this.totalRecords.set(pageData.totalElements);
          this.currentPage.set(pageData.number);
          this.pageSize.set(pageData.size);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('movements.loadError'),
            life: 5000,
          });
        },
      });
  }

  onPageChange(event: TablePageEvent): void {
    this.loadMovements(Math.floor(event.first / event.rows), event.rows);
  }

  showNewMovement(): void {
    void this.router.navigateByUrl('/movements/new');
  }

  showReport(): void {
    void this.router.navigateByUrl('/movements/reports');
  }

  editMovement(movement: Movement): void {
    void this.router.navigate(['/movements/edit', movement.movementId]);
  }

  confirmDelete(movement: Movement): void {
    this.confirmationService.confirm({
      message: this.translate.instant('movements.confirmDelete'),
      header: this.translate.instant('movements.confirmTitle'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteMovement(movement),
    });
  }

  private deleteMovement(movement: Movement): void {
    this.isSubmitting.set(true);
    this.movementService
      .deleteMovement(movement.movementId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant('movements.deleted'),
            life: 3000,
          });
          this.loadMovements();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: error.error?.detail ?? this.translate.instant('movements.deleteError'),
            life: 5000,
          });
        },
      });
  }
}
