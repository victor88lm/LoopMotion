// quotation.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private collectionName = 'quotations';

  constructor(private firestore: AngularFirestore) {}

  private quotationData = new BehaviorSubject<any>(null);
  currentQuotation = this.quotationData.asObservable();

  setQuotationData(data: any) {
    console.log('Setting quotation data:', data); // Para debug
    this.quotationData.next(data);
  }

  getQuotationData() {
    const data = this.quotationData.value;
    console.log('Getting quotation data:', data); // Para debug
    return data;
  }

  clearQuotationData() {
    this.quotationData.next(null);
  }

    // Método para guardar la cotización
    saveQuotation(quotationData: any): Promise<any> {
      return this.firestore.collection(this.collectionName).add(quotationData);
    }
  
    // Método para obtener cotizaciones (opcional)
    getQuotations(): Observable<any[]> {
      return this.firestore.collection(this.collectionName).valueChanges();
    }
}