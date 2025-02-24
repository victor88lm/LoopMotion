// quotation.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { QuotationService } from '../../Core/services/quotation.service';
import { FormArray } from '@angular/forms';

interface ProjectType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  included: boolean;
}

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.scss']
})
export class QuotationComponent implements OnInit {
  currentStep = 1;
  totalSteps = 4;
  quotationForm: FormGroup;

  projectTypes: ProjectType[] = [
    {
      id: 'wordpress',
      name: 'WordPress',
      icon: 'wordpress',
      description: 'Sitio web profesional con WordPress personalizado'
    },
    {
      id: 'custom',
      name: 'Desarrollo a Medida',
      icon: 'code',
      description: 'Desarrollo web completamente personalizado'
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      icon: 'shopping-cart',
      description: 'Tienda online completa con gestión de productos'
    },
    {
      id: 'redesign',
      name: 'Rediseño Web',
      icon: 'refresh',
      description: 'Actualización y mejora de tu sitio existente'
    }
  ];

  features: Feature[] = [
    {
      id: 'responsive',
      name: 'Diseño Responsive',
      description: 'Adaptable a todos los dispositivos',
      included: false
    },
    {
      id: 'seo',
      name: 'SEO Básico',
      description: 'Optimización para buscadores',
      included: false
    },
    {
      id: 'forms',
      name: 'Formularios Avanzados',
      description: 'Formularios personalizados con validaciones',
      included: false
    },
    {
      id: 'analytics',
      name: 'Google Analytics',
      description: 'Seguimiento y análisis de usuarios',
      included: false
    },
    {
      id: 'social',
      name: 'Redes Sociales',
      description: 'Integración con redes sociales',
      included: false
    },
    {
      id: 'admin',
      name: 'Panel de Administración',
      description: 'Gestión de contenido personalizada',
      included: false
    }
  ];

  budgetRanges = [
    { id: 'range1', label: '$400 - $3,000', value: '1000-3000' },
    { id: 'range2', label: '$3,000 - $5,000', value: '3000-5000' },
    { id: 'range3', label: '$5,000 - $10,000', value: '5000-10000' },
    { id: 'range4', label: 'Más de $10,000', value: '10000+' }
  ];

  timeframes = [
    { id: 'urgent', label: 'Urgente (2-3 semanas)', value: 'urgent' },
    { id: 'normal', label: 'Normal (4-6 semanas)', value: 'normal' },
    { id: 'relaxed', label: 'Flexible (6-8 semanas)', value: 'relaxed' }
  ];

  get featuresFormArray() {
    return this.quotationForm.get('projectInfo.features') as FormArray;
  }

  constructor(private fb: FormBuilder, private router: Router, private quotationService: QuotationService) {
    this.quotationForm = this.fb.group({
      // Step 1: Información Personal
      personalInfo: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        company: ['', Validators.required],
        industry: ['', Validators.required]
      }),
      // Step 2: Tipo de Proyecto
      projectInfo: this.fb.group({
        projectType: ['', Validators.required],
        description: ['', [Validators.required, Validators.minLength(50)]],
        features: this.fb.array(
          this.features.map(feature => this.fb.control(false))  // Inicializa todos como false
        )
      }),
      // Step 3: Presupuesto y Tiempo
      budgetInfo: this.fb.group({
        budget: ['', Validators.required],
        timeframe: ['', Validators.required],
        startDate: ['', Validators.required]
      }),
      // Step 4: Detalles Técnicos
      technicalInfo: this.fb.group({
        hasHosting: [false],
        hasDomain: [false],
        hasLogo: [false],
        hasContent: [false],
        additionalComments: ['']
      })
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  onSubmit() {
    if (this.quotationForm.valid) {
      // console.log(this.quotationForm.value);
    }
  }

  getStepTitle(step: number): string {
    switch (step) {
      case 1:
        return 'Información Personal';
      case 2:
        return 'Detalles del Proyecto';
      case 3:
        return 'Presupuesto y Tiempo';
      case 4:
        return 'Detalles Técnicos';
      default:
        return '';
    }
  }

  getProgressPercentage(): number {
    return ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
  }

// En el componente de cotización (quotation.component.ts)
goToSummary() {
  const formData = this.quotationForm.value;
  const featuresArray = this.featuresFormArray.value;
  
  // Verifica si al menos una característica está seleccionada
  const hasSelectedFeatures = featuresArray.some((feature: boolean) => feature);
  
  if (this.quotationForm.valid) {
    const quotationData = {
      ...formData,
      projectInfo: {
        ...formData.projectInfo,
        features: featuresArray
      }
    };

    // console.log('Selected features:', featuresArray);
    this.quotationService.setQuotationData(quotationData);
    this.router.navigate(['/cotizacion/resumen']);
  } else {
    // Marcar campos inválidos
    Object.keys(this.quotationForm.controls).forEach(key => {
      const control = this.quotationForm.get(key);
      control?.markAsTouched();
    });
  }
}

// Añade método para actualizar features
updateFeature(index: number, event: any) {
  const features = this.featuresFormArray;
  features.at(index).setValue(event.target.checked);
}
}