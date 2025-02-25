import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FirebaseService } from '../../Core/services/firebase.service';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage'; // Add this import
import { Router } from '@angular/router';

type ProjectRole = 'frontend' | 'backend' | 'design' | 'pm' | 'qa';

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
  currentView: 'dashboard' | 'contacts' | 'quotations' | 'quotation-detail' | 'new-project' = 'dashboard';
  selectedQuotation: any = null;
  isSidebarOpen = false;
  windowWidth: number = 0;
  searchText: string = '';
  userName: string | null = null;
  userEmail: string | null = null;
  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage, // Add storage service
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

    this.loadData();
    
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth = window.innerWidth;
    }
  }


  changeView(view: 'dashboard' | 'contacts' | 'quotations' | 'new-project') {
    window.scrollTo(0, 0);
    this.currentView = view;
    this.isSidebarOpen = false;  // Cierra el menú
  }

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
  
  previewFile(file: any) {
    // Solo para imágenes
    if (file.type.includes('image')) {
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
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
}
}