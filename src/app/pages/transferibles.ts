import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-transferibles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-6 space-y-6">
      <h1 class="text-xl font-semibold text-slate-800">Transferibles</h1>

      <section class="bg-white rounded-lg border border-slate-200 shadow p-4">
        <div class="text-sm text-slate-700 mb-2">Marcar precio de venta</div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div *ngFor="let j of state.listaJugadores()" class="border rounded p-3">
            <div class="font-medium text-slate-800">{{ j.nombre }} <span class="text-slate-500">({{ j.nivel }})</span></div>
            <div class="text-xs text-slate-600">Actual: <span>$</span>{{ j.precioVenta }}</div>
            <div class="mt-2 flex gap-2 items-center">
              <input class="border rounded px-2 py-1 w-28" type="number" [(ngModel)]="precios[j.id]" placeholder="Precio" />
              <button class="px-3 py-1 rounded bg-slate-100 border" (click)="setPrecio(j.id)">Guardar</button>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-lg border border-slate-200 shadow p-4">
        <h2 class="font-semibold text-slate-700">En venta</h2>
        <ul class="text-sm text-slate-700 mt-2 list-disc ml-6">
          <li *ngFor="let j of enVenta()">{{ j.nombre }} — <span>$</span>{{ j.precioVenta }}</li>
        </ul>
      </section>
    </div>
  `,
})
export class TransferiblesPage {
  readonly state = inject(StateService);
  precios: Record<number, number> = {};

  setPrecio(id: number) {
    const v = this.precios[id] ?? 0;
    this.state.setPrecioVenta(id, v);
  }

  enVenta() { return this.state.listaJugadores().filter((j) => j.precioVenta > 0); }
}
