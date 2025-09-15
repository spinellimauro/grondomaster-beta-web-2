import { Injectable, signal, computed } from '@angular/core';
import { DT, Jugador, Partido, PremiosTorneos, Torneo, createDefaultPremios, premioEvento, uuid } from '../models/domain';

@Injectable({ providedIn: 'root' })
export class StateService {
  // signals holding state
  readonly jugadores = signal<Record<number, Jugador>>({});
  readonly dts = signal<Record<number, DT>>({});
  readonly torneos = signal<Record<string, Torneo>>({});
  readonly partidos = signal<Record<string, Partido>>({});

  private nextJugadorId = 1;
  private nextDtId = 1;

  constructor() {
    this.seed();
  }

  // Derived lists
  readonly listaDTs = computed(() => Object.values(this.dts()));
  readonly listaJugadores = computed(() => Object.values(this.jugadores()));
  readonly listaTorneos = computed(() => Object.values(this.torneos()));

  // Seed demo data
  private seed() {
    const mkJugador = (nombre: string, nivel: number): number => {
      const id = this.nextJugadorId++;
      const j: Jugador = {
        id,
        nombre,
        nacionalidad: 'AR',
        posiciones: ['ST'],
        nivel,
        potencial: nivel + 2,
        lesion: 0,
        habilitado: true,
        precioVenta: 0,
        vecesNoPagadas: 0,
      };
      this.jugadores.update((s) => ({ ...s, [id]: j }));
      return id;
    };

    const mkDT = (nombreDT: string, nombreEquipo: string, jugadores: number[]) => {
      const id = this.nextDtId++;
      const dt: DT = {
        id,
        nombreDT,
        nombreEquipo,
        plata: 100000,
        torneosDisponibles: 3,
        slots: 30,
        rank: 1,
        listaJugadores: jugadores,
      };
      this.dts.update((s) => ({ ...s, [id]: dt }));
      return id;
    };

    const j1 = mkJugador('Lionel Messi', 91);
    const j2 = mkJugador('Ángel Di María', 86);
    const j3 = mkJugador('Julián Álvarez', 84);
    const j4 = mkJugador('Lautaro Martínez', 86);
    const j5 = mkJugador('Rodrigo De Paul', 84);

    const j6 = mkJugador('Kylian Mbappé', 92);
    const j7 = mkJugador('Antoine Griezmann', 88);
    const j8 = mkJugador('Ousmane Dembélé', 85);
    const j9 = mkJugador('Aurélien Tchouaméni', 84);
    const j10 = mkJugador('Theo Hernández', 85);

    mkDT('Master', 'Argentina', [j1, j2, j3, j4, j5]);
    mkDT('Invitado', 'Francia', [j6, j7, j8, j9, j10]);
  }

  // CRUD DT
  addDT(nombreDT: string, nombreEquipo: string) {
    const id = this.nextDtId++;
    this.dts.update((s) => ({
      ...s,
      [id]: { id, nombreDT, nombreEquipo, plata: 0, torneosDisponibles: 3, slots: 30, rank: 1, listaJugadores: [] },
    }));
  }

  getDT(id: number) { return this.dts()[id]; }
  getJugador(id: number) { return this.jugadores()[id]; }

  // Torneos
  createTorneo(nombreTorneo: string) {
    const id = uuid();
    const torneo: Torneo = {
      id,
      nombreTorneo,
      listaParticipantes: [],
      listaPartidos: [],
      premios: createDefaultPremios(),
      limiteAmarillas: 3,
      terminado: false,
    };
    this.torneos.update((s) => ({ ...s, [id]: torneo }));
  }

  addParticipante(torneoId: string, dtId: number) {
    const t = this.torneos()[torneoId];
    if (!t) return;
    if (!t.listaParticipantes.includes(dtId)) {
      this.torneos.update((s) => ({
        ...s,
        [torneoId]: { ...s[torneoId], listaParticipantes: [...s[torneoId].listaParticipantes, dtId] },
      }));
    }
  }

  private numeroFechas(participantes: number[]): number {
    const n = participantes.length;
    return n % 2 === 0 ? n - 1 : n;
    }

