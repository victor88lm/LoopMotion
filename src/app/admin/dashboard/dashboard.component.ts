import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FirebaseService } from '../../Core/services/firebase.service';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage'; // Add this import
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { of } from 'rxjs';
declare module 'papaparse';
import { ComponentFixture, TestBed } from '@angular/core/testing';


type ProjectRole = 'frontend' | 'backend' | 'design' | 'pm' | 'qa';

Chart.register(...registerables);

declare global {
  interface Window {
    businessChart: any;
    presenceChart: any;
  }
}

interface TeamMember {
  name: string;
  role: ProjectRole;
  percentage: number;
}


interface ProjectDesign {
  colors: string[];
  headingFont: string;
  bodyFont: string;
  logo: any;
}

interface ProjectTask {
  name: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string;
}

interface Project {
  name: string;
  type: string;
  description: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  teamMembers: TeamMember[];
  design: ProjectDesign;
  tasks: ProjectTask[];
  notes: string;
  createdAt: Date | null;
  status: string;
  tags: string[];
  files: File[];
  fileReferences?: FileReference[];
  milestones: ProjectMilestone[];
  resources: ProjectResource[];
}

interface ProjectResource {
  type: string;
  name: string;
  url: string;
  username: string;
  password: string;
  notes: string;
  showPassword: boolean;
}


interface FileReference {
  name: string;
  type: string;
  size: number;
  url: string;
  path: string;
  uploadedAt: Date;
}
interface ProjectMilestone {
  name: string;
  date: string;
  description: string;
  paymentPercentage: number;
  completed: boolean;
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedQuotation: any = null; 

  projects: any[] = [];
  newProject: Project = {
    name: '',
    type: 'web',
    description: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    startDate: '',
    endDate: '',
    totalBudget: 0,
    teamMembers: [] as TeamMember[],
    design: {
      colors: ['#4F46E5'],
      headingFont: 'sans',
      bodyFont: 'sans',
      logo: null
    },
    tasks: [] as ProjectTask[],
    notes: '',
    createdAt: null,
    status: 'active',
    tags: [] as string[],
    files: [] as File[],
    milestones: [] as ProjectMilestone[],
    resources: [] as ProjectResource[]
  };
  
  newTagText: string = '';
  logoFile: File | null = null;

  
  contacts: any[] = [];
  quotations: any[] = [];
  users: any[] = []; // Para obtener usuarios del sistema si es necesario
  currentView: 'dashboard' | 'contacts' | 'quotations' | 'quotation-detail' | 'new-project' | 'projects' | 'project-detail' | 'potential-clients' = 'dashboard';
  isSidebarOpen = false;
  windowWidth: number = 0;
  searchText: string = '';
  userName: string | null = null;
  userEmail: string | null = null;
// Actualizar constructor para inyectar AngularFireStorage
constructor(
  
  private firebaseService: FirebaseService,
  private router: Router,
  private auth: AngularFireAuth,
  private firestore: AngularFirestore,
  private storage: AngularFireStorage, // Añadir esto
  @Inject(PLATFORM_ID) private platformId: Object
) {}

  async logout() {
    try {
      await this.auth.signOut();
      // Mostrar mensaje de éxito
      Swal.fire({
        title: '<span class="text-blue-800 font-semibold">¡Hasta pronto!</span>',
        html: '<div class="space-y-4"><p class="text-blue-700">Has cerrado sesión correctamente.</p></div>',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#1e40af',
        timer: 2000,
        timerProgressBar: true
      }).then(() => {
        // Redirigir al login
        this.router.navigate(['/loop-admin']);
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Swal.fire({
        title: '<span class="text-red-800 font-semibold">Error</span>',
        html: '<div class="space-y-4"><p class="text-red-700">Ocurrió un error al cerrar sesión.</p></div>',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc2626'
      });
    }
  }

  
  ngOnInit() {
    // Cargar datos del usuario
    this.auth.user.subscribe((user: any) => {
      if (user) {
        this.userEmail = user.email;
        // Obtener datos adicionales del usuario desde Firestore
        this.firestore.collection('users').doc(user.uid).get().subscribe(
          (doc: any) => {
            if (doc.exists) {
              const userData = doc.data() as any;
              this.userName = userData.name;
            }
          },
          (error: Error) => console.error('Error al obtener datos del usuario:', error)
        );
      }
    });
  
    // Cargar proyectos activos
    this.firestore.collection('projects', ref => 
      ref.where('status', '==', 'active')
    ).get().subscribe(snapshot => {
      this.activeProjects = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        return { id: doc.id, ...data };
      });
  
      // Calcular ingresos totales (suma de todos los presupuestos)
      this.totalRevenue = this.activeProjects.reduce((sum, project) => 
        sum + (project.totalBudget || 0), 0);
    });
  
    // Cargar datos adicionales
    this.loadData();
  
    // Verificar si está en el navegador para obtener el ancho de la ventana
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth = window.innerWidth;
    }

