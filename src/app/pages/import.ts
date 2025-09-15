import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-6 space-y-4">
      <h1 class="text-xl font-semibold text-slate-800">Importar data.xml</h1>
      <p class="text-sm text-slate-600">Pegá el contenido de tu data.xml (XStream) y importá DTs y Jugadores.</p>
      <textarea class="w-full h-64 border rounded p-2 font-mono text-xs" [(ngModel)]="xml"></textarea>
      <div class="flex items-center gap-2">
        <button class="px-3 py-1 rounded bg-blue-600 text-white" (click)="doImport()">Importar</button>
        <div *ngIf="msg()" class="text-sm text-emerald-700">{{ msg() }}</div>
      </div>
    </div>
  `,
})
export class ImportPage {
  readonly state = inject(StateService);
  xml = '';
  msg = signal('');
  doImport() {
    if (!this.xml.trim()) return;
    const res = this.state.importFromXml(this.xml);
    this.msg.set(`Importados DTs: ${res.dtsAdded}, Jugadores (nuevos): ${res.jugadoresAdded}`);
  }
}
