import { Component, OnInit } from '@angular/core';
import { ProjectService, Project } from '../../Core/services/project.service';

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
  isLoading: boolean = true;
  
  // Datos de categorías con iconos azules de Icons8
  categories: Category[] = [
    { value: 'all', label: 'Todos', icon: 'https://img.icons8.com/fluency/48/null/select-all-files.png' },
    { value: 'web', label: 'Desarrollo Web', icon: 'https://img.icons8.com/fluency/48/null/web.png' },
    { value: 'mobile', label: 'Apps Móviles', icon: 'https://img.icons8.com/fluency/48/null/smartphone-tablet.png' },
    { value: 'design', label: 'Diseño UI/UX', icon: 'https://img.icons8.com/fluency/48/null/design.png' },
    { value: 'ecommerce', label: 'E-commerce', icon: 'https://img.icons8.com/fluency/48/null/shopping-cart.png' }
  ];
  
  // Datos de los proyectos
  allProjects: Project[] = [];
  filteredProjects: Project[] = [];
  displayedProjects: Project[] = [];
  
  constructor(private projectService: ProjectService) { }
  
  ngOnInit(): void {
    this.loadProjects();
    window.scrollTo(0, 0);
  }
  
  // Cargar los proyectos del servicio
  loadProjects(): void {
    this.isLoading = true;
    this.projectService.getProjects().subscribe(
      projects => {
        this.allProjects = projects;
        this.resetFilters();
        this.isLoading = false;
      },
      error => {
        console.error('Error al cargar los proyectos:', error);
        this.isLoading = false;
      }
    );
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
  
  // Método para obtener icono de tecnología usando el servicio
  getTechnologyIcon(tech: string): string {
    return this.projectService.getTechnologyIcon(tech);
  }
}