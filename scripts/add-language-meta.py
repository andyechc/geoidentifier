# One-off: inject languageMeta {sample, tip:{en,es}} into africa/*.json
import json
import glob

DATA = {
    "botswana": ("Dumela", "Setswana greeting — if you see Dumela, you're likely in Botswana.",
                 "Saludo en setsuana: si ves Dumela, casi seguro es Botsuana."),
    "egypt": ("مصر", "Arabic script: flowing lines with dots above/below. Seen on signs in trekker zones.",
              "Escritura árabe: trazos fluidos con puntos. Aparece en señales de zonas trekker."),
    "eswatini": ("Sawubona", "siSwati greetings on signs; official signage is in English.",
                 "Saludos en suazi en carteles; la señalización oficial está en inglés."),
    "ghana": ("Trotro", "Signs are in English — rely on the taped car and plates instead.",
              "Las señales están en inglés: fíate del coche con cinta y las matrículas."),
    "kenya": ("Karibu", "Swahili 'karibu' (welcome) and 'matatu' minibuses point to Kenya.",
              "El suajili 'karibu' (bienvenido) y los minibuses 'matatu' apuntan a Kenia."),
    "lesotho": ("Lumela", "Sesotho greeting. Long Sesotho words with many vowels are a strong hint.",
                "Saludo en sesoto. Palabras largas con muchas vocales: pista fuerte."),
    "madagascar": ("Tongasoa", "Malagasy looks Austronesian with French flavor; French also on signs.",
                   "El malgache suena austronesio con toque francés; también hay francés en señales."),
    "mali": ("Bienvenue au Mali", "French signage plus Bambara words; mud-mosque towns confirm it.",
             "Francés en señales más palabras en bámbara; las mezquitas de adobe lo confirman."),
    "namibia": ("Windhoek", "English is official but German place names (Straße, -mund) are everywhere.",
                "El inglés es oficial pero hay topónimos alemanes (Straße, -mund) por todas partes."),
    "nigeria": ("Lagos", "English everywhere — plates with a green tinge decide it vs Ghana.",
                "Inglés en todas partes: las matrículas con tono verde lo distinguen de Ghana."),
    "reunion": ("Saint-Denis", "A French department: signs identical to France — check tropical vegetation.",
                "Departamento francés: señales idénticas a Francia, fíjate en la vegetación tropical."),
    "rwanda": ("Murakaza neza", "Kinyarwanda welcome signs; French appears on older signage.",
               "Bienvenida en kinyaruanda; el francés aparece en señalización antigua."),
    "sao-tome-and-principe": ("Bem-vindo", "European Portuguese signage in a tiny island setting.",
                               "Portugués europeo en un entorno de isla diminuta."),
    "senegal": ("Bienvenue à Dakar", "French signage with Wolof words mixed in.",
                "Francés en señales mezclado con palabras en wólof."),
    "south-africa": ("Ubuntu", "11 official languages: Afrikaans double vowels, Zulu/Xhosa c/x/q clicks in writing.",
                     "11 idiomas oficiales: vocales dobles del afrikáans, clics c/x/q del zulú/xhosa escritos."),
    "tanzania": ("Karibu Tanzania", "Swahili 'karibu' plus daladala buses.",
                 "Suajili 'karibu' más autobuses daladala."),
    "tunisia": ("تونس", "Arabic-French bilingual signs; French helps confirm Tunisia over the Middle East.",
                "Señales bilingües árabe-francés; el francés confirma Túnez frente a Oriente Medio."),
    "uganda": ("Kampala", "English signs; white-front plates and left-side driving are stronger clues.",
               "Señales en inglés; las matrículas blancas delante y conducir por la izquierda son mejores pistas."),
}

for f in glob.glob("src/lib/data/africa/*.json"):
    d = json.load(open(f))
    sample, tip_en, tip_es = DATA[d["slug"]]
    d["languageMeta"] = {"sample": sample, "tip": {"en": tip_en, "es": tip_es}}
    json.dump(d, open(f, "w"), ensure_ascii=False, indent=2)
    print("ok", d["slug"])
