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
    cameras, audioEndpoints, usbDevices, ghostStats,
    mediaProcesses, loading, lastRefresh, refresh,
  } = useDevices();

  return (
    <div className="app">
      <Header lastRefresh={lastRefresh} loading={loading} onRefresh={refresh} />
      <div className="app-main">
        <div className="panel">
          <ProcessList processes={mediaProcesses} />
          <Timeline />
        </div>
        <div className="panel">
          <Dashboard cameras={cameras} audioEndpoints={audioEndpoints} loading={loading} />
          <UsbHealthPanel usbDevices={usbDevices} ghostStats={ghostStats} />
        </div>
      </div>
      <QuickActions ghostStats={ghostStats} onActionComplete={refresh} />
      <SettingsBar />
    </div>
  );
}

export default App;
