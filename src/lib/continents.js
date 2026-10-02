// Natural Earth 50m country names grouped by continent.
// Used to render continent silhouettes from the existing countries-50m.json.

const AFRICA = [
	"Algeria", "Angola", "Benin", "Botswana", "Br. Indian Ocean Ter.", "Burkina Faso",
	"Burundi", "Cabo Verde", "Cameroon", "Central African Rep.", "Chad", "Comoros",
	"Congo", "Côte d'Ivoire", "Dem. Rep. Congo", "Djibouti", "Egypt", "Eq. Guinea",
	"Eritrea", "eSwatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea",
	"Guinea-Bissau", "Indian Ocean Ter.", "Kenya", "Lesotho", "Liberia", "Libya",
	"Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco",
	"Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "São Tomé and Principe",
	"Senegal", "Seychelles", "Sierra Leone", "Somalia", "Somaliland", "South Africa",
	"S. Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "W. Sahara",
	"Zambia", "Zimbabwe"
];

const EUROPE = [
	"Åland", "Albania", "Andorra", "Austria", "Belarus", "Belgium",
	"Bosnia and Herz.", "Bulgaria", "Croatia", "Czechia", "Denmark", "Estonia",
	"Faeroe Is.", "Finland", "France", "Germany", "Greece", "Guernsey", "Hungary",
	"Iceland", "Ireland", "Isle of Man", "Italy", "Jersey", "Kosovo", "Latvia",
	"Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Moldova", "Monaco",
	"Montenegro", "Netherlands", "Norway", "Poland", "Portugal", "Romania",
	"Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden",
	"Switzerland", "Ukraine", "United Kingdom", "Vatican"
];

const ASIA = [
	"Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan",
	"Brunei", "Cambodia", "China", "Cyprus", "Georgia", "Hong Kong", "India",
	"Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan",
	"Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Macao", "Malaysia", "Maldives",
	"Mongolia", "Myanmar", "N. Cyprus", "North Korea", "Oman", "Pakistan",
	"Palestine", "Philippines", "Qatar", "Saudi Arabia", "Siachen Glacier",
	"Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan",
	"Thailand", "Timor-Leste", "Turkey", "Turkmenistan", "United Arab Emirates",
	"Uzbekistan", "Vietnam", "Yemen"
];

const AMERICAS = [
	"Anguilla", "Antigua and Barb.", "Argentina", "Aruba", "Bahamas", "Barbados",
	"Belize", "Bermuda", "Bolivia", "Brazil", "British Virgin Is.", "Canada",
	"Cayman Is.", "Chile", "Colombia", "Costa Rica", "Cuba", "Curaçao",
	"Dominica", "Dominican Rep.", "Ecuador", "El Salvador", "Falkland Is.",
	"Greenland", "Grenada", "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica",
	"Mexico", "Montserrat", "Nicaragua", "Panama", "Paraguay", "Peru",
	"Puerto Rico", "St-Barthélemy", "St. Kitts and Nevis", "St. Pierre and Miquelon",
	"St. Vin. and Gren.", "St-Martin", "Suriname", "Trinidad and Tobago",
	"United States of America", "Uruguay", "U.S. Virgin Is.", "Venezuela"
];


// South America (plonkit coverage lives here, plus the Dutch Caribbean island
// and the South Atlantic territories that ship with it).
const SOUTH_AMERICA = [
	"Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Curaçao", "Ecuador",
	"Falkland Is.", "Guyana", "Paraguay", "Peru", "S. Geo. and the Is.",
	"Suriname", "Uruguay", "Venezuela"
];

// Countries that exist in the data but would wreck the silhouette's bounding
// box or read as stray dots — excluded from the *drawing* only. They stay
// clickable in the globe and highlightable via their own shape.
export const SILHOUETTE_EXCLUDE = {
	africa: [
		"Seychelles", "Mauritius", "Comoros", "Cabo Verde", "São Tomé and Principe",
		"Br. Indian Ocean Ter.", "Indian Ocean Ter.", "Saint Helena"
	],
	// Russia would turn the "Europe" card into half of Eurasia
	europe: ["Russia", "Faeroe Is."],
	asia: [],
	americas: ["Falkland Is.", "S. Geo. and the Is.", "Curaçao"],
	"south-america": ["Falkland Is.", "S. Geo. and the Is.", "Curaçao"],
	oceania: [],
	antarctica: []
};

const OCEANIA = [
	"American Samoa", "Ashmore and Cartier Is.", "Australia", "Fiji",
	"Fr. Polynesia", "Guam", "Kiribati", "Marshall Is.", "Micronesia",
	"N. Mariana Is.", "Nauru", "New Caledonia", "New Zealand", "Niue",
	"Norfolk Island", "Palau", "Papua New Guinea", "Pitcairn Is.", "Samoa",
	"Solomon Is.", "Tonga", "Vanuatu", "Wallis and Futuna Is."
];

const ANTARCTICA = [
	"Antarctica", "Fr. S. Antarctic Lands", "Heard I. and McDonald Is.",
	"S. Geo. and the Is."
];

export const CONTINENT_MEMBERS = {
	africa: AFRICA,
	europe: EUROPE,
	asia: ASIA,
	americas: AMERICAS,
	"south-america": SOUTH_AMERICA,
	oceania: OCEANIA,
	antarctica: ANTARCTICA
};

export const NAME_TO_CONTINENT = Object.fromEntries(
	Object.entries(CONTINENT_MEMBERS).flatMap(([c, names]) => names.map((n) => [n, c]))
);

export const CONTINENTS = Object.keys(CONTINENT_MEMBERS);