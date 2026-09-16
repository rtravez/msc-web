import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [RouterLink, TranslatePipe],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Forbidden {}
