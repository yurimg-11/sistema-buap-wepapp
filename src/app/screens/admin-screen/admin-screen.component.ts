import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss'],
  standalone: false
})
export class AdminScreenComponent implements OnInit {
  // Variables y métodos del componente
  public name_user: string = "";
  public lista_admins: any[] = [];
  public token: string = "";

  constructor(
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    // Lógica de inicialización aquí
    this.name_user = this.facadeService.getUserCompleteName();

    // Obtenemos los administradores
    this.obtenerAdmins();
  }

  //Obtener lista de usuarios
  public obtenerAdmins() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response) => {
        this.lista_admins = response;
        console.log("Lista users: ", this.lista_admins);
      }, (error) => {
        alert("No se pudo obtener la lista de administradores");
      }
    );
  }
  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/administrador/" + idUser]);
  }
  public delete(idAdmin: number) {
  const dialogRef = this.dialog.open(EliminarUserModalComponent, {
    data: { id: idAdmin, rol: 'administrador' },
    height: '288px',
    width: '328px',
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result && result.isDelete) {
      this.administradoresService.eliminarAdmin(idAdmin).subscribe(
        (res) => {
          alert("Administrador eliminado correctamente.");
          this.obtenerAdmins(); // ✅ aquí refrescamos la lista
        },
        (err) => {
          if (err.status === 404) {
            // ✅ si el backend devuelve 404, lo tratamos como éxito
            alert("Administrador eliminado correctamente.");
            this.obtenerAdmins();
          } else {
            alert("Error al eliminar administrador.");
          }
        }
      );
    }
  });
}
}
