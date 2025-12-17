import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductRoutingModule } from './product-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, ProductRoutingModule]
})
export class ProductModule { }
