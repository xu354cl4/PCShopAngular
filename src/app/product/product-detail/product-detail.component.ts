import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  imageUrl: string;
  description?: string;
  stock?: number;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  productId!: number;
  product!: Product;
  quantity = 1;

  products: Product[] = [
    {
      id: 1,
      name: 'M75 Sport Watch',
      category: 'Watches',
      price: 320.99,
      rating: 4,
      imageUrl: 'assets/images/products/watch.jpg',
      description: '高品質運動手錶，支援心率監測、防水設計，續航最長 48 小時。',
      stock: 10
    },
    {
      id: 2,
      name: 'iPhone 12 Pro Max',
      category: 'Phones',
      price: 259.99,
      rating: 5,
      imageUrl: 'assets/images/products/iphone.jpg',
      description: '搭載 A14 仿生晶片，超清三鏡頭，支援夜拍與 5G。',
      stock: 5
    },
    {
      id: 3,
      name: 'Gaming Headset',
      category: 'Headphones',
      price: 89.99,
      rating: 4,
      imageUrl: 'assets/images/products/headset.jpg',
      description: '沉浸式環繞音效，降噪麥克風，適合長時間遊戲。',
      stock: 15
    },
    {
      id: 4,
      name: 'Smart TV 55"',
      category: 'TV',
      price: 799.99,
      rating: 5,
      imageUrl: 'assets/images/products/tv.jpg',
      description: '55 吋 4K UHD 智慧電視，支援 Netflix、YouTube。',
      stock: 6
    },
    {
      id: 5,
      name: 'Bluetooth Speaker',
      category: 'Speaker',
      price: 49.99,
      rating: 4,
      imageUrl: 'assets/images/products/speaker.jpg',
      description: '輕巧便攜藍牙喇叭，音量大、低音清晰。',
      stock: 20
    },
    {
      id: 6,
      name: 'Ultra HD Camera',
      category: 'Camera',
      price: 450.0,
      rating: 5,
      imageUrl: 'assets/images/products/camera.jpg',
      description: '高畫質相機，支援 4K 錄影與專業級影像處理。',
      stock: 8
    },
    {
      id: 7,
      name: 'Wireless Headphones',
      category: 'Headphones',
      price: 150.0,
      rating: 5,
      imageUrl: 'assets/images/products/headset2.jpg',
      description: '真無線耳機，主動降噪，音質清晰。',
      stock: 12
    },
    {
      id: 8,
      name: 'Mini Bluetooth Speaker',
      category: 'Speaker',
      price: 70.0,
      rating: 4,
      imageUrl: 'assets/images/products/speaker2.jpg',
      description: '迷你設計，戶外攜帶方便，續航力佳。',
      stock: 18
    },
    {
      id: 9,
      name: 'Apple MacBook Air',
      category: 'Laptop',
      price: 899.0,
      rating: 5,
      imageUrl: 'assets/images/products/laptop.jpg',
      description: '輕薄筆電，效能強勁，適合工作與學習。',
      stock: 7
    },

    /* ===== 以下重複商品給不同庫存 ===== */

    {
      id: 10,
      name: 'M75 Sport Watch',
      category: 'Watches',
      price: 320.99,
      rating: 4,
      imageUrl: 'assets/images/products/watch.jpg',
      description: '智慧運動手錶，支援多種運動模式。',
      stock: 9
    },
    {
      id: 11,
      name: 'M75 Sport Watch',
      category: 'Watches',
      price: 320.99,
      rating: 4,
      imageUrl: 'assets/images/products/watch.jpg',
      description: '防水運動錶，適合日常與戶外活動。',
      stock: 14
    },
    {
      id: 12,
      name: 'iPhone 12 Pro Max',
      category: 'Phones',
      price: 259.99,
      rating: 5,
      imageUrl: 'assets/images/products/iphone.jpg',
      description: '高效能手機，優秀拍照與顯示效果。',
      stock: 6
    },
    {
      id: 13,
      name: 'Gaming Headset',
      category: 'Headphones',
      price: 89.99,
      rating: 4,
      imageUrl: 'assets/images/products/headset.jpg',
      description: '專為電競打造，音效定位精準。',
      stock: 16
    },
    {
      id: 14,
      name: 'Smart TV 55"',
      category: 'TV',
      price: 799.99,
      rating: 5,
      imageUrl: 'assets/images/products/tv.jpg',
      description: '大螢幕視覺享受，家庭娛樂首選。',
      stock: 4
    },
    {
      id: 15,
      name: 'Bluetooth Speaker',
      category: 'Speaker',
      price: 49.99,
      rating: 4,
      imageUrl: 'assets/images/products/speaker.jpg',
      description: '清晰音質，適合居家與戶外使用。',
      stock: 22
    },
    {
      id: 16,
      name: 'Ultra HD Camera',
      category: 'Camera',
      price: 450.0,
      rating: 5,
      imageUrl: 'assets/images/products/camera.jpg',
      description: '專業攝影相機，畫面細節清楚。',
      stock: 5
    },
    {
      id: 17,
      name: 'Wireless Headphones',
      category: 'Headphones',
      price: 150.0,
      rating: 5,
      imageUrl: 'assets/images/products/headset2.jpg',
      description: '舒適配戴，長時間聆聽不疲勞。',
      stock: 11
    },
    {
      id: 18,
      name: 'Mini Bluetooth Speaker',
      category: 'Speaker',
      price: 70.0,
      rating: 4,
      imageUrl: 'assets/images/products/speaker2.jpg',
      description: '小巧設計，音量表現出色。',
      stock: 19
    },
    {
      id: 19,
      name: 'Apple MacBook Air',
      category: 'Laptop',
      price: 899.0,
      rating: 5,
      imageUrl: 'assets/images/products/laptop.jpg',
      description: '效能與續航兼具的輕薄筆電。',
      stock: 6
    },

    {
      id: 20,
      name: 'M75 Sport Watch',
      category: 'Watches',
      price: 320.99,
      rating: 4,
      imageUrl: 'assets/images/products/watch.jpg',
      description: '智慧運動錶，健康監測功能完整。',
      stock: 13
    },
    {
      id: 21,
      name: 'M75 Sport Watch',
      category: 'Watches',
      price: 320.99,
      rating: 4,
      imageUrl: 'assets/images/products/watch.jpg',
      description: '日常與運動皆適合配戴。',
      stock: 10
    },
    {
      id: 22,
      name: 'iPhone 12 Pro Max',
      category: 'Phones',
      price: 259.99,
      rating: 5,
      imageUrl: 'assets/images/products/iphone.jpg',
      description: '流暢效能與高品質拍照體驗。',
      stock: 4
    },
    {
      id: 23,
      name: 'Gaming Headset',
      category: 'Headphones',
      price: 89.99,
      rating: 4,
      imageUrl: 'assets/images/products/headset.jpg',
      description: '清晰語音與震撼音效。',
      stock: 17
    },
    {
      id: 24,
      name: 'Smart TV 55"',
      category: 'TV',
      price: 799.99,
      rating: 5,
      imageUrl: 'assets/images/products/tv.jpg',
      description: '智慧系統操作簡單，畫質優秀。',
      stock: 5
    },
    {
      id: 25,
      name: 'Bluetooth Speaker',
      category: 'Speaker',
      price: 49.99,
      rating: 4,
      imageUrl: 'assets/images/products/speaker.jpg',
      description: '高 CP 值藍牙喇叭。',
      stock: 21
    },
    {
      id: 26,
      name: 'Ultra HD Camera',
      category: 'Camera',
      price: 450.0,
      rating: 5,
      imageUrl: 'assets/images/products/camera.jpg',
      description: '適合攝影愛好者的高畫質相機。',
      stock: 7
    },
    {
      id: 27,
      name: 'Wireless Headphones',
      category: 'Headphones',
      price: 150.0,
      rating: 5,
      imageUrl: 'assets/images/products/headset2.jpg',
      description: '無線設計，自由聆聽。',
      stock: 9
    },
    {
      id: 28,
      name: 'Mini Bluetooth Speaker',
      category: 'Speaker',
      price: 70.0,
      rating: 4,
      imageUrl: 'assets/images/products/speaker2.jpg',
      description: '小體積，大音量。',
      stock: 16
    },
    {
      id: 29,
      name: 'Apple MacBook Air',
      category: 'Laptop',
      price: 899.0,
      rating: 5,
      imageUrl: 'assets/images/products/laptop.jpg',
      description: '輕薄便攜，高效工作。',
      stock: 5
    },
    {
      id: 30,
      name: 'M75 Sport Watch',
      category: 'Watches',
      price: 320.99,
      rating: 4,
      imageUrl: 'assets/images/products/watch.jpg',
      description: '適合日常與運動使用的智慧手錶。',
      stock: 12
    }
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct();
  }

  loadProduct(): void {
    this.product = this.products.find(p => p.id === this.productId) || this.products[0];
  }

  addToCart(): void {
    if (this.quantity > (this.product.stock || 0)) {
      alert('庫存不足');
      return;
    }
    alert(`已加入購物車: ${this.product.name} x ${this.quantity}`);
    console.log('加入購物車', { productId: this.product.id, quantity: this.quantity });
  }
}
