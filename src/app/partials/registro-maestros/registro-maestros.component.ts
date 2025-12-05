import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss'],
  standalone: false
})
export class RegistroMaestrosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public maestro:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  //Para el select
  public areas: any[] = [
    {value: '1', viewValue: 'Desarrollo Web'},
    {value: '2', viewValue: 'Programación'},
    {value: '3', viewValue: 'Bases de datos'},
    {value: '4', viewValue: 'Redes'},
    {value: '5', viewValue: 'Matemáticas'},
  ];

  public materias:any[] = [
    {value: '1', nombre: 'Aplicaciones Web'},
    {value: '2', nombre: 'Programación 1'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre: 'Tecnologías Web'},
    {value: '5', nombre: 'Minería de datos'},
    {value: '6', nombre: 'Desarrollo móvil'},
    {value: '7', nombre: 'Estructuras de datos'},
    {value: '8', nombre: 'Administración de redes'},
    {value: '9', nombre: 'Ingeniería de Software'},
    {value: '10', nombre: 'Administración de S.O.'},
  ];

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService
  ) { }

  ngOnInit(): void {
    this.token = this.facadeService.getSessionToken();
    this.maestro = this.maestrosService.esquemaMaestro();
    this.maestro.rol = this.rol;

    // Verificar si es edición
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];

      this.maestrosService.obtenerMaestroPorID(Number(this.idUser)).subscribe(
        (response)=>{
          this.maestro = response;
          // Mapeo de datos del usuario
          if(this.maestro.user){
            this.maestro.first_name = this.maestro.user.first_name;
            this.maestro.last_name = this.maestro.user.last_name;
            this.maestro.email = this.maestro.user.email;
            this.maestro.password = "";
            this.maestro.confirmar_password = "";
          }
          // Asegurar que materias_json sea un arreglo (el backend ya lo manda parseado, pero por si acaso)
          if (!Array.isArray(this.maestro.materias_json)) {
            this.maestro.materias_json = [];
          }
          console.log("Maestro edit: ", this.maestro);
        }, (error)=>{
          alert("No se pudo obtener la información del maestro");
        }
      );
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    //Validamos formulario
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    if(this.maestro.password == this.maestro.confirmar_password){
      this.maestrosService.registrarMaestro(this.maestro).subscribe(
        (response) => {
          alert("Maestro registrado exitosamente");
          this.router.navigate(["maestros"]);
        },
        (error) => {
          alert("Error al registrar maestro");
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.maestro.password="";
      this.maestro.confirmar_password="";
    }
  }

  public actualizar(){
    // Validación
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    this.maestrosService.actualizarMaestro(this.maestro).subscribe(
      (response)=>{
        alert("Maestro actualizado correctamente");
        this.router.navigate(["maestros"]);
      }, (error)=>{
        alert("Error al actualizar el maestro");
      }
    );
  }

  //Funciones para password
  showPassword() {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text'; this.hide_1 = true;
    } else{
      this.inputType_1 = 'password'; this.hide_1 = false;
    }
  }

  showPwdConfirmar() {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text'; this.hide_2 = true;
    } else{
      this.inputType_2 = 'password'; this.hide_2 = false;
    }
  }

  public changeFecha(event :any){
    this.maestro.fecha_nacimiento = event.value.toISOString().split("T")[0];
  }

  public checkboxChange(event:any){
    if(event.checked){
      this.maestro.materias_json.push(event.source.value)
    }else{
      this.maestro.materias_json.forEach((materia:any, i:any) => {
        if(materia == event.source.value){
          this.maestro.materias_json.splice(i,1)
        }
      });
    }
  }

  public revisarSeleccion(nombre: string){
    if(this.maestro.materias_json){
      var busqueda = this.maestro.materias_json.find((element:any)=>element==nombre);
      if(busqueda != undefined){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
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
