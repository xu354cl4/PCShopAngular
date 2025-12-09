import { Routes } from '@angular/router';

<<<<<<< HEAD
export const routes: Routes = [];
=======


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  { path: 'faqs', loadComponent: () => import('./faqs/faqs.component').then(m => m.FaqsComponent) },
  // 未來其他頁面也放這裡
];
>>>>>>> 6126e2fd8bde20481091e9c71b9197406de31e76
