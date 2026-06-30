"use client";

import { useState } from "react";

const emptyClientForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export function ClientRegistrationForm() {
  const [clientForm, setClientForm] = useState(emptyClientForm);
  const [clientFormMessage, setClientFormMessage] = useState("");

  function updateClientForm(field: keyof typeof clientForm, value: string) {
    setClientForm((current) => ({ ...current, [field]: value }));
  }

  function submitClientRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientForm(emptyClientForm);
    setClientFormMessage("Cuenta cliente recibida. Ya podes pedir servicios y contactar profesionales cercanos.");
  }

  return (
    <form className="client-register-form" onSubmit={submitClientRegistration}>
      <label>
        Nombre y apellido
        <input
          placeholder="Ej: Laura Fernandez"
          required
          value={clientForm.name}
          onChange={(event) => updateClientForm("name", event.target.value)}
        />
      </label>
      <label>
        Email
        <input
          placeholder="nombre@email.com"
          required
          type="email"
          value={clientForm.email}
          onChange={(event) => updateClientForm("email", event.target.value)}
        />
      </label>
      <label>
        Telefono
        <input
          placeholder="Ej: +54 9 261 555 1234"
          required
          type="tel"
          value={clientForm.phone}
          onChange={(event) => updateClientForm("phone", event.target.value)}
        />
      </label>
      <label>
        Domicilio principal
        <input
          placeholder="Ej: Av. San Martin 1120, Ciudad"
          required
          value={clientForm.address}
          onChange={(event) => updateClientForm("address", event.target.value)}
        />
      </label>
      {clientFormMessage && <p className="form-message">{clientFormMessage}</p>}
      <button className="button primary" type="submit">Crear cuenta cliente</button>
    </form>
  );
}
