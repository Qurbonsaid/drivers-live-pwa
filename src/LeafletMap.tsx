import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface Props {
  drivers?: { user: { _id: string }; lat: number; lng: number; rot: number }[];
  setLocation?: (value: {
    user: { _id: string };
    lat: number;
    lng: number;
    rot: number;
  }) => void;
}

const TileLayerControl = ({
  drivers,
  position,
  hybridTile,
  setHybridTile,
}: {
  drivers?: Props["drivers"];
  position: [number, number];
  hybridTile: boolean;
  setHybridTile: (value: boolean) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(
      drivers?.length
        ? [
            +(drivers.reduce((a, b) => a + b.lat, 0) / drivers.length).toFixed(
              6
            ),
            +(drivers.reduce((a, b) => a + b.lng, 0) / drivers.length).toFixed(
              6
            ),
          ]
        : position,
      map.getZoom()
    );
  }, [drivers, position, map]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        zIndex: 1000,
        background: "white",
        padding: "8px",
        borderRadius: "5px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <input
        type="checkbox"
        checked={hybridTile}
        onChange={(e) => {
          setHybridTile(e.target.checked);
          map.invalidateSize();
        }}
        style={{ marginRight: "5px", scale: "1.5" }}
      />
      <label style={{ fontSize: "14px", fontWeight: "bold", color: "black" }}>
        Hybrid
      </label>
    </div>
  );
};

function LeafletMap({ drivers, setLocation }: Props) {
  const [position, setPosition] = useState<[number, number]>(
    drivers?.length
      ? [
          +(drivers.reduce((a, b) => a + b.lat, 0) / drivers.length).toFixed(6),
          +(drivers.reduce((a, b) => a + b.lng, 0) / drivers.length).toFixed(6),
        ]
      : [37.240232, 67.286938]
  );
  const [rotation, setRotation] = useState(0);
  const [hybridTile, setHybridTile] = useState(false);

  useEffect(() => {
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        if (!drivers && setLocation) {
          const newID = crypto.randomUUID();
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            rot: pos.coords.heading || rotation,
            user: {
              _id:
                localStorage.getItem("driver") ||
                (localStorage.setItem("driver", newID), newID),
            },
          });
        }
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setRotation((prev) => pos.coords.heading || prev);
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [setLocation, drivers, rotation]);

  return (
    <>
      <MapContainer
        center={position}
        zoom={16}
        style={{ height: "50vh", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayerControl
          drivers={drivers}
          position={position}
          hybridTile={hybridTile}
          setHybridTile={setHybridTile}
        />

        <TileLayer
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          url={`https://{s}.google.com/vt/lyrs=${
            hybridTile ? "s,h" : "m"
          }&x={x}&y={y}&z={z}`}
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxZoom={20}
        />

        {drivers?.length &&
          drivers.map((driver) => (
            <Marker
              key={driver.user._id}
              position={[driver.lat, driver.lng]}
              icon={L.divIcon({
                html: `<img src="/car.png" style="transform: rotate(${driver.rot}deg); width: 60px; height: 60px; object-fit: contain;" />`,
                iconSize: [60, 60],
                iconAnchor: [30, 60],
                popupAnchor: [0, -60],
                className: "transparent-marker",
              })}
            >
              <Popup>ID: {driver.user._id || "N/A"}</Popup>
            </Marker>
          ))}
        {!drivers?.length && position && (
          <Marker
            position={position}
            icon={L.divIcon({
              html: `<img src="/car.png" style="transform: rotate(${rotation}deg); width: 60px; height: 60px; object-fit: contain;" />`,
              iconSize: [60, 60],
              iconAnchor: [30, 60],
              popupAnchor: [0, -60],
              className: "transparent-marker",
            })}
          >
            <Popup>ID: {localStorage.getItem("driver") || "N/A"}</Popup>
          </Marker>
        )}
      </MapContainer>
    </>
  );
}

export default LeafletMap;
