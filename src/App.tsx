import PWABadge from "./PWABadge.tsx";
import "./App.css";
import LeafletMap from "./LeafletMap.tsx";
import socket from "./socket.ts";
import { useEffect } from "react";
import { useOnline } from "@reactuses/core";

function App() {
  const online = useOnline();
  const setLocation = (driver: {
    lat: number;
    lng: number;
    rot?: number;
    user: { _id: string };
  }) => {
    if (!online) {
      const rest: Array<typeof driver> = JSON.parse(
        localStorage.getItem("update") || "[]"
      );
      localStorage.setItem("update", JSON.stringify(rest.concat(driver)));
    } else {
      socket.emit("location", driver, (res = null) => {
        console.log(driver, res);
      });
    }
  };

  useEffect(() => {
    if (online) {
      const pending: Array<{
        lat: number;
        lng: number;
        rot?: number;
        user: { _id: string };
      }> = JSON.parse(localStorage.getItem("update") || "[]");
      pending.forEach((driver) => {
        socket.emit("location", driver);
      });
      localStorage.removeItem("update");
    }
  }, [online]);

  return (
    <>
      <br />
      <a href="/admin">Admin</a>
      <h1>Your current location</h1>

      <div className="card">
        <LeafletMap setLocation={setLocation} />
      </div>

      <PWABadge />
    </>
  );
}

export default App;
