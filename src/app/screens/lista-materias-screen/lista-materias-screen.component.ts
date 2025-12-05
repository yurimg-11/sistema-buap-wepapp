import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { MateriasService } from 'src/app/services/materias.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { FacadeService } from 'src/app/services/facade.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-lista-materias-screen',
  templateUrl: './lista-materias-screen.component.html',
  styleUrls: ['./lista-materias-screen.component.scss'],
  standalone: false
})
export class ListaMateriasScreenComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'nrc',
    'nombre',
    'seccion',
    'dias',
    'horario',
    'salon',
    'programa',
    'profesor',
    'creditos',
    'editar',
    'eliminar'
  ];

  // 🔹 SIEMPRE inicializado, nunca null
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  lista_materias: any[] = [];
  searchValue: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  name_user: string = '';
  rol: string = '';

  // id_maestro -> "Nombre Apellido"
  maestrosMap: { [id: number]: string } = {};

  constructor(
    private materiasService: MateriasService,
    private maestrosService: MaestrosService,
    private facadeService: FacadeService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    // Si NO es administrador, ocultamos columnas de editar/eliminar
    if (!this.puedeEditarEliminar()) {
      this.displayedColumns = this.displayedColumns.filter(
        col => col !== 'editar' && col !== 'eliminar'
      );
    }

    this.cargarMaestrosYMaterias();
  }

  // 🔹 Aquí se conecta REALMENTE el paginator y el sort
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Primero obtenemos maestros para poder armar el nombre
  cargarMaestrosYMaterias(): void {
    this.maestrosService.obtenerListaMaestros().subscribe({
      next: (maestros: any[]) => {
        this.maestrosMap = {};
        maestros.forEach((m: any) => {
          const id = m.id;
          let nombre = '';

          if (m.user) {
            nombre = `${m.user.first_name} ${m.user.last_name}`;
          } else if (m.first_name || m.last_name) {
            nombre = `${m.first_name || ''} ${m.last_name || ''}`.trim();
          } else {
            nombre = 'Sin nombre';
          }

          this.maestrosMap[id] = nombre;
        });

        this.cargarMaterias();
      },
      error: (err) => {
        console.error('Error al obtener maestros para las materias', err);
        this.maestrosMap = {};
        this.cargarMaterias(); // aun sin maestros, cargamos materias
      }
    });
  }

  cargarMaterias(): void {
    this.materiasService.listarMaterias().subscribe({
      next: (response: any[]) => {
        this.lista_materias = response;

        // Agregamos profesor_nombre usando el mapa
        this.lista_materias.forEach((m: any) => {
          const idMaestro = m.profesor;            // viene del backend
          m.profesor_nombre = this.maestrosMap[idMaestro] || 'Sin asignar';
        });

        // 🔹 IMPORTANTE: NO crear otro MatTableDataSource,
        // solo actualizar los datos
        this.dataSource.data = this.lista_materias;

        this.configurarFiltro();
      },
      error: (err) => {
        console.error('Error al obtener materias', err);
        alert('No se pudo obtener la lista de materias');
      }
    });
  }

  configurarFiltro(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const term = filter.trim().toLowerCase();

      return (
        (data.nrc + '').toLowerCase().includes(term) ||
        (data.nombre_materia || '').toLowerCase().includes(term) ||
        (data.programa_educativo || '').toLowerCase().includes(term) ||
        (data.profesor_nombre || '').toLowerCase().includes(term)
      );
    };
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;
    this.dataSource.filter = value.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter(): void {
    this.searchValue = '';
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  puedeEditarEliminar(): boolean {
    return this.rol === 'administrador' || this.rol === 'admin';
  }

  // ===== EDITAR =====
  editarMateria(row: any): void {
    if (!this.puedeEditarEliminar()) {
      alert('No tienes permisos para editar materias.');
      return;
    }
    this.router.navigate(['/materias-registro', row.nrc]);
  }

  // ===== ELIMINAR con MODAL =====
  eliminarMateria(row: any): void {
    if (!this.puedeEditarEliminar()) {
      alert('No tienes permisos para eliminar materias.');
      return;
    }

    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: row.nrc, rol: 'materia' },
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {
        alert('Materia eliminada correctamente.');
        this.cargarMaterias();
      } else if (result && result.isDelete === false) {
        alert('No se pudo eliminar la materia.');
      }
    });
  }
}
