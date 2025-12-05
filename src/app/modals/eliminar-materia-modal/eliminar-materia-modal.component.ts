import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MateriasService } from 'src/app/services/materias.service';

export interface EliminarMateriaData {
  nrc: string;
  nombre_materia: string;
}

@Component({
  selector: 'app-eliminar-materia-modal',
  templateUrl: './eliminar-materia-modal.component.html',
  styleUrls: ['./eliminar-materia-modal.component.scss'],
  standalone: false
})
export class EliminarMateriaModalComponent {

  constructor(
    private dialogRef: MatDialogRef<EliminarMateriaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EliminarMateriaData,
    private materiasService: MateriasService
  ) {}

  cerrar_modal(): void {
    this.dialogRef.close({ isDelete: false });
  }

  eliminarMateria(): void {
    this.materiasService.eliminarMateria(this.data.nrc).subscribe({
      next: () => {
        this.dialogRef.close({ isDelete: true });
      },
      error: (error) => {
        console.error('Error al eliminar materia', error);
        this.dialogRef.close({ isDelete: false, error });
      }
    });
  }
}
