import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const CenterMap = ({ position }: { position?: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);

  return null;
};

const TileLayerControl = ({
  hybridTile,
  setHybridTile,
}: {
  hybridTile: boolean;
  setHybridTile: (value: boolean) => void;
}) => {
  const map = useMap();

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

interface Props {
  drivers?: { user: { _id: string }; lat: number; lng: number }[];
  setLocation?: (value: {
    user: { _id: string };
    lat: number;
    lng: number;
  }) => void;
}

function LeafletMap({ drivers, setLocation }: Props) {
  const [position, setPosition] = useState<[number, number] | undefined>();
  const [hybridTile, setHybridTile] = useState(false);

  useEffect(() => {
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        if (!drivers && setLocation) {
          const newID = crypto.randomUUID();
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            user: {
              _id:
                localStorage.getItem("driver") ||
                (localStorage.setItem("driver", newID), newID),
            },
          });
        }
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [setLocation, drivers]);

  return (
    <>
      <MapContainer
        center={position || [37.240232, 67.286938]}
        zoom={16}
        style={{ height: "500px", width: "100%" }}
        scrollWheelZoom={false}
      >
        <CenterMap position={position} />

        <TileLayerControl
          hybridTile={hybridTile}
          setHybridTile={setHybridTile}
        />

        <TileLayer
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          url={`http://{s}.google.com/vt/lyrs=${
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
              icon={L.icon({
                iconUrl: "/car.png",
                iconSize: [60, 60],
                iconAnchor: [30, 60],
                popupAnchor: [0, -60],
              })}
            >
              <Popup>ID: {driver.user._id || "N/A"}</Popup>
            </Marker>
          ))}
        {!drivers?.length && position && (
          <Marker
            position={position}
            icon={L.icon({
              iconUrl: "/car.png",
              iconSize: [60, 60],
              iconAnchor: [30, 60],
              popupAnchor: [0, -60],
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
