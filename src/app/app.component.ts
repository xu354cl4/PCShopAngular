import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginpageComponent } from "./loginpage/loginpage.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginpageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'PcShop';
}
