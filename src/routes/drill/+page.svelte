<script>
	import { visibleCountries, dataRev } from "$lib/data/live.js";

	const allCountries = $derived.by(() => {
		$dataRev;
		return visibleCountries();
	});


	import Drill from "$lib/components/Drill.svelte";
</script>

<Drill countries={allCountries} titleKey="drill.titleAll" />