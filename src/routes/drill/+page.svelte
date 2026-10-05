<script>
	import { visibleCountries, dataRev } from "$lib/data/live.js";

	const allCountries = $derived.by(() => {
		$dataRev;
		return visibleCountries();
	});


	import Drill from "$lib/components/Drill.svelte";
</script>

<svelte:head>
	<title>Practice · GeoIdentifier</title>
</svelte:head>

<Drill countries={allCountries} titleKey="drill.titleAll" />