  sortearFechas(torneoId: string) {
    const t = this.torneos()[torneoId];
    if (!t) return;

    // Clear previous
    this.torneos.update((s) => ({ ...s, [torneoId]: { ...s[torneoId], listaPartidos: [] } }));

    const participantes = [...t.listaParticipantes];
    const libreId = -1;
    if (participantes.length % 2 !== 0) participantes.push(libreId);

    const n = participantes.length;
    const fechas = this.numeroFechas(participantes);

    for (let fecha = 0; fecha < fechas; fecha++) {
      for (let p = 0; p < n / 2; p++) {
        const localIdx = (fecha + p) % fechas;
        const visitIdx = p === 0 ? fechas : (fechas - p + fecha) % fechas;
        const local = participantes[localIdx];
        const visitante = participantes[visitIdx];
        if (local === libreId || visitante === libreId) continue;

        const partidoId = uuid();
        const partido: Partido = {
          id: partidoId,
          numeroFecha: fecha + 1,
          dtLocalId: local,
          dtVisitanteId: visitante,
          terminado: false,
          torneoId: torneoId,
          golesLocal: [],
          golesVisitante: [],
          listaAmarillas: [],
          listaRojas: [],
        };
        this.partidos.update((ps) => ({ ...ps, [partidoId]: partido }));
        this.torneos.update((s) => ({
          ...s,
          [torneoId]: { ...s[torneoId], listaPartidos: [...s[torneoId].listaPartidos, partidoId] },
        }));
      }
    }
  }

  getPartido(id: string) { return this.partidos()[id]; }

  // Derived tournament helpers
  partidosDeTorneo(torneoId: string) {
    const t = this.torneos()[torneoId];
    if (!t) return [] as Partido[];
    return t.listaPartidos.map((pid) => this.partidos()[pid]).filter(Boolean) as Partido[];
  }

  getPartidosJugadosDT(torneoId: string, dtId: number) {
    return this.partidosDeTorneo(torneoId).filter((p) => p.terminado && (p.dtLocalId === dtId || p.dtVisitanteId === dtId));
  }

  getPuntosDT(torneoId: string, dtId: number) {
    return this.getPartidosJugadosDT(torneoId, dtId).reduce((acc, p) => acc + this.puntosPartido(p, dtId), 0);
  }

  getGolesFavorDT(torneoId: string, dtId: number) {
    return this.getPartidosJugadosDT(torneoId, dtId).reduce((acc, p) => acc + this.golesFavor(p, dtId), 0);
  }

  getGolesContraDT(torneoId: string, dtId: number) {
    return this.getPartidosJugadosDT(torneoId, dtId).reduce((acc, p) => acc + this.golesContra(p, dtId), 0);
  }

  tablaPosiciones(torneoId: string) {
    const t = this.torneos()[torneoId];
    if (!t) return [] as any[];
    return [...t.listaParticipantes].map((dtId) => {
      const dt = this.getDT(dtId);
      const pj = this.getPartidosJugadosDT(torneoId, dtId).length;
      const pts = this.getPuntosDT(torneoId, dtId);
      const gf = this.getGolesFavorDT(torneoId, dtId);
      const gc = this.getGolesContraDT(torneoId, dtId);
      const g = this.getPartidosJugadosDT(torneoId, dtId).filter((p) => this.puntosPartido(p, dtId) === 3).length;
      const e = this.getPartidosJugadosDT(torneoId, dtId).filter((p) => this.puntosPartido(p, dtId) === 1).length;
      const pCount = this.getPartidosJugadosDT(torneoId, dtId).filter((p) => this.puntosPartido(p, dtId) === 0).length;
      return { nombre: dt.nombreDT, equipo: dt.nombreEquipo, pj, g, e, p: pCount, goles: `${gf}:${gc}`, pts };
    }).sort((a, b) => b.pts - a.pts);
  }

  tablaGoleadores(torneoId: string) {
    const goles = new Map<number, number>();
    for (const p of this.partidosDeTorneo(torneoId)) {
      for (const j of p.golesLocal) goles.set(j, (goles.get(j) ?? 0) + 1);
      for (const j of p.golesVisitante) goles.set(j, (goles.get(j) ?? 0) + 1);
    }
    return Array.from(goles.entries())
      .map(([id, g]) => ({ id, nombre: this.getJugador(id)?.nombre ?? String(id), goles: g }))
      .filter((x) => x.goles > 0)
      .sort((a, b) => b.goles - a.goles);
  }

