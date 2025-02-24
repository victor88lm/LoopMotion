import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FirebaseService } from '../../Core/services/firebase.service';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  contacts: any[] = [];
  quotations: any[] = [];
  currentView: 'dashboard' | 'contacts' | 'quotations' | 'quotation-detail' = 'dashboard';
  selectedQuotation: any = null;
  isSidebarOpen = false;
  windowWidth: number = 0;
  searchText: string = '';

  userName: string | null = null;
  userEmail: string | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async logout() {
    try {
      await this.auth.signOut();
      // Mostrar mensaje de éxito
      Swal.fire({
        title: '<span class="text-blue-800 font-semibold">¡Hasta pronto!</span>',
        html: '<div class="space-y-4"><p class="text-blue-700">Has cerrado sesión correctamente.</p></div>',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#1e40af',
        timer: 2000,
        timerProgressBar: true
      }).then(() => {
        // Redirigir al login
        this.router.navigate(['/loop-admin']);
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Swal.fire({
        title: '<span class="text-red-800 font-semibold">Error</span>',
        html: '<div class="space-y-4"><p class="text-red-700">Ocurrió un error al cerrar sesión.</p></div>',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc2626'
      });
    }
  }

  ngOnInit() {
    // Cargar datos del usuario
    this.auth.user.subscribe((user: any) => {
      if (user) {
        this.userEmail = user.email;
        // Obtener datos adicionales del usuario desde Firestore
        this.firestore.collection('users').doc(user.uid).get().subscribe(
          (doc: any) => {
            if (doc.exists) {
              const userData = doc.data() as any;
              this.userName = userData.name;
            }
          },
          (error: Error) => console.error('Error al obtener datos del usuario:', error)
        );
      }
    });

    // ...existing code...
    this.loadData();
    
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth = window.innerWidth;
    }
  }

  loadData() {
    this.firebaseService.getContacts().subscribe(data => {
      this.contacts = data;
    });

    this.firebaseService.getQuotations().subscribe(data => {
      this.quotations = data;
    });
  }

  changeView(view: 'dashboard' | 'contacts' | 'quotations') {
    window.scrollTo(0, 0);
    this.currentView = view;
    this.isSidebarOpen = false;  // Cierra el menú
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  showQuotationDetail(quotation: any) {
    window.scrollTo(0, 0);
    this.selectedQuotation = quotation;
    this.currentView = 'quotation-detail';
    if (this.windowWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  goBack() {
    if (this.currentView === 'quotation-detail') {
      this.currentView = 'quotations';
    } else {
      this.currentView = 'dashboard';
    }
    this.selectedQuotation = null;
  }

  showConfirmModal = false;
  confirmAction: 'approve' | 'reject' | null = null;
  showConfirmation(action: 'approve' | 'reject') {
    this.confirmAction = action;
    this.showConfirmModal = true;
  }

  cancelConfirmation() {
    this.showConfirmModal = false;
    this.confirmAction = null;
  }

  approveQuotation() {
 
  }
  
  rejectQuotation() {
   
  }
  

  showNotification(message: string, type: 'success' | 'error' = 'success') {
    // Implementa aquí tu lógica de notificación
  }
  filteredContacts() {
    return this.contacts.filter(contact =>
        contact.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        contact.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
        contact.message.toLowerCase().includes(this.searchText.toLowerCase())
    );
}
}
