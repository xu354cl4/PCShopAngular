

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
    path: 'adsback', loadComponent: () => import('./ads-back/ads-back.component').then(m => m.AdsBackComponent)
  },
  {
    path: 'adsfront', loadComponent: () => import('./ads-front/ads-front.component').then(m => m.AdsFrontComponent)
  },
  {
    path: 'faqsback', loadComponent: () => import('./faqs-back/faqs-back.component').then(m => m.FaqsBackComponent)
  },
  {
    path: 'loginpage', loadComponent: () => import('./loginpage/loginpage.component').then(m => m.LoginpageComponent)
  },
  {
    path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verify-email', loadComponent: () => import('./Memberpages/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
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
    path: 'products', loadChildren: () => import('./product/product.module').then(m => m.ProductModule)
  },
  {
    path: 'forgot-password', loadComponent: () => import('./resetpage/resetpage.component').then(m => m.ResetpageComponent),
    title: '忘記密碼'
  },
  {
    path: 'reset-password', loadComponent: () => import('./resetpage/resetpage.component').then(m => m.ResetpageComponent),
    title: '密碼重設'
  },
  {
    path: 'membercenter', loadComponent: () => import('./membercenter/membercenter.component').then(m => m.MembercenterComponent),
    title: '會員中心'
  },
  {
    path: 'adminpage', loadComponent: () => import('./adminpage/adminpage.component').then(m => m.AdminpageComponent),
    title: '會員中心'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
