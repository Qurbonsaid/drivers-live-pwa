import { useState } from "react";
import PWABadge from "./PWABadge";
import LeafletMap from "./LeafletMap";

function Admin() {
  const [drivers] = useState([
    {
      lat: 37.241732,
      lng: 67.285438,
      user: {
        _id: crypto.randomUUID(),
      },
    },
    {
      lat: 37.239832,
      lng: 67.287038,
      user: {
        _id: crypto.randomUUID(),
      },
    },
    {
      lat: 37.242132,
      lng: 67.284738,
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
