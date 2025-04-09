import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// Interfaces para los modelos
export interface TeamMember {
  name: string;
  role: string;
  avatarUrl?: string;
  profileUrl?: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  position?: string;
  company?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  images?: string[];
  technologies: string[];
  demoUrl: string;
  repoUrl?: string;
  category: string;
  featured?: boolean;
  date?: string;
  team?: TeamMember[];
  challenges?: string[];
  solutions?: string[];
  testimonial?: Testimonial;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Datos de los proyectos (única fuente de datos)
  private projects: Project[] = [
    {
      id: 1,
      title: 'Escuela Profesional de Dibujo S.C.',
      description: 'Plataforma para escuelas de dibujo que gestiona cursos, inscripciones en línea y seguimiento académico. Incluye panel para docentes, exhibición de trabajos y detalles sobre la institución y sus ubicaciones.',
      imageUrl: 'img/EPD_sitioweb.avif',
      images: [
        'img/EPD_sitioweb.avif',
        'img/EPD_detail1.avif',
        'img/EPD_detail2.avif',
        'img/EPD_detail3.avif',
      ],
      technologies: ['Angular', 'Tailwind CSS', 'TypeScript', 'PHP', 'CSS3', 'Stripe', 'Paypal'],
      demoUrl: 'https://epd.edu.mx',
      repoUrl: 'https://github.com/victor88lm/Escuela-Profesional-De-Dibujo-S.C.git',
      category: 'web',
      featured: true,
      date: '2025-04-10',
      team: [
        {
          name: 'Oswaldo Benitez',
          role: 'Fullstack Developer',
          avatarUrl: 'img/oswaldo.avif',
          profileUrl: 'https://github.com/OswaldoRcdm'
        },
        {
          name: 'Rodrigo Quintana',
          role: 'Frontend Developer',
          avatarUrl: 'img/rodrigo.avif',
          profileUrl: 'https://github.com/RodriBrr'
        },
        {
          name: 'Victor Flores',
          role: 'Fullstack Developer',
          avatarUrl: 'img/victor.avif',
          profileUrl: 'https://github.com/victor88lm'
        }
      ],
      challenges: [
        'Integración de sistema de pagos seguro',
        'Optimización del rendimiento para carga de galerías de trabajos'
      ],
      solutions: [
        'Implementación de pasarela de pagos con encriptación',
        'Carga progresiva de imágenes y optimización de recursos'
      ],
      testimonial: {
        quote: 'El nuevo sitio web ha incrementado nuestras inscripciones en un 40% y nos ha permitido gestionar los cursos de manera más eficiente.',
        author: 'Jorge',
        position: 'Sub Director',
        company: 'Escuela Profesional de Dibujo S.C'
      }
    },
    // Aquí puedes agregar más proyectos
  ];

  constructor() { }

  // Método para obtener todos los proyectos
  getProjects(): Observable<Project[]> {
    return of(this.projects);
  }

  // Método para obtener un proyecto por ID
  getProjectById(id: number): Observable<Project | undefined> {
    const project = this.projects.find(p => p.id === id);
    return of(project);
  }

