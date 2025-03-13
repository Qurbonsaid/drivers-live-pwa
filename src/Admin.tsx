import { useState } from "react";
import PWABadge from "./PWABadge";
import LeafletMap from "./LeafletMap";
import socket from "./socket";

interface Driver {
  user: { _id: string };
  lat: number;
  lng: number;
  rot?: number;
}

function Admin() {
  const [drivers] = useState<Driver[]>([]);

  socket.on("location", (driver: Driver) => {
    const index = drivers.findIndex((d) => d.user._id === driver.user._id);
    if (index === -1) {
      drivers.push(driver);
    } else {
      drivers[index] = driver;
    }
  });

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
