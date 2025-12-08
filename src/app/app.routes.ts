import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      // 未來其他頁面也放這裡
      // { path: 'product/:id', component: ProductDetailComponent },
    ]
  },

];
