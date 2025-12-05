import { Component, OnInit, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MateriasService } from 'src/app/services/materias.service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss'],
  standalone: false
})
export class GraficasScreenComponent implements OnInit, AfterViewInit {

  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;

  public total_user: any = {};

  // GRÁFICA 1: Line Chart (Mantenemos la inicialización en 0)
  lineChartData = {
    labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    datasets: [
      {
        data: [0, 0, 0, 0, 0],
        label: 'Materias por día',
        backgroundColor: '#F88406',
        borderColor: '#F88406',
        pointBackgroundColor: '#F88406',
        fill: false,
        tension: 0.1
      }
    ]
  };
  lineChartOption = { responsive: true };
  lineChartPlugins = [DatalabelsPlugin];

  // GRÁFICA 2: Barras
  barChartData = {
    labels: ["Admins", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Usuarios Registrados',
        backgroundColor: ['#F88406', '#FCFF44', '#82D3FB']
      }
    ]
  };
  barChartOption = { responsive: true };
  barChartPlugins = [DatalabelsPlugin];

  // GRÁFICA 3: Circular
  pieChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731']
      }
    ]
  };
  pieChartOption = { responsive: true };
  pieChartPlugins = [DatalabelsPlugin];

  // GRÁFICA 4: Doughnut
  doughnutChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: ['#F88406', '#FCFF44', '#31E7E7']
      }
    ]
  };
  doughnutChartOption = { responsive: true };
  doughnutChartPlugins = [DatalabelsPlugin];

  constructor(
    private administradoresServices: AdministradoresService,
    private materiasService: MateriasService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void { 
    this.obtenerTotalUsers();
    this.obtenerDatosMaterias();
  }

  public obtenerTotalUsers() {
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response) => {
        // Log de diagnóstico
        console.log("API USERS - RESPUESTA EXITOSA:", response);

        this.total_user = response;
        const datos = [
          this.total_user.admins || 0,
          this.total_user.maestros || 0,
          this.total_user.alumnos || 0
        ];

        this.barChartData = {
          ...this.barChartData,
          datasets: [{...this.barChartData.datasets[0], data: datos as number[]}]
        };

        this.pieChartData = {
          ...this.pieChartData,
          datasets: [{...this.pieChartData.datasets[0], data: datos as number[]}]
        };

        this.doughnutChartData = {
          ...this.doughnutChartData,
          datasets: [{...this.doughnutChartData.datasets[0], data: datos as number[]}]
        };
        this.actualizarGraficas();
      }, (error) => {
        console.error("API USERS - ERROR:", error);
      }
    );
  }

  public obtenerDatosMaterias() {
    this.materiasService.obtenerListaMaterias().subscribe(
      (response: any[]) => {
        console.log("API MATERIAS - RESPUESTA EXITOSA:", response);

        const conteoDias = [0, 0, 0, 0, 0];

        response.forEach(materia => {
          const diasProp = materia.dias_semana || materia.dias;

          if (diasProp) {
            const diasArray = Array.isArray(diasProp)
              ? diasProp
              : diasProp.split(',').map((d: string) => d.trim());

            if (diasArray.includes('Lunes')) conteoDias[0]++;
            if (diasArray.includes('Martes')) conteoDias[1]++;
            if (diasArray.includes('Miércoles')) conteoDias[2]++;
            if (diasArray.includes('Jueves')) conteoDias[3]++;
            if (diasArray.includes('Viernes')) conteoDias[4]++;
          }
        });

        console.log("Conteo de materias por día:", conteoDias);

        this.lineChartData = {
          ...this.lineChartData,
          datasets: [{...this.lineChartData.datasets[0], data: conteoDias as number[]}]
        };

        this.actualizarGraficas();

      }, (error) => {
        console.error("API MATERIAS - ERROR:", error);
      }
    );
  }

  public actualizarGraficas() {
    if (this.charts) {
      this.charts.forEach((child) => {
        child.chart?.update();
      });
    }
  }
}
