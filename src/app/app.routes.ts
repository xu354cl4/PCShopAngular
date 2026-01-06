
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
    path: 'ad', loadComponent: () => import('./pages/admin/admin-ads/admin-ads.component').then(m => m.AdminAdsComponent)
  },
  {
    path: 'adplay', loadComponent: () => import('./pages/ads-playground/ads-playground.component').then(m => m.AdsPlaygroundComponent)
  },
  {
    path: 'adstat', loadComponent: () => import('./pages/admin/admin-ads-stats/admin-ads-stats.component').then(m => m.AdminAdsStatsComponent)
  },
  {
    path: 'adlayout', loadComponent: () => import('./pages/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent)
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
  {
    path: 'order-success/:orderId', loadComponent: () => import('./checkout/order-success/order-success.component').then(m => m.OrderSuccessComponent),
    title: '訂單完成'
  },
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
    path: 'adminpage/:view', loadComponent: () => import('./adminpage/adminpage.component').then(m => m.AdminpageComponent),
    title: '會員中心'
  },
  //要加click
  {
    path: '**',
    redirectTo: ''
  }
];
