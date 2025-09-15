import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { StateService } from "../services/state.service";
import { Partido, Torneo } from "../models/domain";

@Component({
  selector: "app-partido",
  standalone: true,
  imports: [CommonModule, FormsModule],
  inputs: ["partidoId"],
  template: `
    <ng-container *ngIf="p() as p">
      <div class="flex items-center justify-between">
        <div class="font-medium text-slate-800">
          Fecha {{ p.numeroFecha }} — {{ dtLocal()?.nombreDT }} vs
          {{ dtVisit()?.nombreDT }}
        </div>
        <div class="text-slate-700">
          Marcador: {{ p.golesLocal.length }} - {{ p.golesVisitante.length }}
        </div>
      </div>

      <div class="mt-3 grid md:grid-cols-2 gap-4">
        <div>
          <div class="text-sm font-semibold text-slate-700 mb-1">
            Goles Local
          </div>
          <div class="flex gap-2 items-center">
            <select
              class="border rounded px-2 py-1"
              [(ngModel)]="jugGolLocal"
              name="jgl-{{ p.id }}"
            >
              <option [ngValue]="null">Seleccioná jugador local</option>
              <option *ngFor="let j of jugadoresLocal()" [ngValue]="j.id">
                {{ j.nombre }} ({{ j.nivel }})
              </option>
            </select>
            <button
              class="px-3 py-1 rounded bg-slate-100 border"
              (click)="addGolLocal()"
              [disabled]="!jugGolLocal || p.terminado"
            >
              Agregar gol
            </button>
          </div>
          <div class="overflow-x-auto mt-2">
            <table
              class="min-w-full text-sm bg-white border border-slate-200 rounded"
            >
              <thead>
                <tr class="text-left text-slate-600">
                  <th class="py-1 px-2">Jugador</th>
                  <th class="py-1 px-2">Goles</th>
                  <th class="py-1 px-2"></th>
                </tr>
              </thead>
              <tbody class="text-slate-800">
                <tr
                  *ngFor="let r of golesLocalGrouped()"
                  class="border-t border-slate-200"
                >
                  <td class="py-1 px-2">{{ r.nombre }}</td>
                  <td class="py-1 px-2">{{ r.count }}</td>
                  <td class="py-1 px-2 text-right">
                    <button
                      class="px-2 py-0.5 text-xs rounded border"
                      (click)="removeOneGol(r.id)"
                      [disabled]="p.terminado"
                    >
                      Quitar 1
                    </button>
                  </td>
                </tr>
                <tr *ngIf="p.golesLocal.length === 0">
                  <td class="py-1 px-2 text-slate-500" colspan="3">
                    Sin goles
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div class="text-sm font-semibold text-slate-700 mb-1">
            Goles Visitante
          </div>
          <div class="flex gap-2 items-center">
            <select
              class="border rounded px-2 py-1"
              [(ngModel)]="jugGolVisit"
              name="jgv-{{ p.id }}"
            >
              <option [ngValue]="null">Seleccioná jugador visitante</option>
              <option *ngFor="let j of jugadoresVisit()" [ngValue]="j.id">
                {{ j.nombre }} ({{ j.nivel }})
              </option>
            </select>
            <button
              class="px-3 py-1 rounded bg-slate-100 border"
              (click)="addGolVisit()"
              [disabled]="!jugGolVisit || p.terminado"
            >
              Agregar gol
            </button>
          </div>
          <div class="overflow-x-auto mt-2">
            <table
              class="min-w-full text-sm bg-white border border-slate-200 rounded"
            >
              <thead>
                <tr class="text-left text-slate-600">
                  <th class="py-1 px-2">Jugador</th>
                  <th class="py-1 px-2">Goles</th>
                  <th class="py-1 px-2"></th>
                </tr>
              </thead>
              <tbody class="text-slate-800">
                <tr
                  *ngFor="let r of golesVisitGrouped()"
                  class="border-t border-slate-200"
                >
                  <td class="py-1 px-2">{{ r.nombre }}</td>
                  <td class="py-1 px-2">{{ r.count }}</td>
                  <td class="py-1 px-2 text-right">
                    <button
                      class="px-2 py-0.5 text-xs rounded border"
                      (click)="removeOneGol(r.id)"
                      [disabled]="p.terminado"
                    >
                      Quitar 1
                    </button>
                  </td>
                </tr>
                <tr *ngIf="p.golesVisitante.length === 0">
                  <td class="py-1 px-2 text-slate-500" colspan="3">
                    Sin goles
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-4 grid md:grid-cols-2 gap-4">
        <div>
          <div class="text-sm font-semibold text-slate-700 mb-1">
            Tarjetas Amarillas
          </div>
          <div class="flex gap-2 items-center">
            <select
              class="border rounded px-2 py-1"
              [(ngModel)]="jugTarj"
              name="jt-{{ p.id }}"
            >
              <option [ngValue]="null">Seleccioná jugador</option>
              <option *ngFor="let j of jugadoresDePartido()" [ngValue]="j.id">
                {{ j.nombre }} ({{ j.nivel }})
              </option>
            </select>
            <button
              class="px-3 py-1 rounded bg-yellow-500 text-white"
              (click)="addTarj('amarilla')"
              [disabled]="!jugTarj || p.terminado"
            >
              Agregar
            </button>
          </div>
          <div class="overflow-x-auto mt-2">
            <table
              class="min-w-full text-sm bg-white border border-slate-200 rounded"
            >
              <thead>
                <tr class="text-left text-slate-600">
                  <th class="py-1 px-2">Jugador</th>
                  <th class="py-1 px-2">Cant.</th>
                  <th class="py-1 px-2"></th>
                </tr>
              </thead>
              <tbody class="text-slate-800">
                <tr
                  *ngFor="let r of amarillasGrouped()"
                  class="border-t border-slate-200"
                >
                  <td class="py-1 px-2">{{ r.nombre }}</td>
                  <td class="py-1 px-2">{{ r.count }}</td>
                  <td class="py-1 px-2 text-right">
                    <button
                      class="px-2 py-0.5 text-xs rounded border"
                      (click)="removeTarj('amarilla', r.id)"
                      [disabled]="p.terminado"
                    >
                      Quitar 1
                    </button>
                  </td>
                </tr>
                <tr *ngIf="p.listaAmarillas.length === 0">
                  <td class="py-1 px-2 text-slate-500" colspan="3">
                    Sin amarillas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div class="text-sm font-semibold text-slate-700 mb-1">
            Tarjetas Rojas
          </div>
          <div class="flex gap-2 items-center">
            <select
              class="border rounded px-2 py-1"
              [(ngModel)]="jugTarjRoja"
              name="jtr-{{ p.id }}"
            >
              <option [ngValue]="null">Seleccioná jugador</option>
              <option *ngFor="let j of jugadoresDePartido()" [ngValue]="j.id">
                {{ j.nombre }} ({{ j.nivel }})
              </option>
            </select>
            <button
              class="px-3 py-1 rounded bg-red-600 text-white"
              (click)="addTarjRoja()"
              [disabled]="!jugTarjRoja || p.terminado"
            >
              Agregar
            </button>
          </div>
          <div class="overflow-x-auto mt-2">
            <table
              class="min-w-full text-sm bg-white border border-slate-200 rounded"
            >
              <thead>
                <tr class="text-left text-slate-600">
                  <th class="py-1 px-2">Jugador</th>
                  <th class="py-1 px-2">Cant.</th>
                  <th class="py-1 px-2"></th>
                </tr>
              </thead>
              <tbody class="text-slate-800">
                <tr
                  *ngFor="let r of rojasGrouped()"
                  class="border-t border-slate-200"
                >
                  <td class="py-1 px-2">{{ r.nombre }}</td>
                  <td class="py-1 px-2">{{ r.count }}</td>
                  <td class="py-1 px-2 text-right">
                    <button
                      class="px-2 py-0.5 text-xs rounded border"
                      (click)="removeTarj('roja', r.id)"
                      [disabled]="p.terminado"
                    >
                      Quitar 1
                    </button>
                  </td>
                </tr>
                <tr *ngIf="p.listaRojas.length === 0">
                  <td class="py-1 px-2 text-slate-500" colspan="3">
                    Sin rojas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-3">
        <button
          class="px-3 py-1 rounded bg-emerald-600 text-white"
          (click)="terminar()"
          [disabled]="p.terminado"
        >
          Terminar partido
        </button>
        <div *ngIf="p.terminado" class="text-emerald-700 text-sm">
          Partido terminado. Se actualizaron premios y ranking.
        </div>
      </div>
    </ng-container>
  `,
})
export class PartidoCmp {
  readonly state = inject(StateService);
  partidoId!: string;

  jugGolLocal: number | null = null;
  jugGolVisit: number | null = null;
  jugTarj: number | null = null;
  jugTarjRoja: number | null = null;

  p = computed(() =>
    this.partidoId ? this.state.getPartido(this.partidoId) : undefined,
  );
  dtLocal = computed(() =>
    this.p() ? this.state.getDT(this.p()!.dtLocalId) : undefined,
  );
  dtVisit = computed(() =>
    this.p() ? this.state.getDT(this.p()!.dtVisitanteId) : undefined,
  );

  jugadoresLocal() {
    const d = this.dtLocal();
    if (!d) return [];
    return d.listaJugadores
      .map((id) => this.state.getJugador(id)!)
      .filter(Boolean);
  }

  jugadoresVisit() {
    const d = this.dtVisit();
    if (!d) return [];
    return d.listaJugadores
      .map((id) => this.state.getJugador(id)!)
      .filter(Boolean);
  }

  jugadoresDePartido() {
    const l = this.jugadoresLocal();
    const v = this.jugadoresVisit();
    return [...l, ...v];
  }

  addGolLocal() {
    if (!this.partidoId || !this.jugGolLocal) return;
    this.state.addGol(this.partidoId, this.jugGolLocal);
    this.jugGolLocal = null;
  }

  addGolVisit() {
    if (!this.partidoId || !this.jugGolVisit) return;
    this.state.addGol(this.partidoId, this.jugGolVisit);
    this.jugGolVisit = null;
  }

  removeOneGol(jugadorId: number) {
    if (!this.partidoId) return;
    this.state.removeGol(this.partidoId, jugadorId);
  }

  addTarj(tipo: "amarilla" | "roja") {
    if (!this.partidoId || !this.jugTarj) return;
    this.state.addTarjeta(this.partidoId, this.jugTarj, tipo);
    this.jugTarj = null;
  }

  addTarjRoja() {
    if (!this.partidoId || !this.jugTarjRoja) return;
    this.state.addTarjeta(this.partidoId, this.jugTarjRoja, "roja");
    this.jugTarjRoja = null;
  }

  removeTarj(tipo: "amarilla" | "roja", jugadorId: number) {
    if (!this.partidoId) return;
    this.state.removeTarjeta(this.partidoId, jugadorId, tipo);
  }

  private group(ids: number[]) {
    const map = new Map<number, number>();
    for (const id of ids) map.set(id, (map.get(id) ?? 0) + 1);
    return Array.from(map.entries()).map(([id, count]) => ({
      id,
      nombre: this.state.getJugador(id)?.nombre ?? String(id),
      count,
    }));
  }

  golesLocalGrouped() {
    return this.group(this.p()?.golesLocal ?? []);
  }
  golesVisitGrouped() {
    return this.group(this.p()?.golesVisitante ?? []);
  }
  amarillasGrouped() {
    return this.group(this.p()?.listaAmarillas ?? []);
  }
  rojasGrouped() {
    return this.group(this.p()?.listaRojas ?? []);
  }

  terminar() {
    if (!this.partidoId) return;
    this.state.terminarPartido(this.partidoId);
  }
}

