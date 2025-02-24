import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, take } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AngularFireAuth,
    private router: Router
  ) {}

  canActivate() {
    return this.auth.authState.pipe(
      take(1),
      map(user => {
        if (user && user.emailVerified) {
          return true;
        } else {
          Swal.fire({
            title: '<span class="text-red-800 font-semibold">Acceso denegado</span>',
            html: '<div class="space-y-4"><p class="text-red-700">Debes iniciar sesión con una cuenta verificada para acceder al dashboard.</p></div>',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#dc2626'
          });
          
          this.router.navigate(['/loop-admin']);
          return false;
        }
      })
    );
  }
}