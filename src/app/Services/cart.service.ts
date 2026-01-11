import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap, of } from 'rxjs';
import { AuthStateService } from './auth-state.service';

export interface CartItem {
    id: number;
    productId: number;
    name: string;
    spec: string;
    price: number;
    quantity: number;
    imageUrl: string;
    selected: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiUrl = 'https://localhost:7001/api/Cart';
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
    cartItems$ = this.cartItemsSubject.asObservable();

    constructor(private http: HttpClient, private authState: AuthStateService) {
        this.authState.user$.subscribe(user => {
            if (user) {
                this.loadCart();
            } else {
                this.cartItemsSubject.next([]);
            }
        });
    }

    loadCart(): void {
        this.http.get<CartItem[]>(this.apiUrl).subscribe({
            next: (data) => {
                const rawItems = Array.isArray(data) ? data : [];
                const processedItems = rawItems.map(item => ({
                    ...item,
                    imageUrl: item.imageUrl
                        ? (item.imageUrl.startsWith('http') ? item.imageUrl : `https://localhost:7001${item.imageUrl}`)
                        : 'https://localhost:7001/images/products/noimage.jpg',
                    selected: item.selected ?? false
                }));
                this.cartItemsSubject.next(processedItems);
            },
            error: (err) => {
                console.error('載入購物車失敗', err);
            }
        });
    }

    updateQty(cartItemId: number, quantity: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/Update`, { cartItemId, quantity }).pipe(
            tap(() => this.loadCart())
        );
    }

    addToCart(skuid: number, quantity: number): Observable<any> {
        const token = localStorage.getItem('token');
        return this.http.post(`${this.apiUrl}/add`, { skuid, quantity }, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).pipe(
            tap(() => this.loadCart())
        );
    }

    removeItem(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/Delete/${id}`).pipe(
            tap(() => this.loadCart())
        );
    }

    get totalItems(): number {
        return this.cartItemsSubject.value.reduce((acc, item) => acc + item.quantity, 0);
    }

    get totalAmount(): number {
        return this.cartItemsSubject.value.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }
}
