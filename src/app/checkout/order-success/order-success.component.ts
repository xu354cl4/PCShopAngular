import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-order-success',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule],
    templateUrl: './order-success.component.html',
    styleUrl: './order-success.component.css'
})
export class OrderSuccessComponent implements OnInit {
    orderId: string | null = null;

    constructor(private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.orderId = this.route.snapshot.paramMap.get('orderId');
    }
}