  tablaFairPlay(torneoId: string) {
    const t = this.torneos()[torneoId];
    if (!t) return [] as any[];
    return t.listaParticipantes.map((dtId) => {
      const dt = this.getDT(dtId);
      const amarillas = this.partidosDeTorneo(torneoId)
        .filter((p) => p.terminado)
        .reduce((acc, p) => acc + p.listaAmarillas.filter((j) => dt.listaJugadores.includes(j)).length, 0);
      const rojas = this.partidosDeTorneo(torneoId)
        .filter((p) => p.terminado)
        .reduce((acc, p) => acc + p.listaRojas.filter((j) => dt.listaJugadores.includes(j)).length, 0);
      const puntos = amarillas * 4 + rojas * 12;
      return { nombre: dt.nombreDT, equipo: dt.nombreEquipo, amarillas, rojas, puntos };
    }).sort((a, b) => a.puntos - b.puntos);
  }

  propietarioDeJugador(jId: number): number | null {
    for (const dt of Object.values(this.dts())) {
      if (dt.listaJugadores.includes(jId)) return dt.id;
    }
    return null;
  }

  setPrecioVenta(jId: number, precio: number) {
    const j = this.getJugador(jId);
    if (!j) return;
    this.jugadores.update((s) => ({ ...s, [jId]: { ...s[jId], precioVenta: Math.max(0, Math.round(precio)) } }));
  }

  partidosEntre(dtA: number, dtB: number) {
    return Object.values(this.partidos())
      .filter(Boolean)
      .filter((p) => p.terminado && ((p.dtLocalId === dtA && p.dtVisitanteId === dtB) || (p.dtLocalId === dtB && p.dtVisitanteId === dtA)));
  }

  historial(dtA: number, dtB: number) {
    const ps = this.partidosEntre(dtA, dtB);
    const ganadosA = ps.filter((p) => this.puntosPartido(p, dtA) === 3).length;
    const empatados = ps.filter((p) => this.puntosPartido(p, dtA) === 1).length;
    const perdidosA = ps.filter((p) => this.puntosPartido(p, dtA) === 0).length;
    return { ganadosA, empatados, perdidosA };
  }

  // SoFifa-like helpers (demo mode without external proxy)
  searchJugadores(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return this.listaJugadores();
    return this.listaJugadores().filter((j) => j.nombre.toLowerCase().includes(q));
  }

  updateJugadorFromSofifa(id: number) {
    const j = this.getJugador(id);
    if (!j) return;
    const delta = ((id % 3) - 1);
    const nivel = Math.max(60, Math.min(99, j.nivel + delta));
    const potencial = Math.max(nivel, Math.min(99, j.potencial + (delta >= 0 ? 1 : 0)));
    this.jugadores.update((s) => ({ ...s, [id]: { ...s[id], nivel, potencial } }));
  }

  // Partido interactions
  addGol(partidoId: string, jugadorId: number) {
    const p = this.partidos()[partidoId];
    if (!p || p.terminado) return;
    const dtLocal = this.getDT(p.dtLocalId);
    if (dtLocal.listaJugadores.includes(jugadorId)) {
      this.partidos.update((ps) => ({
        ...ps,
        [partidoId]: { ...ps[partidoId], golesLocal: [...ps[partidoId].golesLocal, jugadorId] },
      }));
    } else {
      this.partidos.update((ps) => ({
        ...ps,
        [partidoId]: { ...ps[partidoId], golesVisitante: [...ps[partidoId].golesVisitante, jugadorId] },
      }));
    }
  }

  removeGol(partidoId: string, jugadorId: number) {
    const p = this.partidos()[partidoId];
    if (!p || p.terminado) return;
    const dtLocal = this.getDT(p.dtLocalId);
    const which = dtLocal.listaJugadores.includes(jugadorId) ? 'golesLocal' : 'golesVisitante';
    this.partidos.update((ps) => {
      const arr = ps[partidoId][which as 'golesLocal' | 'golesVisitante'];
      const idx = arr.indexOf(jugadorId);
      const newArr = idx >= 0 ? [...arr.slice(0, idx), ...arr.slice(idx + 1)] : arr;
      return { ...ps, [partidoId]: { ...ps[partidoId], [which]: newArr } } as Record<string, Partido>;
    });
  }

