import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {


  public obtenerListaMaterias(): Observable<any[]> {
    return this.listarMaterias();
  }

  // Usamos una sola base URL, la misma que ya usabas
  private baseUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaMateria() {
    return {
      nrc: '',
      nombre_materia: '',
      seccion: '',
      dias: [],
      hora_inicio: '',
      hora_fin: '',
      salon: '',
      programa_educativo: '',
      profesor: '',
      creditos: ''
    };
  }

  public esquemaErrores() {
    return {
      nrc: '',
      nombre_materia: '',
      seccion: '',
      dias: '',
      hora_inicio: '',
      hora_fin: '',
      salon: '',
      programa_educativo: '',
      profesor: '',
      creditos: '',
      general: ''
    };
  }

  // Validaciones básicas en frontend
  public validarMateria(materia: any): any {
    const errors = this.esquemaErrores();

    if (!materia.nrc || !/^\d{5,6}$/.test(materia.nrc)) {
      errors.nrc = 'El NRC es obligatorio y debe tener 5 o 6 dígitos.';
    }

    if (!materia.nombre_materia || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(materia.nombre_materia)) {
      errors.nombre_materia = 'El nombre solo debe contener letras y espacios.';
    }

    if (!materia.seccion || !/^\d{1,3}$/.test(materia.seccion)) {
      errors.seccion = 'La sección solo admite números y máximo 3 dígitos.';
    }

    if (!materia.dias || materia.dias.length === 0) {
      errors.dias = 'Selecciona al menos un día.';
    }

    if (!materia.hora_inicio) {
      errors.hora_inicio = 'La hora de inicio es obligatoria.';
    }
    if (!materia.hora_fin) {
      errors.hora_fin = 'La hora de fin es obligatoria.';
    }
    if (materia.hora_inicio && materia.hora_fin && materia.hora_inicio >= materia.hora_fin) {
      errors.hora_fin = 'La hora de inicio debe ser menor a la hora de fin.';
    }

    if (!materia.salon || materia.salon.length > 15 || !/^[A-Za-z0-9 ]+$/.test(materia.salon)) {
      errors.salon = 'El salón solo admite caracteres alfanuméricos y espacios (máx 15).';
    }

    if (!materia.programa_educativo) {
      errors.programa_educativo = 'Selecciona un programa educativo.';
    }

    if (!materia.profesor) {
      errors.profesor = 'Selecciona un profesor.';
    }

    if (!materia.creditos || !/^\d{1,2}$/.test(materia.creditos)) {
      errors.creditos = 'Los créditos deben ser un número entero positivo de máximo 2 dígitos.';
    }

    return errors;
  }

  // Helpers para headers con token
  private buildHeaders(): HttpHeaders {
    const token = this.facadeService.getSessionToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    }

    return headers;
  }


  public listarMaterias(): Observable<any[]> {
    const headers = this.buildHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/lista-materias/`, { headers });
  }

  public obtenerMateria(nrc: string): Observable<any> {
    const headers = this.buildHeaders();
    return this.http.get<any>(`${this.baseUrl}/materias/?nrc=${nrc}`, { headers });
  }

  public obtenerMateriaPorNrc(nrc: string): Observable<any> {
    return this.obtenerMateria(nrc);
  }

  public crearMateria(materia: any): Observable<any> {
    const headers = this.buildHeaders();
    const payload = {
      ...materia,
      dias: (materia.dias || []).join(',')   // arreglo → "Lunes,Martes"
    };
    return this.http.post<any>(`${this.baseUrl}/materias/`, payload, { headers });
  }

  public actualizarMateria(nrc: string, materia: any): Observable<any> {
    const headers = this.buildHeaders();
    const payload = {
      ...materia,
      nrc: nrc,
      dias: (materia.dias || []).join(',')
    };
    // El endpoint /materias/ mapea a MateriasView.put()
    return this.http.put<any>(`${this.baseUrl}/materias/`, payload, { headers });
  }

  public eliminarMateria(nrc: string): Observable<any> {
    const headers = this.buildHeaders();
    return this.http.delete<any>(`${this.baseUrl}/materias/?nrc=${nrc}`, { headers });
  }
}
