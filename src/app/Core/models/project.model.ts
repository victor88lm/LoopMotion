export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  demoUrl: string;
  detailsUrl: string;
  category: string;
  featured?: boolean;     // Proyecto destacado
  rating?: string;        // Calificación del proyecto (ej: "4.8")
  completion?: string;    // Porcentaje de completitud (ej: "90%")
  date?: string;          // Fecha de publicación
}