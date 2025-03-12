import { useState } from "react";
import PWABadge from "./PWABadge";
import LeafletMap from "./LeafletMap";

function Admin() {
  const [drivers] = useState([
    {
      lat: 39.6510763,
      lng: 66.9684902,
      user: {
        _id: crypto.randomUUID(),
      },
    },
    {
      lat: 39.6481163,
      lng: 66.9649602,
      user: {
        _id: crypto.randomUUID(),
      },
    },
    {
      lat: 39.6517563,
      lng: 66.9633302,
      user: {
        _id: crypto.randomUUID(),
      },
    },
  ]);

  return (
    <>
      <h1>Drivers live location</h1>

      <div className="card">
        <LeafletMap drivers={drivers} />
      </div>

      <PWABadge />
    </>
  );
}

export default Admin;
