import { ResetpageComponent } from './resetpage/resetpage.component';
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
    path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'order-list', loadComponent: () => import('./order-list/order-list.component').then(m => m.OrderListComponent)
  },
  {
    path: 'cart', loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent),
    title: '我的購物車'
  },
  {
    path: 'checkout', loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent),
    title: '結帳作業'
  },

  // 未來其他頁面也放這裡
  {
    path: 'products',
    loadChildren: () =>
      import('./product/product.module').then(m => m.ProductModule)
  },
  {
    path: 'forgot-password', loadComponent: () => import('./resetpage/resetpage.component').then(m => m.ResetpageComponent),
    title: '忘記密碼Page'
  },
  {
    path: 'reset-password', loadComponent: () => import('./resetpage/resetpage.component').then(m => m.ResetpageComponent),
    title: '忘記密碼Page'
  },
  {
    path: 'verify-email', loadComponent: () => import('./resetpage/resetpage.component').then(m => m.ResetpageComponent),
    title: '忘記密碼Page'
  },
 {
    path: 'membercenter', loadComponent: () => import('./membercenter/membercenter.component').then(m => m.MembercenterComponent),
    title: '忘記密碼Page'
  },
  {
    path: '**',
    redirectTo: ''
  }

];
