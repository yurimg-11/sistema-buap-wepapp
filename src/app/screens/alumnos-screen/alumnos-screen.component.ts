  import { Component, OnInit, ViewChild } from '@angular/core';
  import { MatDialog } from '@angular/material/dialog';
  import { MatPaginator } from '@angular/material/paginator';
  import { MatSort } from '@angular/material/sort';
  import { MatTableDataSource } from '@angular/material/table';
  import { Router } from '@angular/router';
  import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
  import { AlumnosService } from 'src/app/services/alumnos.service';
  import { FacadeService } from 'src/app/services/facade.service';

  @Component({
    selector: 'app-alumnos-screen',
    templateUrl: './alumnos-screen.component.html',
    styleUrls: ['./alumnos-screen.component.scss'],
    standalone: false
  })
  export class AlumnosScreenComponent implements OnInit {

    public name_user: string = "";
    public rol: string = "";
    public token: string = "";
    public lista_alumnos: any[] = [];

    displayedColumns: string[] = ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'edad', 'curp', 'rfc', 'telefono', 'ocupacion', 'editar', 'eliminar'];

    dataSource = new MatTableDataSource<DatosAlumno>(this.lista_alumnos as DatosAlumno[]);

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(
      public facadeService: FacadeService,
      public alumnosService: AlumnosService,
      private router: Router,
      public dialog: MatDialog
    ) { }

    ngOnInit(): void {
      this.name_user = this.facadeService.getUserCompleteName();
      this.rol = this.facadeService.getUserGroup();

      this.token = this.facadeService.getSessionToken();
      if(this.token == ""){
        this.router.navigate(["/"]);
      }

      this.obtenerAlumnos();
    }

    public obtenerAlumnos() {
  this.alumnosService.obtenerListaAlumnos().subscribe(
    (response) => {
      this.lista_alumnos = response;

      if (this.lista_alumnos.length > 0) {

        this.lista_alumnos.forEach(usuario => {
          usuario.first_name = usuario.user.first_name;
          usuario.last_name = usuario.user.last_name;
          usuario.email = usuario.user.email;
        });

        this.dataSource = new MatTableDataSource<DatosAlumno>(this.lista_alumnos);

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      }
    },
    () => {
      alert("No se pudo obtener la lista de alumnos");
    }
  );
}

    public applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }

   public goEditar(idUser: number) {
  this.router.navigate(["/registro-usuarios/alumno", idUser]);
}

  public delete(idUser: number) {
    const userIdSession = Number(this.facadeService.getUserId());

    if (this.rol === 'administrador' || (this.rol === 'alumno' && userIdSession === idUser)) {
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'alumno'},
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          alert("Alumno eliminado correctamente.");
          window.location.reload();
        } else {
          alert("No se pudo eliminar el alumno.");
        }
      });
    } else {
      alert("No tienes permisos para eliminar este alumno.");
    }
  }
}

export interface DatosAlumno {
  id: number,
  matricula: string;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  curp: string,
  rfc: string,
  ocupacion: string,
}
