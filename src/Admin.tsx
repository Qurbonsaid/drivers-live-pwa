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

      <br />

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const username = formData.get("username") as string;
          const password = formData.get("password") as string;
          const { token } = await fetch(
            "https://bakery.the-watcher.uz/user/login",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ username, password }),
            }
          ).then((res) => res.json());
          localStorage.setItem("token", token);
          alert("Logged in");
        }}
      >
        <p>
          Username: <input type="text" name="username" />
        </p>
        <p>
          Password: <input type="password" name="password" />
        </p>
        <p>
          <input type="submit" value="Login" />
        </p>
      </form>

      <PWABadge />
    </>
  );
}

export default Admin;
