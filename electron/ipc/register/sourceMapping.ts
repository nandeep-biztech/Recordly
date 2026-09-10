export const LINUX_PORTAL_SCREEN_SOURCE_ID = "screen:linux-portal";

export function isLikelyLinuxWaylandSession(env: NodeJS.ProcessEnv) {
	const sessionType = env.XDG_SESSION_TYPE?.trim().toLowerCase();
	if (sessionType === "wayland") {
		return true;
	}
	if (sessionType === "x11") {
		return false;
	}

	return Boolean(env.WAYLAND_DISPLAY);
}

export function getScreenSourceIdForDisplay({
	displayId,
	env = process.env,
	matchedSourceId,
	platform,
}: {
	displayId: string;
	env?: NodeJS.ProcessEnv;
	matchedSourceId?: string | null;
	platform: NodeJS.Platform | string;
}) {
	// Wayland is checked before matchedSourceId on purpose. desktopCapturer
	// still enumerates screens under Wayland, but the ids it returns cannot be
	// captured: passing one to getUserMedia as chromeMediaSourceId fails with
	// NotReadableError ("Could not start video source"). Preferring the matched
	// id here meant any Wayland session that enumerated successfully took the
	// broken path and could never record. Only an unmatched screen reached the
	// portal, which is backwards — the portal is the sole route that works.
	if (platform === "linux" && isLikelyLinuxWaylandSession(env)) {
		return LINUX_PORTAL_SCREEN_SOURCE_ID;
	}

	if (matchedSourceId) {
		return matchedSourceId;
	}

	return `screen:fallback:${displayId}`;
}
