import { useDevices } from "./hooks/useDevices";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { UsbHealthPanel } from "./components/UsbHealthPanel";
import { ProcessList } from "./components/ProcessList";
import { Timeline } from "./components/Timeline";
import { QuickActions } from "./components/QuickActions";
import { SettingsBar } from "./components/SettingsBar";

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

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-px bg-border overflow-auto">
        {/* Left: What is using what */}
        <section className="lg:col-span-2 bg-surface p-6 space-y-6">
          <ProcessList processes={mediaProcesses} />
          <Timeline />
        </section>

        {/* Right: Devices & health */}
        <aside className="bg-surface p-6 space-y-6">
          <Dashboard
            cameras={cameras}
            audioEndpoints={audioEndpoints}
            loading={loading}
          />
          <UsbHealthPanel usbDevices={usbDevices} ghostStats={ghostStats} />
        </aside>
      </main>

      <QuickActions ghostStats={ghostStats} onActionComplete={refresh} />
      <SettingsBar />
    </div>
  );
}

export default App;
