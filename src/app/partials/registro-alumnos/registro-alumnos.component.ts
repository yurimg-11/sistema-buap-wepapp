import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss'],
  standalone: false
})
export class RegistroAlumnosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public alumno:any= {};
  public token: string = "";
  public errors:any={};
  public editar:boolean = false;
  public idUser: Number = 0;

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private alumnosService: AlumnosService,
    private facadeService: FacadeService
  ) { }

  ngOnInit(): void {
    this.token = this.facadeService.getSessionToken();

    this.alumno = this.alumnosService.esquemaAlumno();
    this.alumno.rol = this.rol;

    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);

      if (this.datos_user && Object.keys(this.datos_user).length > 0) {
    this.editar = true;
    this.alumno = this.datos_user;

    if (this.alumno.user) {
      this.alumno.first_name = this.alumno.user.first_name;
      this.alumno.last_name = this.alumno.user.last_name;
      this.alumno.email = this.alumno.user.email;
      this.alumno.password = "";
      this.alumno.confirmar_password = "";
    }
    console.log("Datos alumno recibidos del padre: ", this.alumno);
  }
  // Si no hay datos_user, entonces sí haz la petición por ID
  else if (this.activatedRoute.snapshot.params['id'] != undefined) {
    this.editar = true;
    this.idUser = this.activatedRoute.snapshot.params['id'];
    this.alumnosService.obtenerAlumnoPorID(Number(this.idUser)).subscribe(
      (response) => {
        this.alumno = response;
        if (this.alumno.user) {
          this.alumno.first_name = this.alumno.user.first_name;
          this.alumno.last_name = this.alumno.user.last_name;
          this.alumno.email = this.alumno.user.email;
          this.alumno.password = "";
          this.alumno.confirmar_password = "";
        }
        console.log("Datos alumno edit (desde API): ", this.alumno);
      },
      (error) => {
        alert("No se pudo obtener la información del alumno");
      }
    );
  }
}
}



  public regresar(){
    this.location.back();
  }

  public registrar(){
    //Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Lógica para registrar un nuevo alumno
    if(this.alumno.password == this.alumno.confirmar_password){
      this.alumnosService.registrarAlumno(this.alumno).subscribe(
        (response) => {
          alert("Alumno registrado exitosamente");
          this.router.navigate(["alumnos"]);
        },
        (error) => {
          alert("Error al registrar alumno");
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.alumno.password="";
      this.alumno.confirmar_password="";
    }
  }

  public actualizar(){
    // Validación
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }


    this.alumnosService.actualizarAlumno(this.alumno).subscribe(
      (response)=>{
        alert("Alumno actualizado correctamente");
        this.router.navigate(["alumnos"]);
      }, (error)=>{
        alert("Ocurrió un error al actualizar");
      }
    );
  }

  //Funciones para password
  showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public changeFecha(event :any){
    this.alumno.fecha_nacimiento = event.value.toISOString().split("T")[0];
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      charCode !== 32
    ) {
      event.preventDefault();
    }
  }
}
