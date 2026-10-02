<script>
	import { locale, locales } from "$lib/stores/locale.js";
</script>

<div
	class="relative grid grid-cols-2 rounded-full border border-base-300 bg-base-200 p-1 text-xs font-bold"
	role="group"
	aria-label="Language"
>
	<span
		class="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-primary transition-transform duration-300 ease-out {$locale === 'en' ? 'translate-x-full' : 'translate-x-0'}"
	></span>
	{#each locales as l}
		<button
			class="relative z-10 rounded-full px-3 py-1 transition-colors duration-300 {$locale === l.code
				? 'text-primary-content'
				: 'text-base-content/60 hover:text-base-content'}"
			aria-pressed={$locale === l.code}
			onclick={() => locale.set(l.code)}
		>
			{l.code.toUpperCase()}
		</button>
	{/each}
</div>