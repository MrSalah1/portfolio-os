import { useCallback, useState } from "react";
import { AppShell } from "./app/AppShell";
import { BootScreen } from "./features/boot/BootScreen";

function App() {
  const [isBooting, setIsBooting] = useState(true);
  const finishBoot = useCallback(() => setIsBooting(false), []);

  return (
    <div className="salahos-screen">
      <AppShell />
      {isBooting ? <BootScreen onDone={finishBoot} /> : null}
      <div className="salahos-crt" aria-hidden="true" />
    </div>
  );
}

export default App;