    this.loadPotentialClientsFromFirestore();
  }
  
  clientsData: any[] = [];


  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  showQuotationDetail(quotation: any) {
    window.scrollTo(0, 0);
    this.selectedQuotation = quotation;
    this.currentView = 'quotation-detail';
    if (this.windowWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  goBack() {
    if (this.currentView === 'quotation-detail') {
      this.currentView = 'quotations';
    } else if (this.currentView === 'new-project') {
      this.currentView = 'dashboard';
    } else {
      this.currentView = 'dashboard';
    }
    this.selectedQuotation = null;
  }
  
  // Funciones para el nuevo proyecto
  addTeamMember() {
    this.newProject.teamMembers.push({
      name: '',
      role: 'frontend',
      percentage: 0
    });
  }
  removeTeamMember(index: number) {
    this.newProject.teamMembers.splice(index, 1);
    this.calculateShares();
  }

  calculateShares() {
    // Recalcula los montos cuando cambia el presupuesto total o los porcentajes
    // No necesita implementación adicional ya que se calcula dinámicamente en la plantilla
  }

  getTotalPercentage(): number {
    return this.newProject.teamMembers.reduce((sum, member) => sum + Number(member.percentage), 0);
  }

  addColor() {
    this.newProject.design.colors.push('#000000');
    this.newProject.design.colors = [...this.newProject.design.colors, '#000000'];
  }

  removeColor(index: number) {
    if (this.newProject.design.colors.length > 1) {
      this.newProject.design.colors.splice(index, 1);
    }
  }

  addTask() {
    this.newProject.tasks.push({
      name: '',
      assignedTo: '',
      startDate: this.newProject.startDate,
      endDate: '',
      status: 'pending',
      description: ''
    });
  }

  removeTask(index: number) {
    this.newProject.tasks.splice(index, 1);
  }


  getRoleLabel(role: ProjectRole): string {
    const roleLabels = {
      frontend: 'Frontend Developer',
      backend: 'Backend Developer',
      design: 'Designer',
      pm: 'Project Manager',
      qa: 'QA Engineer'
    };
    return roleLabels[role] || role;
  }

  async saveProject() {
    // Validar datos
    if (!this.newProject.name) {
      Swal.fire({
        title: '<span class="text-red-800 font-semibold">Error</span>',
        html: '<div class="space-y-4"><p class="text-red-700">El nombre del proyecto es obligatorio.</p></div>',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc2626'
      });
      return;
    }
  
    // Validar distribución de presupuesto si hay miembros
    if (this.newProject.teamMembers.length > 0 && this.getTotalPercentage() !== 100) {
      const result = await Swal.fire({
        title: '<span class="text-yellow-800 font-semibold">Advertencia</span>',
        html: '<div class="space-y-4"><p class="text-yellow-700">La distribución del presupuesto no suma 100%.</p></div>',
        icon: 'warning',
        confirmButtonText: 'Revisar',
        confirmButtonColor: '#d97706',
        showCancelButton: true,
        cancelButtonText: 'Guardar de todos modos',
        cancelButtonColor: '#4b5563'
      });
      
      if (result.isConfirmed) {
        return; // El usuario quiere revisar
      }
      // Si presiona cancelar, continúa con el guardado
    }
  
    // Validar hitos de pago si existen
    if (this.newProject.milestones.length > 0 && this.getTotalMilestonePercentage() !== 100) {
      const result = await Swal.fire({
        title: '<span class="text-yellow-800 font-semibold">Advertencia</span>',
        html: '<div class="space-y-4"><p class="text-yellow-700">Los porcentajes de pago en los hitos no suman 100%.</p></div>',
        icon: 'warning',
        confirmButtonText: 'Revisar',
        confirmButtonColor: '#d97706',
        showCancelButton: true,
        cancelButtonText: 'Guardar de todos modos',
        cancelButtonColor: '#4b5563'
      });
      
      if (result.isConfirmed) {
        return; // El usuario quiere revisar
      }
      // Si presiona cancelar, continúa con el guardado
    }
  
    // Mostrar cargando
    Swal.fire({
      title: '<span class="text-blue-800 font-semibold">Guardando proyecto...</span>',
      html: '<div class="space-y-4"><p class="text-blue-700">Esto puede tomar un momento.</p></div>',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    try {
      // Añadir fecha de creación
      this.newProject.createdAt = new Date();
      
      // Copia del proyecto para guardar (sin los archivos originales)
      const projectData = JSON.parse(JSON.stringify(this.newProject));
      
      // Eliminar archivos del objeto (se guardarán en Storage)
      delete projectData.files;
      projectData.fileReferences = [];
      
      // Handle logo - remove the data URL from the JSON
      const logoDataUrl = projectData.design.logo;
      projectData.design.logoUrl = null; // Will store the URL after upload
      projectData.design.logo = null; // Don't store the data URL in Firestore
      
      // Crear el documento primero para obtener el ID
      const projectRef = await this.firestore.collection('projects').add(projectData);
      const projectId = projectRef.id;
      
      // Upload logo if exists
      if (this.logoFile) {
        const logoFileName = `projects/${projectId}/logo_${Date.now()}_${this.logoFile.name}`;
        const logoStorageRef = this.storage.ref(logoFileName);
        
        // Upload logo
        const logoUploadTask = this.storage.upload(logoFileName, this.logoFile);
        
        // Wait for upload to complete
        await logoUploadTask.then(async () => {
          // Get download URL
          const logoDownloadURL = await logoStorageRef.getDownloadURL().toPromise();
          
          // Update project with logo URL
          await this.firestore.collection('projects').doc(projectId).update({
            'design.logoUrl': logoDownloadURL,
            'design.logoPath': logoFileName
          });
        });
      }
      
      // Si hay archivos, subirlos a Firebase Storage
      if (this.newProject.files && this.newProject.files.length > 0) {
        for (const file of this.newProject.files) {
          // Crear referencia en Storage
          const fileName = `projects/${projectId}/${Date.now()}_${file.name}`;
          const storageRef = this.storage.ref(fileName);
          
          // Subir archivo
          const uploadTask = this.storage.upload(fileName, file);
          
          // Esperar a que termine la subida
          await uploadTask.then(async () => {
            // Obtener URL de descarga
            const downloadURL = await storageRef.getDownloadURL().toPromise();
            
            // Añadir referencia del archivo
            projectData.fileReferences.push({
              name: file.name,
              type: file.type,
              size: file.size,
              url: downloadURL,
              path: fileName,
              uploadedAt: new Date()
            });
          });
        }
        
        // Actualizar el documento con las referencias a los archivos
        await this.firestore.collection('projects').doc(projectId).update({
          fileReferences: projectData.fileReferences
        });
      }
  
      Swal.fire({
        title: '<span class="text-blue-800 font-semibold">¡Éxito!</span>',
        html: '<div class="space-y-4"><p class="text-blue-700">El proyecto ha sido creado correctamente.</p></div>',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#1e40af'
      }).then(() => {
        // Resetear el formulario y el logo file
        this.resetProjectForm();
        this.logoFile = null;
        // Redireccionar al dashboard
        this.currentView = 'dashboard';
      });
    } catch (error) {
      console.error('Error al guardar el proyecto:', error);
      Swal.fire({
        title: '<span class="text-red-800 font-semibold">Error</span>',
        html: '<div class="space-y-4"><p class="text-red-700">Ocurrió un error al guardar el proyecto.</p></div>',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc2626'
      });
    }
  }

  async finalizeSaveProject() {
    try {
      // Añadir fecha de creación
      this.newProject.createdAt = new Date();
      
      // Guardar el proyecto en Firestore
      await this.firestore.collection('projects').add(this.newProject);
      
      Swal.fire({
        title: '<span class="text-blue-800 font-semibold">¡Éxito!</span>',
        html: '<div class="space-y-4"><p class="text-blue-700">El proyecto ha sido creado correctamente.</p></div>',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#1e40af'
      }).then(() => {
        // Resetear el formulario
        this.resetProjectForm();
        // Redireccionar al dashboard
        this.currentView = 'dashboard';
      });
    } catch (error) {
      console.error('Error al guardar el proyecto:', error);
      Swal.fire({
        title: '<span class="text-red-800 font-semibold">Error</span>',
        html: '<div class="space-y-4"><p class="text-red-700">Ocurrió un error al guardar el proyecto.</p></div>',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc2626'
      });
    }
  }


  showNotification(message: string, type: 'success' | 'error' = 'success') {
    // Implementa aquí tu lógica de notificación
  }
  
  filteredContacts() {
    return this.contacts.filter(contact =>
        contact.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        contact.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
        contact.message.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  addTag() {
    if (this.newTagText.trim() !== '') {
      // Evitar duplicados
      if (!this.newProject.tags.includes(this.newTagText.trim())) {
        this.newProject.tags.push(this.newTagText.trim());
      }
      this.newTagText = '';
    }
  }
  
  removeTag(index: number) {
    this.newProject.tags.splice(index, 1);
  }

  handleFileUpload(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Verificar tamaño máximo (10MB)
        if (file.size <= 10 * 1024 * 1024) {
          this.newProject.files.push(file);
        } else {
          // Mostrar error de tamaño excedido
          Swal.fire({
            title: '<span class="text-red-800 font-semibold">Error</span>',
            html: `<div class="space-y-4"><p class="text-red-700">El archivo "${file.name}" excede el tamaño máximo permitido (10MB).</p></div>`,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#dc2626'
          });
        }
      }
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = '';
  }
  
  removeFile(index: number) {
    this.newProject.files.splice(index, 1);
  }
  
  
  // Funciones para manejo de hitos (milestones)
  addMilestone() {
    this.newProject.milestones.push({
      name: '',
      date: this.newProject.endDate, // Por defecto, la fecha de entrega del proyecto
      description: '',
      paymentPercentage: 0,
      completed: false
    });
  }
  
  removeMilestone(index: number) {
    this.newProject.milestones.splice(index, 1);
  }
  
  getTotalMilestonePercentage(): number {
    return this.newProject.milestones.reduce((sum, milestone) => sum + Number(milestone.paymentPercentage), 0);
  }
  
  // Funciones para manejo de recursos externos
  addResource() {
    this.newProject.resources.push({
      type: 'hosting',
      name: '',
      url: '',
      username: '',
      password: '',
      notes: '',
      showPassword: false // Para controlar la visibilidad de la contraseña
    });
  }
  
  removeResource(index: number) {
    this.newProject.resources.splice(index, 1);
  }
  
  // Actualiza la función resetProjectForm para incluir las nuevas propiedades
  resetProjectForm() {
    this.newProject = {
      name: '',
      type: 'web',
      description: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientCompany: '',
      startDate: '',
      endDate: '',
      totalBudget: 0,
      teamMembers: [],
      design: {
        colors: ['#4F46E5'],
        headingFont: 'sans',
        bodyFont: 'sans',
        logo: null
      },
      tasks: [],
      notes: '',
      createdAt: null,
      status: 'active',
      // Nuevas propiedades
      tags: [],
      files: [],
      milestones: [],
      resources: []
    };
    this.newTagText = '';
  }

  handleLogoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Verify it's an image file
      if (!file.type.includes('image')) {
        Swal.fire({
          title: '<span class="text-red-800 font-semibold">Error</span>',
          html: '<div class="space-y-4"><p class="text-red-700">Por favor, selecciona un archivo de imagen.</p></div>',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#dc2626'
        });
        return;
      }
      
      // Check file size (max 2MB for logo)
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          title: '<span class="text-red-800 font-semibold">Error</span>',
          html: '<div class="space-y-4"><p class="text-red-700">La imagen es demasiado grande. El tamaño máximo permitido es 2MB.</p></div>',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#dc2626'
        });
        return;
      }
      
      // Store the actual file for later upload
      this.logoFile = file;
      
      // Create a preview of the logo
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newProject.design.logo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  

  // En tu componente TypeScript
activeProjects: any[] = [];
totalRevenue: number = 0;

// En el método ngOnInit o donde cargues tus datos
loadData() {
  this.firebaseService.getContacts().subscribe(data => {
    this.contacts = data;
  });

  this.firebaseService.getQuotations().subscribe(data => {
    this.quotations = data;
  });
  
  // Obtener proyectos activos
  this.firestore.collection('projects', ref => 
    ref.where('status', '==', 'active')
  ).get().subscribe(snapshot => {
    this.activeProjects = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return { id: doc.id, ...data };
    });
    
    // Calcular ingresos totales (suma de todos los presupuestos)
    this.totalRevenue = this.activeProjects.reduce((sum, project) => 
      sum + (project.totalBudget || 0), 0);
  });
  
  // Cargar todos los proyectos y mantenerse suscrito a cambios
  this.firestore.collection('projects').snapshotChanges().subscribe(actions => {
    this.projects = actions.map(a => {
      const data = a.payload.doc.data() as any;
      const id = a.payload.doc.id;
      return { id, ...data };
    });
    
    // Actualizar datos para el dashboard si es necesario
    if (!this.activeProjects.length) {
      this.activeProjects = this.projects.filter(p => p.status === 'active');
      this.totalRevenue = this.activeProjects.reduce((sum, project) => 
        sum + (project.totalBudget || 0), 0);
    }
  });
}

