// portfolio.component.ts
import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface Technology {
  name: string;
  icon: string; // Path to the icon or icon class
}

interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  category: 'web' | 'mobile' | 'design' | 'ecommerce';
  technologies: Technology[];
  demoUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  completionDate: Date;
  clientName?: string;
  testimonial?: {
    text: string;
    author: string;
    position: string;
  };
}

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
  animations: [
    trigger('fadeInUp', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(20px)'
      })),
      transition('void => *', [
        animate('0.6s ease-out', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ])
    ]),
    trigger('scaleIn', [
      state('void', style({
        opacity: 0,
        transform: 'scale(0.9)'
      })),
      transition('void => *', [
        animate('0.5s ease-out', style({
          opacity: 1,
          transform: 'scale(1)'
        }))
      ])
    ])
  ]
})
export class PortfolioComponent implements OnInit {
  selectedCategory: string = 'all';
  categories: string[] = ['all', 'web', 'mobile', 'design', 'ecommerce'];
  searchTerm: string = '';
  projects: Project[] = [
    // Aquí se agregarán los proyectos en el futuro
    // Ejemplo de estructura:
    /*
    {
      id: 'project-1',
      title: 'E-commerce Platform',
      description: 'A full-featured e-commerce platform built with Angular and Node.js',
      shortDescription: 'Modern e-commerce solution',
      imageUrl: '/assets/projects/ecommerce.jpg',
      category: 'ecommerce',
      technologies: [
        { name: 'Angular', icon: 'angular-icon' },
        { name: 'Node.js', icon: 'nodejs-icon' }
      ],
      demoUrl: 'https://demo.example.com',
      githubUrl: 'https://github.com/example',
      liveUrl: 'https://live.example.com',
      featured: true,
      completionDate: new Date('2024-01-15'),
      clientName: 'Tech Solutions Inc.',
      testimonial: {
        text: 'Excellent work and outstanding results',
        author: 'John Doe',
        position: 'CEO'
      }
    }
    */
  ];

  filteredProjects: Project[] = [];

  constructor() {
    this.filteredProjects = this.projects;
  }

  ngOnInit(): void {
    this.filterProjects();
    window.scrollTo(0, 0);

  }

  filterProjects(): void {
    this.filteredProjects = this.projects.filter(project => {
      const matchesCategory = this.selectedCategory === 'all' || project.category === this.selectedCategory;
      const matchesSearch = project.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  getFeaturedProjects(): Project[] {
    return this.projects.filter(project => project.featured);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterProjects();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.filterProjects();
  }

  getCategoryIcon(category: string): string {
    switch(category) {
      case 'web':
        return 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9';
      case 'mobile':
        return 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z';
      case 'design':
        return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z';
      case 'ecommerce':
        return 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z';
      default:
        return 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0h10';
    }
  }
}