@Component({
  selector: "app-torneos",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PartidoCmp],
  template: `
    <div class="container mx-auto p-6 space-y-6">
      <h1 class="text-xl font-semibold text-slate-800">Torneos</h1>

      <form (submit)="crear($event)" class="flex gap-2">
        <input
          class="border rounded px-2 py-1"
          placeholder="Nombre del torneo"
          [(ngModel)]="nombre"
          name="nombre"
        />
        <button class="px-3 py-1 rounded bg-blue-600 text-white">
          Crear Torneo
        </button>
      </form>

      <div class="flex items-center gap-2">
        <label class="text-sm text-slate-600">Seleccionar torneo</label>
        <select
          class="border rounded px-2 py-1"
          [(ngModel)]="selectedTorneoId"
          name="selectedTorneoId"
        >
          <option [ngValue]="null">Elegir...</option>
          <option *ngFor="let tt of state.listaTorneos()" [ngValue]="tt.id">
            {{ tt.nombreTorneo }}
          </option>
        </select>
      </div>

      <ng-container *ngIf="selectedTorneo() as t; else noTorneo">
        <div
          class="p-4 bg-white rounded-lg border border-slate-200 shadow space-y-3"
        >
          <div class="flex items-center justify-between">
            <div class="text-lg font-medium text-slate-800">
              {{ t.nombreTorneo }}
            </div>
            <div class="flex gap-2">
              <button
                class="px-3 py-1 rounded bg-slate-800 text-white"
                (click)="sortear(t.id)"
              >
                Sortear Fechas
              </button>
              <a
                class="px-3 py-1 rounded bg-slate-100 border"
                [routerLink]="['/torneos', t.id]"
                >Ver Tablas</a
              >
            </div>
          </div>

          <div>
            <div class="text-sm font-medium text-slate-700">Participantes</div>
            <div class="flex flex-wrap gap-2 items-center mt-2">
              <select
                class="border rounded px-2 py-1"
                [(ngModel)]="dtSeleccionado"
                name="dt-{{ t.id }}"
              >
                <option [ngValue]="null">Seleccioná DT</option>
                <option *ngFor="let dt of state.listaDTs()" [ngValue]="dt.id">
                  {{ dt.nombreDT }} — {{ dt.nombreEquipo }}
                </option>
              </select>
              <button
                class="px-3 py-1 rounded bg-slate-100 border"
                (click)="agregarDT(t.id)"
                [disabled]="!dtSeleccionado"
              >
                Agregar
              </button>
            </div>
            <ul class="text-sm text-slate-700 list-disc ml-5 mt-2">
              <li *ngFor="let dtId of t.listaParticipantes">
                {{ state.getDT(dtId)?.nombreDT }} —
                {{ state.getDT(dtId)?.nombreEquipo }}
              </li>
            </ul>
          </div>

          <div *ngIf="t.listaPartidos.length > 0" class="border-t pt-3">
            <div class="text-sm font-medium text-slate-700">Fixture</div>
            <div class="space-y-2 mt-2">
              <div
                *ngFor="let pId of t.listaPartidos"
                class="p-3 border rounded"
              >
                <app-partido [partidoId]="pId"></app-partido>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
      <ng-template #noTorneo>
        <div class="text-sm text-slate-500">
          Seleccioná un torneo para gestionarlo.
        </div>
      </ng-template>
    </div>
  `,
})
export class TorneosPage {
  readonly state = inject(StateService);
  nombre: string = "";
  dtSeleccionado: number | null = null;
  selectedTorneoId: string | null = null;

  crear(ev: Event) {
    ev.preventDefault();
    const n = this.nombre.trim();
    if (!n) return;
    this.state.createTorneo(n);
    this.nombre = "";
  }

  selectedTorneo(): Torneo | null {
    if (!this.selectedTorneoId) return null;
    return (
      this.state.listaTorneos().find((t) => t.id === this.selectedTorneoId) ??
      null
    );
  }

  agregarDT(torneoId: string) {
    if (!this.dtSeleccionado) return;
    this.state.addParticipante(torneoId, this.dtSeleccionado);
  }

  sortear(torneoId: string) {
    this.state.sortearFechas(torneoId);
  }
}
