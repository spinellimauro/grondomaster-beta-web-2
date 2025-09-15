export interface Jugador {
  id: number;
  nombre: string;
  nacionalidad: string;
  posiciones: string[];
  nivel: number;
  potencial: number;
  lesion: number;
  habilitado: boolean;
  precioVenta: number;
  vecesNoPagadas: number;
}

export interface DT {
  id: number;
  nombreDT: string;
  nombreEquipo: string;
  password?: string;
  plata: number;
  torneosDisponibles: number;
  slots: number;
  rank: number;
  listaJugadores: number[]; // store jugador ids
}

export interface PremioEvento { evento: string; premio: number; }
export interface PremioPosicion { posicion: number; premio: number; }

export interface PremiosTorneos {
  listaEventos: PremioEvento[];
  listaPosiciones: PremioPosicion[];
}

export type Tarjeta = 'amarilla' | 'roja';

export interface Partido {
  id: string;
  numeroFecha: number;
  dtLocalId: number;
  dtVisitanteId: number;
  terminado: boolean;
  torneoId: string;
  golesLocal: number[]; // jugador ids
  golesVisitante: number[]; // jugador ids
  listaAmarillas: number[]; // jugador ids
  listaRojas: number[]; // jugador ids
}

export interface Torneo {
  id: string;
  nombreTorneo: string;
  listaParticipantes: number[]; // dt ids
  listaPartidos: string[]; // partido ids
  premios: PremiosTorneos;
  limiteAmarillas: number;
  terminado: boolean;
}

export function createDefaultPremios(): PremiosTorneos {
  return {
    listaEventos: [
      { evento: 'Victoria', premio: 2000 },
      { evento: 'Gol', premio: 1000 },
      { evento: 'Empate', premio: 1000 },
    ],
    listaPosiciones: [
      { posicion: 1, premio: 40000 },
      { posicion: 2, premio: 30000 },
      { posicion: 3, premio: 20000 },
      { posicion: 4, premio: 10000 },
    ],
  };
}

export function premioEvento(premios: PremiosTorneos, evento: string): number {
  return premios.listaEventos.find((e) => e.evento === evento)?.premio ?? 0;
}

export function uuid(): string {
  // simple uuid v4-ish
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
