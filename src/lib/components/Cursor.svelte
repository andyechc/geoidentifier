<script>
	import { onMount } from "svelte";

	let dot = $state(null);
	let x = $state(0);
	let y = $state(0);
	let tx = $state(0);
	let ty = $state(0);

	onMount(() => {
		if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
		let raf = 0;
		let initialized = false;

		const move = (e) => {
			tx = e.clientX;
			ty = e.clientY;
			if (!initialized) {
				initialized = true;
				x = tx;
				y = ty;
			}
		};
		const over = (e) => {
			document.body.classList.toggle(
				"cursor-hot",
				!!e.target.closest?.("a,button,input,select,textarea,[role=button],[tabindex]")
			);
		};
		const tick = () => {
			x += (tx - x) * 0.35;
			y += (ty - y) * 0.35;
			if (dot) dot.style.transform = `translate(${x - dot.offsetWidth / 2}px, ${y - dot.offsetHeight / 2}px)`;
			raf = requestAnimationFrame(tick);
		};
		window.addEventListener("mousemove", move, { passive: true });
		window.addEventListener("mouseover", over, { passive: true });
		raf = requestAnimationFrame(tick);
		return () => {
			window.removeEventListener("mousemove", move);
			window.removeEventListener("mouseover", over);
			cancelAnimationFrame(raf);
		};
	});
</script>

<div class="cursor-dot" bind:this={dot} style:opacity={1}></div>