import { useEffect, useState } from "react";
import { socialLinks } from "../../data/contact";
import type { WindowId, WindowState } from "../../types/window";

type StatusBarProps = {
  windows: WindowState[];
  onOpenWindow: (id: WindowId) => void;
};

/*
  The clock ticks on its own, so it lives in its own component. Otherwise every
  second would re-render the whole task list and the link row for no reason.
*/
function Clock() {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const timer = window.setInterval(
      () => setTime(formatTime(new Date())),
      1000,
    );

    return () => window.clearInterval(timer);
  }, []);

  return (
    <time className="salahos-status-clock" dateTime={new Date().toISOString()}>
      {time}
    </time>
  );
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function StatusBar({ windows, onOpenWindow }: StatusBarProps) {
  return (
    <footer className="salahos-status-bar">
      <div className="salahos-status-apps">
        {windows.map((windowState) => (
          <button
            className="salahos-status-item"
            type="button"
            key={windowState.id}
            data-active={windowState.isFocused}
            data-minimized={windowState.isMinimized}
            aria-current={windowState.isFocused ? "true" : undefined}
            aria-label={
              windowState.isMinimized
                ? `Restore ${windowState.title}`
                : `Focus ${windowState.title}`
            }
            title={windowState.title}
            onClick={() => onOpenWindow(windowState.id)}
          >
            [{windowState.title}]
          </button>
        ))}
      </div>
      <div className="salahos-status-actions">
        <div className="salahos-status-links">
          {socialLinks.map((link) => (
            <a
              className="salahos-status-link"
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              aria-label={`Open ${link.label} in a new tab`}
            >
              [{link.badge}]
            </a>
          ))}
        </div>
        <Clock />
      </div>
    </footer>
  );
}
