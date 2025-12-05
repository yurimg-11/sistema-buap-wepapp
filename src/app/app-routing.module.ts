import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { RegistroUsuariosScreenComponent } from './screens/registro-usuarios-screen/registro-usuarios-screen.component';
import { GraficasScreenComponent } from './screens/graficas-screen/graficas-screen.component'; // AÑADIDO: Importar Gráficas
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { AdminScreenComponent } from './screens/admin-screen/admin-screen.component';
import { AlumnosScreenComponent } from './screens/alumnos-screen/alumnos-screen.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { MaestrosScreenComponent } from './screens/maestros-screen/maestros-screen.component';
import { RegistroMateriasScreenComponent } from './screens/registro-materias-screen/registro-materias-screen.component';
import { ListaMateriasScreenComponent } from './screens/lista-materias-screen/lista-materias-screen.component';

const routes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: LoginScreenComponent },
            { path: 'registro-usuarios', component: RegistroUsuariosScreenComponent },
            { path: 'registro-usuarios/:rol/:id', component: RegistroUsuariosScreenComponent },
        ]
    },
    {
        path: '',
        component: DashboardLayoutComponent,
        children: [
            { path: 'home', component: HomeScreenComponent },

            // RUTAS DE ROLES (Necesarias para el login redirect)
            { path: 'administrador', component: AdminScreenComponent }, // Ruta necesaria
            { path: 'maestro', component: MaestrosScreenComponent },
            { path: 'alumno', component: AlumnosScreenComponent },

            // Rutas para listados (Mantenemos los plurales para la navegación interna)
            { path: 'administradores', component: AdminScreenComponent }, 
            { path: 'alumnos', component: AlumnosScreenComponent },
            { path: 'maestros', component: MaestrosScreenComponent },

            // Rutas de Materias
            { path: 'materias-registro/:nrc', component: RegistroMateriasScreenComponent },
            { path: 'materias-registro', component: RegistroMateriasScreenComponent },
            { path: 'materias-lista', component: ListaMateriasScreenComponent },
            { path: 'graficas', component: GraficasScreenComponent }, // AÑADIDO
        ]
    },
    // fallback route
    { path: '**', redirectTo: 'login' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
