import { useEffect, useState } from "react";
import PWABadge from "./PWABadge";
import LeafletMap from "./LeafletMap";
import socket from "./socket";

interface Driver {
  user: { _id: string };
  lat: number;
  lng: number;
  rot: number;
}

function Admin() {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    socket.on("location", (driver: Driver) => {
      setDrivers((prevDrivers) => {
        const driverIndex = prevDrivers.findIndex(
          (prevDriver) => prevDriver.user._id === driver.user._id
        );

        if (driverIndex !== -1) {
          prevDrivers[driverIndex] = driver;
          return [...prevDrivers];
        }

        return [...prevDrivers, driver];
      });
    });

    return () => {
      socket.off("drivers");
    };
  }, []);

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
