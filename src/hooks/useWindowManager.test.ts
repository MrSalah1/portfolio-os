import { describe, expect, it } from "vitest";
import { initialWindows } from "../data/windows";
import type {
  WindowId,
  WindowManagerAction,
  WindowManagerState,
  WindowMap,
  WindowState,
} from "../types/window";
import { createInitialWindowManagerState, windowManagerReducer } from "./useWindowManager";

/*
  The reducer is the heart of the window system, so these tests drive it
  directly with the real window table from src/data/windows.ts rather than a
  hand-built stand-in. That way the tests also confirm the registry produces
  state the reducer can operate on.

  Every test starts from a deep copy of the initial window map, so no test can
  leak state into another one regardless of how the reducer builds its results.
*/

function freshWindows(): WindowMap {
  return structuredClone(initialWindows);
}

function createState(): WindowManagerState {
  return createInitialWindowManagerState(freshWindows());
}

function apply(state: WindowManagerState, ...actions: WindowManagerAction[]) {
  return actions.reduce(windowManagerReducer, state);
}

function focusedWindows(state: WindowManagerState): WindowId[] {
  return (Object.keys(state.windows) as WindowId[]).filter(
    (id) => state.windows[id].isFocused,
  );
}

function snapshotOf(state: WindowManagerState, except: WindowId) {
  return Object.fromEntries(
    (Object.keys(state.windows) as WindowId[])
      .filter((id) => id !== except)
      .map((id) => [id, state.windows[id]]),
  );
}

const OPEN_SALAH: WindowManagerAction = { type: "open", id: "salah" };
const OPEN_TERMINAL: WindowManagerAction = { type: "open", id: "terminal" };

