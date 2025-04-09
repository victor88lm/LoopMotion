import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ServicesComponent } from './components/services/services.component';
import { AboutComponent } from './components/about/about.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { QuotationComponent } from './components/quotation/quotation.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { QuotationSummaryComponent } from './components/quotation-summary/quotation-summary.component';
import { QuotationService } from './Core/services/quotation.service';
import { ContactFormComponent } from './components/contact-form/contact-form.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationComponent } from './components/notification/notification.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { LoginComponent } from './admin/login/login.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { FirebaseService } from './Core/services/firebase.service';

// Firebase imports (versión compat)
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { environment } from '../environments/environment';
import { AuthGuard } from './Core/guards/auth.guard';
import { FaqComponent } from './components/faq/faq.component';
import { FundadoresComponent } from './components/fundadores/fundadores.component';
import { DesarrollowebComponent } from './components/desarrolloweb/desarrolloweb.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    FooterComponent,
    ServicesComponent,
    AboutComponent,
    PricingComponent,
    QuotationComponent,
    QuotationSummaryComponent,
    ContactFormComponent,
    TermsAndConditionsComponent,
    NotificationComponent,
    PortfolioComponent,
    LoginComponent,
    DashboardComponent,
    FaqComponent,
    FundadoresComponent,
    DesarrollowebComponent,
    ProjectDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    FormsModule,
    
    // Firebase Modules
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule
  ],
  providers: [
    QuotationService,
    FirebaseService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }