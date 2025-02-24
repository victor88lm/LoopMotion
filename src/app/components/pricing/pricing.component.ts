// pricing.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface PlanFeature {
  name: string;
  description?: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  pricedos: number;
  period: 'único';
  features: PlanFeature[];
  isPopular?: boolean;
  discountPercentage?: number;
  category: ServiceCategory;
  maintenance?: boolean;
  designIncluded?: boolean;
}

interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

type ServiceCategory = 'WordPress' | 'Custom' | 'E-commerce';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
  animations: [
    trigger('fadeInUp', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(20px)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('void => *', [
        animate('600ms ease-out')
      ])
    ])
  ]
})
export class PricingComponent implements OnInit {
  readonly categories: ServiceCategory[] = ['WordPress', 'Custom', 'E-commerce'];
  selectedCategory: ServiceCategory = 'WordPress';
  selectedBillingPeriod: 'único' = 'único';

  plans: Plan[] = [
    // WordPress Plans
    {
      id: 'wp-basic',
      name: 'WordPress Básico',
      description: 'Ideal para pequeños negocios y blogs',
      price: 400,
      pricedos: 800,
      period: 'único',
      category: 'WordPress',
      features: [
        { name: 'Tema Premium Personalizado', included: true },
        { name: 'Optimización SEO Básica', included: true },
        { name: 'Formularios de Contacto', included: true },
        { name: 'Integración con Redes Sociales', included: true },
        { name: 'Responsive Design', included: true },
        { name: 'Configuración de Analytics', included: true },
        { name: 'Mantenimiento Mensual', included: false },
        { name: 'Diseño UX/UI Personalizado', included: false }
      ]
    },
    {
      id: 'wp-pro',
      name: 'WordPress Pro',
      description: 'Para negocios que buscan destacar',
      price: 800,
      pricedos: 1500,
      period: 'único',
      category: 'WordPress',
      isPopular: true,
      features: [
        { name: 'Tema Premium Personalizado', included: true },
        { name: 'Optimización SEO Avanzada', included: true },
        { name: 'Formularios Avanzados', included: true },
        { name: 'Integración con Redes Sociales', included: true },
        { name: 'Responsive Design', included: true },
        { name: 'Configuración de Analytics', included: true },
        { name: 'Mantenimiento Mensual', included: true },
        { name: 'Diseño UX/UI Personalizado', included: true }
      ]
    },
    // Custom Development Plans
    {
      id: 'custom-basic',
      name: 'Desarrollo a Medida Básico',
      description: 'Sitios web únicos y personalizados',
      price: 2000,
      pricedos: 3000,
      period: 'único',
      category: 'Custom',
      features: [
        { name: 'Diseño UX/UI en Figma', included: true },
        { name: 'Desarrollo Frontend Personalizado', included: true },
        { name: 'SEO Optimizado', included: true },
        { name: 'Panel de Administración', included: true },
        { name: 'Responsive Design', included: true },
        { name: 'Integración APIs', included: false },
        { name: 'Mantenimiento Premium', included: false },
        { name: 'Análisis de Datos Avanzado', included: false }
      ]
    },
    {
      id: 'custom-pro',
      name: 'Desarrollo a Medida Pro',
      description: 'Soluciones web empresariales completas',
      price: 4000,
      pricedos: 6000,
      period: 'único',
      category: 'Custom',
      isPopular: true,
      features: [
        { name: 'Diseño UX/UI en Figma', included: true },
        { name: 'Desarrollo Full Stack', included: true },
        { name: 'SEO Avanzado', included: true },
        { name: 'Panel de Administración Personalizado', included: true },
        { name: 'Responsive Design', included: true },
        { name: 'Integración APIs', included: true },
        { name: 'Mantenimiento Premium', included: true },
        { name: 'Análisis de Datos Avanzado', included: true }
      ]
    },
    // E-commerce Plans
    {
      id: 'ecommerce-basic',
      name: 'E-commerce Básico',
      description: 'Inicia tu tienda online',
      price: 2500,
      pricedos: 3500,
      period: 'único',
      category: 'E-commerce',
      features: [
        { name: 'Tienda WooCommerce/Shopify', included: true },
        { name: 'Hasta 100 Productos', included: true },
        { name: 'Pasarela de Pagos', included: true },
        { name: 'Gestión de Inventario', included: true },
        { name: 'Diseño Responsive', included: true },
        { name: 'SEO E-commerce', included: true },
        { name: 'Mantenimiento Básico', included: false },
        { name: 'Integraciones Avanzadas', included: false }
      ]
    },
    {
      id: 'ecommerce-pro',
      name: 'E-commerce Avanzado',
      description: 'Solución completa para grandes tiendas',
      price: 5000,
      pricedos: 7000,
      period: 'único',
      category: 'E-commerce',
      isPopular: true,
      features: [
        { name: 'Tienda Personalizada', included: true },
        { name: 'Productos Ilimitados', included: true },
        { name: 'Multi Pasarela de Pagos', included: true },
        { name: 'Gestión Avanzada de Inventario', included: true },
        { name: 'Diseño UX/UI Premium', included: true },
        { name: 'SEO E-commerce Avanzado', included: true },
        { name: 'Mantenimiento Premium', included: true },
        { name: 'Integraciones Personalizadas', included: true }
      ]
    }
  ];


  faqs: FAQ[] = [
    {
      question: "¿Cuánto tiempo toma desarrollar mi proyecto?",
      answer: "El tiempo de desarrollo varía según la complejidad del proyecto. Típicamente, los proyectos pequeños toman 2-4 semanas, mientras que los más complejos pueden llevar 2-3 meses.",
      isOpen: false
    },
    {
      question: "¿Qué incluye el soporte técnico?",
      answer: "Nuestro soporte técnico incluye mantenimiento del sitio, corrección de errores, actualizaciones de seguridad y asistencia por email durante horario laboral.",
      isOpen: false
    },
    {
      question: "¿Puedo cambiar de plan más adelante?",
      answer: "Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los ajustes en la facturación se realizarán de forma prorrateada.",
      isOpen: false
    },
    {
      question: "¿Ofrecen servicios personalizados?",
      answer: "Sí, además de nuestros planes estándar, ofrecemos soluciones personalizadas para proyectos con necesidades específicas. Contáctanos para discutir tu caso.",
      isOpen: false
    }
  ];


  constructor(private router: Router) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  getCategoryIcon(category: string): string {
    switch(category) {
      case 'WordPress':
        return 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4';
      case 'Custom':
        return 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4';
      case 'E-commerce':
        return 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z';
      default:
        return '';
    }
  }

  getAdjustedPrice(plan: Plan): number {
    return plan.price;
  }

  selectPlan() {
this.router.navigate(['/cotizacion']);
  }

  getFilteredPlans() {
    return this.plans.filter(plan => plan.category === this.selectedCategory);
  }

  ircontact() {
    this.router.navigate(['/contact']);
  }
}