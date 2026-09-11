import { Component } from '@angular/core';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Header, Sidebar, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout { }
