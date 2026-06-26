"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { customerPosition, initialRequests, initialWorkers } from "@/lib/demo-data";
import { isSupabaseConfigured, schemaSql } from "@/lib/supabase";
import { searchableTrades } from "@/lib/trades";
import type { ServiceRequest, UserRole, Worker } from "@/lib/types";

type GoogleMarker = {
  setPosition: (position: { lat: number; lng: number }) => void;
  addListener: (eventName: string, handler: () => void) => void;
};

type GooglePolyline = {
  setMap: (map: GoogleMap | null) => void;
};

type GoogleMap = object;
type MapState = "demo" | "loading" | "ready" | "error";

type GoogleMapsApi = {
  maps: {
    Map: new (
      element: HTMLElement,
      options: Record<string, unknown>
    ) => GoogleMap;
    Marker: new (options: Record<string, unknown>) => GoogleMarker;
    Polyline: new (options: Record<string, unknown>) => GooglePolyline;
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
    initOficioMap?: () => void;
  }
}

export function OficioCercaApp() {
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [role, setRole] = useState<UserRole>("cliente");
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [trade, setTrade] = useState("Todos");
  const [address, setAddress] = useState("Av. San Martin 1120, Ciudad de Mendoza");
  const [urgency, setUrgency] = useState<ServiceRequest["urgency"]>("Ahora");
  const [selectedWorkerId, setSelectedWorkerId] = useState("w-1");
  const [tracking, setTracking] = useState(false);
  const [consent, setConsent] = useState(false);
  const [mapState, setMapState] = useState<MapState>(googleMapsKey ? "loading" : "demo");
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<GoogleMap | null>(null);
  const markersRef = useRef<Map<string, GoogleMarker>>(new Map());
  const routeRef = useRef<GooglePolyline | null>(null);

  const selectedWorker = workers.find((worker) => worker.id === selectedWorkerId) ?? workers[0];

  const filteredWorkers = useMemo(() => {
    return trade === "Todos" ? workers : workers.filter((worker) => worker.trade === trade);
  }, [trade, workers]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const key = googleMapsKey;
    if (!key) return;
    if (!mapRef.current) return;

    const initializeGoogleMap = (google: GoogleMapsApi) => {
      if (!mapRef.current || googleMapRef.current) return;
      googleMapRef.current = new google.maps.Map(mapRef.current, {
        center: customerPosition,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });
      new google.maps.Marker({
        position: customerPosition,
        map: googleMapRef.current,
        title: "Domicilio del cliente",
      });
      initialWorkers.forEach((worker) => {
        const marker = new google.maps.Marker({
          position: worker.position,
          map: googleMapRef.current,
          title: `${worker.name} - ${worker.trade}`,
        });
        marker.addListener("click", () => setSelectedWorkerId(worker.id));
        markersRef.current.set(worker.id, marker);
      });
      setMapState("ready");
    };

    if (window.google) {
      initializeGoogleMap(window.google);
      return;
    }

    window.initOficioMap = () => {
      if (!window.google) return;
      initializeGoogleMap(window.google);
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=initOficioMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setMapState("error");
    document.head.appendChild(script);
  }, [googleMapsKey]);

  useEffect(() => {
    if (!tracking || !consent) return;
    const timer = window.setInterval(() => {
      setWorkers((current) =>
        current.map((worker) => {
          if (worker.id !== selectedWorkerId) return worker;
          const position = {
            lat: worker.position.lat + (customerPosition.lat - worker.position.lat) * 0.14,
            lng: worker.position.lng + (customerPosition.lng - worker.position.lng) * 0.14,
          };
          return {
            ...worker,
            position,
            status: "En camino",
            eta: Math.max(3, Math.round(worker.eta * 0.86)),
            distance: Math.max(0.4, worker.distance * 0.86),
          };
        })
      );
    }, 1800);
    return () => window.clearInterval(timer);
  }, [consent, selectedWorkerId, tracking]);

  useEffect(() => {
    if (!window.google || !googleMapRef.current || !selectedWorker) return;
    const google = window.google;
    const marker = markersRef.current.get(selectedWorker.id);
    if (marker) marker.setPosition(selectedWorker.position);
    if (routeRef.current) routeRef.current.setMap(null);
    routeRef.current = new google.maps.Polyline({
      path: [selectedWorker.position, customerPosition],
      geodesic: true,
      strokeColor: "#00c8b4",
      strokeOpacity: 0.9,
      strokeWeight: 5,
      map: googleMapRef.current,
    });
  }, [selectedWorker, workers]);

  function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRequest: ServiceRequest = {
      id: `REQ-${1027 + requests.length}`,
      clientName: "Cliente demo",
      trade: trade === "Todos" ? "Plomeria" : trade,
      address,
      urgency,
      status: "Pendiente",
      createdAt: new Date().toLocaleString("es-AR"),
    };
    setRequests((current) => [nextRequest, ...current]);
    setRole("trabajador");
  }

  function requestConsent(workerId: string) {
    setSelectedWorkerId(workerId);
    setConsent(false);
    setTracking(false);
    setRole("cliente");
    document.querySelector("#mapa")?.scrollIntoView({ behavior: "smooth" });
  }

  function acceptTracking() {
    setConsent(true);
    setTracking(true);
    setRequests((current) =>
      current.map((request, index) =>
        index === 0
          ? { ...request, workerId: selectedWorker.id, status: "En camino" }
          : request
      )
    );
  }

  function stopTracking() {
    setTracking(false);
    setConsent(false);
    setWorkers((current) =>
      current.map((worker) =>
        worker.id === selectedWorker.id ? { ...worker, status: "Libre" } : worker
      )
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="OficioCerca inicio">
          <Image className="brand-logo" src="/oficioya-logo.png" alt="OficioYa" width={230} height={139} priority />
        </a>
        <nav className="nav-tabs" aria-label="Secciones">
          <a href="#buscar">Buscar</a>
          <a href="#mapa">Mapa</a>
          <a href="#paneles">Paneles</a>
        </nav>
        <div className="role-tabs" aria-label="Acceso">
          <Link className="login-tab" href="/login">
            INICIAR SESIÓN
          </Link>
          <Link className="register-tab" href="/registro">
            REGISTRO
          </Link>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div>
            <p className="eyebrow">Oficios en Mendoza y alrededores</p>
            <h1>
              Encontrá profesionales confiables <strong>cerca de tu casa en Mendoza.</strong>
            </h1>
            <p>
              Pedí plomeros, electricistas, gasistas y técnicos en Ciudad, Godoy Cruz,
              Guaymallén, Las Heras, Maipú y Luján de Cuyo. Compará reputación y seguí
              su llegada cuando acepten el trabajo.
            </p>
            <div className="direct-notice">
              Contacto directo entre cliente y trabajador. La página no interviene en el
              acuerdo del trabajo y no cobra comisión por servicio realizado.
            </div>
            <div className="hero-actions">
              <a className="button primary" href="#buscar">Pedir oficio</a>
              <a className="button" href="#mapa">Ver mapa</a>
            </div>
          </div>
          <div className="phone-frame" aria-label="Vista mobile de la app">
            <div className="phone-screen">
              <span className="status-pill"><span className="dot" /> {selectedWorker.status}</span>
              <h2>{selectedWorker.name}</h2>
              <p>{selectedWorker.trade} certificado. {selectedWorker.license}</p>
              <div className="metric-grid">
                <div className="metric"><span>ETA</span><strong>{selectedWorker.eta} min</strong></div>
                <div className="metric"><span>Distancia</span><strong>{selectedWorker.distance.toFixed(1)} km</strong></div>
                <div className="metric"><span>Rating</span><strong>{selectedWorker.rating}</strong></div>
              </div>
              <div className="tracking-banner">
                <span className={`dot ${tracking ? "" : "paused"}`} />
                <span>{tracking ? "Ubicacion compartida en vivo" : "Esperando permiso de ubicacion"}</span>
              </div>
              <button className="button primary" onClick={acceptTracking} type="button">
                Aceptar seguimiento
              </button>
              <button className="button danger" onClick={stopTracking} type="button">
                Finalizar
              </button>
            </div>
          </div>
        </section>

        <section className="section benefits-section" aria-labelledby="benefits-title">
          <div className="section-head centered">
            <div>
              <p className="eyebrow">Pensada para Mendoza</p>
              <h2 id="benefits-title">Mas simple que buscar por tu cuenta</h2>
            </div>
          </div>
          <div className="benefit-grid">
            <article className="benefit-card">
              <h3>Pedilo en minutos</h3>
              <p>
                Elegis el oficio, cargás tu dirección y ves profesionales disponibles
                en el Gran Mendoza sin vueltas ni llamadas al azar.
              </p>
            </article>
            <article className="benefit-card featured">
              <h3>Contacto directo</h3>
              <p>
                Coordinás directamente con quien va a hacer el trabajo. La plataforma
                solo conecta y no participa del presupuesto ni cobra comisión por trabajo.
              </p>
            </article>
            <article className="benefit-card">
              <h3>Confianza antes de contratar</h3>
              <p>
                Revisas reputación, oficio, matrícula y trabajos realizados antes
                de confirmar el servicio.
              </p>
            </article>
          </div>
        </section>

        <section className="section" id="buscar">
          <div className="section-head">
            <div>
              <p className="eyebrow">Cliente</p>
              <h2>Solicitá un trabajador en Mendoza</h2>
            </div>
            <span className="status-pill">
              Supabase: {isSupabaseConfigured ? "conectado" : "modo demo"}
            </span>
          </div>
          <form className="form-grid" onSubmit={submitRequest}>
            <label>
              Oficio
              <select value={trade} onChange={(event) => setTrade(event.target.value)}>
                {searchableTrades.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Domicilio
              <input value={address} onChange={(event) => setAddress(event.target.value)} />
            </label>
            <label>
              Urgencia
              <select value={urgency} onChange={(event) => setUrgency(event.target.value as ServiceRequest["urgency"])}>
                <option>Ahora</option>
                <option>Hoy</option>
                <option>Esta semana</option>
              </select>
            </label>
            <button className="button primary" type="submit">Crear pedido</button>
          </form>
          <p className="direct-disclaimer">
            El contacto y la contratación son directos entre cliente y trabajador. OficioCerca Mendoza
            no interviene en el precio final ni cobra comisión por cada trabajo.
          </p>
        </section>

        <section className="section grid-2" id="mapa">
          <div className="panel">
            <p className="eyebrow">Tracking autorizado</p>
            <h2>Mapa en vivo</h2>
            <p>
              El trabajador debe aceptar compartir ubicación. El cliente ve distancia, ETA y estado
              hasta que el servicio finaliza o el permiso se revoca.
            </p>
            <div className="tracking-banner">
              <span className={`dot ${tracking ? "" : "paused"}`} />
              <span>{tracking ? `${selectedWorker.name} esta en camino.` : "Selecciona un trabajador y acepta el permiso."}</span>
            </div>
            <span className="status-pill map-status">
              Google Maps: {mapState === "ready" ? "activo" : mapState === "loading" ? "cargando" : mapState === "error" ? "error de API" : "modo demo"}
            </span>
            <div className="metric-grid">
              <div className="metric"><span>Distancia</span><strong>{selectedWorker.distance.toFixed(1)} km</strong></div>
              <div className="metric"><span>Llegada</span><strong>{selectedWorker.eta} min</strong></div>
              <div className="metric"><span>Estado</span><strong>{selectedWorker.status}</strong></div>
            </div>
            <div className="panel-actions">
              <button className="button primary" onClick={acceptTracking} type="button">Aceptar permiso</button>
              <button className="button danger" onClick={stopTracking} type="button">Detener</button>
            </div>
          </div>
          <div className="map-shell">
            <div ref={mapRef} className="map-canvas" aria-label="Mapa de Google Maps con trabajadores" />
            {mapState !== "ready" && (
              <div className="map-fallback-overlay" aria-label="Mapa demo de trabajadores">
                <span className="fallback-grid" />
                {workers.slice(0, 4).map((worker, index) => (
                  <button
                    aria-label={`Seleccionar ${worker.name}`}
                    className={`map-point worker-point ${selectedWorkerId === worker.id ? "selected" : ""}`}
                    key={worker.id}
                    onClick={() => setSelectedWorkerId(worker.id)}
                    style={{ left: `${18 + index * 15}%`, top: `${22 + (index % 2) * 18}%` }}
                    type="button"
                  />
                ))}
                <span className="map-point home-point" />
              </div>
            )}
            <div className="map-toolbar">
              <button className="icon-button" onClick={acceptTracking} title="Iniciar tracking" type="button">▶</button>
              <button className="icon-button" onClick={stopTracking} title="Detener tracking" type="button">■</button>
            </div>
          </div>
        </section>

        <section className="section" id="paneles">
          <div className="section-head">
            <div>
              <p className="eyebrow">Roles</p>
              <h2>Paneles de operacion</h2>
            </div>
          </div>

          <div className={`role-panel ${role === "cliente" ? "active" : ""}`}>
            <div className="card-grid">
              {filteredWorkers.map((worker) => (
                <article className="card" key={worker.id}>
                  <div className="worker-top">
                    <span className="avatar">{worker.initials}</span>
                    <div>
                      <h3>{worker.name}</h3>
                      <p>{worker.trade}</p>
                    </div>
                  </div>
                  <div className="meta">
                    <span>{worker.rating} estrellas</span>
                    <span>{worker.jobs} trabajos</span>
                    <span>{worker.eta} min</span>
                  </div>
                  <p>{worker.license}</p>
                  <button className="button primary" onClick={() => requestConsent(worker.id)} type="button">
                    Ver en mapa
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div className={`role-panel ${role === "trabajador" ? "active" : ""}`}>
            <div className="grid-2">
              <div className="panel worker-register-panel">
                <p className="eyebrow">Trabajador</p>
                <h2>Panel del trabajador</h2>
                <p>
                  Desde este panel podés aceptar pedidos, activar ubicación solo durante el trabajo
                  y administrar tu disponibilidad. Los acuerdos son directos con el cliente,
                  sin comisión por trabajo realizado.
                </p>
                <div className="worker-join-card">
                  <strong>¿Querés recibir pedidos en Mendoza?</strong>
                  <p>
                    El registro se completa en una página segura con validación de identidad,
                    datos profesionales y plan mensual.
                  </p>
                  <Link className="button primary" href="/registro">Ir al registro</Link>
                </div>
                <div className="panel-actions">
                  <button className="button primary" onClick={acceptTracking} type="button">Aceptar pedido</button>
                  <button className="button danger" onClick={stopTracking} type="button">Revocar ubicacion</button>
                </div>
              </div>
              <div className="request-list">
                {requests.map((request) => (
                  <article className="request-card" key={request.id}>
                    <div>
                      <h3>{request.trade} - {request.clientName}</h3>
                      <p>{request.address} · {request.createdAt}</p>
                    </div>
                    <span className="status-pill">{request.status}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className={`role-panel ${role === "admin" ? "active" : ""}`}>
            <div className="grid-2">
              <div className="panel">
                <p className="eyebrow">Administracion</p>
                <h2>Control de plataforma</h2>
                <p>
                  Gestión de altas, oficios, matrículas, pedidos, reclamos y auditoría de
                  consentimiento de ubicación por zonas de Mendoza.
                </p>
                <div className="admin-grid">
                  <div className="admin-tile"><span>Trabajadores</span><strong>{workers.length}</strong></div>
                  <div className="admin-tile"><span>Pedidos</span><strong>{requests.length}</strong></div>
                  <div className="admin-tile"><span>Tracking activo</span><strong>{tracking ? 1 : 0}</strong></div>
                </div>
              </div>
              <div className="panel">
                <p className="eyebrow">SQL inicial</p>
                <textarea readOnly value={schemaSql.trim()} />
              </div>
            </div>
          </div>
        </section>

      </main>

      <nav className="bottom-nav" aria-label="Mobile">
        <button className={role === "cliente" ? "active" : ""} onClick={() => setRole("cliente")} type="button">CLIENTE</button>
        <button className={role === "trabajador" ? "active" : ""} onClick={() => setRole("trabajador")} type="button">TRABAJO</button>
        <button className={role === "admin" ? "active" : ""} onClick={() => setRole("admin")} type="button">ADMIN</button>
        <Link href="/registro">REGISTRO</Link>
      </nav>
    </div>
  );
}
