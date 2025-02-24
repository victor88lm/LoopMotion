import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
    constructor(private router: Router) {}
  
  ngOnInit(): void {
    window.scrollTo(0, 0);
  }
  irACotizacion() {
    this.router.navigate(['/cotizacion']);
  }
}