// Propiedades adicionales que necesitas agregar a tu componente
searchProjectText: string = '';
currentProjectFilter: 'all' | 'active' | 'completed' | 'overdue' = 'all';
projectSortBy: string = 'date-desc';
selectedProject: any = null;
activeProjectTab: string = 'info';
projectTabs = [
  { id: 'info', name: 'Información General' },
  { id: 'tasks', name: 'Tareas' },
  { id: 'files', name: 'Archivos' },
  { id: 'resources', name: 'Recursos' },
  { id: 'milestones', name: 'Hitos' }
];
currentTaskFilter: 'all' | 'pending' | 'in-progress' | 'review' | 'completed' = 'all';
currentFileFilter: 'all' | 'image' | 'document' | 'other' = 'all';
openTaskMenuIndex: number = -1;

// Modales y edición
showTaskModal: boolean = false;
showFileModal: boolean = false;
showResourceModal: boolean = false;
showMilestoneModal: boolean = false;
editingTaskIndex: number = -1;
editingResourceIndex: number = -1;
editingMilestoneIndex: number = -1;
currentTask: any = {};
currentResource: any = {};
currentMilestone: any = {};
selectedFiles: any[] = [];
isUploading: boolean = false;
showPassword: boolean = false;



// Métodos para la vista de proyectos
filterProjects(filter: 'all' | 'active' | 'completed' | 'overdue') {
  this.currentProjectFilter = filter;
}

sortProjects() {
  // La lógica de ordenamiento se implementa en filteredProjects()
}

showProjectDetail(project: any) {
  this.selectedProject = project;
  this.currentView = 'project-detail';
  this.activeProjectTab = 'info'; // Por defecto muestra la información general
  this.isSidebarOpen = false;
}

goBackToProjects() {
  this.currentView = 'projects';
  this.selectedProject = null;
}

// Métodos de utilidad
getStatusLabel(status: string): string {
  const statusLabels: any = {
    'active': 'Activo',
    'completed': 'Completado',
    'paused': 'Pausado',
    'overdue': 'Vencido'
  };
  return statusLabels[status] || status;
}

getProjectTypeLabel(type: string): string {
  const typeLabels: any = {
    'web': 'Desarrollo Web',
    'mobile': 'Aplicación Móvil',
    'ecommerce': 'E-Commerce',
    'redesign': 'Rediseño',
    'other': 'Otro'
  };
  return typeLabels[type] || type;
}

getTaskStatusLabel(status: string): string {
  const statusLabels: any = {
    'pending': 'Pendiente',
    'in-progress': 'En Progreso',
    'review': 'En Revisión',
    'completed': 'Completado'
  };
  return statusLabels[status] || status;
}

getFontLabel(font: string): string {
  const fontLabels: any = {
    'sans': 'Sans-serif',
    'serif': 'Serif',
    'mono': 'Monospace',
    'display': 'Display',
    'other': 'Otro'
  };
  return fontLabels[font] || font;
}

getResourceTypeLabel(type: string): string {
  const typeLabels: any = {
    'hosting': 'Hosting',
    'domain': 'Dominio',
    'repo': 'Repositorio',
    'design': 'Diseño',
    'tool': 'Herramienta',
    'api': 'API / Servicio',
    'other': 'Otro'
  };
  return typeLabels[type] || type;
}

getRandomColor(seed: string): string {
  // Generar color pseudo-aleatorio basado en el nombre
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
  ];
  return colors[Math.abs(hash) % colors.length];
}

formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Métodos para filtrado
filteredProjects() {
  let result = [...this.projects]; // Asumiendo que tienes una propiedad 'projects'
  
  // Filtrar por texto de búsqueda
  if (this.searchProjectText) {
    const searchText = this.searchProjectText.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(searchText) || 
      p.clientName?.toLowerCase().includes(searchText) ||
      p.clientCompany?.toLowerCase().includes(searchText) ||
      p.description?.toLowerCase().includes(searchText) ||
      (p.tags && p.tags.some((tag: string) => tag.toLowerCase().includes(searchText)))
    );
  }
  
  // Filtrar por estado
  if (this.currentProjectFilter !== 'all') {
    result = result.filter(p => {
      if (this.currentProjectFilter === 'active') return p.status === 'active';
      if (this.currentProjectFilter === 'completed') return p.status === 'completed';
      if (this.currentProjectFilter === 'overdue') {
        // Verificar si la fecha de entrega ya pasó y el proyecto no está completado
        return p.status !== 'completed' && new Date(p.endDate) < new Date(); // Fix this line
      }
      return true;
    });
  }
  
  // Ordenar proyectos
  result.sort((a, b) => {
    switch (this.projectSortBy) {
      case 'date-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'budget-desc':
        return (b.totalBudget || 0) - (a.totalBudget || 0);
      case 'budget-asc':
        return (a.totalBudget || 0) - (b.totalBudget || 0);
      default:
        return 0;
    }
  });
  
  return result;
}

