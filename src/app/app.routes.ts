import { Routes } from '@angular/router';

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
    path: 'loginpage', loadComponent: () => import('./loginpage/loginpage.component').then(m => m.LoginpageComponent)
  },
  {
    path: 'order-list', loadComponent: () => import('./order-list/order-list.component').then(m => m.OrderListComponent)
  },
  {
    path: 'cart', loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent)
  },
  // 未來其他頁面也放這裡
];
