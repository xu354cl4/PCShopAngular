import { Component } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { RouterOutlet } from "@angular/router";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GamehomeComponent } from '../gamehome/gamehome.component';
import { CommonModule } from '@angular/common';
import { FaqsComponent } from "../faqs/faqs.component";
import { HomeComponent } from "../home/home.component";


@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatDialogModule, // ← 很重要！一定要加

  ]
})
export class LayoutComponent {

}