  addTarjeta(partidoId: string, jugadorId: number, tipo: 'amarilla' | 'roja') {
    const p = this.partidos()[partidoId];
    if (!p || p.terminado) return;
    this.partidos.update((ps) => ({
      ...ps,
      [partidoId]: {
        ...ps[partidoId],
        listaAmarillas: tipo === 'amarilla' ? [...ps[partidoId].listaAmarillas, jugadorId] : ps[partidoId].listaAmarillas,
        listaRojas: tipo === 'roja' ? [...ps[partidoId].listaRojas, jugadorId] : ps[partidoId].listaRojas,
      },
    }));
  }

  removeTarjeta(partidoId: string, jugadorId: number, tipo: 'amarilla' | 'roja') {
    const field = tipo === 'amarilla' ? 'listaAmarillas' : 'listaRojas';
    this.partidos.update((ps) => {
      const arr = ps[partidoId][field as 'listaAmarillas' | 'listaRojas'];
      const idx = arr.indexOf(jugadorId);
      const newArr = idx >= 0 ? [...arr.slice(0, idx), ...arr.slice(idx + 1)] : arr;
      return { ...ps, [partidoId]: { ...ps[partidoId], [field]: newArr } } as Record<string, Partido>;
    });
  }

  puntosPartido(p: Partido, dtId: number): number {
    const gf = this.golesFavor(p, dtId);
    const gc = this.golesContra(p, dtId);
    if (p.dtLocalId === dtId) {
      if (gf > gc) return 3;
      if (gf < gc) return 0;
      return 1;
    } else {
      if (gf > gc) return 3;
      if (gf < gc) return 0;
      return 1;
    }
  }

  golesFavor(p: Partido, dtId: number) {
    return p.dtLocalId === dtId ? p.golesLocal.length : p.golesVisitante.length;
  }

  golesContra(p: Partido, dtId: number) {
    return p.dtLocalId === dtId ? p.golesVisitante.length : p.golesLocal.length;
  }

  terminarPartido(partidoId: string) {
    const p = this.partidos()[partidoId];
    if (!p || p.terminado) return;
    this.partidos.update((ps) => ({ ...ps, [partidoId]: { ...ps[partidoId], terminado: true } }));

    const t = this.torneos()[p.torneoId];
    if (!t) return;
    const premios = t.premios as PremiosTorneos;

    const local = this.getDT(p.dtLocalId);
    const vis = this.getDT(p.dtVisitanteId);
    const gl = p.golesLocal.length;
    const gv = p.golesVisitante.length;

    const ganador = gl > gv ? local : gl < gv ? vis : null;
    const perdedor = gl > gv ? vis : gl < gv ? local : null;

    if (ganador && perdedor) this.rankVictoria(ganador, perdedor);
    else this.empate(local, vis);

    const premioLocal = this.premioDT(p, local.id, premios);
    const premioVisitante = this.premioDT(p, vis.id, premios);
    this.dts.update((ds) => ({
      ...ds,
      [local.id]: { ...ds[local.id], plata: ds[local.id].plata + premioLocal },
      [vis.id]: { ...ds[vis.id], plata: ds[vis.id].plata + premioVisitante },
    }));
  }

  private premioDT(p: Partido, dtId: number, premios: PremiosTorneos): number {
    const pts = this.puntosPartido(p, dtId);
    if (pts === 3) {
      return (
        premioEvento(premios, 'Victoria') +
        premioEvento(premios, 'Gol') * (this.golesFavor(p, dtId) - this.golesContra(p, dtId))
      );
    } else if (pts === 1) {
      return premioEvento(premios, 'Empate');
    }
    return 0;
  }

  private rankVictoria(dtG: DT, dtP: DT) {
    const I = 10.0;
    const PbeforeLocal = dtG.rank;
    const PbeforeVisitante = dtP.rank;
    const dr = PbeforeLocal - PbeforeVisitante;
    const WeG = 1.0 / (Math.pow(10.0, -dr / 6.0) + 1.0);
    const WeP = 1.0 / (Math.pow(10.0, -dr / 600.0) + 1.0);
    let PA = PbeforeLocal + I * (1.0 - WeG);
    let PB = PbeforeVisitante + I * (0.0 - WeP);
    if (PA < 0) PA = 0;
    if (PB < 0) PB = 0;
    this.dts.update((ds) => ({
      ...ds,
      [dtG.id]: { ...ds[dtG.id], rank: PA },
      [dtP.id]: { ...ds[dtP.id], rank: PB },
    }));
  }

