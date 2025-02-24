// services.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Beneficio {
  titulo: string;
  descripcion: string;
}

interface Servicio {
  titulo: string;
  descripcion: string;
  icono: string;
  beneficios: Beneficio[];
}

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  servicios: Servicio[] = [
    {
      titulo: "Desarrollo en WordPress",
      descripcion: "Creamos sitios web profesionales en WordPress, optimizados para SEO y fáciles de gestionar.",
      icono: "https://img.icons8.com/ios/100/2563eb/wordpress.png",
      beneficios: [
        { titulo: "Fácil gestión", descripcion: "Interfaz intuitiva y sencilla de actualizar." },
        { titulo: "SEO Optimizado", descripcion: "Mejor posicionamiento en buscadores." },
        { titulo: "Personalización", descripcion: "Temas y plugins para cada necesidad." },
        { titulo: "Escalabilidad", descripcion: "Adaptable al crecimiento de tu negocio." }
      ]
    },
    {
      titulo: "Páginas a Medida",
      descripcion: "Desarrollamos soluciones personalizadas con tecnologías modernas y alto rendimiento.",
      icono: "https://img.icons8.com/ios/100/2563eb/code.png",
      beneficios: [
        { titulo: "Código optimizado", descripcion: "Desarrollamos con buenas prácticas y alto rendimiento." },
        { titulo: "Seguridad", descripcion: "Protección avanzada contra amenazas." },
        { titulo: "Diseño exclusivo", descripcion: "Interfaz única y adaptada a tu identidad." },
        { titulo: "Escalabilidad", descripcion: "Crecimiento sin límites tecnológicos." }
      ]
    },
    {
      titulo: "E-commerce",
      descripcion: "Tiendas online eficientes, optimizadas para conversión y con múltiples métodos de pago.",
      icono: "https://img.icons8.com/ios/100/2563eb/shopping-cart.png",
      beneficios: [
        { titulo: "Ventas 24/7", descripcion: "Automatiza tu negocio con ventas en línea." },
        { titulo: "Seguridad", descripcion: "Protección en transacciones y datos." },
        { titulo: "Optimización móvil", descripcion: "Experiencia fluida en dispositivos móviles." },
        { titulo: "Integraciones", descripcion: "Conexión con múltiples plataformas y pasarelas de pago." }
      ]
    },
    {
      titulo: "Diseño UI/UX",
      descripcion: "Creamos interfaces atractivas y funcionales para mejorar la experiencia del usuario.",
      icono: "https://img.icons8.com/ios/100/2563eb/design.png",
      beneficios: [
        { titulo: "Experiencia fluida", descripcion: "Interfaces intuitivas y amigables." },
        { titulo: "Conversión optimizada", descripcion: "Aumenta la tasa de interacción y ventas." },
        { titulo: "Diseño adaptable", descripcion: "Compatibilidad con todos los dispositivos." },
        { titulo: "Usabilidad", descripcion: "Facilidad de uso y accesibilidad mejorada." }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  irACotizacion() {
    this.router.navigate(['/cotizacion']);
  }
}