describe("windowManagerReducer", () => {
  describe("the initial state", () => {
    it("starts with every window closed and unfocused", () => {
      const state = createState();

      for (const id of Object.keys(state.windows) as WindowId[]) {
        expect(state.windows[id].isOpen).toBe(false);
        expect(state.windows[id].isFocused).toBe(false);
        expect(state.windows[id].isMinimized).toBe(false);
        expect(state.windows[id].isMaximized).toBe(false);
      }
    });

    it("starts with no active window", () => {
      expect(createState().activeWindowId).toBeNull();
    });

    it("covers every window declared in the registry", () => {
      expect(Object.keys(createState().windows).sort()).toEqual(
        Object.keys(initialWindows).sort(),
      );
    });
  });

  describe("open", () => {
    it("marks the window open", () => {
      const state = apply(createState(), OPEN_SALAH);

      expect(state.windows.salah.isOpen).toBe(true);
    });

    it("focuses the window and makes it active", () => {
      const state = apply(createState(), OPEN_SALAH);

      expect(state.windows.salah.isFocused).toBe(true);
      expect(state.activeWindowId).toBe("salah");
    });

    it("focuses exactly one window", () => {
      const state = apply(createState(), OPEN_SALAH, OPEN_TERMINAL);

      expect(focusedWindows(state)).toEqual(["terminal"]);
    });

    it("clears focus from the previously active window", () => {
      const state = apply(createState(), OPEN_SALAH, OPEN_TERMINAL);

      expect(state.windows.salah.isFocused).toBe(false);
    });

    it("raises the window above every other window", () => {
      const state = apply(createState(), OPEN_SALAH, OPEN_TERMINAL);

      expect(state.windows.terminal.zIndex).toBeGreaterThan(
        state.windows.salah.zIndex,
      );
    });

    it("advances the top z-index counter", () => {
      const before = createState();
      const after = apply(before, OPEN_SALAH);

      expect(after.topZIndex).toBeGreaterThan(before.topZIndex);
    });

    it("restores a minimized window instead of leaving it minimized", () => {
      const minimized = apply(createState(), OPEN_SALAH, {
        type: "minimize",
        id: "salah",
      });

      expect(minimized.windows.salah.isMinimized).toBe(true);

      const reopened = apply(minimized, OPEN_SALAH);

      expect(reopened.windows.salah.isMinimized).toBe(false);
      expect(reopened.windows.salah.isOpen).toBe(true);
    });

    it("leaves every other window untouched", () => {
      const before = createState();
      const after = apply(before, OPEN_SALAH);

      expect(snapshotOf(after, "salah")).toEqual(snapshotOf(before, "salah"));
    });

    it("does not mutate the previous state", () => {
      const before = apply(createState(), OPEN_SALAH);
      const snapshot = structuredClone(before);

      apply(before, { type: "close", id: "salah" });

      expect(before).toEqual(snapshot);
    });
  });

  describe("close", () => {
    it("marks the window closed and clears its minimized and focus flags", () => {
      const state = apply(createState(), OPEN_SALAH, { type: "close", id: "salah" });

      expect(state.windows.salah.isOpen).toBe(false);
      expect(state.windows.salah.isMinimized).toBe(false);
      expect(state.windows.salah.isFocused).toBe(false);
    });

    it("falls back to the topmost window that is still visible", () => {
      const state = apply(
        createState(),
        OPEN_SALAH,
        OPEN_TERMINAL,
        { type: "close", id: "terminal" },
      );

      expect(state.activeWindowId).toBe("salah");
      expect(state.windows.salah.isFocused).toBe(true);
    });

    it("falls back to the topmost visible window, not the first declared one", () => {
      const state = apply(
        createState(),
        { type: "open", id: "contact" },
        OPEN_SALAH,
        { type: "close", id: "salah" },
      );

      expect(state.activeWindowId).toBe("contact");
    });

    it("clears the active window when nothing visible is left", () => {
      const state = apply(createState(), OPEN_SALAH, { type: "close", id: "salah" });

      expect(state.activeWindowId).toBeNull();
      expect(focusedWindows(state)).toEqual([]);
    });

    it("preserves the state of other open windows", () => {
      const before = apply(createState(), OPEN_SALAH, OPEN_TERMINAL);
      const after = apply(before, { type: "close", id: "terminal" });

      expect(after.windows.salah.isOpen).toBe(true);
      expect(after.windows.terminal.isOpen).toBe(false);
    });

    it("ignores a close for a window that is already closed", () => {
      const before = createState();
      const after = apply(before, { type: "close", id: "salah" });

      expect(after).toBe(before);
    });
  });

  describe("minimize", () => {
    it("marks the window minimized so it leaves the visible layer", () => {
      const state = apply(createState(), OPEN_SALAH, {
        type: "minimize",
        id: "salah",
      });

      expect(state.windows.salah.isMinimized).toBe(true);
    });

    it("keeps the window open, so it can be restored", () => {
      const state = apply(createState(), OPEN_SALAH, {
        type: "minimize",
        id: "salah",
      });

      expect(state.windows.salah.isOpen).toBe(true);
    });

    it("removes focus from the minimized window", () => {
      const state = apply(createState(), OPEN_SALAH, {
        type: "minimize",
        id: "salah",
      });

      expect(state.windows.salah.isFocused).toBe(false);
      expect(focusedWindows(state)).toEqual([]);
    });

    it("hands the active window to the topmost window still visible", () => {
      const state = apply(
        createState(),
        OPEN_SALAH,
        OPEN_TERMINAL,
        { type: "minimize", id: "terminal" },
      );

      expect(state.activeWindowId).toBe("salah");
    });

    it("ignores minimizing a window that is not visible", () => {
      const before = createState();

      expect(apply(before, { type: "minimize", id: "salah" })).toBe(before);
    });

    it("ignores minimizing a window that is already minimized", () => {
      const before = apply(createState(), OPEN_SALAH, {
        type: "minimize",
        id: "salah",
      });

      expect(apply(before, { type: "minimize", id: "salah" })).toBe(before);
    });

    it("is restored by focusing it again, which un-minimizes nothing but re-raises", () => {
      const minimized = apply(createState(), OPEN_SALAH, {
        type: "minimize",
        id: "salah",
      });

      expect(
        apply(minimized, { type: "focus", id: "salah" }).windows.salah.isMinimized,
      ).toBe(true);
    });
  });

  describe("toggle-maximize", () => {
    it("maximizes a normal window", () => {
      const state = apply(createState(), OPEN_SALAH, {
        type: "toggle-maximize",
        id: "salah",
      });

      expect(state.windows.salah.isMaximized).toBe(true);
    });

    it("restores a maximized window", () => {
      const maximized = apply(createState(), OPEN_SALAH, {
        type: "toggle-maximize",
        id: "salah",
      });
      const restored = apply(maximized, {
        type: "toggle-maximize",
        id: "salah",
      });

      expect(restored.windows.salah.isMaximized).toBe(false);
    });

    it("focuses and raises the window when maximizing", () => {
      const state = apply(createState(), OPEN_SALAH, OPEN_TERMINAL, {
        type: "toggle-maximize",
        id: "salah",
      });

      expect(state.activeWindowId).toBe("salah");
      expect(state.windows.salah.zIndex).toBeGreaterThan(
        state.windows.terminal.zIndex,
      );
    });

    it("leaves the window open and not minimized", () => {
      const state = apply(createState(), OPEN_SALAH, {
        type: "toggle-maximize",
        id: "salah",
      });

      expect(state.windows.salah.isOpen).toBe(true);
      expect(state.windows.salah.isMinimized).toBe(false);
    });

    it("ignores a window that is not visible", () => {
      const before = createState();

      expect(apply(before, { type: "toggle-maximize", id: "salah" })).toBe(before);
    });
  });

  describe("focus", () => {
    it("makes the window active and focused", () => {
      const state = apply(createState(), OPEN_SALAH, OPEN_TERMINAL, {
        type: "focus",
        id: "salah",
      });

      expect(state.activeWindowId).toBe("salah");
      expect(state.windows.salah.isFocused).toBe(true);
    });

    it("clears focus from the previously focused window", () => {
      const state = apply(createState(), OPEN_SALAH, OPEN_TERMINAL, {
        type: "focus",
        id: "salah",
      });

      expect(state.windows.terminal.isFocused).toBe(false);
      expect(focusedWindows(state)).toEqual(["salah"]);
    });

    it("raises the window to the front", () => {
      const state = apply(createState(), OPEN_SALAH, OPEN_TERMINAL, {
        type: "focus",
        id: "salah",
      });

      expect(state.windows.salah.zIndex).toBeGreaterThan(
        state.windows.terminal.zIndex,
      );
    });

    it("does not change whether the window is open or maximized", () => {
      const before = apply(createState(), OPEN_SALAH, {
        type: "toggle-maximize",
        id: "salah",
      });
      const after = apply(before, { type: "focus", id: "salah" });

      expect(after.windows.salah.isMaximized).toBe(true);
      expect(after.windows.salah.isMinimized).toBe(false);
    });

    it("is a no-op when the window is already focused and active", () => {
      const before = apply(createState(), OPEN_SALAH);

      expect(apply(before, { type: "focus", id: "salah" })).toBe(before);
    });

    it("ignores a window that is not visible", () => {
      const before = createState();

      expect(apply(before, { type: "focus", id: "salah" })).toBe(before);
    });
  });

  describe("move", () => {
    it("stores the requested position", () => {
      const state = apply(createState(), OPEN_SALAH, {
        type: "move",
        id: "salah",
        position: { x: 400, y: 250 },
      });

      expect(state.windows.salah.position).toEqual({ x: 400, y: 250 });
    });

    it("accepts the origin", () => {
      const state = apply(createState(), OPEN_SALAH, {
        type: "move",
        id: "salah",
        position: { x: 0, y: 0 },
      });

      expect(state.windows.salah.position).toEqual({ x: 0, y: 0 });
    });

    it("does not change focus, z-index or the active window", () => {
      const before = apply(createState(), OPEN_SALAH, OPEN_TERMINAL);
      const after = apply(before, {
        type: "move",
        id: "salah",
        position: { x: 10, y: 20 },
      });

      expect(after.activeWindowId).toBe(before.activeWindowId);
      expect(after.topZIndex).toBe(before.topZIndex);
      expect(after.windows.salah.zIndex).toBe(before.windows.salah.zIndex);
      expect(after.windows.salah.isFocused).toBe(before.windows.salah.isFocused);
    });

    it("can move a minimized window", () => {
      const state = apply(
        createState(),
        OPEN_SALAH,
        { type: "minimize", id: "salah" },
        { type: "move", id: "salah", position: { x: 12, y: 34 } },
      );

      expect(state.windows.salah.position).toEqual({ x: 12, y: 34 });
      expect(state.windows.salah.isMinimized).toBe(true);
    });

    it("ignores a move for a window that is not open", () => {
      const before = createState();

      expect(
        apply(before, {
          type: "move",
          id: "salah",
          position: { x: 1, y: 1 },
        }),
      ).toBe(before);
    });
  });

  describe("show-desktop", () => {
    it("minimizes every open window", () => {
      const state = apply(
        createState(),
        OPEN_SALAH,
        OPEN_TERMINAL,
        { type: "show-desktop" },
      );

      expect(state.windows.salah.isMinimized).toBe(true);
      expect(state.windows.terminal.isMinimized).toBe(true);
    });

    it("keeps those windows open so they can be restored", () => {
      const state = apply(createState(), OPEN_SALAH, {
        type: "show-desktop",
      });

      expect(state.windows.salah.isOpen).toBe(true);
    });

    it("clears the active window and all focus", () => {
      const state = apply(createState(), OPEN_SALAH, { type: "show-desktop" });

      expect(state.activeWindowId).toBeNull();
      expect(focusedWindows(state)).toEqual([]);
    });

    it("leaves windows that were never open alone", () => {
      const before = createState();
      const after = apply(before, { type: "show-desktop" });

      expect(after.windows.projects).toBe(before.windows.projects);
    });

    it("does not change the z-index counter", () => {
      const before = apply(createState(), OPEN_SALAH);
      const after = apply(before, { type: "show-desktop" });

      expect(after.topZIndex).toBe(before.topZIndex);
    });

    it("is a no-op when nothing is open", () => {
      const before = createState();
      const after = apply(before, { type: "show-desktop" });

      expect(after.activeWindowId).toBeNull();
      expect(focusedWindows(after)).toEqual([]);
    });
  });

  describe("invariants across a long random-ish sequence", () => {
    it("never reports a focused window that is not the active window", () => {
      const sequence: WindowManagerAction[] = [
        OPEN_SALAH,
        { type: "move", id: "salah", position: { x: 5, y: 5 } },
        OPEN_TERMINAL,
        { type: "toggle-maximize", id: "salah" },
        { type: "focus", id: "salah" },
        { type: "minimize", id: "salah" },
        { type: "show-desktop" },
        { type: "close", id: "terminal" },
        { type: "open", id: "projects" },
        { type: "toggle-maximize", id: "projects" },
      ];

      const final = apply(createState(), ...sequence);

      if (final.activeWindowId === null) {
        expect(focusedWindows(final)).toEqual([]);
      } else {
        expect(focusedWindows(final)).toEqual([final.activeWindowId]);
      }
    });

    it("never lets the top z-index counter go backwards", () => {
      const sequence: WindowManagerAction[] = [
        OPEN_SALAH,
        OPEN_TERMINAL,
        { type: "focus", id: "salah" },
        { type: "close", id: "salah" },
        { type: "open", id: "salah" },
      ];

      let state = createState();
      let previous = state.topZIndex;

      for (const action of sequence) {
        state = apply(state, action);

        expect(state.topZIndex).toBeGreaterThanOrEqual(previous);
        previous = state.topZIndex;
      }
    });

    it("keeps every window in the map for every action", () => {
      const ids = Object.keys(initialWindows).sort();

      const actions: WindowManagerAction[] = [
        OPEN_SALAH,
        { type: "close", id: "salah" },
        { type: "minimize", id: "salah" },
        { type: "toggle-maximize", id: "salah" },
        { type: "focus", id: "salah" },
        { type: "move", id: "salah", position: { x: 0, y: 0 } },
        { type: "show-desktop" },
      ];

      for (const action of actions) {
        const state = apply(createState(), action);

        expect(Object.keys(state.windows).sort()).toEqual(ids);
      }
    });

    it("leaves the declared title, variant and starting position of each window intact", () => {
      const state = apply(
        createState(),
        OPEN_SALAH,
        { type: "move", id: "salah", position: { x: 999, y: 999 } },
      );

      const titles = (Object.keys(state.windows) as WindowId[]).map(
        (id) => state.windows[id].title,
      );

      expect(titles).toContain("Salah.exe");
      expect(titles).toContain("Terminal.exe");
      expect((state.windows.contact as WindowState).title).toBe("Contact.exe");
    });
  });
});
