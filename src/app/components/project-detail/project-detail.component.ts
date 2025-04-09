import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ProjectService, Project } from '../../Core/services/project.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  project: Project | undefined;
  selectedImage: string = '';
  isLoading: boolean = true;
  
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private projectService: ProjectService
  ) { }
  
  ngOnInit(): void {
    this.loadProject();
    window.scrollTo(0, 0);
  }
  
  // Cargar los datos del proyecto
  loadProject(): void {
    this.isLoading = true;
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      const id = +idParam; 
      
      this.projectService.getProjectById(id).subscribe(
        project => {
          this.project = project;
          
          if (this.project && this.project.images && this.project.images.length > 0) {
            // Establecer la imagen seleccionada inicialmente
            this.selectedImage = this.project.images[0];
          }
          
          this.isLoading = false;
        },
        error => {
          console.error('Error al cargar el proyecto:', error);
          this.isLoading = false;
        }
      );
    } else {
      this.isLoading = false;
    }
  }
  
  // Cambiar la imagen principal
  changeMainImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }
  
  // Volver a la página anterior
  goBack(): void {
    this.location.back();
  }
  
  // Método para obtener icono de tecnología usando el servicio
  getTechnologyIcon(tech: string): string {
    return this.projectService.getTechnologyIcon(tech);
  }
}