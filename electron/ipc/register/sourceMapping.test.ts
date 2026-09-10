import { describe, expect, it } from "vitest";

import { getScreenSourceIdForDisplay, LINUX_PORTAL_SCREEN_SOURCE_ID } from "./sourceMapping";

describe("getScreenSourceIdForDisplay", () => {
	it("keeps the live Electron screen source when one is available on X11", () => {
		expect(
			getScreenSourceIdForDisplay({
				displayId: "42",
				env: { XDG_SESSION_TYPE: "x11", DISPLAY: ":0" },
				matchedSourceId: "screen:42:0",
				platform: "linux",
			}),
		).toBe("screen:42:0");
	});

	it("routes matched Linux Wayland screens through the portal sentinel", () => {
		// desktopCapturer enumerates screens under Wayland, but those ids cannot
		// be captured via chromeMediaSourceId. Preferring the match here made
		// recording fail with NotReadableError on every Wayland session.
		expect(
			getScreenSourceIdForDisplay({
				displayId: "42",
				env: { XDG_SESSION_TYPE: "wayland", WAYLAND_DISPLAY: "wayland-0" },
				matchedSourceId: "screen:42:0",
				platform: "linux",
			}),
		).toBe(LINUX_PORTAL_SCREEN_SOURCE_ID);
	});

	it("routes matched Wayland screens through the portal when only WAYLAND_DISPLAY is set", () => {
		expect(
			getScreenSourceIdForDisplay({
				displayId: "42",
				env: { WAYLAND_DISPLAY: "wayland-0" },
				matchedSourceId: "screen:42:0",
				platform: "linux",
			}),
		).toBe(LINUX_PORTAL_SCREEN_SOURCE_ID);
	});

	it("keeps matched screens on other platforms untouched", () => {
		expect(
			getScreenSourceIdForDisplay({
				displayId: "42",
				env: {},
				matchedSourceId: "screen:42:0",
				platform: "darwin",
			}),
		).toBe("screen:42:0");
	});

	it("routes unmatched Linux Wayland screens through the portal sentinel", () => {
		expect(
			getScreenSourceIdForDisplay({
				displayId: "42",
				env: { XDG_SESSION_TYPE: "wayland", WAYLAND_DISPLAY: "wayland-0" },
				matchedSourceId: null,
				platform: "linux",
			}),
		).toBe(LINUX_PORTAL_SCREEN_SOURCE_ID);
	});

	it("keeps unmatched Linux X11 screens on the explicit fallback id", () => {
		expect(
			getScreenSourceIdForDisplay({
				displayId: "42",
				env: { XDG_SESSION_TYPE: "x11", DISPLAY: ":0" },
				matchedSourceId: null,
				platform: "linux",
			}),
		).toBe("screen:fallback:42");
	});

	it("keeps non-Linux unmatched screens on the explicit fallback id", () => {
		expect(
			getScreenSourceIdForDisplay({
				displayId: "42",
				matchedSourceId: undefined,
				platform: "win32",
			}),
		).toBe("screen:fallback:42");
	});
});
