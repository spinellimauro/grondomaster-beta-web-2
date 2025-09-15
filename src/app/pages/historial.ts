import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-6 space-y-4">
      <h1 class="text-xl font-semibold text-slate-800">Historial entre DTs</h1>
      <div class="flex gap-2 items-center">
        <select class="border rounded px-2 py-1" [(ngModel)]="a">
          <option [ngValue]="null">DT A</option>
          <option *ngFor="let dt of state.listaDTs()" [ngValue]="dt.id">{{ dt.nombreDT }} — {{ dt.nombreEquipo }}</option>
        </select>
        <select class="border rounded px-2 py-1" [(ngModel)]="b">
          <option [ngValue]="null">DT B</option>
          <option *ngFor="let dt of state.listaDTs()" [ngValue]="dt.id">{{ dt.nombreDT }} — {{ dt.nombreEquipo }}</option>
        </select>
      </div>

      <div *ngIf="a && b" class="p-4 bg-white rounded-lg border border-slate-200 shadow">
        <div class="text-slate-800 font-medium mb-2">{{ nombreDT(a) }} vs {{ nombreDT(b) }}</div>
        <div class="text-sm text-slate-700">Ganados (A): {{ h().ganadosA }} • Empates: {{ h().empatados }} • Perdidos (A): {{ h().perdidosA }}</div>
      </div>
    </div>
  `,
})
export class HistorialPage {
  readonly state = inject(StateService);
  a: number | null = null;
  b: number | null = null;

  h() { return this.state.historial(this.a!, this.b!); }
  nombreDT(id: number | null) { return id ? this.state.getDT(id).nombreDT : ''; }
}
