import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MainLayout } from '../../layout/main-layout/main-layout';

@Component({
  standalone: true,
  imports: [RouterLink, TranslatePipe, MainLayout],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
