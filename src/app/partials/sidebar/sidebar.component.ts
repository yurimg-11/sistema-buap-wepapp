import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false
})
export class SidebarComponent implements OnInit {

  mobileOpen = false;
  isMobileView = window.innerWidth < 900;
  userRole: string = '';

  constructor(
    private router: Router,
    private facadeService: FacadeService
  ) { }

  ngOnInit(): void {
    this.userRole = this.facadeService.getUserGroup() || '';
    console.log('User role in sidebar:', this.userRole);
    console.log('canSeeMateriasLista():', this.canSeeMateriasLista());
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobileView = window.innerWidth < 900;
    if (!this.isMobileView) {
      this.mobileOpen = false;
    }
  }

  toggleSidebar(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeSidebar(): void {
    this.mobileOpen = false;
  }

  logout(): void {
    this.facadeService.logout().subscribe(
      () => {
        console.log('Logout successful');
        this.facadeService.destroyUser();
        this.router.navigate(['/login']);
        this.closeSidebar();
      },
      (error) => {
        console.error('Logout error:', error);
        // Fallback: limpiar sesión local y navegar de todos modos
        this.facadeService.destroyUser();
        this.router.navigate(['/login']);
        this.closeSidebar();
      }
    );
  }

  // ===== Helpers de rol =====

  isAdmin(): boolean {
    return this.userRole === 'administrador';
  }

  isTeacher(): boolean {
    return this.userRole === 'maestro';
  }

  isStudent(): boolean {
    return this.userRole === 'alumno';
  }

  // Ítems solo admin
  canSeeAdminItems(): boolean {
    return this.isAdmin();
  }

  // Ítems para admin y maestros
  canSeeTeacherItems(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

  // Ítems visibles para todos
  canSeeStudentItems(): boolean {
    return this.isAdmin() || this.isTeacher() || this.isStudent();
  }

  // Inicio (admin + maestro)
  canSeeHomeItem(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

  // Registro de usuarios (admin + maestro)
  canSeeRegisterItem(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

  // ===== Permisos de materias =====

  // Solo administrador puede registrar materias
  canSeeMateriasRegistro(): boolean {
    return this.isAdmin();
  }

  // Admin y maestros pueden ver la lista de materias
  canSeeMateriasLista(): boolean {
    return this.isAdmin() || this.isTeacher();
    // Para probar que el item se pinta sí o sí, puedes usar temporalmente:
    // return true;
  }
}
