"use client";

import { useState } from "react";
import { registerTrades } from "@/lib/trades";

const mendozaAreas = ["Ciudad", "Godoy Cruz", "Guaymallen", "Las Heras", "Maipu", "Lujan de Cuyo"];

const emptyWorkerForm = {
  name: "",
  dni: "",
  phone: "",
  email: "",
  trade: "Plomeria",
  customTrade: "",
  license: "",
  insurance: "",
  coverageArea: "Ciudad",
  address: "",
  hasCriminalRecordCertificate: false,
  acceptsLocation: false,
  acceptsTerms: false,
  acceptsSubscription: false,
};

export function WorkerRegistrationForm() {
  const [workerForm, setWorkerForm] = useState(emptyWorkerForm);
  const [workerFormMessage, setWorkerFormMessage] = useState("");

  function updateWorkerForm(field: keyof typeof workerForm, value: string | boolean) {
    setWorkerForm((current) => ({ ...current, [field]: value }));
  }

  function submitWorkerRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workerForm.acceptsLocation || !workerForm.acceptsTerms || !workerForm.acceptsSubscription) {
      setWorkerFormMessage("Para registrarte tenes que aceptar ubicacion durante pedidos, reglas de seguridad y suscripcion mensual.");
      return;
    }

    setWorkerForm(emptyWorkerForm);
    setWorkerFormMessage("Registro recibido. Tu perfil queda pendiente de validacion y el plan mensual de $14.999 queda preparado para activar la cuenta.");
  }

  return (
    <form className="worker-form" onSubmit={submitWorkerRegistration}>
      <div className="subscription-card">
        <span className="status-pill">Plan profesional</span>
        <h3>$14.999 por mes</h3>
        <p>
          La suscripcion mensual habilita tu perfil para recibir solicitudes,
          figurar en el mapa y acceder a descuentos exclusivos en Bulonera Agroindustrial.
          No se cobra comision por cada trabajo: el acuerdo es directo con el cliente.
        </p>
        <ul>
          <li>Perfil visible para clientes de Mendoza.</li>
          <li>Pedidos directos por oficio y zona.</li>
          <li>Sin comision por trabajo realizado.</li>
          <li>Beneficios y descuentos para herramientas e insumos.</li>
        </ul>
      </div>

      <div className="form-row two">
        <label>
          Nombre y apellido
          <input
            required
            value={workerForm.name}
            onChange={(event) => updateWorkerForm("name", event.target.value)}
            placeholder="Ej: Juan Perez"
          />
        </label>
        <label>
          DNI
          <input
            required
            inputMode="numeric"
            minLength={7}
            value={workerForm.dni}
            onChange={(event) => updateWorkerForm("dni", event.target.value)}
            placeholder="Ej: 30111222"
          />
        </label>
      </div>

      <div className="form-row two">
        <label>
          Telefono
          <input
            required
            type="tel"
            value={workerForm.phone}
            onChange={(event) => updateWorkerForm("phone", event.target.value)}
            placeholder="Ej: +54 9 261 555 1234"
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            value={workerForm.email}
            onChange={(event) => updateWorkerForm("email", event.target.value)}
            placeholder="nombre@email.com"
          />
        </label>
      </div>

      <div className="form-row two">
        <label>
          Oficio principal
          <select value={workerForm.trade} onChange={(event) => updateWorkerForm("trade", event.target.value)}>
            {registerTrades.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Zona de cobertura
          <select value={workerForm.coverageArea} onChange={(event) => updateWorkerForm("coverageArea", event.target.value)}>
            {mendozaAreas.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      {workerForm.trade === "Otro" && (
        <label>
          Indica tu oficio
          <input
            required
            value={workerForm.customTrade}
            onChange={(event) => updateWorkerForm("customTrade", event.target.value)}
            placeholder="Ej: instalador solar, colocador de pisos, tapicero"
          />
        </label>
      )}

      <label>
        Matricula, certificacion o referencia laboral
        <input
          required
          value={workerForm.license}
          onChange={(event) => updateWorkerForm("license", event.target.value)}
          placeholder="Ej: Gasista matriculado / electricista certificado"
        />
      </label>

      <label>
        Seguro o cobertura de trabajo
        <input
          value={workerForm.insurance}
          onChange={(event) => updateWorkerForm("insurance", event.target.value)}
          placeholder="Ej: RC profesional, ART, monotributo"
        />
      </label>

      <label>
        Domicilio laboral o base de salida
        <input
          required
          value={workerForm.address}
          onChange={(event) => updateWorkerForm("address", event.target.value)}
          placeholder="Ej: San Martin 1200, Godoy Cruz"
        />
      </label>

      <div className="check-list">
        <label className="check-row">
          <input
            checked={workerForm.hasCriminalRecordCertificate}
            onChange={(event) => updateWorkerForm("hasCriminalRecordCertificate", event.target.checked)}
            type="checkbox"
          />
          Tengo certificado de antecedentes o puedo presentarlo para validacion.
        </label>
        <label className="check-row">
          <input
            checked={workerForm.acceptsLocation}
            onChange={(event) => updateWorkerForm("acceptsLocation", event.target.checked)}
            required
            type="checkbox"
          />
          Acepto compartir ubicacion solo durante pedidos aceptados.
        </label>
        <label className="check-row">
          <input
            checked={workerForm.acceptsTerms}
            onChange={(event) => updateWorkerForm("acceptsTerms", event.target.checked)}
            required
            type="checkbox"
          />
          Acepto reglas de seguridad, trato responsable y validacion de identidad.
        </label>
        <label className="check-row">
          <input
            checked={workerForm.acceptsSubscription}
            onChange={(event) => updateWorkerForm("acceptsSubscription", event.target.checked)}
            required
            type="checkbox"
          />
          Acepto el plan de suscripcion mensual de $14.999 para activar mi perfil profesional, sin comision por trabajo.
        </label>
      </div>

      {workerFormMessage && <p className="form-message">{workerFormMessage}</p>}
      <button className="button primary" type="submit">Suscribirme y enviar registro</button>
    </form>
  );
}