  // Iconos para tecnologías
  getTechnologyIcon(tech: string): string {
    // Mapa de iconos utilizando Icons8 (tonos azules priorizados)
    const icons: {[key: string]: string} = {
      'Angular': 'https://img.icons8.com/color/48/null/angularjs.png',
      'Tailwind CSS': 'https://img.icons8.com/color/48/null/tailwindcss.png',
      'TypeScript': 'https://img.icons8.com/color/48/null/typescript.png',
      'PHP': 'https://img.icons8.com/color/48/null/php.png',
      'CSS3': 'https://img.icons8.com/color/48/null/css3.png',
      'React': 'https://img.icons8.com/external-tal-revivo-color-tal-revivo/48/null/external-react-a-javascript-library-for-building-user-interfaces-logo-color-tal-revivo.png',
      'Next.js': 'https://img.icons8.com/color/48/null/nextjs.png',
      'Stripe': 'https://img.icons8.com/color/48/null/stripe.png',
      'Firebase': 'https://img.icons8.com/color/48/null/firebase.png',
      'Styled Components': 'https://img.icons8.com/color/48/null/styled-components.png',
      'React Native': 'https://img.icons8.com/external-tal-revivo-color-tal-revivo/48/null/external-react-a-javascript-library-for-building-user-interfaces-logo-color-tal-revivo.png',
      'Redux': 'https://img.icons8.com/color/48/null/redux.png',
      'Node.js': 'https://img.icons8.com/fluency/48/null/node-js.png',
      'MongoDB': 'https://img.icons8.com/color/48/null/mongodb.png',
      'Express': 'https://img.icons8.com/color/48/null/express.png',
      'Figma': 'https://img.icons8.com/color/48/null/figma.png',
      'Adobe XD': 'https://img.icons8.com/color/48/null/adobe-xd.png',
      'Sketch': 'https://img.icons8.com/color/48/null/sketch.png',
      'Bootstrap': 'https://img.icons8.com/color/48/null/bootstrap.png',
      'PostgreSQL': 'https://img.icons8.com/color/48/null/postgresql.png',
      'Socket.io': 'https://img.icons8.com/color/48/null/socket-io.png',
      'Flutter': 'https://img.icons8.com/color/48/null/flutter.png',
      'Google Maps API': 'https://img.icons8.com/color/48/null/google-maps.png',
      'GetX': 'https://img.icons8.com/color/48/null/api-settings.png',
      
      /* Nuevas tecnologías de pago y otras */
      'PayPal': 'img/paypal-3.svg',
      'Apple Pay': 'https://img.icons8.com/color/48/null/apple-pay.png',
      'Google Pay': 'https://img.icons8.com/color/48/null/google-pay.png',
      'Amazon Pay': 'https://img.icons8.com/color/48/null/amazon-pay.png',
      'Klarna': 'https://img.icons8.com/color/48/null/klarna.png',
      'Square': 'https://img.icons8.com/color/48/null/square-logo.png',
      'Venmo': 'https://img.icons8.com/color/48/null/venmo.png',
      'Shopify': 'https://img.icons8.com/color/48/null/shopify.png',
      'WooCommerce': 'https://img.icons8.com/color/48/null/woocommerce.png',
      'Braintree': 'https://img.icons8.com/color/48/null/braintree.png',
      'Authorize.net': 'https://img.icons8.com/color/48/null/authorize-net.png',
      'Adyen': 'https://img.icons8.com/color/48/null/adyen.png',
      'Alipay': 'https://img.icons8.com/color/48/null/alipay.png',
      'Bitcoin': 'https://img.icons8.com/color/48/null/bitcoin.png',
      'Ethereum': 'https://img.icons8.com/color/48/null/ethereum.png',
      
      /* Tecnologías adicionales */
      'Docker': 'https://img.icons8.com/color/48/null/docker.png',
      'Kubernetes': 'https://img.icons8.com/color/48/null/kubernetes.png',
      'GraphQL': 'https://img.icons8.com/color/48/null/graphql.png',
      'AWS': 'https://img.icons8.com/color/48/null/amazon-web-services.png',
      'Azure': 'https://img.icons8.com/color/48/null/azure-1.png',
      'Google Cloud': 'https://img.icons8.com/color/48/null/google-cloud.png',
      'Laravel': 'https://img.icons8.com/fluency/48/null/laravel.png',
      'Django': 'https://img.icons8.com/color/48/null/django.png',
      'Flask': 'https://img.icons8.com/color/48/null/flask.png',
      'Vue.js': 'https://img.icons8.com/color/48/null/vue-js.png',
      'Svelte': 'https://img.icons8.com/color/48/null/svelte.png'
    };
    
    // URL para ícono genérico en caso de no encontrar uno específico (en azul)
    const defaultIcon = 'https://img.icons8.com/fluency/48/null/code.png';
    
    // Retornar el ícono o el genérico si no existe
    return icons[tech] || defaultIcon;
  }
}