filteredTasks(project: any) {
  if (!project.tasks) return [];
  
  let result = [...project.tasks];
  
  // Filtrar por estado
  if (this.currentTaskFilter !== 'all') {
    result = result.filter(task => task.status === this.currentTaskFilter);
  }
  
  return result;
}

filteredFiles(project: any) {
  if (!project.fileReferences) return [];
  
  let result = [...project.fileReferences];
  
  // Filtrar por tipo
  if (this.currentFileFilter !== 'all') {
    if (this.currentFileFilter === 'image') {
      result = result.filter(file => file.type.includes('image'));
    } else if (this.currentFileFilter === 'document') {
      result = result.filter(file => 
        file.type.includes('pdf') || 
        file.type.includes('word') || 
        file.type.includes('document') ||
        file.type.includes('sheet') ||
        file.type.includes('excel')
      );
    } else if (this.currentFileFilter === 'other') {
      result = result.filter(file => 
        !file.type.includes('image') && 
        !file.type.includes('pdf') && 
        !file.type.includes('word') && 
        !file.type.includes('document') &&
        !file.type.includes('sheet') &&
        !file.type.includes('excel')
      );
    }
  }
  
  return result;
}

// Métodos para métricas de proyectos
getProjectProgress(project: any): number {
  if (!project.tasks || project.tasks.length === 0) return 0;
  
  const completedTasks = project.tasks.filter((task: any) => task.status === 'completed').length;
  return Math.round((completedTasks / project.tasks.length) * 100);
}

getCompletedTasks(project: any): number {
  if (!project.tasks) return 0;
  return project.tasks.filter((task: any) => task.status === 'completed').length;
}

getDaysRemaining(project: any): number {
  const endDate = new Date(project.endDate);
  const today = new Date();
  
  // Si la fecha ya pasó, devolver 0
  if (endDate < today) return 0;
  
  const diffTime = endDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date();
  
  const diffTime = today.getTime() - date.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

getDaysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date();
  
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

getNextPayment(project: any): any {
  if (!project.milestones || project.milestones.length === 0) return null;
  
  // Encontrar el próximo hito no completado con fecha futura más cercana
  const pendingMilestones = project.milestones
    .filter((m: any) => !m.completed)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (pendingMilestones.length === 0) return null;
  
  const nextMilestone = pendingMilestones[0];
  return {
    date: nextMilestone.date,
    amount: project.totalBudget * nextMilestone.paymentPercentage / 100
  };
}

getNextMilestone(project: any): any {
  if (!project.milestones || project.milestones.length === 0) return null;
  
  // Encontrar el próximo hito no completado con fecha futura más cercana
  const pendingMilestones = project.milestones
    .filter((m: any) => !m.completed)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (pendingMilestones.length === 0) return null;
  
  return pendingMilestones[0];
}

isPaymentOverdue(payment: any): boolean {
  if (!payment) return false;
  return new Date(payment.date) < new Date();
}

isMilestoneOverdue(milestone: any): boolean {
  return !milestone.completed && new Date(milestone.date) < new Date();
}

// Métodos para cambiar el estado del proyecto
async changeProjectStatus(project: any) {
  const { value: newStatus } = await Swal.fire({
    title: 'Cambiar Estado',
    input: 'select',
    inputOptions: {
      'active': 'Activo',
      'paused': 'Pausado',
      'completed': 'Completado',
      'overdue': 'Vencido'
    },
    inputValue: project.status,
    showCancelButton: true,
    confirmButtonText: 'Cambiar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3b82f6'
  });
  
  if (newStatus) {
    try {
      // Actualizar el estado en Firestore
      await this.firestore.collection('projects').doc(project.id).update({
        status: newStatus
      });
      
      // Actualizar objeto local
      project.status = newStatus;
      
      Swal.fire({
        title: 'Estado actualizado',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estado del proyecto',
        icon: 'error'
      });
    }
  }
}

// Métodos para editar el proyecto
editProject(project: any) {
  // Navegar a la pantalla de edición de proyecto
  // Esto dependerá de cómo estructures tu aplicación
  console.log('Editar proyecto:', project.id);
  // Podrías implementar esto así:
  // this.router.navigate(['/edit-project', project.id]);
}

// Gestión de tareas
openAddTaskModal(project: any) {
  this.editingTaskIndex = -1;
  this.currentTask = {
    name: '',
    description: '',
    assignedTo: '',
    status: 'pending',
    startDate: new Date().toISOString().split('T')[0],
    endDate: project.endDate
  };
  this.showTaskModal = true;
}

openEditTaskModal(project: any, index: number) {
  this.editingTaskIndex = index;
  this.currentTask = { ...project.tasks[index] };
  this.showTaskModal = true;
}

openTaskDetailsModal(task: any) {
  Swal.fire({
    title: task.name,
    html: `
      <div class="text-left">
        <p class="my-2">${task.description || 'Sin descripción'}</p>
        <div class="grid grid-cols-2 gap-2 mt-4">
          <div>
            <p class="text-sm text-gray-500">Asignado a:</p>
            <p class="font-medium">${task.assignedTo || 'Sin asignar'}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Estado:</p>
            <p class="font-medium">${this.getTaskStatusLabel(task.status)}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Fecha de inicio:</p>
            <p class="font-medium">${task.startDate ? new Date(task.startDate).toLocaleDateString() : 'No definida'}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Fecha de fin:</p>
            <p class="font-medium">${task.endDate ? new Date(task.endDate).toLocaleDateString() : 'No definida'}</p>
          </div>
        </div>
      </div>
    `,
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#3b82f6'
  });
}

closeTaskModal() {
  this.showTaskModal = false;
  this.currentTask = {};
  this.editingTaskIndex = -1;
}

async saveTask() {
  // Validar datos
  if (!this.currentTask.name) {
    Swal.fire({
      title: 'Error',
      text: 'El nombre de la tarea es obligatorio',
      icon: 'error'
    });
    return;
  }

  try {
    // Clonar el proyecto para realizar modificaciones
    const projectUpdate = { ...this.selectedProject };
    
    // Asegurar que existe el array de tareas
    if (!projectUpdate.tasks) {
      projectUpdate.tasks = [];
    }
    
    // Añadir o actualizar tarea
    if (this.editingTaskIndex === -1) {
      // Añadir nueva tarea
      projectUpdate.tasks.push(this.currentTask);
    } else {
      // Actualizar tarea existente
      projectUpdate.tasks[this.editingTaskIndex] = this.currentTask;
    }
    
    // Actualizar en Firestore
    await this.firestore.collection('projects').doc(projectUpdate.id).update({
      tasks: projectUpdate.tasks
    });
    
    // Actualizar objeto local
    this.selectedProject = projectUpdate;
    
    Swal.fire({
      title: this.editingTaskIndex === -1 ? 'Tarea añadida' : 'Tarea actualizada',
      icon: 'success',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });
    
    this.closeTaskModal();
  } catch (error) {
    console.error('Error al guardar la tarea:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo guardar la tarea',
      icon: 'error'
    });
  }
}

toggleTaskStatusMenu(index: number) {
  if (this.openTaskMenuIndex === index) {
    this.openTaskMenuIndex = -1;
  } else {
    this.openTaskMenuIndex = index;
  }
}

async updateTaskStatus(project: any, taskIndex: number, newStatus: string) {
  this.openTaskMenuIndex = -1; // Cerrar el menú
  
  try {
    // Clonar el proyecto para realizar modificaciones
    const projectUpdate = { ...project };
    
    // Actualizar el estado de la tarea
    projectUpdate.tasks[taskIndex].status = newStatus;
    
    // Actualizar en Firestore
    await this.firestore.collection('projects').doc(projectUpdate.id).update({
      tasks: projectUpdate.tasks
    });
    
    // Actualizar objeto local
    this.selectedProject = projectUpdate;
  } catch (error) {
    console.error('Error al actualizar el estado de la tarea:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo actualizar el estado de la tarea',
      icon: 'error'
    });
  }
}

