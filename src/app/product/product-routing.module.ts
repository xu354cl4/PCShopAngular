import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from '../product/product-list/product-list.component';
import { ProductDetailComponent } from '../product/product-detail/product-detail.component';

const routes: Routes = [

  { path: '', component: ProductListComponent },       // /products
  { path: ':id', component: ProductDetailComponent }   // /products/9

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
