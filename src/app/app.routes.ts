import { Routes } from '@angular/router';



export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  { path: 'faqs', loadComponent: () => import('./faqs/faqs.component').then(m => m.FaqsComponent) },
  // 未來其他頁面也放這裡
];
