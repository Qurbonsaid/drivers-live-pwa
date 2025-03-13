import PWABadge from "./PWABadge.tsx";
import "./App.css";
import LeafletMap from "./LeafletMap.tsx";

function App() {
  const setLocation = (driver: {
    lat: number;
    lng: number;
    user: { _id: string };
  }) => {
    console.log(driver);
  };

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