  private empate(dtA: DT, dtB: DT) {
    const I = 10.0;
    const PbeforeLocal = dtA.rank;
    const PbeforeVisitante = dtB.rank;
    const dr = PbeforeLocal - PbeforeVisitante;
    const We = (1.0 / 10.0) * ((-dr / 60.0) + 1.0);
    let PA = PbeforeLocal + I * (0.5 - We);
    let PB = PbeforeVisitante + I * (0.5 - We);
    if (PA < 0) PA = 0;
    if (PB < 0) PB = 0;
    this.dts.update((ds) => ({
      ...ds,
      [dtA.id]: { ...ds[dtA.id], rank: PA },
      [dtB.id]: { ...ds[dtB.id], rank: PB },
    }));
  }

  // Import from data.xml (LigaMaster XStream)
  importFromXml(xmlText: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');

    const text = (el: Element | null, tag: string) => el?.getElementsByTagName(tag)?.item(0)?.textContent?.trim() ?? '';
    const num = (el: Element | null, tag: string) => Number(text(el, tag) || 0);
    const bool = (el: Element | null, tag: string) => text(el, tag) === 'true';

    // Players cache to avoid duplicates
    const ensureJugador = (jEl: Element) => {
      const id = Number(text(jEl, 'id'));
      const exists = this.jugadores()[id];
      const posParent = jEl.getElementsByTagName('posiciones').item(0);
      const posiciones = posParent ? Array.from(posParent.getElementsByTagName('string')).map((n) => n.textContent?.trim() || '') : [];
      const j: Jugador = {
        id,
        nombre: text(jEl, 'nombre') || `Jugador ${id}`,
        nacionalidad: text(jEl, 'nacionalidad') || '',
        posiciones,
        nivel: num(jEl, 'nivel'),
        potencial: num(jEl, 'potencial'),
        lesion: num(jEl, 'lesion'),
        habilitado: bool(jEl, 'habilitado'),
        precioVenta: Number(text(jEl, 'precioVenta') || 0),
        vecesNoPagadas: num(jEl, 'vecesNoPagadas'),
      };
      if (!exists) {
        this.jugadores.update((s) => ({ ...s, [id]: j }));
        if (id >= this.nextJugadorId) this.nextJugadorId = id + 1;
      } else {
        this.jugadores.update((s) => ({ ...s, [id]: { ...exists, ...j } }));
      }
      return id;
    };

    let dtsAdded = 0;
    let jugadoresAdded = 0;

    const dtNodes = Array.from(doc.getElementsByTagName('master.DT'));
    const existingByName = new Set(this.listaDTs().map((d) => d.nombreDT));

    for (const dtEl of dtNodes) {
      const nombreEquipo = text(dtEl, 'nombreEquipo') || '';
      const nombreDT = text(dtEl, 'nombreDT') || '';
      if (!nombreDT) continue;
      if (existingByName.has(nombreDT)) continue;

      const listaJugadoresEl = dtEl.getElementsByTagName('listaJugadores').item(0);
      const jugadoresEls = listaJugadoresEl ? Array.from(listaJugadoresEl.getElementsByTagName('master.Jugador')) : [];
      const jIds: number[] = [];
      for (const jEl of jugadoresEls) {
        const before = !!this.jugadores()[Number(text(jEl, 'id'))];
        const id = ensureJugador(jEl);
        if (!before) jugadoresAdded++;
        jIds.push(id);
      }

      const id = this.nextDtId++;
      const dt: DT = {
        id,
        nombreDT,
        nombreEquipo,
        plata: Number(text(dtEl, 'plata') || 0),
        torneosDisponibles: num(dtEl, 'torneosDisponibles') || 3,
        slots: num(dtEl, 'slots') || 30,
        rank: Number(text(dtEl, 'rank') || 1),
        listaJugadores: jIds,
      };
      this.dts.update((s) => ({ ...s, [id]: dt }));
      dtsAdded++;
    }

    return { dtsAdded, jugadoresAdded };
  }
}
