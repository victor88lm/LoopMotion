// quotation-summary.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { QuotationService } from '../../Core/services/quotation.service';
import Swal from 'sweetalert2';

//enviar cotización por correo
import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';
import { EmailService } from '../../Core/services/email.service'; // Importar el servicio de email



@Component({
  selector: 'app-quotation-summary',
  templateUrl: './quotation-summary.component.html'
})
export class QuotationSummaryComponent implements OnInit {
  quotationData: any;
  loading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private quotationService: QuotationService,
    private emailService: EmailService // Inyectar servicio de Email
  ) {}


  ngOnInit() {
    this.quotationData = this.quotationService.getQuotationData();
    // console.log('Received data:', this.quotationData);
  
    if (!this.quotationData) {
      console.error("No quotation data found!");
      this.router.navigate(['/cotizacion']);
      return;
    }
  
    // Asegurar que `details` sea un array
    if (!Array.isArray(this.quotationData.details)) {
      console.warn("quotationData.details no es un array, inicializando como vacío.");
      this.quotationData.details = [];
    }
  
    window.scrollTo(0, 0);
  }
  

  editQuotation() {
    this.router.navigate(['/cotizacion']);
  }
  submitQuotation() {
    this.loading = true;
  
    this.quotationService.saveQuotation(this.quotationData)
      .then(() => {
        // console.log("📩 Enviando correo de confirmación...");
  
        const toEmail = this.quotationData.personalInfo?.email?.trim();
        const clientName = this.quotationData.personalInfo?.name?.trim() || "Cliente";
  
        // console.log("📩 Correo destinatario:", toEmail);
  
        if (!toEmail || !toEmail.includes("@")) {
          console.error("❌ Error: No se encontró un correo válido para el destinatario.");
          Swal.fire({
            title: '<span class="text-red-700 font-semibold">No se pudo enviar el correo</span>',
            html: '<p class="text-red-600">No se encontró una dirección de correo válida para el destinatario.</p>' +
                  '<p class="text-sm text-red-500 mt-2">Verifica la información de contacto e intenta nuevamente.</p>',
            icon: "error",
            confirmButtonText: '<i class="fas fa-times-circle mr-2"></i>Entendido',
            background: "#fff1f2",
            color: "#991b1b",
            iconColor: "#dc2626",
            confirmButtonColor: "#b91c1c",
            backdrop: `rgba(153, 27, 27, 0.4)`,
            customClass: {
              popup: 'rounded-xl border border-red-300 shadow-lg',
              title: 'text-xl border-b border-red-100 pb-3',
              htmlContainer: 'py-4',
              confirmButton: 'rounded-lg text-sm px-5 py-2.5 font-medium'
            },
            timer: 5000,
            timerProgressBar: true,
            showConfirmButton: true,
          });
          this.loading = false;
          return;
        }
  
        // Aquí se asegura de enviar la estructura esperada por el servicio
        const emailParams = {
          personalInfo: {
            name: clientName,
            email: toEmail,
          },
          budgetInfo: {
            total: this.quotationData.budgetInfo?.total || 'Pendiente',
          },
        };
  
        this.emailService.sendEmail(toEmail, emailParams)
          .then(() => {
            Swal.fire({
              title: '<span class="text-blue-800 font-semibold">¡Cotización enviada con éxito!</span>',
              html: '<div class="space-y-4">' +
                    '<p class="text-blue-700">Tu cotización ha sido procesada y enviada correctamente.</p>' +
                    '<p class="text-sm text-blue-600">Hemos enviado un correo de confirmación a <strong>' + toEmail + '</strong></p>' +
                    '<p class="text-xs text-blue-500 mt-3">Revisa tu bandeja de entrada o la carpeta de correo no deseado (spam).</p>' +
                    '</div>',
              imageUrl: 'http://loopmotion.tech/favicon.ico', // Reemplaza con la URL de tu imagen
              imageWidth: 120,
              imageHeight: 120,
              imageAlt: 'Correo enviado',
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
          })
          .catch(error => {
            console.error("❌ Error al enviar el correo:", error);
            Swal.fire({
              title: '<span class="text-red-700 font-semibold">Error al enviar el correo</span>',
              html: '<div class="space-y-3">' +
                    '<p class="text-red-600">Hubo un problema al enviar la cotización por correo.</p>' +
                    '<p class="text-sm text-red-500 mt-2">La cotización fue guardada pero no pudimos enviar la confirmación.</p>' +
                    '<details class="text-xs text-left text-red-400 mt-3 cursor-pointer">' +
                    '<summary>Detalles técnicos</summary>' +
                    '<code class="block mt-2 p-2 bg-red-50 rounded">' + (error?.message || 'Error de comunicación con el servidor') + '</code>' +
                    '</details>' +
                    '</div>',
              icon: "error",
              confirmButtonText: '<i class="fas fa-sync mr-2"></i>Reintentar',
              showCancelButton: true,
              cancelButtonText: 'Cerrar',
              background: "#fff1f2",
              color: "#991b1b",
              iconColor: "#dc2626",
              confirmButtonColor: "#b91c1c",
              cancelButtonColor: "#6b7280",
              backdrop: `rgba(153, 27, 27, 0.4)`,
              customClass: {
                popup: 'rounded-xl border border-red-300 shadow-lg',
                title: 'text-xl border-b border-red-100 pb-3',
                htmlContainer: 'py-4 text-left',
                confirmButton: 'rounded-lg text-sm px-5 py-2.5 font-medium',
                cancelButton: 'rounded-lg text-sm px-5 py-2.5 font-medium'
              },
              timer: 7000,
              timerProgressBar: true,
              showConfirmButton: true,
            });
          })
          .finally(() => {
            this.loading = false;
          });
      })
      .catch(error => {
        console.error('❌ Error al guardar la cotización:', error);
        Swal.fire({
          title: '<span class="text-red-700 font-semibold">Error al guardar la cotización</span>',
          html: '<div class="space-y-3">' +
                '<p class="text-red-600">No pudimos procesar tu solicitud de cotización.</p>' +
                '<p class="text-sm text-red-500 mt-2">Verifica tu conexión a internet e intenta nuevamente.</p>' +
                '<details class="text-xs text-left text-red-400 mt-3 cursor-pointer">' +
                '<summary>Detalles técnicos</summary>' +
                '<code class="block mt-2 p-2 bg-red-50 rounded">' + (error?.message || 'Error desconocido') + '</code>' +
                '</details>' +
                '</div>',
          icon: "error",
          confirmButtonText: '<i class="fas fa-redo mr-2"></i>Intentar nuevamente',
          background: "#fff1f2",
          color: "#991b1b",
          iconColor: "#dc2626",
          confirmButtonColor: "#b91c1c",
          backdrop: `rgba(153, 27, 27, 0.4)`,
          customClass: {
            popup: 'rounded-xl border border-red-300 shadow-lg',
            title: 'text-xl border-b border-red-100 pb-3',
            htmlContainer: 'py-4 text-left',
            confirmButton: 'rounded-lg text-sm px-5 py-2.5 font-medium'
          },
          timer: 6000,
          timerProgressBar: true,
          showConfirmButton: true,
        });
        this.loading = false;
      });
  }
  
  getFeaturesList(): string[] {
    if (!this.quotationData?.projectInfo?.features) {
      return [];
    }
  
    const features = [
      'Diseño Responsive',
      'SEO Básico',
      'Formularios Avanzados',
      'Google Analytics',
      'Redes Sociales',
      'Panel de Administración'
    ];
  
    const selectedFeatures = this.quotationData.projectInfo.features
      .map((isSelected: boolean, index: number) => {
        return isSelected === true ? features[index] : null;
      })
      .filter((feature: string | null) => feature !== null);
  
    return selectedFeatures;
  }
  private getFeaturesMap(): { [key: number]: string } {
    return {
      0: 'Diseño Responsive',
      1: 'SEO Básico',
      2: 'Formularios Avanzados',
      3: 'Google Analytics',
      4: 'Redes Sociales',
      5: 'Panel de Administración'
    };
  }

  getIndustryName(industryValue: string): string {
    const industries = {
      'technology': 'Tecnología',
      'retail': 'Comercio',
      'services': 'Servicios',
      'education': 'Educación',
      'healthcare': 'Salud',
      'other': 'Otro'
    };
    return industries[industryValue as keyof typeof industries] || industryValue;
  }
  getProjectTypeName(type: string): string {
    const projectTypes: { [key: string]: string } = {
      'wordpress': 'WordPress',
      'custom': 'Desarrollo a Medida',
      'ecommerce': 'E-commerce',
      'redesign': 'Rediseño Web'
    };
    return projectTypes[type] || type;
  }
}