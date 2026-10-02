import { feature } from "topojson-client";

let cache50 = null;
let cache110 = null;

async function load(url) {
	const res = await fetch(url);
	const topo = await res.json();
	return feature(topo, topo.objects.countries).features;
}

export async function getCountries50() {
	if (!cache50) cache50 = await load("/json/topojson/countries-50m.json");
	return cache50;
}

export async function getCountries110() {
	if (!cache110) cache110 = await load("/json/topojson/countries-110m.json");
	return cache110;
}

// Natural Earth name -> our slug (Réunion has no NE feature)
export const TOPO_TO_SLUG = {
	// Africa
	Botswana: "botswana",
	Egypt: "egypt",
	eSwatini: "eswatini",
	Ghana: "ghana",
	Kenya: "kenya",
	Lesotho: "lesotho",
	Madagascar: "madagascar",
	Mali: "mali",
	Namibia: "namibia",
	Nigeria: "nigeria",
	Rwanda: "rwanda",
	"São Tomé and Principe": "sao-tome-and-principe",
	Senegal: "senegal",
	"South Africa": "south-africa",
	Tanzania: "tanzania",
	Tunisia: "tunisia",
	Uganda: "uganda",
	// South America
	Argentina: "argentina",
	Bolivia: "bolivia",
	Brazil: "brazil",
	Chile: "chile",
	Colombia: "colombia",
	Curaçao: "curacao",
	Ecuador: "ecuador",
	"Falkland Is.": "falkland-islands",
	Peru: "peru",
	"S. Geo. and the Is.": "south-georgia-sandwich-islands",
	Uruguay: "uruguay"
};

export const SLUG_TO_TOPO = Object.fromEntries(
	Object.entries(TOPO_TO_SLUG).map(([k, v]) => [v, k])
);

// Réunion: no polygon in Natural Earth — island marker instead
export const REUNION_LONLAT = [55.5364, -21.1151];
