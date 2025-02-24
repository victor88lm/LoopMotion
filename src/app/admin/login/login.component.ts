import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  animations: [
    trigger('formAnimation', [
      state('login', style({ transform: 'translateX(0)', opacity: 1 })),
      state('register', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('login => register', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out')
      ]),
      transition('register => login', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out')
      ])
    ]),
    trigger('backgroundAnimation', [
      transition('login <=> register', [
        animate('500ms ease-in-out')
      ])
    ]),
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class LoginComponent {

    loginForm: FormGroup;
    showPassword = false;
    isRegistering = false;
    loading = false;
  
    constructor(
      private fb: FormBuilder,
      private router: Router,
      private auth: AngularFireAuth,
      private firestore: AngularFirestore
    ) {
      this.loginForm = this.fb.group({
        name: [''],
        email: ['', [
          Validators.required, 
          Validators.email,
          this.loopmotionEmailValidator
        ]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
    }
  
    // Validador personalizado para correos @loopmotion.tech
    loopmotionEmailValidator(control: AbstractControl): ValidationErrors | null {
      if (!control.value) return null;
      
      const email = control.value.toLowerCase();
      return email.endsWith('@loopmotion.tech') ? null : { invalidDomain: true };
    }
  
    async onSubmit() {
      if (this.loginForm.valid) {
        this.loading = true;
        const { email, password, name } = this.loginForm.value;
  
        try {
          if (this.isRegistering) {
            // Registro de usuario
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
  
            if (userCredential.user) {
              // Enviar email de verificación
              await userCredential.user.sendEmailVerification();
  
              // Guardar información adicional en Firestore
              await this.firestore.collection('users').doc(userCredential.user.uid).set({
                name,
                email,
                createdAt: new Date(),
                role: 'user',
                emailVerified: false
              });
  
              this.showAlert(
                '¡Registro exitoso!',
                'Se ha enviado un correo de verificación a tu dirección de email. Por favor, verifica tu correo antes de iniciar sesión.',
                'success',
                false
              );
  
              // Redirigir al login
              this.isRegistering = false;
            }
          } else {
            // Inicio de sesión
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            
            if (userCredential.user) {
              if (!userCredential.user.emailVerified) {
                // Si el email no está verificado, mostrar mensaje y enviar nuevo correo
                await userCredential.user.sendEmailVerification();
                this.showAlert(
                  'Email no verificado',
                  'Tu correo electrónico aún no ha sido verificado. Se ha enviado un nuevo correo de verificación.',
                  'error',
                  false
                );
                // Cerrar sesión ya que no está verificado
                await this.auth.signOut();
                return;
              }
  
              // Si el email está verificado, proceder con el login
              this.showAlert(
                '¡Bienvenido!',
                'Has iniciado sesión correctamente.',
                'success',
                true
              );
            }
          }
        } catch (error: any) {
          let errorMessage = 'Ha ocurrido un error. Por favor, intenta nuevamente.';
          
          switch (error.code) {
            case 'auth/email-already-in-use':
              errorMessage = 'Este correo electrónico ya está registrado.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'El correo electrónico no es válido.';
              break;
            case 'auth/operation-not-allowed':
              errorMessage = 'Operación no permitida.';
              break;
            case 'auth/weak-password':
              errorMessage = 'La contraseña es demasiado débil.';
              break;
            case 'auth/user-not-found':
              errorMessage = 'Usuario no encontrado.';
              break;
            case 'auth/wrong-password':
              errorMessage = 'Contraseña incorrecta.';
              break;
          }
  
          this.showAlert('Error', errorMessage, 'error');
        } finally {
          this.loading = false;
        }
      } else if (this.loginForm.get('email')?.errors?.['invalidDomain']) {
        this.showAlert(
          'Error',
          'Solo se permiten correos electrónicos con dominio @loopmotion.tech',
          'error'
        );
      }
    }
  
    showAlert(title: string, message: string, icon: 'success' | 'error', redirect: boolean = false) {
      Swal.fire({
        title: `<span class="text-${icon === 'success' ? 'blue' : 'red'}-800 font-semibold">${title}</span>`,
        html: `<div class="space-y-4"><p class="text-${icon === 'success' ? 'blue' : 'red'}-700">${message}</p></div>`,
        icon,
        confirmButtonText: 'Continuar',
        confirmButtonColor: icon === 'success' ? '#1e40af' : '#dc2626',
        timer: icon === 'success' ? 3000 : undefined,
        timerProgressBar: icon === 'success',
        showConfirmButton: true
      }).then(() => {
        if (redirect) {
          this.router.navigate(['/dashboard']);
        }
      });
    }
  toggleForm() {
    this.isRegistering = !this.isRegistering;
    this.loginForm.reset();

    // Actualizar validadores
    if (this.isRegistering) {
      this.loginForm.get('name')?.setValidators([Validators.required]);
    } else {
      this.loginForm.get('name')?.clearValidators();
    }
    this.loginForm.get('name')?.updateValueAndValidity();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}