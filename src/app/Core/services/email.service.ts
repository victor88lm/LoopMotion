import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

interface QuotationData {
  personalInfo?: {
    name?: string;
    email?: string;
  };
  budgetInfo?: {
    total: string | number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private userId = 'GQJN-BZ9XaCd48f8_';
  private serviceId = 'service_fah2pzb';
  private templateId = 'template_3ezv374';

  sendEmail(toEmail: string, quotationData: QuotationData) {
    if (!toEmail || !toEmail.includes("@")) {
      console.error('❌ Error: Dirección de correo no válida.');
      return Promise.reject('El destinatario del correo es obligatorio y debe ser válido.');
    }
  
    if (!quotationData) {
      console.error('❌ Error: quotationData no es válido.');
      return Promise.reject('Los datos de la cotización son inválidos.');
    }
  
    const templateParams = {
      to_email: toEmail, // 🔹 Asegurar que EmailJS recibe esta clave exacta
      to_name: quotationData.personalInfo?.name || 'Cliente Anónimo',
      from_email: quotationData.personalInfo?.email || 'Sin correo',
      quotation_amount: quotationData.budgetInfo?.total || 'Pendiente',
    };
    
    console.log("📩 Enviando datos a EmailJS:", templateParams);
    
    return emailjs
      .send(this.serviceId, this.templateId, templateParams, this.userId)
      .then(response => {
        console.log('✅ Correo enviado con éxito:', response);
        return response;
      })
      .catch(error => {
        console.error('❌ Error al enviar el correo:', error);
        return Promise.reject(error);
      });
  }
}
