import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  isOpen: boolean;
  keywords: string[];
}


@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {

  searchControl = new FormControl('');
  allFaqs: FaqItem[] = [];
  filteredFaqs: FaqItem[] = [];
  selectedCategory: string = 'all';
  categories: string[] = ['all', 'servicios', 'proceso', 'tecnología', 'soporte', 'empresa'];
  expandAll: boolean = false;

  constructor() { }

  ngOnInit(): void {
    window.scrollTo(0, 0);

    this.initializeFaqs();
    
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterFaqs(searchTerm || '');
    });
  }

  initializeFaqs(): void {
    this.allFaqs = [
      {
        id: 1,
        question: "¿Qué servicios ofrece Loopmotion?",
        answer: "Loopmotion ofrece servicios de desarrollo y rediseño de sitios web profesionales, completamente adaptados a las necesidades específicas de cada cliente. Nuestros servicios incluyen diseño web desde cero, rediseño de sitios existentes, desarrollo de tiendas en línea, implementación de sistemas de gestión de contenido (CMS), optimización para motores de búsqueda (SEO) y desarrollo de aplicaciones web personalizadas.",
        category: "servicios",
        isOpen: false,
        keywords: ['servicios', 'desarrollo', 'rediseño', 'web', 'diseño']
      },
      {
        id: 2,
        question: "¿Loopmotion trabaja con empresas de todos los tamaños?",
        answer: "Sí, en Loopmotion ofrecemos soluciones personalizadas tanto para pequeñas empresas como para grandes corporativos. Entendemos que cada negocio tiene necesidades y presupuestos diferentes, por lo que adaptamos nuestros servicios para satisfacer los requerimientos específicos de cada cliente, independientemente de su tamaño o industria.",
        category: "empresa",
        isOpen: false,
        keywords: ['empresas', 'tamaño', 'pequeñas', 'grandes', 'corporativos', 'personalizado']
      },
      {
        id: 3,
        question: "¿Cómo puedo contactar a Loopmotion para un proyecto?",
        answer: "Puedes contactarnos a través de nuestro sitio web oficial en https://loopmotion.tech/ donde encontrarás un formulario de contacto. También puedes enviarnos un correo electrónico directamente a info@loopmotion.tech o llamarnos al número que aparece en nuestra página. Nuestro equipo estará encantado de atenderte y programar una consulta inicial para discutir tu proyecto.",
        category: "empresa",
        isOpen: false,
        keywords: ['contacto', 'proyecto', 'email', 'teléfono', 'consulta']
      },
      {
        id: 4,
        question: "¿Ofrecen mantenimiento y soporte después del desarrollo del sitio?",
        answer: "Sí, en Loopmotion proporcionamos servicios completos de mantenimiento y soporte técnico continuo una vez finalizado el desarrollo de tu sitio web. Ofrecemos diferentes planes de mantenimiento que incluyen actualizaciones de seguridad, respaldos regulares, solución de problemas, actualizaciones de contenido y optimización continua para garantizar que tu sitio web funcione de manera óptima en todo momento.",
        category: "soporte",
        isOpen: false,
        keywords: ['mantenimiento', 'soporte', 'técnico', 'actualización', 'seguridad']
      },
      {
        id: 5,
        question: "¿Qué tecnologías utiliza Loopmotion en el desarrollo web?",
        answer: "Empleamos las tecnologías más actuales y adecuadas según los requerimientos específicos de cada proyecto. Trabajamos con lenguajes como HTML5, CSS3, JavaScript, TypeScript, PHP, y frameworks modernos como Angular. También implementamos sistemas de gestión de contenido como WordPress, Drupal y otros CMS personalizados. Nuestra flexibilidad tecnológica nos permite garantizar sitios web modernos, eficientes y escalables.",
        category: "tecnología",
        isOpen: false,
        keywords: ['tecnologías', 'desarrollo', 'lenguajes', 'frameworks', 'CMS']
      },
      {
        id: 6,
        question: "¿Pueden ayudar a mejorar un sitio web existente?",
        answer: "Sí, ofrecemos servicios especializados de rediseño y optimización para mejorar la funcionalidad, rendimiento y apariencia de sitios web ya existentes. Nuestro proceso incluye un análisis exhaustivo de tu sitio actual, identificación de áreas de mejora, implementación de diseños modernos y responsivos, optimización de velocidad, mejora de la experiencia de usuario (UX) y actualización de tecnologías obsoletas.",
        category: "servicios",
        isOpen: false,
        keywords: ['mejorar', 'existente', 'rediseño', 'optimización', 'actualización']
      },
      {
        id: 7,
        question: "¿Los sitios desarrollados por Loopmotion son responsivos?",
        answer: "Absolutamente. Todos los sitios web que desarrollamos están diseñados y optimizados para ser completamente responsivos, garantizando una visualización y funcionamiento correctos en todos los dispositivos, incluyendo smartphones, tablets, laptops y computadoras de escritorio. Implementamos técnicas de diseño adaptativo para asegurar que tu sitio ofrezca una experiencia óptima a los usuarios independientemente del dispositivo que utilicen.",
        category: "tecnología",
        isOpen: false,
        keywords: ['responsivo', 'móvil', 'dispositivos', 'adaptativo', 'smartphones']
      },
      {
        id: 8,
        question: "¿Ofrecen integración con redes sociales y otras plataformas?",
        answer: "Sí, ofrecemos integración completa de tu sitio web con diversas redes sociales (Facebook, Instagram, Twitter, LinkedIn, etc.) y otras plataformas digitales como sistemas de pago, sistemas de reservas, CRM, herramientas de marketing digital, y más. Estas integraciones permiten ampliar tu alcance en línea, mejorar la interacción con tus clientes y optimizar tus procesos de negocio.",
        category: "servicios",
        isOpen: false,
        keywords: ['integración', 'redes sociales', 'plataformas', 'digital', 'conexión']
      },
      {
        id: 9,
        question: "¿Cómo es el proceso de trabajo con Loopmotion?",
        answer: "Nuestro proceso de trabajo se estructura en varias etapas: 1) Consulta inicial: Para entender tus necesidades, objetivos y expectativas del proyecto. 2) Propuesta y planificación: Desarrollo de una propuesta personalizada con cronograma y presupuesto. 3) Diseño: Creación de prototipos y maquetas para tu aprobación. 4) Desarrollo: Implementación técnica y programación del sitio. 5) Pruebas y ajustes: Verificación exhaustiva de funcionalidad y usabilidad. 6) Lanzamiento: Puesta en marcha del sitio. 7) Soporte post-lanzamiento: Mantenimiento continuo y resolución de incidencias.",
        category: "proceso",
        isOpen: false,
        keywords: ['proceso', 'trabajo', 'etapas', 'consulta', 'desarrollo', 'lanzamiento']
      },
      {
        id: 10,
        question: "¿Qué distingue a Loopmotion de otras empresas de desarrollo web?",
        answer: "Nos distinguimos por nuestro enfoque genuinamente personalizado, donde cada proyecto recibe atención detallada y adaptada a las necesidades específicas del cliente. Nuestra combinación de experiencia técnica, creatividad en diseño y comprensión de estrategias de marketing digital nos permite ofrecer soluciones integrales. Además, nuestro compromiso con la calidad, la eficiencia en los tiempos de entrega y la comunicación constante durante todo el proceso asegura resultados excepcionales y clientes satisfechos.",
        category: "empresa",
        isOpen: false,
        keywords: ['distingue', 'diferencia', 'competencia', 'ventajas', 'beneficios']
      },
      {
        id: 11,
        question: "¿Cuánto tiempo toma desarrollar un sitio web con Loopmotion?",
        answer: "El tiempo de desarrollo varía según la complejidad del proyecto. Un sitio web informativo básico puede completarse en 2-4 semanas, mientras que proyectos más complejos como tiendas en línea o aplicaciones web pueden tomar de 2 a 4 meses. Durante la consulta inicial, analizamos tus requisitos específicos y proporcionamos un cronograma detallado con plazos realistas para cada etapa del proyecto.",
        category: "proceso",
        isOpen: false,
        keywords: ['tiempo', 'desarrollo', 'plazos', 'cronograma', 'duración']
      },
      {
        id: 12,
        question: "¿Cuál es el costo de desarrollar un sitio web con Loopmotion?",
        answer: "Los costos varían dependiendo de las necesidades específicas de cada proyecto, incluyendo el alcance, complejidad, funcionalidades requeridas y plazos. Ofrecemos diferentes opciones para adaptarnos a diversos presupuestos, manteniendo siempre la calidad en nuestro trabajo. Tras la consulta inicial, presentamos una propuesta detallada con desglose de costos transparente. Contáctanos para recibir una cotización personalizada para tu proyecto.",
        category: "empresa",
        isOpen: false,
        keywords: ['costo', 'precio', 'presupuesto', 'inversión', 'cotización']
      },
      {
        id: 13,
        question: "¿Ofrecen servicios de hosting y registro de dominio?",
        answer: "Sí, ofrecemos servicios completos de hosting y registro de dominio como parte de nuestras soluciones. Trabajamos con proveedores confiables y seguros para garantizar un alto rendimiento y disponibilidad para tu sitio web. También podemos asesorarte en la elección del mejor plan de hosting según las necesidades específicas de tu proyecto y gestionar la renovación anual del dominio y hosting.",
        category: "servicios",
        isOpen: false,
        keywords: ['hosting', 'dominio', 'alojamiento', 'servidor', 'registrar']
      },
      {
        id: 14,
        question: "¿Realizan optimización SEO para los sitios web?",
        answer: "Sí, implementamos técnicas de SEO (Optimización para Motores de Búsqueda) en todos los sitios web que desarrollamos. Esto incluye optimización on-page (estructura del sitio, metadatos, contenido optimizado, velocidad de carga), aspectos técnicos de SEO y configuración para una indexación eficiente. También ofrecemos servicios adicionales de SEO más avanzados para mejorar el posicionamiento de tu sitio en los resultados de búsqueda a largo plazo.",
        category: "servicios",
        isOpen: false,
        keywords: ['SEO', 'optimización', 'posicionamiento', 'búsqueda', 'Google']
      },
      {
        id: 15,
        question: "¿Ofrecen servicios de diseño gráfico y creación de contenido?",
        answer: "Sí, contamos con profesionales especializados en diseño gráfico y creación de contenido como parte de nuestros servicios integrales. Podemos desarrollar logotipos, material gráfico para tu sitio web, banners, infografías y otros elementos visuales. También ofrecemos servicios de redacción de contenido optimizado para SEO, creación de textos persuasivos y estructuración de contenidos que ayuden a convertir visitantes en clientes.",
        category: "servicios",
        isOpen: false,
        keywords: ['diseño', 'gráfico', 'contenido', 'redacción', 'visual']
      },
      {
        id: 16,
        question: "¿Desarrollan tiendas en línea o comercio electrónico?",
        answer: "Sí, tenemos amplia experiencia en el desarrollo de tiendas en línea y plataformas de comercio electrónico. Utilizamos soluciones como WooCommerce, Magento, Shopify u otras plataformas personalizadas según las necesidades específicas de tu negocio. Implementamos sistemas seguros de pago, gestión de inventario, configuración de impuestos, opciones de envío, y todas las funcionalidades necesarias para una experiencia de compra eficiente.",
        category: "servicios",
        isOpen: false,
        keywords: ['tienda', 'ecommerce', 'comercio', 'electrónico', 'venta']
      },
      {
        id: 17,
        question: "¿Cómo garantizan la seguridad en los sitios web que desarrollan?",
        answer: "La seguridad es una prioridad en todos nuestros desarrollos. Implementamos certificados SSL para conexiones seguras, realizamos configuraciones de seguridad avanzadas en los servidores, utilizamos prácticas de codificación segura, implementamos protecciones contra ataques comunes (como inyección SQL, XSS, CSRF), y mantenemos actualizadas todas las tecnologías y plugins utilizados. Además, realizamos respaldos regulares y ofrecemos monitoreo continuo de seguridad en nuestros planes de mantenimiento.",
        category: "tecnología",
        isOpen: false,
        keywords: ['seguridad', 'protección', 'SSL', 'ataques', 'respaldos']
      },
      {
        id: 18,
        question: "¿Pueden integrar sistemas de analítica web?",
        answer: "Sí, implementamos e integramos herramientas de analítica web como Google Analytics, Google Tag Manager, Hotjar, Facebook Pixel y otras plataformas de seguimiento. Estas herramientas te permiten monitorear el rendimiento de tu sitio, comprender el comportamiento de los usuarios, analizar la eficacia de tus estrategias de marketing y tomar decisiones basadas en datos para optimizar continuamente tu presencia digital.",
        category: "servicios",
        isOpen: false,
        keywords: ['analítica', 'estadísticas', 'datos', 'métricas', 'seguimiento']
      },
      {
        id: 19,
        question: "¿Ofrecen capacitación para la administración del sitio web?",
        answer: "Sí, proporcionamos capacitación completa para que puedas administrar y actualizar el contenido de tu sitio web de manera independiente. Esto incluye sesiones personalizadas donde te enseñamos a utilizar el sistema de gestión de contenido (CMS), actualizar textos e imágenes, gestionar productos (en caso de tiendas en línea), revisar analíticas básicas y realizar mantenimiento rutinario. También ofrecemos manuales de usuario y soporte continuo para resolver dudas que puedan surgir posteriormente.",
        category: "soporte",
        isOpen: false,
        keywords: ['capacitación', 'administración', 'gestión', 'actualizar', 'enseñanza']
      },
      {
        "id": 20,
        "question": "¿Cuál es la política de propiedad del sitio web una vez finalizado?",
        "answer": "Una vez finalizado el proyecto y completado el pago, el sitio web y todos sus componentes (excepto licencias de terceros) pasan a ser propiedad del cliente. Esto incluye el diseño, contenido y otros elementos desarrollados específicamente para tu proyecto. Sin embargo, el código fuente no está incluido en la entrega estándar. Si deseas acceso al código fuente, se requiere un acuerdo adicional y un costo extra.",
        "category": "empresa",
        "isOpen": false,
        "keywords": ["propiedad", "derechos", "código", "finalización", "acceso"]
      }      
    ];
    
    this.filteredFaqs = [...this.allFaqs];
  }

  toggleFaq(faq: FaqItem): void {
    faq.isOpen = !faq.isOpen;
  }

  toggleAllFaqs(): void {
    this.expandAll = !this.expandAll;
    this.filteredFaqs.forEach(faq => faq.isOpen = this.expandAll);
  }

  filterFaqs(searchTerm: string): void {
    if (!searchTerm && this.selectedCategory === 'all') {
      this.filteredFaqs = [...this.allFaqs];
      return;
    }

    this.filteredFaqs = this.allFaqs.filter(faq => {
      const matchesCategory = this.selectedCategory === 'all' || faq.category === this.selectedCategory;
      const matchesSearch = !searchTerm || 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.filterFaqs(this.searchControl.value || '');
  }

  getResultsCount(): number {
    return this.filteredFaqs.length;
  }

  getTotalCount(): number {
    return this.allFaqs.length;
  }
}
