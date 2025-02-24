// Core/services/firebase.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private firestore: AngularFirestore) {}

  getContacts(): Observable<any[]> {
    return this.firestore.collection('contactos').valueChanges();
  }

  getQuotations(): Observable<any[]> {
    return this.firestore.collection('quotations').valueChanges();
  }

  updateQuotationStatus(id: string, status: 'approved' | 'rejected') {
    // Verificar si el id es válido
    if (!id) {
      console.error("El ID proporcionado es inválido o undefined");
      return;
    }
  
    const docRef = this.firestore.collection('quotations').doc(id);
  
    return docRef.get().toPromise().then(doc => {
      // Verificamos si el documento existe
      if (doc && doc.exists) {
        // Si el documento existe, lo actualizamos
        return docRef.update({
          status: status,            // Añadimos el campo 'status'
          statusDate: new Date()     // También añadimos la fecha en que se actualizó el estado
        });
      } else {
        console.error("El documento con ID: " + id + " no existe.");
        throw new Error('Documento no encontrado');
      }
    }).catch(error => {
      console.error("Error actualizando el estado de la cotización: ", error);
    });
  }
  
  
  
}