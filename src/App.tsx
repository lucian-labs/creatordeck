import { useDevices } from "./hooks/useDevices";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { UsbHealthPanel } from "./components/UsbHealthPanel";
import { ProcessList } from "./components/ProcessList";
import { QuickActions } from "./components/QuickActions";

function App() {
  const {
    cameras,
    audioEndpoints,
    usbDevices,
    ghostStats,
    mediaProcesses,
    loading,
    lastRefresh,
    refresh,
  } = useDevices();

  return (
    <div className="min-h-screen flex flex-col bg-surface text-zinc-100">
      <Header lastRefresh={lastRefresh} loading={loading} onRefresh={refresh} />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-auto">
        <section className="lg:col-span-2 space-y-4">
          <Dashboard
            cameras={cameras}
            audioEndpoints={audioEndpoints}
            loading={loading}
          />
        </section>

        <aside className="space-y-4">
          <UsbHealthPanel usbDevices={usbDevices} ghostStats={ghostStats} />
          <ProcessList processes={mediaProcesses} />
        </aside>
      </main>

      <QuickActions ghostStats={ghostStats} onActionComplete={refresh} />
    </div>
  );
}

export default App;
