import { useEffect, useState } from "react";
import "./PWABadge.css";

import { useRegisterSW } from "virtual:pwa-register/react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

function PWABadge() {
  // check for updates every hour
  const period = 60 * 60 * 1000;

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return;
      if (r?.active?.state === "activated") {
        registerPeriodicSync(period, swUrl, r);
      } else if (r?.installing) {
        r.installing.addEventListener("statechange", (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === "activated") registerPeriodicSync(period, swUrl, r);
        });
      }
    },
  });

  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subscribtion, setSubscription] = useState(() =>
    localStorage.getItem("push-subscribtion")
  );

  useEffect(() => {
    if (!subscribtion) {
      setShowSubscribe(true);
    }
  }, [subscribtion]);

  async function askPermission() {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      subscribeUser();
    } else {
      console.warn("Push notifications permission denied.");
      setShowSubscribe(false);
    }
  }

  async function subscribeUser() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.error("Push notifications are not supported in this browser.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("User is not authenticated.");
      return;
    }

    try {
      const [{ _id: branch }] = await fetch(
        "https://bakery.the-watcher.uz/branch",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).then((res) => res.json());
      localStorage.setItem("branch", branch);
    } catch (error) {
      console.error("Failed to authenticate user:", error);
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      console.log(registration);
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("Already subscribed:", existingSubscription);
        setSubscription(JSON.stringify(existingSubscription));
        localStorage.setItem(
          "push-subscribtion",
          JSON.stringify(existingSubscription)
        );
        setShowSubscribe(false);
        return;
      }

      const publicVapidKey =
        "BO5UItRTE2roiyFrBjKX2i_O7eHnmpTr9JvFrfk1K2PZuzIW-zvuryK-QnwqDmA0XMVhAK_CzGdr9Rg2Ia48ino";
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      console.log("User subscribed:", subscription);
      await fetch("https://bakery.the-watcher.uz/notification/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Branch": localStorage.getItem("branch")!,
        },
      });

      setSubscription(JSON.stringify(subscription));
      localStorage.setItem("push-subscribtion", JSON.stringify(subscription));
      setShowSubscribe(false);
    } catch (error) {
      console.error("Failed to subscribe user:", error);
    }
  }

  function close() {
    setOfflineReady(false);
    setNeedRefresh(false);
  }

  return (
    <div className="PWABadge" role="alert" aria-labelledby="toast-message">
      {(offlineReady || needRefresh) && (
        <div className="PWABadge-toast">
          <div className="PWABadge-toast-message">
            {offlineReady ? (
              <span id="toast-message">App ready to work offline</span>
            ) : (
              <span id="toast-message">
                New content available, click on reload button to update.
              </span>
            )}
          </div>
          <div className="PWABadge-buttons">
            {needRefresh && (
              <button
                className="PWABadge-toast-button"
                onClick={() => updateServiceWorker(true)}
              >
                Reload
              </button>
            )}
            <button className="PWABadge-toast-button" onClick={() => close()}>
              Close
            </button>
          </div>
        </div>
      )}
      {showSubscribe && (
        <div className="PWABadge-toast">
          <div className="PWABadge-toast-message">
            Enable push notifications for updates!
          </div>
          <div className="PWABadge-buttons">
            <button className="PWABadge-toast-button" onClick={askPermission}>
              Subscribe
            </button>
            <button
              className="PWABadge-toast-button"
              onClick={() => setShowSubscribe(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PWABadge;

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration
) {
  if (period <= 0) return;

  setInterval(async () => {
    if ("onLine" in navigator && !navigator.onLine) return;

    const resp = await fetch(swUrl, {
      cache: "no-store",
      headers: {
        cache: "no-store",
        "cache-control": "no-cache",
      },
    });

    if (resp?.status === 200) await r.update();
  }, period);
}
