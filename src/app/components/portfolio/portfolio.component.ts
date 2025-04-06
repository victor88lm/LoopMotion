import { Component, OnInit } from '@angular/core';

// Interfaz para el modelo de proyecto
interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  demoUrl: string;
  detailsUrl: string;
  category: string;
  featured?: boolean;
  date?: string;
}

// Interfaz para categorías
interface Category {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  // Propiedades para la búsqueda y filtrado
  searchTerm: string = '';
  selectedCategory: string = 'all';
  
  // Propiedades para paginación
  currentPage: number = 1;
  itemsPerPage: number = 6;
  
  // Datos de categorías con iconos azules de Icons8
  categories: Category[] = [
    { value: 'all', label: 'Todos', icon: 'https://img.icons8.com/fluency/48/null/select-all-files.png' },
    { value: 'web', label: 'Desarrollo Web', icon: 'https://img.icons8.com/fluency/48/null/web.png' },
    { value: 'mobile', label: 'Apps Móviles', icon: 'https://img.icons8.com/fluency/48/null/smartphone-tablet.png' },
    { value: 'design', label: 'Diseño UI/UX', icon: 'https://img.icons8.com/fluency/48/null/design.png' },
    { value: 'ecommerce', label: 'E-commerce', icon: 'https://img.icons8.com/fluency/48/null/shopping-cart.png' }
  ];
  
  // Datos de los proyectos
  allProjects: Project[] = [
    {
      id: 1,
      title: 'Escuela Profesional de Dibujo S.C.',
      description: 'Plataforma para escuelas de dibujo que gestiona cursos, inscripciones en línea y seguimiento académico. Incluye panel para docentes, exhibición de trabajos y detalles sobre la institución y sus ubicaciones.',
      imageUrl: 'img/EPD_sitioweb.avif',
      technologies: ['Angular', 'Tailwind CSS', 'TypeScript', 'PHP', 'CSS3'],
      demoUrl: 'https://epd.edu.mx',
      detailsUrl: '/projects/escuela-dibujo',
      category: 'web',
      featured: true,
      date: '2024-02-15'
    },
  ];
  
  // Lista de proyectos filtrados
  filteredProjects: Project[] = [];
  
  // Proyectos a mostrar en la página actual
  displayedProjects: Project[] = [];
  
  constructor() { }
  
  ngOnInit(): void {
    // Inicializar proyectos y aplicar paginación
    this.resetFilters();
    window.scrollTo(0, 0);
  }
  
  // Método para filtrar por categoría
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1; // Volver a la primera página al cambiar filtros
    this.filterProjects();
  }
  
  // Método para filtrar proyectos combinando búsqueda y categoría
  filterProjects(): void {
    const searchLower = this.searchTerm.toLowerCase().trim();
    
    this.filteredProjects = this.allProjects.filter(project => {
      // Filtro por término de búsqueda 
      const matchesSearch = searchLower === '' || 
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchLower)) ||
        project.category.toLowerCase().includes(searchLower);
      
      // Filtro por categoría
      const matchesCategory = this.selectedCategory === 'all' || project.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    // Ordenar los proyectos (primero destacados, luego por fecha)
    this.filteredProjects.sort((a, b) => {
      // Primero ordenar por destacado
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Luego ordenar por fecha (más reciente primero)
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
    
    // Aplicar paginación
    this.applyPagination();
  }
  
  // Método para aplicar paginación
  applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedProjects = this.filteredProjects.slice(startIndex, endIndex);
  }
  
  // Método para reiniciar filtros
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.currentPage = 1;
    this.filteredProjects = [...this.allProjects];
    this.applyPagination();
  }
  
  // Métodos para navegación de paginación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyPagination();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Getters para paginación
  get totalPages(): number {
    return Math.ceil(this.filteredProjects.length / this.itemsPerPage);
  }
  
  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
  
  get endItem(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.filteredProjects.length ? this.filteredProjects.length : end;
  }
  
  get pagesArray(): number[] {
    // Limitar la cantidad de páginas mostradas (máximo 5)
    const maxPages = 5;
    const pages: number[] = [];
    
    if (this.totalPages <= maxPages) {
      // Si hay 5 o menos páginas, mostrar todas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Si hay más de 5 páginas, mostrar un rango centrado en la página actual
      let start = Math.max(this.currentPage - Math.floor(maxPages / 2), 1);
      let end = start + maxPages - 1;
      
      // Ajustar si llegamos al final
      if (end > this.totalPages) {
        end = this.totalPages;
        start = Math.max(end - maxPages + 1, 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
  
  // Método para obtener icono de tecnología usando Icons8
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
      'GetX': 'https://img.icons8.com/color/48/null/api-settings.png'
    };
    
    // URL para ícono genérico en caso de no encontrar uno específico (en azul)
    const defaultIcon = 'https://img.icons8.com/fluency/48/null/code.png';
    
    // Retornar el ícono o el genérico si no existe
    return icons[tech] || defaultIcon;
  }
}