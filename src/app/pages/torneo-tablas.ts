import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-torneo-tablas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto p-6 space-y-6" *ngIf="tid as id">
      <a routerLink="/torneos" class="text-sm text-slate-600">← Volver</a>
      <h1 class="text-xl font-semibold text-slate-800">Tablas — {{ state.torneos()[id]?.nombreTorneo }}</h1>

      <section class="bg-white rounded-lg border border-slate-200 shadow p-4">
        <h2 class="font-semibold text-slate-700">Tabla de posiciones</h2>
        <div class="overflow-auto">
          <table class="min-w-full text-sm mt-2">
            <thead><tr class="text-left text-slate-600"><th class="p-2">DT</th><th class="p-2">Equipo</th><th class="p-2">PJ</th><th class="p-2">G</th><th class="p-2">E</th><th class="p-2">P</th><th class="p-2">Goles</th><th class="p-2">Pts</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of state.tablaPosiciones(id)" class="border-t">
                <td class="p-2">{{ r.nombre }}</td>
                <td class="p-2">{{ r.equipo }}</td>
                <td class="p-2">{{ r.pj }}</td>
                <td class="p-2">{{ r.g }}</td>
                <td class="p-2">{{ r.e }}</td>
                <td class="p-2">{{ r.p }}</td>
                <td class="p-2">{{ r.goles }}</td>
                <td class="p-2 font-medium">{{ r.pts }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="bg-white rounded-lg border border-slate-200 shadow p-4">
        <h2 class="font-semibold text-slate-700">Goleadores</h2>
        <ul class="text-sm text-slate-700 mt-2 list-disc ml-6">
          <li *ngFor="let g of state.tablaGoleadores(id)">{{ g.nombre }} — {{ g.goles }}</li>
        </ul>
      </section>

      <section class="bg-white rounded-lg border border-slate-200 shadow p-4">
        <h2 class="font-semibold text-slate-700">Fair Play</h2>
        <div class="overflow-auto">
          <table class="min-w-full text-sm mt-2">
            <thead><tr class="text-left text-slate-600"><th class="p-2">DT</th><th class="p-2">Equipo</th><th class="p-2">Amarillas</th><th class="p-2">Rojas</th><th class="p-2">Puntos</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of state.tablaFairPlay(id)" class="border-t">
                <td class="p-2">{{ r.nombre }}</td>
                <td class="p-2">{{ r.equipo }}</td>
                <td class="p-2">{{ r.amarillas }}</td>
                <td class="p-2">{{ r.rojas }}</td>
                <td class="p-2 font-medium">{{ r.puntos }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
})
export class TorneoTablasPage {
  readonly state = inject(StateService);
  private route = inject(ActivatedRoute);
  get tid() { return this.route.snapshot.paramMap.get('id')!; }
}
