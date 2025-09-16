import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

type SoFifaItem = {
  name: string;
  rating: number | string;
  potential: number | string;
  positions: string[];
};

@Component({
  selector: "app-sofifa",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-6 space-y-4">
      <h1 class="text-xl font-semibold text-slate-800">SoFIFA</h1>

      <form class="flex gap-2 items-center" (submit)="onSearch($event)">
        <input
          class="border rounded px-2 py-1 w-64"
          placeholder="Buscar jugador (ej: Vinicius)"
          [(ngModel)]="q"
          name="q"
        />
        <button
          class="px-3 py-1 rounded bg-blue-600 text-white"
          [disabled]="loading"
        >
          Buscar
        </button>
      </form>

      <div *ngIf="error" class="text-sm text-red-600">{{ error }}</div>

      <div class="overflow-x-auto" *ngIf="results.length > 0">
        <table
          class="min-w-full text-sm bg-white border border-slate-200 rounded"
        >
          <thead>
            <tr class="text-left text-slate-600">
              <th class="py-2 px-3">Jugador</th>
              <th class="py-2 px-3">Nivel</th>
              <th class="py-2 px-3">Potencial</th>
              <th class="py-2 px-3">Posición</th>
            </tr>
          </thead>
          <tbody class="text-slate-800">
            <tr *ngFor="let r of results" class="border-t border-slate-200">
              <td class="py-2 px-3">{{ r.name }}</td>
              <td class="py-2 px-3">{{ r.rating }}</td>
              <td class="py-2 px-3">{{ r.potential }}</td>
              <td class="py-2 px-3">{{ r.positions.join(", ") }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        *ngIf="!loading && results.length === 0 && !error"
        class="text-sm text-slate-500"
      >
        Sin resultados.
      </div>
    </div>
  `,
})
export class SoFifaPage {
  q = "";
  loading = false;
  error: string | null = null;
  results: SoFifaItem[] = [];

  async onSearch(ev: Event) {
    ev.preventDefault();
    this.error = null;
    this.results = [];
    const query = this.q.trim();
    if (!query) return;
    this.loading = true;
    try {
      const url = `/api/sofifa?keyword=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { accept: "application/json" } });
      console.log(res);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data?.results;
      if (!Array.isArray(arr)) throw new Error("Formato inválido");
      this.results = arr.map((x: any) => ({
        name: String(x.name ?? ""),
        rating: x.rating ?? x.overall ?? "",
        potential: x.potential ?? "",
        positions: Array.isArray(x.positions)
          ? x.positions.map((p: any) => String(p))
          : [],
      }));
    } catch (e: any) {
      this.error =
        "No se pudo consultar SoFIFA. Se requiere un endpoint /api/sofifa en el servidor.";
    } finally {
      this.loading = false;
    }
  }
}
