import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard';
import { DTsPage } from './pages/dts';
import { TorneosPage } from './pages/torneos';
import { TorneoTablasPage } from './pages/torneo-tablas';
import { HistorialPage } from './pages/historial';
import { TransferiblesPage } from './pages/transferibles';
import { SoFifaPage } from './pages/sofifa';
import { ImportPage } from './pages/import';

export const routes: Routes = [
  { path: '', component: DashboardPage },
  { path: 'dts', component: DTsPage },
  { path: 'torneos', component: TorneosPage },
  { path: 'torneos/:id', component: TorneoTablasPage },
  { path: 'historial', component: HistorialPage },
  { path: 'transferibles', component: TransferiblesPage },
  { path: 'sofifa', component: SoFifaPage },
  { path: 'importar', component: ImportPage },
  { path: '**', redirectTo: '' },
];
