<script>
	import { goto } from "$app/navigation";
	import { theme, toggleTheme } from "$lib/stores/theme.js";

	let dark = $derived($theme === "geo-dark");

	// Entrada secreta al admin: mantener pulsado 2s y arrastrar a la derecha.
	const HOLD_MS = 2000;
	const DRAG_DX = 60;
	const MOVE_CANCEL = 12;

	let armed = $state(false);
	let btn = $state(null);
	let timer = null;
	let tracking = false;
	let startX = 0;
	let startY = 0;
	let swallowClick = false;

	function cleanup() {
		tracking = false;
		armed = false;
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function onPointerDown(e) {
		if (!e.isPrimary) return;
		if (e.pointerType === "mouse" && e.button !== 0) return;
		tracking = true;
		startX = e.clientX;
		startY = e.clientY;
		timer = setTimeout(() => {
			armed = true;
		}, HOLD_MS);
		try {
			btn?.setPointerCapture(e.pointerId);
		} catch {
			/* ignore */
		}
	}

	function onPointerMove(e) {
		if (!tracking || !e.isPrimary) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		if (!armed) {
			// se movió antes de tiempo: era scroll/arrastre, no pulsación
			if (Math.hypot(dx, dy) > MOVE_CANCEL) cleanup();
			return;
		}
		if (dx > DRAG_DX) {
			const id = e.pointerId;
			cleanup();
			swallowClick = true;
			try {
				btn?.releasePointerCapture(id);
			} catch {
				/* ignore */
			}
			goto("/auth/admin");
		}
	}

	function onPointerUp() {
		if (!tracking) return;
		const wasArmed = armed;
		cleanup();
		// pulsación larga sin arrastre: no cambiar el tema por accidente
		if (wasArmed) swallowClick = true;
	}

	function onClick(e) {
		if (swallowClick) {
			swallowClick = false;
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		toggleTheme();
	}
</script>

<button
	bind:this={btn}
	class="btn btn-ghost btn-sm btn-circle relative touch-none overflow-hidden {armed
		? 'admin-armed'
		: ''}"
	onclick={onClick}
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointercancel={cleanup}
	oncontextmenu={(e) => e.preventDefault()}
	aria-label="Toggle light / dark theme"
	title="Toggle light / dark theme"
>
	<!-- sun -->
	<svg
		class="absolute h-5 w-5 transition-all duration-500 {dark
			? 'rotate-90 scale-0 opacity-0'
			: 'rotate-0 scale-100 opacity-100'}"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
	>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
	</svg>
	<!-- moon -->
	<svg
		class="absolute h-5 w-5 transition-all duration-500 {dark
			? 'rotate-0 scale-100 opacity-100'
			: '-rotate-90 scale-0 opacity-0'}"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
	</svg>
</button>

<style>
	.admin-armed {
		box-shadow:
			0 0 0 2px var(--color-primary),
			0 0 18px 2px var(--color-primary);
		animation: admin-pulse 1.1s ease-in-out infinite;
	}
	@keyframes admin-pulse {
		50% {
			box-shadow:
				0 0 0 2px var(--color-primary),
				0 0 28px 6px var(--color-primary);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.admin-armed {
			animation: none;
		}
	}
</style>
