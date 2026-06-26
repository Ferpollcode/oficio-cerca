export type UserRole = "cliente" | "trabajador" | "admin";

export type LatLng = {
  lat: number;
  lng: number;
};

export type WorkerStatus = "Libre" | "Terminando" | "En camino" | "Ocupado";

export type Worker = {
  id: string;
  name: string;
  dni?: string;
  phone?: string;
  email?: string;
  trade: string;
  rating: number;
  jobs: number;
  eta: number;
  distance: number;
  status: WorkerStatus;
  initials: string;
  verified: boolean;
  license: string;
  insurance?: string;
  coverageArea?: string;
  backgroundCheck?: "Pendiente" | "Aprobado" | "Rechazado";
  position: LatLng;
};

export type ServiceRequest = {
  id: string;
  clientName: string;
  trade: string;
  address: string;
  urgency: "Ahora" | "Hoy" | "Esta semana";
  status: "Pendiente" | "Aceptado" | "En camino" | "Finalizado";
  workerId?: string;
  createdAt: string;
};