async deleteTask(project: any, taskIndex: number) {
  this.openTaskMenuIndex = -1; // Cerrar el menú
  
  const result = await Swal.fire({
    title: '¿Eliminar tarea?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444'
  });
  
  if (result.isConfirmed) {
    try {
      // Clonar el proyecto para realizar modificaciones
      const projectUpdate = { ...project };
      
      // Eliminar la tarea
      projectUpdate.tasks.splice(taskIndex, 1);
      
      // Actualizar en Firestore
      await this.firestore.collection('projects').doc(projectUpdate.id).update({
        tasks: projectUpdate.tasks
      });
      
      // Actualizar objeto local
      this.selectedProject = projectUpdate;
      
      Swal.fire({
        title: 'Tarea eliminada',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar la tarea',
        icon: 'error'
      });
    }
  }
}

// Gestión de archivos
openAddFileModal(project: any) {
  this.selectedFiles = [];
  this.showFileModal = true;
}

closeFileModal() {
  this.showFileModal = false;
  this.selectedFiles = [];
  this.isUploading = false;
}

onFileSelected(event: any) {
  const files = event.target.files;
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Verificar tamaño máximo (10MB)
      if (file.size <= 10 * 1024 * 1024) {
        this.selectedFiles.push(file);
      } else {
        Swal.fire({
          title: 'Error',
          text: `El archivo "${file.name}" excede el tamaño máximo permitido (10MB)`,
          icon: 'error'
        });
      }
    }
  }
  // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
  event.target.value = '';
}

removeSelectedFile(index: number) {
  this.selectedFiles.splice(index, 1);
}

async uploadFiles() {
  if (this.selectedFiles.length === 0) return;
  
  this.isUploading = true;
  
  try {
    // Clonar el proyecto para realizar modificaciones
    const projectUpdate = { ...this.selectedProject };
    
    // Asegurar que existe el array de referencias de archivos
    if (!projectUpdate.fileReferences) {
      projectUpdate.fileReferences = [];
    }
    
    // Subir cada archivo
    for (const file of this.selectedFiles) {
      // Crear referencia en Storage
      const fileName = `projects/${projectUpdate.id}/${Date.now()}_${file.name}`;
      const storageRef = this.storage.ref(fileName);
      
      // Subir archivo
      const uploadTask = this.storage.upload(fileName, file);
      
      // Esperar a que termine la subida
      await uploadTask.then(async () => {
        // Obtener URL de descarga
        const downloadURL = await storageRef.getDownloadURL().toPromise();
        
        // Añadir referencia del archivo
        projectUpdate.fileReferences.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url: downloadURL,
          path: fileName,
          uploadedAt: new Date()
        });
      });
    }
    
    // Actualizar en Firestore
    await this.firestore.collection('projects').doc(projectUpdate.id).update({
      fileReferences: projectUpdate.fileReferences
    });
    
    // Actualizar objeto local
    this.selectedProject = projectUpdate;
    
    Swal.fire({
      title: 'Archivos subidos',
      icon: 'success',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });
    
    this.closeFileModal();
  } catch (error) {
    console.error('Error al subir archivos:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron subir los archivos',
      icon: 'error'
    });
    this.isUploading = false;
  }
}

previewFile(file: any) {
  // Solo para imágenes
  if (file.type.includes('image')) {
    if (file.url) {
      // Si el archivo ya tiene una URL, usarla directamente
      Swal.fire({
        title: file.name,
        imageUrl: file.url,
        imageAlt: 'Vista previa',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3b82f6'
      });
    } else {
      // Si no tiene URL, leer el archivo como DataURL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        Swal.fire({
          title: file.name,
          imageUrl: e.target.result,
          imageAlt: 'Vista previa',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#1e40af'
        });
      };
      reader.readAsDataURL(file);
    }
  }
}

async deleteFile(project: any, fileIndex: number) {
  const result = await Swal.fire({
    title: '¿Eliminar archivo?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444'
  });
  
  if (result.isConfirmed) {
    try {
      // Clonar el proyecto para realizar modificaciones
      const projectUpdate = { ...project };
      
      // Obtener el archivo a eliminar
      const fileToDelete = projectUpdate.fileReferences[fileIndex];
      
      // Eliminar archivo de Storage
      if (fileToDelete.path) {
        await this.storage.ref(fileToDelete.path).delete().toPromise();
      }
      
      // Eliminar referencia del archivo
      projectUpdate.fileReferences.splice(fileIndex, 1);
      
      // Actualizar en Firestore
      await this.firestore.collection('projects').doc(projectUpdate.id).update({
        fileReferences: projectUpdate.fileReferences
      });
      
      // Actualizar objeto local
      this.selectedProject = projectUpdate;
      
      Swal.fire({
        title: 'Archivo eliminado',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el archivo',
        icon: 'error'
      });
    }
  }
}

// Gestión de recursos
openAddResourceModal(project: any) {
  this.editingResourceIndex = -1;
  this.currentResource = {
    type: 'hosting',
    name: '',
    url: '',
    username: '',
    password: '',
    notes: '',
    showPassword: false
  };
  this.showPassword = false;
  this.showResourceModal = true;
}

editResource(project: any, index: number) {
  this.editingResourceIndex = index;
  this.currentResource = { ...project.resources[index] };
  this.currentResource.showPassword = false;
  this.showPassword = false;
  this.showResourceModal = true;
}

closeResourceModal() {
  this.showResourceModal = false;
  this.currentResource = {};
  this.editingResourceIndex = -1;
  this.showPassword = false;
}

async saveResource() {
  // Validar datos
  if (!this.currentResource.name || !this.currentResource.url) {
    Swal.fire({
      title: 'Error',
      text: 'El nombre y la URL son obligatorios',
      icon: 'error'
    });
    return;
  }

  try {
    // Clonar el proyecto para realizar modificaciones
    const projectUpdate = { ...this.selectedProject };
    
    // Asegurar que existe el array de recursos
    if (!projectUpdate.resources) {
      projectUpdate.resources = [];
    }
    
    // Limpiar propiedades temporales
    const resourceToSave = { ...this.currentResource };
    delete resourceToSave.showPassword;
    
    // Añadir o actualizar recurso
    if (this.editingResourceIndex === -1) {
      // Añadir nuevo recurso
      projectUpdate.resources.push(resourceToSave);
    } else {
      // Actualizar recurso existente
      projectUpdate.resources[this.editingResourceIndex] = resourceToSave;
    }
    
    // Actualizar en Firestore
    await this.firestore.collection('projects').doc(projectUpdate.id).update({
      resources: projectUpdate.resources
    });
    
    // Actualizar objeto local
    this.selectedProject = projectUpdate;
    
    Swal.fire({
      title: this.editingResourceIndex === -1 ? 'Recurso añadido' : 'Recurso actualizado',
      icon: 'success',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });
    
    this.closeResourceModal();
  } catch (error) {
    console.error('Error al guardar el recurso:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo guardar el recurso',
      icon: 'error'
    });
  }
}

async deleteResource(project: any, index: number) {
  const result = await Swal.fire({
    title: '¿Eliminar recurso?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444'
  });
  
  if (result.isConfirmed) {
    try {
      // Clonar el proyecto para realizar modificaciones
      const projectUpdate = { ...project };
      
      // Eliminar el recurso
      projectUpdate.resources.splice(index, 1);
      
      // Actualizar en Firestore
      await this.firestore.collection('projects').doc(projectUpdate.id).update({
        resources: projectUpdate.resources
      });
      
      // Actualizar objeto local
      this.selectedProject = projectUpdate;
      
      Swal.fire({
        title: 'Recurso eliminado',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al eliminar el recurso:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el recurso',
        icon: 'error'
      });
    }
  }
}

copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    // Mostrar pequeña notificación
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
    
    Toast.fire({
      icon: 'success',
      title: 'Copiado al portapapeles'
    });
  });
}

// Gestión de hitos
openAddMilestoneModal(project: any) {
  this.editingMilestoneIndex = -1;
  this.currentMilestone = {
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentPercentage: 0,
    completed: false
  };
  this.showMilestoneModal = true;
}

editMilestone(project: any, index: number) {
  this.editingMilestoneIndex = index;
  this.currentMilestone = { ...project.milestones[index] };
  this.showMilestoneModal = true;
}

closeMilestoneModal() {
  this.showMilestoneModal = false;
  this.currentMilestone = {};
  this.editingMilestoneIndex = -1;
}

getTotalMilestonePercentageForEdit(): number {
  if (!this.selectedProject || !this.selectedProject.milestones) return this.currentMilestone.paymentPercentage || 0;
  
  let total = 0;
  this.selectedProject.milestones.forEach((milestone: any, index: number) => {
    if (index !== this.editingMilestoneIndex) {
      total += milestone.paymentPercentage || 0;
    }
  });
  
  return total + (this.currentMilestone.paymentPercentage || 0);
}

async saveMilestone() {
  // Validar datos
  if (!this.currentMilestone.name || !this.currentMilestone.date) {
    Swal.fire({
      title: 'Error',
      text: 'El nombre y la fecha son obligatorios',
      icon: 'error'
    });
    return;
  }

  try {
    // Clonar el proyecto para realizar modificaciones
    const projectUpdate = { ...this.selectedProject };
    
    // Asegurar que existe el array de hitos
    if (!projectUpdate.milestones) {
      projectUpdate.milestones = [];
    }
    
    // Añadir o actualizar hito
    if (this.editingMilestoneIndex === -1) {
      // Añadir nuevo hito
      projectUpdate.milestones.push(this.currentMilestone);
    } else {
      // Actualizar hito existente
      projectUpdate.milestones[this.editingMilestoneIndex] = this.currentMilestone;
    }
    
    // Actualizar en Firestore
    await this.firestore.collection('projects').doc(projectUpdate.id).update({
      milestones: projectUpdate.milestones
    });
    
    // Actualizar objeto local
    this.selectedProject = projectUpdate;
    
    Swal.fire({
      title: this.editingMilestoneIndex === -1 ? 'Hito añadido' : 'Hito actualizado',
      icon: 'success',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });
    
    this.closeMilestoneModal();
  } catch (error) {
    console.error('Error al guardar el hito:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo guardar el hito',
      icon: 'error'
    });
  }
}

async completeMilestone(project: any, index: number) {
  try {
    // Clonar el proyecto para realizar modificaciones
    const projectUpdate = { ...project };
    
    // Marcar hito como completado
    projectUpdate.milestones[index].completed = true;
    
    // Actualizar en Firestore
    await this.firestore.collection('projects').doc(projectUpdate.id).update({
      milestones: projectUpdate.milestones
    });
    
    // Actualizar objeto local
    this.selectedProject = projectUpdate;
    
    Swal.fire({
      title: 'Hito completado',
      icon: 'success',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Error al completar el hito:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo completar el hito',
      icon: 'error'
    });
  }
}

async deleteMilestone(project: any, index: number) {
  const result = await Swal.fire({
    title: '¿Eliminar hito?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444'
  });
  
  if (result.isConfirmed) {
    try {
      // Clonar el proyecto para realizar modificaciones
      const projectUpdate = { ...project };
      
      // Eliminar el hito
      projectUpdate.milestones.splice(index, 1);
      
      // Actualizar en Firestore
      await this.firestore.collection('projects').doc(projectUpdate.id).update({
        milestones: projectUpdate.milestones
      });
      
      // Actualizar objeto local
      this.selectedProject = projectUpdate;
      
      Swal.fire({
        title: 'Hito eliminado',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al eliminar el hito:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el hito',
        icon: 'error'
      });
    }
  }
}

// Mostrar todos los miembros del equipo
showAllTeamMembers() {
  if (!this.selectedProject || !this.selectedProject.teamMembers) return;
  
  const teamMembers = this.selectedProject.teamMembers.map((member: any) => {
    return `
      <div class="flex items-center justify-between border-b border-gray-200 py-2">
        <div class="flex items-center">
          <div class="inline-block w-6 h-6 rounded-full mr-2" style="background-color: ${this.getRandomColor(member.name)}; text-align: center; line-height: 24px; color: white; font-weight: 500; font-size: 12px;">
            ${member.name.charAt(0)}
          </div>
          <span>${member.name}</span>
        </div>
        <div class="flex items-center">
          <div class="inline-block w-6 h-6 rounded-full mr-2" style="background-color: ${this.getRandomColor(member.name)}; text-align: center; line-height: 24px; color: white; font-weight: 500; font-size: 12px;">
            ${member.name.charAt(0)}
          </div>
          <span>${member.name}</span>
        </div>
        <div class="flex items-center">
          <span class="text-gray-500 mr-3">${this.getRoleLabel(member.role)}</span>
          <span class="font-medium">${member.percentage}%</span>
        </div>
      </div>
    `;
  }).join('');
  
  Swal.fire({
    title: 'Equipo del Proyecto',
    html: `
      <div class="max-h-80 overflow-y-auto">
        ${teamMembers}
      </div>
    `,
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#3b82f6'
  });
}

// Filtros de tareas
filterTasks(filter: 'all' | 'pending' | 'in-progress' | 'review' | 'completed') {
  this.currentTaskFilter = filter;
}

// Filtros de archivos
filterFiles(filter: 'all' | 'image' | 'document' | 'other') {
  this.currentFileFilter = filter;
}


// Propiedades adicionales para el componente
searchClientText: string = '';
currentClientFilter: 'all' | 'with-website' | 'no-website' | 'with-location' = 'all';
selectedBusinessType: string = 'all';
businessTypeChart: any[] = [];
businessTypeColors: string[] = [];

// Actualizar changeView para incluir la nueva vista
changeView(view: 'dashboard' | 'contacts' | 'quotations' | 'quotation-detail' | 'new-project' | 'projects' | 'project-detail' | 'potential-clients') {
  window.scrollTo(0, 0);
  this.currentView = view;
  this.isSidebarOpen = false;
  
  // Si se cambia a la vista de clientes potenciales, intentar renderizar las gráficas nuevamente
  if (view === 'potential-clients' && this.clientsData && this.clientsData.length > 0) {
    console.log('Cambiando a vista de clientes potenciales, intentando renderizar gráficas');
    // Dar tiempo para que el DOM se actualice
    setTimeout(() => {
      this.generateCharts();
    }, 500);
  }
}

