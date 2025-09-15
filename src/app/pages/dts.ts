import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { StateService } from "../services/state.service";

@Component({
  selector: "app-dts",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-slate-800">DTs</h1>
        <form (submit)="onAdd($event)" class="flex gap-2">
          <input
            class="border rounded px-2 py-1"
            placeholder="Nombre DT"
            [(ngModel)]="nombreDT"
            name="nombreDT"
          />
          <input
            class="border rounded px-2 py-1"
            placeholder="Equipo"
            [(ngModel)]="nombreEquipo"
            name="nombreEquipo"
          />
          <button class="px-3 py-1 rounded bg-blue-600 text-white">
            Agregar
          </button>
        </form>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm text-slate-600">Ver equipo de:</label>
        <select
          class="border rounded px-2 py-1"
          [(ngModel)]="selectedDtId"
          name="selectedDtId"
        >
          <option [ngValue]="null">Todos</option>
          <option *ngFor="let dt of state.listaDTs()" [ngValue]="dt.id">
            {{ dt.nombreDT }} — {{ dt.nombreEquipo }}
          </option>
        </select>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div
          *ngFor="let dt of filteredDTs()"
          class="p-4 bg-white rounded-lg border border-slate-200 shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="text-lg font-medium text-slate-800">
                {{ dt.nombreDT }}
                <span class="text-slate-500">— {{ dt.nombreEquipo }}</span>
              </div>
              <div class="text-sm text-slate-600">
                Plata: <span>$</span>{{ dt.plata }} • Rank: {{ dt.rank }} •
                Slots: {{ dt.slots }} • Jugadores:
                {{ dt.listaJugadores.length }}
              </div>
            </div>
          </div>
          <div class="mt-3">
            <div class="text-sm font-medium text-slate-700 mb-2">Jugadores</div>
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
        </div>
      </div>
    </div>
  `,
})
export class DTsPage {
  readonly state = inject(StateService);
  readonly route = inject(ActivatedRoute);
  nombreDT: string = "";
  nombreEquipo: string = "";
  selectedDtId: number | null = null;

  constructor() {
    const fromQuery = this.route.snapshot.queryParamMap.get("dt");
    this.selectedDtId = fromQuery ? Number(fromQuery) : null;
    this.route.queryParamMap.subscribe((m) => {
      const v = m.get("dt");
      this.selectedDtId = v ? Number(v) : null;
    });
  }

  jugadoresDT(dt: any) {
    return dt.listaJugadores
      .map((id: number) => this.state.getJugador(id))
      .filter((j: any) => !!j);
  }

  filteredDTs() {
    const ds = this.state.listaDTs();
    return this.selectedDtId == null
      ? ds
      : ds.filter((d) => d.id === this.selectedDtId);
  }

  onAdd(ev: Event) {
    ev.preventDefault();
    const ndt = this.nombreDT.trim();
    const ne = this.nombreEquipo.trim();
    if (!ndt || !ne) return;
    this.state.addDT(ndt, ne);
    this.nombreDT = "";
    this.nombreEquipo = "";
  }
}
