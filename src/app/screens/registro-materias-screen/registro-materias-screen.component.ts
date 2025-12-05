import { Component, OnInit } from '@angular/core';
import { MateriasService } from 'src/app/services/materias.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { FacadeService } from 'src/app/services/facade.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-registro-materias-screen',
  templateUrl: './registro-materias-screen.component.html',
  styleUrls: ['./registro-materias-screen.component.scss'],
  standalone: false
})
export class RegistroMateriasScreenComponent implements OnInit {

  public materia: any = {};
  public errors: any = {};
  public profesores: any[] = [];
  public editar: boolean = false;
  public nrcOriginal: string = '';

  constructor(
    private materiasService: MateriasService,
    private maestrosService: MaestrosService,
    private facadeService: FacadeService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.materia = this.materiasService.esquemaMateria();
    this.errors = this.materiasService.esquemaErrores();
    this.cargarProfesores();

    const nrc = this.route.snapshot.paramMap.get('nrc');
    if (nrc) {
      this.editar = true;
      this.nrcOriginal = nrc;
      this.cargarMateria(nrc);
    }
  }

  cargarProfesores() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.profesores = response;
      },
      (error) => {
        console.log('Error al obtener lista de maestros', error);
        alert('No se pudo obtener la lista de maestros');
      }
    );
  }

  cargarMateria(nrc: string) {
    this.materiasService.obtenerMateriaPorNrc(nrc).subscribe(
      (response) => {
        console.log('Materia a editar', response);

        const diasArray = response.dias_semana
          ? response.dias_semana.split(',').map((d: string) => d.trim())
          : [];

        this.materia = {
          ...response,
          dias: diasArray
        };
      },
      (error) => {
        console.log('Error al obtener la materia', error);
        alert('No se pudo obtener la materia');
      }
    );
  }

  public soloNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (!(charCode >= 48 && charCode <= 57)) {
      event.preventDefault();
    }
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) && // A-Z
      !(charCode >= 97 && charCode <= 122) && // a-z
      charCode !== 32
    ) {
      event.preventDefault();
    }
  }

  toggleDia(dia: string, checked: boolean) {
    if (!this.materia.dias) {
      this.materia.dias = [];
    }
    if (checked) {
      if (!this.materia.dias.includes(dia)) {
        this.materia.dias.push(dia);
      }
    } else {
      this.materia.dias = this.materia.dias.filter((d: string) => d !== dia);
    }
  }

  // ========= VALIDACIÓN DE HORARIO =========
  validarHorario(): void {
    const inicio = this.materia.hora_inicio;
    const fin = this.materia.hora_fin;

    // limpiar errores de horario
    this.errors.hora_inicio = '';
    this.errors.hora_fin = '';

    if (inicio && fin && inicio >= fin) {
      this.errors.hora_inicio = 'La hora de inicio debe ser menor que la hora de fin.';
      this.errors.hora_fin = 'La hora de fin debe ser mayor que la hora de inicio.';
    }
  }

  // ========= GUARDAR / ACTUALIZAR =========
  guardar(): void {
    this.errors = this.materiasService.validarMateria(this.materia);
    this.validarHorario();

    // SOLO bloqueamos si el horario es inválido
    if (this.errors.hora_inicio || this.errors.hora_fin) {
      return;
    }

    if (this.editar) {
      if (!confirm('¿Estás seguro de actualizar la materia?')) {
        return;
      }
      this.materiasService.actualizarMateria(this.nrcOriginal, this.materia).subscribe(
        () => {
          alert('Materia actualizada correctamente');
          this.router.navigate(['/materias-lista']);
        },
        (error) => {
          console.log('Error al actualizar materia', error);
          alert('No se pudo actualizar la materia');
        }
      );
    } else {
      this.materiasService.crearMateria(this.materia).subscribe(
        () => {
          alert('Materia registrada correctamente');
          this.router.navigate(['/materias-lista']);
        },
        (error) => {
          console.log('Error al registrar materia', error);
          if (error.error && error.error.nrc) {
            this.errors.nrc = error.error.nrc;
          } else {
            alert('No se pudo registrar la materia');
          }
        }
      );
    }
  }

  cancelar() {
    this.router.navigate(['/materias-lista']);
  }
}
