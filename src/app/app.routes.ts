import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './product/product-list/product-list.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'faqs', loadComponent: () => import('./faqs/faqs.component').then(m => m.FaqsComponent)
  },
  {
    path: 'login', loadComponent: () => import('./loginpage/loginpage.component').then(m => m.LoginpageComponent)
  },
  // 未來其他頁面也放這裡
  {
    path: 'products', title: 'Products', component: ProductListComponent,
  },

];
