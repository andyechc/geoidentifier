<script>
	import FactIcon from "./FactIcon.svelte";

	// Language badge with hover popup: script sample + learning tip.
	let { language, sample = "", tip = "", label = "" } = $props();
</script>

<span class="group relative inline-flex" tabindex="0">
	<span class="badge badge-lg gap-2 badge-primary cursor-help">
		<FactIcon name="languages" />{language}
	</span>
	<span
		class="invisible absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-xl border border-base-300 bg-base-200 p-4 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
	>
		<span class="block text-2xl font-black" dir="auto">{sample || language}</span>
		{#if label}
			<span class="mt-0.5 block text-xs text-base-content/50">{label}</span>
		{/if}
		<span class="mt-2 block text-sm leading-relaxed text-base-content/80">{tip}</span>
		<span
			class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-base-200"
		></span>
	</span>
</span>