// Método para procesar el archivo Excel seleccionado
async onExcelFileSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Mostrar cargando
  Swal.fire({
    title: 'Procesando archivo',
    html: 'Esto puede tomar un momento...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
  try {
    // Leer el archivo
    const reader = new FileReader();
    
    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      let workbook;
      let jsonData;
      
      if (file.name.endsWith('.csv')) {
        // Procesar CSV
        const text = new TextDecoder('utf-8').decode(data);
        // Llamar a la función pero devolver los datos en lugar de asignarlos directamente
        jsonData = await this.processCSVData(text, true);
      } else {
        // Procesar Excel
        try {
          // Se requiere importar xlsx (SheetJS)
          const XLSX = await import('xlsx');
          workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
          
          // Normalizar los datos pero no asignarlos directamente al clientsData
          jsonData = this.normalizeData(jsonData);
        } catch (error) {
          console.error('Error al procesar Excel:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo procesar el archivo Excel. Asegúrate de que tenga el formato correcto.',
            icon: 'error'
          });
          return;
        }
      }

      // Si llegamos aquí, tenemos los datos normalizados en jsonData
      if (jsonData && jsonData.length > 0) {
        // Guardar en Firestore
        try {
          // Opción 1: Guardar como colección
          const batch = this.firestore.firestore.batch();
          const clientsCollectionRef = this.firestore.collection('potential_clients');
          
          // Eliminar datos existentes (opcional, depende si quieres reemplazar o añadir)
          Swal.fire({
            title: '¿Cómo quieres guardar estos datos?',
            text: 'Puedes reemplazar todos los clientes existentes o añadir estos nuevos a la lista actual',
            icon: 'question',
            showDenyButton: true,
            confirmButtonText: 'Reemplazar existentes',
            denyButtonText: 'Añadir a existentes',
            confirmButtonColor: '#3b82f6'
          }).then(async (result) => {
            if (result.isConfirmed) {
              const existingClients = await clientsCollectionRef.get().toPromise();
              const deletePromises = existingClients?.docs.map(doc => doc.ref.delete()) || [];              
              await Promise.all(deletePromises);
            }
            
            // Ahora guardar los nuevos datos
            for (const client of jsonData) {
              // Añadir fecha de carga
              client.uploadedAt = new Date();
              
              // Crear documento nuevo
              const newDocRef = clientsCollectionRef.doc().ref;
              batch.set(newDocRef, client);              
            }
            
            // Commit el batch
            await batch.commit();
            
            // Cargar los datos en la interfaz
            this.loadPotentialClientsFromFirestore();
            
            Swal.fire({
              title: 'Datos guardados',
              icon: 'success',
              text: `Se guardaron ${jsonData.length} registros de clientes potenciales.`,
              confirmButtonColor: '#3b82f6'
            });
          });
        } catch (error) {
          console.error('Error al guardar en Firestore:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron guardar los datos en la base de datos.',
            icon: 'error'
          });
        }
      }
    };
    
    reader.onerror = () => {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo leer el archivo.',
        icon: 'error'
      });
    };
    
    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error('Error al leer el archivo:', error);
    Swal.fire({
      title: 'Error',
      text: 'Ocurrió un error al procesar el archivo.',
      icon: 'error'
    });
  }
  
  // Limpiar el input file para permitir cargar el mismo archivo nuevamente
  event.target.value = '';
}


loadPotentialClientsFromFirestore() {
  this.firestore.collection('potential_clients')
    .snapshotChanges()
    .subscribe(actions => {
      this.clientsData = actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      });
      
      // Generar gráficos con los datos cargados
      if (this.clientsData.length > 0) {
        this.generateCharts();
      }
    });
}
presenceData: any[] = [];

// Procesar datos CSV
processCSVData(text: string, returnData = false): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      // Se requiere importar Papa Parse
      import('papaparse').then(Papa => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const normalizedData = this.normalizeData(results.data);
            
            if (!returnData) {
              // Comportamiento original
              this.clientsData = normalizedData;
              this.generateCharts();
              
              Swal.fire({
                title: 'Archivo procesado',
                icon: 'success',
                text: `Se cargaron ${this.clientsData.length} registros de clientes potenciales.`,
                confirmButtonColor: '#3b82f6'
              });
            }
            
            resolve(normalizedData);
          },
          error: (error: Error) => {
            console.error('Error al procesar CSV:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error al procesar CSV:', error);
      reject(error);
    }
  });
}
// Normalizar datos del Excel
normalizeData(data: any[]): any[] {
  return data.map(item => {
    // Buscar las columnas que podrían contener los datos que necesitamos
    const nameKeys = Object.keys(item).filter(k => 
      k.toLowerCase().includes('name') || 
      k.toLowerCase().includes('nombre') || 
      k.toLowerCase().includes('business') ||
      k.toLowerCase().includes('empresa')
    );
    
    const websiteKeys = Object.keys(item).filter(k => 
      k.toLowerCase().includes('web') || 
      k.toLowerCase().includes('site') || 
      k.toLowerCase().includes('sitio')
    );
    
    const locationKeys = Object.keys(item).filter(k => 
      k.toLowerCase().includes('location') || 
      k.toLowerCase().includes('ubicacion') || 
      k.toLowerCase().includes('ubicación') ||
      k.toLowerCase().includes('place') ||
      k.toLowerCase().includes('map')
    );
    
    const typeKeys = Object.keys(item).filter(k => 
      k.toLowerCase().includes('type') || 
      k.toLowerCase().includes('tipo') || 
      k.toLowerCase().includes('giro') ||
      k.toLowerCase().includes('industry') ||
      k.toLowerCase().includes('industria') ||
      k.toLowerCase().includes('category') ||
      k.toLowerCase().includes('categoría')
    );
    
    // Obtener los valores usando las claves encontradas o predeterminadas
    const name = nameKeys.length > 0 ? item[nameKeys[0]] : (item['name'] || item['Name'] || '');
    const website = websiteKeys.length > 0 ? item[websiteKeys[0]] : (item['website'] || item['Website'] || '');
    const place_link = locationKeys.length > 0 ? item[locationKeys[0]] : (item['place_link'] || item['location'] || '');
    const types = typeKeys.length > 0 ? item[typeKeys[0]] : (item['types'] || item['type'] || 'No especificado');
    
    return {
      name: name || 'Sin nombre',
      website: website || '',
      place_link: place_link || '',
      types: types || 'No especificado'
    };
  });
}

// Generar gráficos
generateCharts() {
  this.generateBusinessTypeChart();
  this.generatePresenceChart();
}

// Generar gráfico de tipos de negocio
generateBusinessTypeChart() {
  const businessTypes = this.getUniqueBusinessTypes();
  const counts: { [key: string]: number } = {};
  
  // Contar ocurrencias de cada tipo
  this.clientsData.forEach(client => {
    const type = client.types || 'No especificado';
    counts[type] = (counts[type] || 0) + 1;
  });
  
  // Preparar datos para el gráfico
  this.businessTypeChart = businessTypes.map(type => {
    return {
      name: type,
      value: counts[type] || 0
    };
  });
  
  // Ordenar por cantidad descendente y limitar a los 10 más comunes
  this.businessTypeChart.sort((a, b) => b.value - a.value);
  if (this.businessTypeChart.length > 10) {
    const others = {
      name: 'Otros',
      value: this.businessTypeChart.slice(9).reduce((sum, item) => sum + item.value, 0)
    };
    this.businessTypeChart = this.businessTypeChart.slice(0, 9);
    this.businessTypeChart.push(others);
  }
  
  // Generar colores aleatorios para los gráficos
  this.businessTypeColors = this.businessTypeChart.map((item) => this.getRandomColor(item.name));
  
  // Renderizar gráfico usando Chart.js
  setTimeout(() => {
    this.renderBusinessTypeChart();
    this.renderPresenceChart();
  }, 100);
}

