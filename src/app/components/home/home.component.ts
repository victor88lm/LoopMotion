import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router) { }


  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  faq1 = false;
  faq2 = false;
  faq3 = false;
  faq4 = false;
  faq5 = false;

  irACotizacion() {
    this.router.navigate(['/cotizacion']);
  }
}
