<script>
	import { page } from "$app/stores";
	import { _ } from "svelte-i18n";
	import { locale } from "$lib/stores/locale.js";
	import {
		liveCountriesOf as countriesOf,
		visibleContinents,
		dataRev,
		continentLabel
	} from "$lib/data/live.js";
	import { base } from "$app/paths";
	import Drill from "$lib/components/Drill.svelte";

	const continent = $derived($page.params.continent);
	const countries = $derived.by(() => {
		$dataRev;
		return countriesOf(continent);
	});
	const cmeta = $derived(visibleContinents().find((x) => x.id === continent));
	const titleKey = $derived(continent === "south-america" ? "drill.titleSA" : "drill.title");
	const backLabel = $derived(
		cmeta ? continentLabel(cmeta.id, $locale) : ""
	);
</script>

<Drill {countries} {titleKey} backHref="{base}/{continent}" {backLabel} />