renderBusinessTypeChart() {
  const ctx = document.getElementById('businessTypeChart') as HTMLCanvasElement;
  if (!ctx) {
    console.error('No se encontró el elemento businessTypeChart en el DOM');
    return;
  }
  
  console.log('Renderizando gráfica de tipos de negocio');
  
  // Si estás usando Chart.js
  import('chart.js').then(Chart => {
    // Destruir gráfico existente si hay uno
    if (window.businessChart instanceof Chart.Chart) {
      window.businessChart.destroy();
    }
    
    window.businessChart = new Chart.Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.businessTypeChart.map(item => item.name),
        datasets: [{
          data: this.businessTypeChart.map(item => item.value),
          backgroundColor: this.businessTypeColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                const percentage = ((value as number) / this.clientsData.length * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }).catch(error => {
    console.error('Error al cargar Chart.js:', error);
  });
}

// Renderizar gráfico de tipos de negocio con Chart.js
renderPresenceChart() {
  const ctx = document.getElementById('presenceChart') as HTMLCanvasElement;
  if (!ctx) {
    console.error('No se encontró el elemento presenceChart en el DOM');
    return;
  }
  
  console.log('Renderizando gráfica de presencia digital');
  
  // Si estás usando Chart.js
  import('chart.js').then(Chart => {
    // Destruir gráfico existente si hay uno
    if (window.presenceChart instanceof Chart.Chart) {
      window.presenceChart.destroy();
    }
    
    window.presenceChart = new Chart.Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.presenceData.map(item => item.name),
        datasets: [{
          label: 'Clientes',
          data: this.presenceData.map(item => item.value),
          backgroundColor: ['#3b82f6', '#10b981', '#6366f1', '#ef4444'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                const percentage = ((value as number) / this.clientsData.length * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Número de clientes'
            }
          }
        }
      }
    });
  }).catch(error => {
    console.error('Error al cargar Chart.js:', error);
  });
}

// Generar gráfico de presencia digital
generatePresenceChart() {
  const withWebsite = this.getClientsWithWebsite();
  const withLocation = this.getClientsWithLocation();
  const withBoth = this.clientsData.filter(c => 
    (c.website && c.website.trim()) && 
    (c.place_link && c.place_link.trim())
  ).length;
  const withNone = this.clientsData.filter(c => 
    (!c.website || !c.website.trim()) && 
    (!c.place_link || !c.place_link.trim())
  ).length;
  
  this.presenceData = [
    { name: 'Solo Web', value: withWebsite - withBoth },
    { name: 'Solo Ubicación', value: withLocation - withBoth },
    { name: 'Ambos', value: withBoth },
    { name: 'Ninguno', value: withNone }
  ];
}

// Métodos para métricas
getClientsWithWebsite(): number {
  return this.clientsData.filter(client => client.website && client.website.trim()).length;
}

getClientsWithLocation(): number {
  return this.clientsData.filter(client => client.place_link && client.place_link.trim()).length;
}

getUniqueBusinessTypes(): string[] {
  const types = new Set<string>();
  this.clientsData.forEach(client => {
    types.add(client.types || 'No especificado');
  });
  return Array.from(types);
}

getPercentage(part: number, total: number): string {
  if (total === 0) return '0';
  return ((part / total) * 100).toFixed(1);
}

// Método para filtrar clientes
filteredClients(): any[] {
  let result = [...this.clientsData];
  
  // Filtrar por texto de búsqueda
  if (this.searchClientText) {
    const searchText = this.searchClientText.toLowerCase();
    result = result.filter(client => 
      client.name.toLowerCase().includes(searchText) || 
      (client.types && client.types.toLowerCase().includes(searchText))
    );
  }
  
  // Filtrar por presencia web/ubicación
  if (this.currentClientFilter === 'with-website') {
    result = result.filter(client => client.website && client.website.trim());
  } else if (this.currentClientFilter === 'no-website') {
    result = result.filter(client => !client.website || !client.website.trim());
  } else if (this.currentClientFilter === 'with-location') {
    result = result.filter(client => client.place_link && client.place_link.trim());
  }
  
  // Filtrar por tipo de negocio
  if (this.selectedBusinessType !== 'all') {
    result = result.filter(client => client.types === this.selectedBusinessType);
  }
  
  return result;
}

// Cambiar filtro
filterClients(filter: 'all' | 'with-website' | 'no-website' | 'with-location') {
  this.currentClientFilter = filter;
}

// Aplicar filtro de tipo de negocio
applyBusinessTypeFilter() {
  // No es necesario hacer nada aquí, ya que el filtro se aplica en filteredClients()
}

// Obtener clase CSS para el tipo de negocio
getBusinessTypeClass(type: string): string {
  // Generar un color consistente basado en el tipo de negocio
  const hash = this.hashString(type);
  const colorIndex = Math.abs(hash) % 5;
  
  const colorClasses = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800'
  ];
  
  return colorClasses[colorIndex];
}

// Función para generar un hash a partir de un string
hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convertir a entero de 32 bits
  }
  return hash;
}

// Formatear URL de sitio web
formatWebsiteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}


// Exportar a Excel
exportToExcel() {
  // Se requiere importar xlsx (SheetJS)
  import('xlsx').then(XLSX => {
    try {
      const data = this.filteredClients();
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes Potenciales');
      XLSX.writeFile(workbook, 'clientes_potenciales.xlsx');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo exportar a Excel.',
        icon: 'error'
      });
    }
  });
}

// Limpiar datos
clearData() {
  Swal.fire({
    title: '¿Limpiar datos?',
    text: 'Se eliminarán todos los datos de clientes potenciales. Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, limpiar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        // Eliminar de Firestore
        const clientsRef = this.firestore.collection('potential_clients');
        const snapshot = await clientsRef.get().toPromise();
        
        const batch = this.firestore.firestore.batch();
        if (snapshot && snapshot.docs) {
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
        }
        
        await batch.commit();
        
        // Limpiar datos locales
        this.clientsData = [];
        this.businessTypeChart = [];
        this.selectedBusinessType = 'all';
        this.currentClientFilter = 'all';
        this.searchClientText = '';
        
        Swal.fire({
          title: 'Datos eliminados',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al eliminar datos:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron eliminar los datos.',
          icon: 'error'
        });
      }
    }
  });
}

// Convertir a contacto
convertToContact(client: any) {
  Swal.fire({
    title: 'Convertir a Contacto',
    html: `
      <form id="contact-form" class="space-y-4 text-left">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nombre</label>
          <input type="text" id="name" value="${client.name}" class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Teléfono</label>
          <input type="tel" id="phone" class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Mensaje</label>
          <textarea id="message" rows="3" class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>
      </form>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar Contacto',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3b82f6',
    preConfirm: () => {
      const name = (document.getElementById('name') as HTMLInputElement).value;
      const email = (document.getElementById('email') as HTMLInputElement).value;
      const phone = (document.getElementById('phone') as HTMLInputElement).value;
      const message = (document.getElementById('message') as HTMLTextAreaElement).value;
      
      if (!name || !email) {
        Swal.showValidationMessage('El nombre y email son obligatorios');
        return false;
      }
      
      return { name, email, phone, message };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      // Crear contacto en Firestore
      const contactData = {
        name: result.value.name,
        email: result.value.email,
        phone: result.value.phone || '',
        message: result.value.message || '',
        source: 'Convertido de cliente potencial',
        website: client.website || '',
        business_type: client.types || '',
        location: client.place_link || '',
        status: 'nuevo',
        createdAt: new Date()
      };
      
      this.firestore.collection('contacts').add(contactData)
        .then(() => {
          Swal.fire({
            title: 'Contacto guardado',
            text: 'El cliente potencial ha sido convertido a contacto exitosamente.',
            icon: 'success'
          });
        })
        .catch(error => {
          console.error('Error al guardar contacto:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo guardar el contacto.',
            icon: 'error'
          });
        });
    }
  });
}

// Crear cotización
createQuotation(client: any) {
  this.router.navigate(['/create-quotation'], { 
    queryParams: { 
      name: client.name,
      company: client.name, // O puedes usar un campo company si existe
      business_type: client.types
    } 
  });
}

}