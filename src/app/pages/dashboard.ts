import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { StateService } from "../services/state.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mx-auto p-6 space-y-6">
      <h1 class="text-2xl font-semibold text-slate-800">Liga Master - Demo</h1>

      <section class="p-4 rounded-lg bg-white shadow border border-slate-200">
        <div class="flex items-center gap-2">
          <label class="text-sm text-slate-600">Seleccionar DT</label>
          <select
            class="border rounded px-2 py-1"
            [(ngModel)]="selectedDtId"
            name="selectedDtIdDashboard"
          >
            <option [ngValue]="null">Elegir...</option>
            <option *ngFor="let dt of state.listaDTs()" [ngValue]="dt.id">
              {{ dt.nombreDT }} — {{ dt.nombreEquipo }}
            </option>
          </select>
        </div>
        <div *ngIf="selectedDt() as dt" class="mt-4">
          <div class="text-lg font-medium text-slate-800">
            {{ dt.nombreDT }} — {{ dt.nombreEquipo }}
          </div>
          <div class="text-sm text-slate-600">
            Plata: <span>$</span>{{ dt.plata }} • Rank:
            {{ dt.rank | number: "1.0-2" }} • Slots: {{ dt.slots }} • Torneos
            disp.: {{ dt.torneosDisponibles }}
          </div>
          <div class="mt-3">
            <div class="text-sm font-medium text-slate-700 mb-2">
              Jugadores ({{ dt.listaJugadores.length }})
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead>
                  <tr class="text-left text-slate-600">
                    <th class="py-1 pr-4">Jugador</th>
                    <th class="py-1 pr-4">Nivel</th>
                    <th class="py-1 pr-4">Potencial</th>
                    <th class="py-1">Posición</th>
                  </tr>
                </thead>
                <tbody class="text-slate-800">
                  <tr
                    *ngFor="let j of jugadoresDT(dt)"
                    class="border-t border-slate-200"
                  >
                    <td class="py-1 pr-4">{{ j.nombre }}</td>
                    <td class="py-1 pr-4">{{ j.nivel }}</td>
                    <td class="py-1 pr-4">{{ j.potencial }}</td>
                    <td class="py-1">{{ j.posiciones.join(", ") }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="mt-3" *ngIf="selectedDtId != null">
            <a
              [routerLink]="'/dts'"
              [queryParams]="{ dt: selectedDtId }"
              class="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              Ver/editar en DTs →
            </a>
          </div>
        </div>
      </section>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a
          routerLink="/dts"
          class="p-4 rounded-lg bg-white shadow hover:shadow-md border border-slate-200"
        >
          <div class="text-lg font-medium text-slate-700">DTs</div>
          <div class="text-slate-500">
            Gestioná directores técnicos y jugadores
          </div>
        </a>
        <a
          routerLink="/torneos"
          class="p-4 rounded-lg bg-white shadow hover:shadow-md border border-slate-200"
        >
          <div class="text-lg font-medium text-slate-700">Torneos</div>
          <div class="text-slate-500">
            Crear, sortear fechas y cargar partidos
          </div>
        </a>
      </div>
      <section class="p-4 rounded-lg bg-white shadow border border-slate-200">
        <h2 class="font-semibold text-slate-700">Resumen</h2>
        <div class="text-sm text-slate-600 mt-2">
          <div>DTs: {{ state.listaDTs().length }}</div>
          <div>Jugadores: {{ state.listaJugadores().length }}</div>
          <div>Torneos: {{ state.listaTorneos().length }}</div>
        </div>
      </section>
    </div>
  `,
})
export class DashboardPage {
  readonly state = inject(StateService);
  selectedDtId: number | null = null;

  selectedDt() {
    const id = this.selectedDtId;
    return id == null ? null : (this.state.getDT(id) ?? null);
  }

  jugadoresDT(dt: any) {
    return dt.listaJugadores
      .map((id: number) => this.state.getJugador(id))
      .filter((j: any) => !!j);
  }
}
