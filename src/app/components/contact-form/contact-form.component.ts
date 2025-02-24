// contact-form.component.ts
import { Component } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.css',
  animations: [
    trigger('buttonState', [
      state('valid', style({
        backgroundColor: 'green',
        transform: 'scale(1.05)'
      })),
      state('invalid', style({
        backgroundColor: 'red',
        transform: 'scale(1)'
      })),
      transition('valid <=> invalid', [
        animate('0.3s ease-in-out')
      ]),
    ])
  ]
})
export class ContactFormComponent {
  contactForm: FormGroup;

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  constructor(private fb: FormBuilder, private firestore: AngularFirestore) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required],
    });
  }

  async onSubmit() {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;
      try {
        await this.firestore.collection('contactos').add(formData);
        
        // SweetAlert notification
        Swal.fire({
          title: '<span class="text-blue-800 font-semibold">¡Mensaje enviado con éxito!</span>',
          html: '<div class="space-y-4">' +
                '<p class="text-blue-700">Tu mensaje ha sido enviado correctamente.</p>' +
                '<p class="text-sm text-blue-600">Te contactaremos pronto a <strong>' + formData.email + '</strong></p>' +
                '<p class="text-xs text-blue-500 mt-3">Nos pondremos en contacto contigo lo antes posible.</p>' +
                '</div>',
          imageUrl: 'http://loopmotion.tech/favicon.ico', // Reemplaza con la URL de tu imagen
          imageWidth: 120,
          imageHeight: 120,
          imageAlt: 'Mensaje enviado',
          background: '#f0f9ff',
          color: '#1e3a8a',
          confirmButtonText: '<i class="fas fa-check-circle mr-2"></i>Continuar',
          confirmButtonColor: '#1e40af',
          backdrop: `rgba(30, 58, 138, 0.2)`,
          customClass: {
            popup: 'rounded-xl border border-blue-200 shadow-lg',
            title: 'text-xl border-b border-blue-100 pb-3',
            image: 'mt-4 mx-auto',
            htmlContainer: 'py-4',
            confirmButton: 'rounded-lg text-sm px-5 py-2.5 font-medium hover:bg-blue-800 transition-colors'
          },
          timer: 6000,
          timerProgressBar: true,
          showConfirmButton: true,
        });

        this.contactForm.reset();
      } catch (error) {
        console.error('Error al guardar en Firestore:', error);
        
        // Error SweetAlert
        Swal.fire({
          title: '<span class="text-red-800 font-semibold">Error al enviar el mensaje</span>',
          html: '<div class="space-y-4">' +
                '<p class="text-red-700">Ha ocurrido un error al procesar tu mensaje.</p>' +
                '<p class="text-sm text-red-600">Por favor, intenta nuevamente más tarde.</p>' +
                '</div>',
          icon: 'error',
          background: '#fef2f2',
          color: '#991b1b',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc2626',
          customClass: {
            popup: 'rounded-xl border border-red-200 shadow-lg',
          }
        });
      }
    } else {
      // Form validation error SweetAlert
      Swal.fire({
        title: '<span class="text-yellow-800 font-semibold">Formulario incompleto</span>',
        html: '<div class="space-y-4">' +
              '<p class="text-yellow-700">Por favor, completa todos los campos requeridos.</p>' +
              '</div>',
        icon: 'warning',
        background: '#fefce8',
        color: '#854d0e',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ca8a04',
        customClass: {
          popup: 'rounded-xl border border-yellow-200 shadow-lg',
        }
      });
    }
  }
}