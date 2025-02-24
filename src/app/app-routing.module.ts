import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ServicesComponent } from './components/services/services.component';
import { AboutComponent } from './components/about/about.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { QuotationComponent } from './components/quotation/quotation.component';
import { QuotationSummaryComponent } from './components/quotation-summary/quotation-summary.component';
import { ContactFormComponent } from './components/contact-form/contact-form.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { LoginComponent } from './admin/login/login.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { requiresAuth: true }
  },
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'cotizacion', component: QuotationComponent },
  { 
    path: 'cotizacion/resumen', 
    component: QuotationSummaryComponent 
  },
  { path: 'contact', component: ContactFormComponent },
  { path: 'terms', component: TermsAndConditionsComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'loop-admin', component: LoginComponent },
  // Ruta wildcard para manejar rutas no encontradas
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }