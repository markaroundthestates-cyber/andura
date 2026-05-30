# Andura — Exercise image GRIDS (one 4-up image per prompt)

> Generat din `src/engine/exerciseLibrary.js` (`EXERCISE_METADATA`, 657 exercitii).
> **STEP 1** — cele 657 exercitii au fost colapsate la **302 imagini vizual-distincte** (variantele invizibile pentru un user — latimea prizei, tempo, pauza, ROM partial, marca aparatului, "din pini" cand pozitia e identica — partajeaza ACEEASI imagine). Echipament diferit / unghi diferit (plat/inclinat/negativ) / setup vizibil diferit / unilateral vs bilateral / in picioare-sezand-culcat = imagini SEPARATE.
> **STEP 2** — cele 302 imagini sunt grupate in **76 grids** de cate 4 (ultimul are 2). Fiecare grid = UN singur prompt -> UNA singura imagine (un grid 2x2 cu 4 exercitii).

## Workflow generator

1. Copiezi promptul unui grid in generator.
2. Generatorul scoate **o singura imagine** = un grid 2x2 cu 4 exercitii (fiecare celula are 2 panouri: jos/intins | sus/contractat).
3. Zici "next" -> treci la urmatorul grid.
4. Managerul (CC) taie automat fiecare imagine-grid in 4 fisiere, denumite dupa slug-urile din `EXERCISE-IMAGE-MAPPING.json` -> ordinea celulelor e **TL, TR, BL, BR** (vezi linia de sub fiecare `### Grid N`).
5. Bifezi `- [ ]` -> `- [x]` pe masura ce generezi fiecare grid.

**Cod culori:** RED = muschi primar, ORANGE = muschi secundar, restul gri-neutru.
**Varianta feminina:** schimba `male` -> `female` in prima propozitie a promptului.

---

### Grid 1

**Top-left** `press-db-incline` — Impins inclinat cu gantere / Impins inclinat jos cu gantere (+2 variante)  
**Top-right** `press-db-flat` — Impins plat cu gantere / Impins din piept priza neutra gantere (+3 variante)  
**Bottom-left** `bench-barbell-flat` — Impins din piept plat cu bara / Bench Press priza larga (+3 variante)  
**Bottom-right** `fly-pec-deck` — Fluturari Pec Deck sau cablu / Pec Deck cu discuri

- [ ] generat

```text
ONE image, a 2x2 grid = 4 DIFFERENT chest exercises. Dark charcoal background, soft studio light. The SAME matte clay-grey muscular male mannequin (smooth blank face, no hair) in every cell. Each cell is a 2-panel diptych: left panel = stretched/bottom position, right panel = contracted/top position; thin divider line between the two panels and between the cells. Muscle shading: RED = primary muscle, ORANGE = secondary, everything else plain grey. NO text, names, numbers, captions or labels anywhere.
Top-left — Incline dumbbell press, SIDE VIEW, body reclined ~45 degrees lying back on an incline bench: dumbbells at upper chest vs pressed straight up. RED chest, ORANGE front shoulders and triceps.
Top-right — Flat dumbbell press, SIDE VIEW, body lying flat and fully horizontal on a bench: dumbbells at mid-chest vs pressed straight up. RED chest, ORANGE triceps.
Bottom-left — Flat barbell bench press, SIDE VIEW, body lying flat and fully horizontal on a bench inside a power rack with tall upright posts: barbell at mid-chest vs pressed up to lockout. RED chest, ORANGE front shoulders and triceps.
Bottom-right — Pec-deck machine fly, FRONT VIEW, seated upright on the machine: arms wide open on the pads vs squeezed together in front. RED chest.
```

### Grid 2

**Top-left** `fly-cable-mid` — Fluturari la cablu / Fluturari la cablu la mijloc (+4 variante)  
**Top-right** `bench-barbell-incline` — Impins din piept inclinat cu bara  
**Bottom-left** `bench-barbell-decline` — Impins inclinat negativ cu bara  
**Bottom-right** `bench-board` — Impins cu placa la piept

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable fly: arms wide at chest height vs squeezed together in front. Dual cables, standing. RED chest, ORANGE triceps.
Top-right: Incline barbell bench: bar to upper chest vs pressed up. A barbell, incline bench in a rack. RED chest, ORANGE shoulders, triceps.
Bottom-left: Decline barbell bench: bar to lower chest, head-down vs pressed up. A barbell, decline bench in a rack. RED chest, ORANGE triceps.
Bottom-right: Barbell board press: bar lowered to wooden boards on the chest vs pressed up. A barbell, flat bench, boards on chest. RED chest, ORANGE triceps.
```

### Grid 3

**Top-left** `floor-press-barbell` — Impins de la sol cu bara  
**Top-right** `press-db-decline` — Impins inclinat negativ cu gantere  
**Bottom-left** `press-db-single` — Impins din piept un brat gantera  
**Bottom-right** `floor-press-db` — Impins de la sol cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell floor press: lying on floor, bar down until elbows touch vs pressed up. A barbell on the floor in a rack. RED chest, ORANGE triceps.
Top-right: Decline DB press: dumbbells at lower chest, head-down vs pressed up. A pair of dumbbells, decline bench. RED chest, ORANGE triceps.
Bottom-left: Single-arm DB press: one dumbbell at chest vs pressed up. One dumbbell, flat bench. RED chest, ORANGE triceps.
Bottom-right: DB floor press: lying on floor, dumbbells down until elbows touch vs pressed up. A pair of dumbbells, on the floor. RED chest, ORANGE triceps.
```

### Grid 4

**Top-left** `bench-smith-flat` — Impins din piept la Smith / Impins din piept la Smith cu pauza (+2 variante)  
**Top-right** `bench-smith-incline` — Impins inclinat la Smith  
**Bottom-left** `bench-smith-decline` — Impins inclinat negativ la Smith  
**Bottom-right** `press-machine-flat` — Impins din piept plat la aparat / Impins la aparat priza ciocan (+8 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Smith flat bench: bar to mid-chest vs pressed up. Smith machine, flat bench. RED chest, ORANGE shoulders, triceps.
Top-right: Smith incline bench: bar to upper chest vs pressed up. Smith machine, incline bench. RED chest, ORANGE shoulders, triceps.
Bottom-left: Smith decline bench: bar to lower chest, head-down vs pressed up. Smith machine, decline bench. RED chest, ORANGE triceps.
Bottom-right: Chest press machine: handles at chest vs pressed forward. Chest-press machine, seated, weight stack. RED chest, ORANGE triceps, shoulders.
```

### Grid 5

**Top-left** `press-machine-incline` — Impins din piept inclinat la aparat / Impins inclinat priza ciocan (+1 variante)  
**Top-right** `press-machine-decline` — Impins din piept inclinat negativ / Impins inclinat negativ priza ciocan (+1 variante)  
**Bottom-left** `press-cable-flat` — Impins din piept la cablu  
**Bottom-right** `press-cable-incline` — Impins inclinat la cablu

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Incline chest press machine: handles at upper chest vs pressed forward. Incline chest-press machine, seated. RED chest, ORANGE shoulders, triceps.
Top-right: Decline chest press machine: handles low vs pressed forward-down. Decline chest-press machine, seated. RED chest, ORANGE triceps.
Bottom-left: Cable chest press: handles at chest vs pressed forward together. Dual cables, standing or bench. RED chest, ORANGE triceps.
Bottom-right: Incline cable press: handles at upper chest vs pressed up-forward. Dual cables, incline bench. RED chest, ORANGE shoulders, triceps.
```

### Grid 6

**Top-left** `fly-cable-high` — Fluturari la cablu de sus in jos  
**Top-right** `fly-cable-low` — Fluturari la cablu de jos in sus  
**Bottom-left** `fly-cable-incline` — Fluturari la cablu inclinat  
**Bottom-right** `fly-cable-decline` — Fluturari la cablu inclinat negativ

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable crossover high-to-low: arms wide up high vs swept down and together at the hips. Dual high cables, standing. RED chest.
Top-right: Cable fly low-to-high: arms wide down low vs swept up and together at the face. Dual low cables, standing. RED chest.
Bottom-left: Incline cable fly: arms wide vs squeezed together, reclined. Dual cables, incline bench. RED chest, ORANGE shoulders.
Bottom-right: Decline cable fly: arms wide vs squeezed, head-down decline bench. Dual cables, decline bench. RED chest.
```

### Grid 7

**Top-left** `fly-pec-deck-cable` — Pec Deck la cablu  
**Top-right** `fly-db-flat` — Fluturari cu gantere / Fluturari un brat cu gantera  
**Bottom-left** `fly-db-incline` — Fluturari inclinat cu gantere  
**Bottom-right** `fly-db-decline` — Fluturari inclinat negativ gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable pec-deck fly: arms wide vs squeezed together in front. Cable pec-deck station, seated. RED chest.
Top-right: Flat DB fly: dumbbells wide arms open vs arced together above the chest. A pair of dumbbells, flat bench. RED chest.
Bottom-left: Incline DB fly: dumbbells wide vs arced together above the chest, reclined. A pair of dumbbells, incline bench. RED chest, ORANGE shoulders.
Bottom-right: Decline DB fly: dumbbells wide vs arced together, head-down decline bench. A pair of dumbbells. RED chest.
```

### Grid 8

**Top-left** `fly-db-floor` — Fluturari la sol cu gantere  
**Top-right** `pullover-db` — Pullover cu gantera  
**Bottom-left** `dip-chest` — Flotari la paralele / Flotari la paralele fara greutate (+1 variante)  
**Bottom-right** `dip-assisted` — Flotari la paralele asistate aparat / Flotari la paralele asistate cu banda

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Floor DB fly: lying on floor, dumbbells wide vs arced together. A pair of dumbbells, on the floor. RED chest.
Top-right: DB pullover: one dumbbell overhead behind head vs pulled over chest. One dumbbell, lying across a flat bench. RED chest, ORANGE back.
Bottom-left: Chest dip: torso leaning forward lowered between parallel bars vs pressed up. Parallel dip bars. RED chest, ORANGE triceps.
Bottom-right: Assisted dip: knees on a pad, body lowered between bars vs pressed up. Assisted-dip machine. RED chest, ORANGE triceps.
```

### Grid 9

**Top-left** `pushup-standard` — Flotari / Flotari lente  
**Top-right** `pushup-knee` — Flotari pe genunchi  
**Bottom-left** `pushup-wall` — Flotari la perete / Flotari la perete inclinat  
**Bottom-right** `pushup-wide` — Flotari priza larga / Flotari larg pe genunchi

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Standard push-up: body straight chest lowered to floor vs pressed up. Bodyweight, on the floor. RED chest, ORANGE triceps, shoulders.
Top-right: Knee push-up: knees on floor, chest lowered vs pressed up. Bodyweight, floor. RED chest, ORANGE triceps.
Bottom-left: Wall push-up: standing, hands on wall, body in vs pressed away. Bodyweight, hands on a wall. RED chest, ORANGE triceps.
Bottom-right: Wide push-up: hands set wide, chest lowered vs pressed up. Bodyweight, on the floor. RED chest, ORANGE shoulders.
```

### Grid 10

**Top-left** `pushup-decline` — Flotari inclinate negativ / Flotari pe genunchi inclinat negativ  
**Top-right** `pushup-incline` — Flotari inclinate  
**Bottom-left** `pushup-plyo` — Flotari pliometrice / Flotari cu bataie palme  
**Bottom-right** `pushup-archer` — Flotari archer

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Decline push-up: feet elevated on a bench, chest lowered vs pressed up. Bodyweight, feet on a bench. RED chest, ORANGE shoulders, triceps.
Top-right: Incline push-up: hands elevated on a bench, chest lowered vs pressed up. Bodyweight, hands on a bench. RED chest, ORANGE triceps.
Bottom-left: Plyometric push-up: chest at floor vs pushed explosively off with a clap. Bodyweight, floor. RED chest, ORANGE triceps, shoulders.
Bottom-right: Archer push-up: weight shifted to one bent arm, other arm straight vs both extended. Bodyweight, floor. RED chest, ORANGE triceps.
```

### Grid 11

**Top-left** `pushup-onearm` — Flotari un brat asistate / Flotari pe genunchi un brat  
**Top-right** `bench-barbell-pin` — Impins din pini la piept  
**Bottom-left** `bench-smith-pin` — Impins din pini la Smith  
**Bottom-right** `floor-press-smith` — Impins de la sol la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: One-arm push-up: one hand on floor, body lowered vs pressed up. Bodyweight, floor. RED chest, ORANGE triceps.
Top-right: Barbell pin press: bar resting on rack pins at chest vs pressed up. A barbell, flat bench in a power rack, pins set low. RED chest, ORANGE triceps.
Bottom-left: Smith pin press: bar starts on the safety pins at chest vs pressed up. Smith machine, flat bench. RED chest, ORANGE triceps.
Bottom-right: Smith floor press: lying on floor, bar lowered until elbows touch vs pressed up. Smith machine, lying on the floor. RED chest, ORANGE triceps.
```

### Grid 12

**Top-left** `pullover-cable` — Pullover la cablu  
**Top-right** `pullover-barbell` — Pullover cu bara EZ  
**Bottom-left** `lat-pulldown` — Lat Pulldown / Lat Pulldown priza larga (+5 variante)  
**Bottom-right** `row-cable` — Ramat la cablu / Ramat la cablu lent (+7 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable pullover: arms overhead vs pulled down over the chest. High cable, straight-arm bar, standing. RED chest, ORANGE back.
Top-right: EZ-bar pullover: bar overhead behind head vs pulled over chest. An EZ-bar, lying on a flat bench. RED chest, ORANGE back.
Bottom-left: Lat pulldown: bar overhead arms extended vs pulled to the upper chest. Cable lat-pulldown station, seated, thigh pad. RED back / lats, ORANGE biceps.
Bottom-right: Seated cable row: torso upright, handle forward arms extended vs pulled to the abdomen. A seated cable-row station, foot platform. RED back / lats, ORANGE biceps.
```

### Grid 13

**Top-left** `row-chest-supported` — Ramat cu piept sprijinit / Ramat cu piept sprijinit la aparat (+1 variante)  
**Top-right** `pullup` — Tractiuni / Tractiuni priza larga (+9 variante)  
**Bottom-left** `pullup-assisted` — Tractiuni asistate cu banda / Tractiuni supinate asistate cu banda (+1 variante)  
**Bottom-right** `chinup` — Tractiuni priza supinata / Tractiuni priza supinata cu greutate (+9 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Chest-supported row: chest on a pad, handles forward vs rowed back. Chest-supported row machine, seated. RED back / lats, ORANGE biceps.
Top-right: Pull-up: overhand grip, dead hang vs chin over the bar. A pull-up bar. RED back / lats, ORANGE biceps.
Bottom-left: Band-assisted pull-up: overhand grip with a band under the feet, body up vs down. A pull-up bar with band. RED back / lats, ORANGE biceps.
Bottom-right: Chin-up: underhand shoulder-width grip, dead hang vs chin over the bar. A pull-up bar. RED back / lats, ORANGE biceps, forearms.
```

### Grid 14

**Top-left** `chinup-lsit` — Tractiuni supinate in L-sit  
**Top-right** `pulldown-single` — Lat Pulldown cu un brat / Lat Pulldown un brat supinat  
**Bottom-left** `pulldown-machine` — Lat Pulldown la aparat Hammer  
**Bottom-right** `straight-arm-pulldown` — Lat Pulldown cu brate intinse

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: L-sit chin-up: legs held straight out in an L, body hanging vs pulled up. A pull-up bar. RED back / lats, ORANGE biceps.
Top-right: Single-arm lat pulldown: one handle overhead vs pulled down to the side. Cable high pulley, seated. RED back / lats, ORANGE biceps.
Bottom-left: Machine lat pulldown: handles overhead vs pulled to the chest. Plate-loaded lat-pulldown machine, seated. RED back / lats, ORANGE biceps.
Bottom-right: Straight-arm pulldown: bar overhead arms straight vs swept down to the thighs. Cable machine, high pulley, standing. RED back / lats.
```

### Grid 15

**Top-left** `row-barbell` — Ramat cu bara / Ramat Yates cu bara (+2 variante)  
**Top-right** `row-tbar` — Ramat la T-bar / Ramat la T-bar la aparat  
**Bottom-left** `row-pendlay` — Ramat Pendlay cu bara  
**Bottom-right** `row-landmine` — Ramat Meadows landmine / Ramat la T-bar landmine

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Bent-over barbell row: torso hinged forward, bar hanging vs rowed to the lower chest. A barbell, standing bent over. RED back / lats, ORANGE biceps.
Top-right: T-bar row: chest over the bar, handles low vs rowed to the chest. A T-bar row platform, bent over, V-handle. RED back / lats, ORANGE biceps.
Bottom-left: Pendlay row: bar dead on the floor, torso horizontal vs rowed explosively to the chest. A barbell, bent fully over. RED back / lats, ORANGE biceps.
Bottom-right: Landmine row: one end of a barbell, handle at the floor vs rowed to the hip. One end of a barbell anchored in a landmine, bent over. RED back / lats, ORANGE biceps.
```

### Grid 16

**Top-left** `row-db` — Ramat cu gantera / Ramat cu gantera priza supinata (+3 variante)  
**Top-right** `row-chest-supported-db` — Ramat cu piept sprijinit gantere  
**Bottom-left** `row-cable-high` — Ramat la cablu de sus  
**Bottom-right** `row-machine` — Ramat la aparat Hammer / Ramat iso-lateral sus la aparat (+2 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Single-arm DB row: one knee and hand on a bench, dumbbell hanging vs rowed to the hip. One dumbbell, on a flat bench. RED back / lats, ORANGE biceps.
Top-right: Chest-supported DB row: chest on an incline bench, dumbbells hanging vs rowed up. A pair of dumbbells, incline bench face-down. RED back / lats, ORANGE biceps.
Bottom-left: High cable row: seated, high handle forward vs pulled down to the chest. Cable machine, high pulley, seated. RED back / lats, ORANGE biceps.
Bottom-right: Machine row: chest on a pad, handles forward vs rowed back. Iso-lateral plate-loaded row machine, seated. RED back / lats, ORANGE biceps.
```

### Grid 17

**Top-left** `row-smith` — Ramat la Smith / Ramat aplecat la Smith  
**Top-right** `pullover-machine` — Pullover la aparat  
**Bottom-left** `shrug-barbell` — Ridicari de umeri cu bara / Ridicari de umeri cu bara la spate  
**Bottom-right** `shrug-db` — Ridicari de umeri cu gantere / Ridicari de umeri cu disc

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Smith bent-over row: bar low under a torso bent forward vs rowed to the waist. Smith machine, standing bent over. RED back / lats, ORANGE biceps.
Top-right: Machine pullover: elbows overhead vs pulled forward. Pullover machine, seated. RED back / lats, ORANGE chest.
Bottom-left: Barbell shrug: bar at thighs, shoulders down vs shrugged up to the ears. A barbell, standing. RED back / lats.
Bottom-right: DB shrug: dumbbells at sides, shoulders down vs shrugged up to the ears. A pair of dumbbells, standing. RED back / lats.
```

### Grid 18

**Top-left** `shrug-trap-bar` — Ridicari de umeri cu trap bar  
**Top-right** `shrug-cable` — Ridicari de umeri la cablu  
**Bottom-left** `shrug-machine` — Ridicari de umeri la aparat / Ridicari de umeri la Smith  
**Bottom-right** `back-extension` — Extensii lombare la scaun roman / Extensii lombare la 45 grade (+7 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Trap-bar shrug: standing inside a hex bar, shoulders down vs shrugged up. A trap bar. RED back / lats.
Top-right: Cable shrug: low cable bar at thighs, shoulders down vs shrugged up. Low cable, straight bar, standing. RED back / lats.
Bottom-left: Machine shrug: handles down vs shrugged up. Shrug machine, weight stack. RED back / lats.
Bottom-right: 45-degree back extension: torso bent down over the pad vs raised to straight. A 45-degree hyperextension bench. RED back / lats, ORANGE hamstrings.
```

### Grid 19

**Top-left** `good-morning` — Good Morning cu bara / Good Morning la Smith (+3 variante)  
**Top-right** `good-morning-band` — Good Morning cu banda  
**Bottom-left** `good-morning-seated` — Good Morning sezand  
**Bottom-right** `rdl-single-leg` — Romanian Deadlift pe un picior / Romanian Deadlift un picior liber (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell good morning: bar on shoulders, torso hinged forward at the hips vs upright. A barbell, standing. RED back / lats, ORANGE hamstrings, glutes.
Top-right: Banded good morning: band over shoulders, torso hinged forward vs upright. A resistance band, standing. RED back / lats, ORANGE hamstrings, glutes.
Bottom-left: Seated good morning: bar on shoulders, torso hinged forward vs upright. A barbell, seated on a bench. RED back / lats, ORANGE hamstrings, glutes.
Bottom-right: Single-leg RDL: standing on one leg, torso hinged forward, back leg lifting vs upright. A dumbbell or bodyweight. RED back / lats, ORANGE hamstrings, glutes.
```

### Grid 20

**Top-left** `inverted-row` — Ramat orizontal la bara / Ramat orizontal priza larga (+8 variante)  
**Top-right** `superman` — Superman extensie spate la sol  
**Bottom-left** `prone-raise` — Ridicari in Y la pronatie / Ridicari in T la pronatie  
**Bottom-right** `scapular-pullup` — Tractiuni scapulare

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Inverted row: hanging under a fixed bar, arms straight vs chest pulled to the bar. A fixed bar at hip height, body horizontal. RED back / lats, ORANGE biceps.
Top-right: Superman: lying face-down, arms and legs flat vs lifted off the floor. Bodyweight, on the floor. RED back / lats.
Bottom-left: Prone Y/T raise: lying face-down, arms hanging vs raised into a Y or T. Bodyweight or light dumbbells, on the floor. RED back / lats, ORANGE shoulders.
Bottom-right: Scapular pull-up: dead hang shoulders up vs shoulder-blades pulled down, arms stay straight. A pull-up bar. RED back / lats.
```

### Grid 21

**Top-left** `rack-pull` — Indreptari partiale din rack  
**Top-right** `pullup-commando` — Tractiuni comando priza incrucisata  
**Bottom-left** `row-trap-bar` — Ramat cu trap bar  
**Bottom-right** `power-clean` — Aruncare la piept exploziva / Aruncare la piept din atarnare

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell rack pull: bar resting on rack pins at knee height vs pulled to lockout. A barbell on power-rack pins. RED back / lats, ORANGE hamstrings.
Top-right: Commando pull-up: gripping the bar lengthwise, head pulled to one side then the other. A pull-up bar. RED back / lats, ORANGE biceps.
Bottom-left: Trap-bar row: standing inside a hex bar bent over, bar low vs rowed to the waist. A trap bar. RED back / lats, ORANGE biceps.
Bottom-right: Barbell power clean: bar at the knees vs pulled explosively to the shoulders. A barbell, standing. RED back / lats, ORANGE glutes, quads.
```

### Grid 22

**Top-left** `ohp-db` — Impins militar sezand cu gantere / Impins umeri sezand cu gantere (+3 variante)  
**Top-right** `lateral-raise-db` — Ridicari laterale / Ridicari laterale cu gantere (+5 variante)  
**Bottom-left** `lateral-raise-cable` — Ridicari laterale (cable) / Ridicari laterale la cablu (+2 variante)  
**Bottom-right** `rear-delt-machine` — Fluturari deltoid posterior / Pec Deck deltoid posterior (+2 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Seated DB shoulder press: dumbbells at shoulders vs pressed overhead. A pair of dumbbells, seated on an upright bench. RED shoulders / delts, ORANGE triceps.
Top-right: DB lateral raise: dumbbells at sides vs raised out wide to shoulder height. A pair of dumbbells, standing. RED shoulders / delts.
Bottom-left: Cable lateral raise: arm down across body vs raised out to the side to shoulder height. Cable machine, low pulley, single handle. RED shoulders / delts.
Bottom-right: Reverse pec-deck: arms forward together vs pulled out wide to the rear. Reverse pec-deck machine, seated chest against pad. RED shoulders / delts, ORANGE back.
```

### Grid 23

**Top-left** `rear-delt-cable` — Deltoid posterior la cablu / Fluturari deltoid posterior la cablu (+3 variante)  
**Top-right** `face-pull-cable` — Face Pulls / Face Pull pe banca (+4 variante)  
**Bottom-left** `pike-pushup` — Flotari pike pentru umeri / Flotari pike lente umeri  
**Bottom-right** `wall-pike-pushup` — Flotari pike la perete umeri

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable rear delt fly: cables crossed in front vs pulled out wide. Dual high cables, standing. RED shoulders / delts, ORANGE back.
Top-right: Cable rope face pull: rope extended vs pulled to the face, elbows flared high. Cable machine, rope at face height. RED shoulders / delts, ORANGE back.
Bottom-left: Pike push-up: hips piked high, head lowered to floor vs arms extended. Bodyweight, on the floor. RED shoulders / delts, ORANGE triceps, chest.
Bottom-right: Wall pike push-up: feet walked up a wall, head lowered vs extended. Bodyweight, feet on wall. RED shoulders / delts, ORANGE chest.
```

### Grid 24

**Top-left** `face-pull-band` — Face Pull cu banda  
**Top-right** `ohp-barbell` — Impins militar / Impins militar din pini (+3 variante)  
**Bottom-left** `push-press-barbell` — Push Press / Push Press priza smuls (+1 variante)  
**Bottom-right** `ohp-barbell-behind-neck` — Impins din spatele cefei

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Band face pull: band arms extended vs pulled to the face, elbows high. A resistance band anchored at head height. RED shoulders / delts, ORANGE back.
Top-right: Barbell overhead press: bar at shoulders vs pressed overhead lockout. A barbell, standing. RED shoulders / delts, ORANGE triceps.
Bottom-left: Barbell push press: bar at shoulders with a knee dip vs driven overhead. A barbell, standing. RED shoulders / delts, ORANGE triceps, hamstrings.
Bottom-right: Barbell behind-neck press: bar behind the head vs pressed overhead. A barbell, seated. RED shoulders / delts, ORANGE triceps.
```

### Grid 25

**Top-left** `z-press-barbell` — Impins sezand pe sol  
**Top-right** `bradford-press-barbell` — Impins Bradford peste cap  
**Bottom-left** `ohp-db-single` — Impins umeri un brat cu gantera / Impins umeri intr-un genunchi gantere  
**Bottom-right** `arnold-press-db` — Impins Arnold cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell Z-press: seated on floor legs straight, bar at shoulders vs pressed overhead. A barbell, seated on the floor. RED shoulders / delts, ORANGE triceps.
Top-right: Barbell Bradford press: bar at front vs pressed just over the head behind. A barbell, seated. RED shoulders / delts, ORANGE triceps.
Bottom-left: Single-arm DB press: one dumbbell at shoulder vs pressed overhead. One dumbbell, standing. RED shoulders / delts, ORANGE triceps.
Bottom-right: DB Arnold press: dumbbells at front of shoulders palms-in vs pressed overhead rotating out. A pair of dumbbells, seated. RED shoulders / delts, ORANGE triceps.
```

### Grid 26

**Top-left** `cuban-press-db` — Impins cuban umeri  
**Top-right** `bradford-press-db` — Impins Bradford cu gantere  
**Bottom-left** `z-press-db` — Impins sezand pe sol cu gantere  
**Bottom-right** `ohp-smith` — Impins militar la Smith / Impins militar sezand la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: DB Cuban press: dumbbells low vs externally rotated then pressed overhead. A pair of dumbbells, standing. RED shoulders / delts.
Top-right: DB Bradford press: dumbbells in front vs pressed just over the head. A pair of dumbbells, seated. RED shoulders / delts, ORANGE triceps.
Bottom-left: DB Z-press: seated on floor legs straight, dumbbells at shoulders vs pressed overhead. A pair of dumbbells, seated on the floor. RED shoulders / delts, ORANGE triceps.
Bottom-right: Smith shoulder press: bar at shoulders vs pressed overhead. Smith machine, seated bench under bar. RED shoulders / delts, ORANGE triceps.
```

### Grid 27

**Top-left** `ohp-smith-behind-neck` — Impins din spatele cefei la Smith  
**Top-right** `ohp-machine` — Impins militar la aparat / Impins umeri la aparat (+4 variante)  
**Bottom-left** `lateral-raise-machine` — Ridicari laterale Hammer Strength / Ridicari laterale la aparat  
**Bottom-right** `scaption-db` — Ridicari in Y umeri / Ridicari Lu pentru umeri (+4 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Smith behind-neck press: bar at base of neck vs pressed overhead. Smith machine, seated bench under the bar. RED shoulders / delts, ORANGE triceps.
Top-right: Machine shoulder press: handles at shoulders vs pressed overhead. Shoulder-press machine, seated, weight stack. RED shoulders / delts, ORANGE triceps.
Bottom-left: Machine lateral raise: pads at sides vs arms lifted out wide. Lateral-raise machine, pads against outer arms, weight stack. RED shoulders / delts.
Bottom-right: DB scaption / Y-raise: dumbbells down vs raised diagonally forward into a Y. A pair of dumbbells, standing. RED shoulders / delts, ORANGE back.
```

### Grid 28

**Top-left** `front-raise-db` — Ridicari frontale cu gantere / Ridicari frontale cu un brat (+4 variante)  
**Top-right** `front-raise-cable` — Ridicari frontale la cablu  
**Bottom-left** `front-raise-barbell` — Ridicari frontale cu bara  
**Bottom-right** `front-raise-plate` — Ridicari frontale cu disc

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: DB front raise: dumbbells at thighs vs raised forward to shoulder height. A pair of dumbbells, standing. RED shoulders / delts, ORANGE biceps.
Top-right: Cable front raise: handle at thigh vs arm raised straight forward to shoulder height. Low cable, single handle. RED shoulders / delts.
Bottom-left: Barbell front raise: bar at thighs vs raised straight forward to shoulder height. A barbell, standing. RED shoulders / delts.
Bottom-right: Plate front raise: weight plate at hips vs raised forward to eye level. A round weight plate held two-handed, standing. RED shoulders / delts, ORANGE biceps.
```

### Grid 29

**Top-left** `front-raise-machine` — Ridicari frontale la aparat  
**Top-right** `rear-delt-db` — Ridicari laterale aplecat gantere / Deltoid posterior sezand (+2 variante)  
**Bottom-left** `band-pull-apart` — Departare banda elastica umeri  
**Bottom-right** `landmine-press` — Impins landmine pentru umeri / Impins landmine cu un brat (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Machine front raise: arm low vs raised forward. Front-raise machine, seated. RED shoulders / delts.
Top-right: Bent-over DB rear delt fly: dumbbells hanging down vs raised out wide. A pair of dumbbells, torso bent forward. RED shoulders / delts, ORANGE back.
Bottom-left: Band pull-apart: band held in front arms straight vs pulled apart to the chest. A resistance band, standing. RED shoulders / delts, ORANGE back.
Bottom-right: Landmine press: barbell end at shoulder vs pressed up and forward. One end of a barbell anchored in a landmine, half-kneeling. RED shoulders / delts, ORANGE triceps.
```

### Grid 30

**Top-left** `landmine-180` — Landmine 180 grade  
**Top-right** `kb-press` — Impins kettlebell rasturnat / Impins umeri un brat kettlebell  
**Bottom-left** `handstand-pushup` — Flotari in stand pe maini / Flotari in stand la perete  
**Bottom-right** `push-press-behind-neck` — Push Press din spatele cefei

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Landmine 180: barbell end held at shoulder swept in an arc across to the other side. One end of a barbell anchored in a landmine. RED shoulders / delts, ORANGE triceps.
Top-right: Kettlebell overhead press: kettlebell at shoulder vs pressed overhead. A single kettlebell, standing. RED shoulders / delts, ORANGE triceps.
Bottom-left: Handstand push-up against wall: inverted arms bent vs extended. Bodyweight, feet against a wall. RED shoulders / delts, ORANGE triceps.
Bottom-right: Barbell behind-neck push press: bar behind head, knee dip vs driven overhead. A barbell, standing. RED shoulders / delts, ORANGE triceps, hamstrings.
```

### Grid 31

**Top-left** `ohp-barbell-single` — Impins militar cu un brat  
**Top-right** `rotator-cuff-cable` — Rotatie externa umar la cablu / Rotatie interna umar la cablu  
**Bottom-left** `clean-and-press` — Aruncare la piept si impins  
**Bottom-right** `incline-curl-db` — Flexii inclinate cu gantere / Flexii inclinate alternative gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Single-arm barbell press: short bar at one shoulder vs pressed overhead. A barbell, standing. RED shoulders / delts, ORANGE triceps.
Top-right: Cable shoulder rotation: forearm across body vs rotated out, elbow pinned. Cable at elbow height, single handle. RED shoulders / delts.
Bottom-left: Barbell clean and press: bar at hips vs cleaned to shoulders then pressed overhead. A barbell, standing. RED shoulders / delts, ORANGE triceps, hamstrings.
Bottom-right: Incline DB curl: reclined on an incline bench, arms hanging straight down vs curled up. A pair of dumbbells, incline bench. RED biceps.
```

### Grid 32

**Top-left** `bayesian-curl` — Flexii biceps la cablu in spate  
**Top-right** `cable-curl-bar` — Flexii la cablu / Flexii la cablu cu bara dreapta (+4 variante)  
**Bottom-left** `preacher-curl-machine` — Flexii la pupitru / Flexii la pupitru la aparat  
**Bottom-right** `hammer-curl-db` — Hammer Curl / Hammer Curl in picioare cu gantere (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Bayesian cable curl: cable behind the body, arm extended back vs curled forward. Cable at shoulder height, single handle, standing. RED biceps.
Top-right: Cable curl: straight bar at the thighs vs curled to the chest. Low cable, straight bar, standing. RED biceps, ORANGE forearms.
Bottom-left: Machine preacher curl: arms over a pad extended vs curled up. Preacher-curl machine, seated. RED biceps.
Bottom-right: DB hammer curl: dumbbells at the thighs neutral grip vs curled to the shoulders. A pair of dumbbells, standing. RED biceps, ORANGE forearms.
```

### Grid 33

**Top-left** `barbell-curl` — Flexii cu bara in picioare / Flexii cu bara priza larga (+8 variante)  
**Top-right** `preacher-curl-barbell` — Flexii la pupitru cu bara EZ  
**Bottom-left** `spider-curl-barbell` — Flexii spider cu bara / Flexii spider cu bara EZ  
**Bottom-right** `concentration-curl-barbell` — Flexii concentrate sezand cu bara

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell curl: bar at the thighs vs curled to the chest. A straight barbell, standing. RED biceps, ORANGE back.
Top-right: EZ-bar preacher curl: arms over the angled pad extended vs curled up. An EZ-bar, preacher bench. RED biceps.
Bottom-left: Barbell spider curl: chest on an incline bench, bar hanging vs curled up. An EZ-bar, incline bench face-down. RED biceps.
Bottom-right: Seated barbell concentration curl: arms between the knees extended vs curled. A barbell, seated. RED biceps.
```

### Grid 34

**Top-left** `db-curl` — Flexii in picioare cu gantere / Flexii alternative in picioare gantere (+3 variante)  
**Top-right** `hammer-curl-crossbody` — Hammer Curl incrucisat cu gantera  
**Bottom-left** `spider-curl-db` — Flexii spider cu gantere  
**Bottom-right** `preacher-curl-db` — Flexii la pupitru cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Standing DB curl: dumbbells at the thighs vs curled to the shoulders, palms up. A pair of dumbbells, standing. RED biceps.
Top-right: Cross-body hammer curl: dumbbell curled across the body to the opposite shoulder vs down. A pair of dumbbells. RED biceps, ORANGE forearms.
Bottom-left: DB spider curl: chest on an incline bench, dumbbells hanging vs curled up. A pair of dumbbells, incline bench face-down. RED biceps.
Bottom-right: DB preacher curl: one arm over the pad extended vs curled. A dumbbell, preacher bench. RED biceps.
```

### Grid 35

**Top-left** `zottman-curl` — Flexii Zottman cu gantere  
**Top-right** `concentration-curl-db` — Flexii concentrate in picioare gantere / Flexii concentrate in genunchi gantere  
**Bottom-left** `cable-curl-single` — Flexii la cablu cu un brat / Flexii la cablu incrucisate un brat  
**Bottom-right** `hammer-curl-cable` — Hammer Curl la cablu cu coarda

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Zottman curl: dumbbells curled up palms-up vs lowered palms-down rotated. A pair of dumbbells, standing. RED biceps, ORANGE forearms.
Top-right: DB concentration curl: elbow braced on the inner thigh, arm extended vs curled. One dumbbell, seated. RED biceps.
Bottom-left: Single-arm cable curl: one handle extended vs curled. Cable, single handle, standing. RED biceps.
Bottom-right: Cable rope hammer curl: rope at the thighs neutral grip vs curled to the shoulders. Low cable, rope, standing. RED biceps, ORANGE forearms.
```

### Grid 36

**Top-left** `cable-curl-lying` — Flexii la cablu culcat pe banca  
**Top-right** `machine-curl` — Flexii la aparat sezand  
**Bottom-left** `concentration-curl-cable` — Flexii concentrate la cablu  
**Bottom-right** `preacher-curl-cable` — Flexii la pupitru la cablu

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Lying cable curl: lying on a bench, bar at full stretch vs curled. Low cable, flat bench. RED biceps.
Top-right: Machine curl: arms over a pad extended vs curled up. Seated curl machine, weight stack. RED biceps.
Bottom-left: Cable concentration curl: elbow braced on the thigh, low cable extended vs curled. Low cable, seated. RED biceps.
Bottom-right: Cable preacher curl: arms over a pad, low cable, extended vs curled. A preacher bench, low cable. RED biceps.
```

### Grid 37

**Top-left** `spider-curl-cable` — Flexii spider la cablu  
**Top-right** `triceps-overhead-cable` — Extensii triceps peste cap / Extensii triceps peste cap cu coarda (+3 variante)  
**Bottom-left** `triceps-pushdown` — Extensii triceps la cablu jos / Extensii triceps la cablu bara dreapta (+4 variante)  
**Bottom-right** `cgbp` — Bench Press priza ingusta

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable spider curl: chest on an incline bench, arms hanging vs curled up. Low cable, incline bench face-down. RED biceps.
Top-right: Cable overhead triceps extension: rope behind the head vs extended overhead. Cable, rope, facing away, standing. RED triceps.
Bottom-left: Cable triceps pushdown: elbows pinned, handle at the chest vs pressed down to the thighs. Cable machine, high pulley, standing. RED triceps.
Bottom-right: Close-grip bench press: narrow grip, bar to the lower chest elbows tucked vs pressed up. A barbell, flat bench. RED triceps, ORANGE chest.
```

### Grid 38

**Top-left** `bench-dip` — Flotari triceps pe banca / Flotari triceps pe banca picioare jos (+1 variante)  
**Top-right** `diamond-pushup` — Flotari diamant  
**Bottom-left** `diamond-pushup-knee` — Flotari diamant pe genunchi  
**Bottom-right** `cgbp-smith` — Impins priza ingusta la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Bench dip: hands behind on a bench, hips lowered vs pressed up. A flat bench. RED triceps, ORANGE chest.
Top-right: Diamond push-up: hands in a diamond under the chest, lowered vs pressed up. Bodyweight, floor. RED triceps, ORANGE chest.
Bottom-left: Knee diamond push-up: knees down, hands in a diamond, chest lowered vs pressed up. Bodyweight, floor. RED triceps, ORANGE chest.
Bottom-right: Smith close-grip bench: narrow grip, bar to the lower chest vs pressed up. Smith machine, flat bench. RED triceps, ORANGE chest.
```

### Grid 39

**Top-left** `triceps-press-machine` — Impins triceps la aparat  
**Top-right** `skullcrusher-barbell` — Extensii triceps culcat cu bara / Extensii triceps culcat cu bara EZ (+1 variante)  
**Bottom-left** `triceps-overhead-barbell` — Extensii triceps sezand cu bara / Extensii triceps sezand cu bara EZ (+1 variante)  
**Bottom-right** `jm-press` — Impins JM triceps

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Triceps press machine: handles at the chest vs pressed down-forward. Triceps-press machine, seated. RED triceps, ORANGE chest.
Top-right: Skullcrusher: lying on a bench, bar lowered to the forehead vs extended up. An EZ-bar, flat bench. RED triceps.
Bottom-left: EZ-bar overhead triceps extension: bar behind the head vs extended overhead. An EZ-bar, seated. RED triceps.
Bottom-right: JM press: lying, bar lowered toward the neck elbows tucked vs pressed up. A barbell, flat bench. RED triceps, ORANGE chest.
```

### Grid 40

**Top-left** `triceps-kickback-cable` — Extensii triceps inapoi cu coarda / Extensii triceps inapoi cu un brat  
**Top-right** `skullcrusher-db` — Extensii triceps culcat cu gantere / Extensii triceps culcat incrucisat (+3 variante)  
**Bottom-left** `triceps-overhead-db` — Extensii triceps peste cap doua maini / Extensii triceps peste cap un brat sezand (+2 variante)  
**Bottom-right** `triceps-kickback-db` — Extensii triceps inapoi in picioare / Extensii triceps inapoi sprijinit

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable triceps kickback: torso bent, elbow high, forearm down vs extended back. Low cable, single handle. RED triceps.
Top-right: DB lying triceps extension: lying on a bench, dumbbells lowered beside the head vs extended up. A pair of dumbbells, flat bench. RED triceps, ORANGE chest.
Bottom-left: DB overhead triceps extension: dumbbell behind the head vs extended overhead. One dumbbell two-handed, seated. RED triceps.
Bottom-right: DB triceps kickback: torso bent, elbow high, forearm down vs extended straight back. A dumbbell, bent over. RED triceps.
```

### Grid 41

**Top-left** `triceps-dip` — Flotari la paralele triceps / Flotari la paralele triceps cu greutate  
**Top-right** `triceps-dip-machine` — Flotari triceps la aparat  
**Bottom-left** `wrist-curl-barbell` — Flexii incheietura cu bara sezand sus / Flexii incheietura cu bara sezand jos (+1 variante)  
**Bottom-right** `wrist-curl-db` — Flexii incheietura gantere palme sus / Flexii incheietura gantere palme jos

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Triceps dip: torso upright between parallel bars, lowered vs pressed up. Parallel dip bars. RED triceps, ORANGE chest.
Top-right: Triceps dip machine: handles pressed down vs up, torso upright. Dip machine, seated. RED triceps, ORANGE chest.
Bottom-left: Barbell wrist curl: forearms on the thighs palms-up, hands dropped vs curled up. A barbell, seated. RED forearms.
Bottom-right: DB wrist curl: forearms on the thighs palms-up, hands dropped vs curled up. A pair of dumbbells, seated. RED forearms.
```

### Grid 42

**Top-left** `reverse-wrist-curl-barbell` — Flexii inverse incheietura cu bara  
**Top-right** `reverse-wrist-curl-db` — Flexii inverse incheietura cu gantere  
**Bottom-left** `reverse-wrist-curl-cable` — Flexii inverse incheietura la cablu / Extensii incheietura la cablu  
**Bottom-right** `wrist-curl-cable` — Flexii incheietura la cablu

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell reverse wrist curl: forearms on the thighs palms-down, knuckles dropped vs curled up. A barbell, seated. RED forearms.
Top-right: DB reverse wrist curl: forearms on the thighs palms-down, knuckles dropped vs curled up. A pair of dumbbells, seated. RED forearms.
Bottom-left: Cable reverse wrist curl: forearms on the thighs palms-down, knuckles dropped vs curled up. Low cable, straight bar, seated. RED forearms.
Bottom-right: Cable wrist curl: forearms on the thighs palms-up, hands dropped vs curled up. Low cable, straight bar, seated. RED forearms.
```

### Grid 43

**Top-left** `wrist-roller` — Rulator incheietura antebrate  
**Top-right** `plate-pinch` — Mentinere prindere disc antebrate  
**Bottom-left** `farmers-walk` — Mers fermierului cu gantere / Mers fermierului cu trap bar (+3 variante)  
**Bottom-right** `dead-hang` — Atarnare cu prosop la bara / Atarnare pasiva la bara (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Wrist roller: arms out front winding a weight up on a cord vs unwound. A wrist-roller bar with a hanging weight, standing. RED forearms.
Top-right: Plate pinch: pinching weight plates between the fingers and thumb, held at the side. Two weight plates pinched, standing. RED forearms.
Bottom-left: Farmer carry: heavy weights held at the sides, walking tall. A pair of dumbbells or kettlebells, standing. RED forearms, ORANGE back.
Bottom-right: Dead hang: hanging from a bar by the hands, arms straight. A pull-up bar. RED forearms.
```

### Grid 44

**Top-left** `gripper` — Strangere gripper antebrate  
**Top-right** `reverse-curl-barbell` — Flexii inverse cu bara / Flexii inverse cu bara EZ (+1 variante)  
**Bottom-left** `reverse-curl-cable` — Flexii inverse la cablu  
**Bottom-right** `reverse-curl-db` — Flexii inverse cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Hand gripper: a spring gripper open vs squeezed shut in one hand. A hand gripper. RED forearms.
Top-right: Barbell reverse curl: overhand grip, bar at the thighs vs curled to the chest. A barbell, standing. RED forearms, ORANGE biceps.
Bottom-left: Cable reverse curl: overhand grip, bar at the thighs vs curled to the chest. Low cable, straight bar. RED forearms, ORANGE biceps.
Bottom-right: DB reverse curl: overhand grip, dumbbells at the thighs vs curled to the chest. A pair of dumbbells. RED forearms, ORANGE biceps.
```

### Grid 45

**Top-left** `pinwheel-curl` — Flexii pinwheel cu gantere  
**Top-right** `plate-curl` — Flexii cu disc  
**Bottom-left** `sledgehammer` — Parghie cu baros antebrate  
**Bottom-right** `fat-grip-hold` — Mentinere priza groasa antebrate / Flexii cu bara priza groasa (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Pinwheel curl: dumbbell neutral grip curled up across to the opposite chest vs down. A dumbbell, standing. RED forearms, ORANGE biceps.
Top-right: Plate curl: a weight plate pinched and curled up vs down. One weight plate, standing. RED forearms.
Bottom-left: Sledgehammer lever: a hammer held at the end of the handle, raised vertical vs levered down. A sledgehammer, standing. RED forearms.
Bottom-right: Fat-grip hold: thick-handled weights gripped and held at the sides. Thick-grip dumbbells, standing. RED forearms, ORANGE biceps.
```

### Grid 46

**Top-left** `leg-press` — Presa de picioare / Presa de picioare la 45 grade (+3 variante)  
**Top-right** `leg-extension` — Extensii cvadriceps / Extensii cvadriceps cu tempo (+1 variante)  
**Bottom-left** `squat-back` — Genuflexiuni cu bara sus / Genuflexiuni cu bara jos (+6 variante)  
**Bottom-right** `squat-front` — Genuflexiuni frontale

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Leg press: seated, knees bent toward the chest vs legs extended pushing the sled. A 45-degree leg-press machine. RED quads.
Top-right: Leg extension: shins under the pad, knees bent vs legs extended straight. Leg-extension machine, seated, weight stack. RED quads.
Bottom-left: Barbell back squat: bar on the upper back, deep squat vs stood up to lockout. A barbell, in a power rack, J-hooks. RED quads, ORANGE back, glutes.
Bottom-right: Front squat: bar racked on the front shoulders elbows high, deep squat vs stood up. A barbell, in a power rack. RED quads.
```

### Grid 47

**Top-left** `squat-box` — Genuflexiuni pe cutie  
**Top-right** `squat-zercher` — Genuflexiuni Zercher  
**Bottom-left** `squat-overhead` — Genuflexiuni deasupra capului  
**Bottom-right** `squat-smith` — Genuflexiuni la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Box squat: bar on the back, sitting back to a box vs stood up. A barbell, a box behind. RED quads, ORANGE back.
Top-right: Zercher squat: bar held in the crooks of the elbows, deep squat vs stood up. A barbell at the elbows. RED quads, ORANGE back.
Bottom-left: Overhead squat: bar locked out overhead, deep squat vs stood up. A barbell, arms overhead. RED quads, ORANGE shoulders, back.
Bottom-right: Smith back squat: bar on the back, deep squat vs stood up. Smith machine. RED quads.
```

### Grid 48

**Top-left** `squat-smith-front` — Genuflexiuni frontale la Smith  
**Top-right** `hack-squat` — Genuflexiuni hack la aparat / Genuflexiuni hack verticale  
**Bottom-left** `hack-squat-reverse` — Genuflexiuni hack inverse  
**Bottom-right** `belt-squat` — Genuflexiuni la belt squat

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Smith front squat: bar on the front of the shoulders, deep squat vs stood up. Smith machine. RED quads.
Top-right: Hack squat: back on the angled pad, deep squat vs stood up. Hack-squat machine, shoulder pads. RED quads, ORANGE glutes.
Bottom-left: Reverse hack squat: facing the pad, hips back, deep squat vs stood up. Hack-squat machine, facing in. RED quads.
Bottom-right: Belt squat: weight hung from a hip belt, deep squat vs stood up. Belt-squat machine, standing on platforms. RED quads.
```

### Grid 49

**Top-left** `pendulum-squat` — Genuflexiuni pendulum  
**Top-right** `goblet-squat` — Genuflexiuni goblet / Genuflexiuni goblet kettlebell  
**Bottom-left** `db-squat` — Genuflexiuni cu gantere  
**Bottom-right** `db-sumo-squat` — Genuflexiuni sumo cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Pendulum squat: shoulders under pads on a swinging arc, deep squat vs stood up. Pendulum-squat machine. RED quads.
Top-right: Goblet squat: holding one weight at the chest, deep squat vs stood up. One kettlebell or dumbbell at the chest. RED quads, ORANGE glutes.
Bottom-left: DB squat: dumbbells at the shoulders or sides, deep squat vs stood up. A pair of dumbbells. RED quads.
Bottom-right: DB sumo squat: wide stance, one dumbbell hanging between the legs, deep squat vs stood up. One dumbbell. RED quads.
```

### Grid 50

**Top-left** `bulgarian-split-squat` — Genuflexiuni bulgaresti  
**Top-right** `pistol-squat-assisted` — Genuflexiuni pe un picior asistate  
**Bottom-left** `leg-press-single` — Presa de picioare pe un picior  
**Bottom-right** `lunge-db` — Fandari cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Bulgarian split squat: rear foot on a bench, front knee bent deep vs stood up. A pair of dumbbells, rear foot elevated. RED quads.
Top-right: Assisted pistol squat: one leg out front, deep squat holding a support vs standing. Bodyweight, holding a rail. RED quads.
Bottom-left: Single-leg leg press: one foot on the sled, knee bent vs extended. A 45-degree leg-press machine. RED quads.
Bottom-right: Forward lunge: dumbbells at sides, one leg forward in a deep lunge vs standing. A pair of dumbbells. RED quads.
```

### Grid 51

**Top-left** `lunge-walking` — Fandari mers / Fandari mers pentru fese  
**Top-right** `lunge-reverse` — Fandari inapoi / Fandari inapoi cu deficit (+2 variante)  
**Bottom-left** `lunge-lateral` — Fandari laterale  
**Bottom-right** `lunge-curtsy` — Fandari curtsy

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Walking lunge: stepping forward into a deep lunge vs standing tall to the next step. A pair of dumbbells. RED quads, ORANGE hamstrings.
Top-right: Reverse lunge: stepping back into a deep lunge vs standing tall. A pair of dumbbells. RED quads, ORANGE hamstrings, glutes.
Bottom-left: Lateral lunge: stepping wide to one side, that knee bent vs standing centered. A dumbbell. RED quads.
Bottom-right: Curtsy lunge: one leg crossing behind into a bent lunge vs standing. A dumbbell. RED quads.
```

### Grid 52

**Top-left** `lunge-barbell` — Fandari cu bara / Fandari cu bara safety  
**Top-right** `leg-extension-single` — Extensii cvadriceps pe un picior  
**Bottom-left** `leg-extension-cable` — Extensii cvadriceps la cablu  
**Bottom-right** `sissy-squat-machine` — Genuflexiuni sissy la aparat

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell lunge: bar on shoulders, one leg forward in a deep lunge vs standing. A barbell. RED quads, ORANGE glutes.
Top-right: Single-leg leg extension: one shin under the pad, knee bent vs extended. Leg-extension machine. RED quads.
Bottom-left: Cable leg extension: ankle strap, knee bent vs leg extended straight. Low cable, ankle strap, seated. RED quads.
Bottom-right: Sissy squat machine: knees driven forward, torso leaning back vs upright. Sissy-squat station. RED quads.
```

### Grid 53

**Top-left** `leg-extension-band` — Extensii cvadriceps cu banda  
**Top-right** `sissy-squat` — Genuflexiuni sissy fara greutate  
**Bottom-left** `step-up-db` — Pasire pe banca cu gantere / Pasire pe banca focus fese  
**Bottom-right** `step-up-barbell` — Pasire pe banca cu bara

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Banded leg extension: band on the ankle, knee bent vs extended. A resistance band, seated. RED quads.
Top-right: Sissy squat: knees forward torso leaning back on the toes vs upright. Bodyweight, holding a support. RED quads.
Bottom-left: DB step-up: foot on a box, driving up to stand on it vs foot down. A pair of dumbbells, a box. RED quads, ORANGE hamstrings.
Bottom-right: Barbell step-up: foot on a box, driving up to stand on it vs foot down. A barbell, a box. RED quads.
```

### Grid 54

**Top-left** `pistol-squat` — Genuflexiuni pe un picior  
**Top-right** `wall-sit` — Sezut la perete static  
**Bottom-left** `bodyweight-squat` — Genuflexiuni cu greutatea corpului  
**Bottom-right** `split-squat-smith` — Genuflexiuni split la Smith / Genuflexiuni bulgaresti la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Pistol squat: one leg straight out front, deep single-leg squat vs standing. Bodyweight. RED quads.
Top-right: Wall sit: back against a wall, knees bent to 90 degrees holding the position. Bodyweight, against a wall. RED quads.
Bottom-left: Bodyweight squat: arms forward, deep squat vs stood up. Bodyweight. RED quads.
Bottom-right: Smith split squat: rear foot on a bench, front knee bent deep vs stood up. Smith machine, one foot back on a bench. RED quads, ORANGE glutes.
```

### Grid 55

**Top-left** `rdl-barbell` — Romanian Deadlift / Indreptari cu picioare drepte (+7 variante)  
**Top-right** `leg-curl-lying` — Flexii femurale / Flexii femurale pe un picior (+1 variante)  
**Bottom-left** `deadlift-conventional` — Indreptari clasice  
**Bottom-right** `rdl-smith` — Romanian Deadlift la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell Romanian deadlift: bar at thighs, hips hinged back knees soft vs upright. A barbell, standing. RED hamstrings, ORANGE back, glutes.
Top-right: Lying leg curl: face-down, legs straight vs heels curled to the glutes. Lying leg-curl machine, ankle pad. RED hamstrings.
Bottom-left: Conventional deadlift: bar on the floor, hips low vs stood up to lockout. A barbell on the floor. RED hamstrings, ORANGE back.
Bottom-right: Smith RDL: bar at thighs, hips hinged back vs upright. Smith machine, standing. RED hamstrings, ORANGE back.
```

### Grid 56

**Top-left** `ghr` — Glute-ham raise la aparat / Glute-ham raise natural  
**Top-right** `deadlift-trap-bar` — Indreptari cu trap bar / Romanian Deadlift cu trap bar  
**Bottom-left** `rdl-db` — Romanian Deadlift cu gantere / Romanian Deadlift B-stance gantere (+3 variante)  
**Bottom-right** `kb-swing` — Balans cu kettlebell

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Glute-ham raise: on a GHD, torso down horizontal vs raised to upright. A glute-ham developer (GHD) bench. RED hamstrings.
Top-right: Trap-bar deadlift: standing inside a hex bar, hips low vs stood up to lockout. A trap bar on the floor. RED hamstrings, ORANGE back, glutes.
Bottom-left: DB Romanian deadlift: dumbbells at thighs, hips hinged back knees soft vs upright. A pair of dumbbells, standing. RED hamstrings, ORANGE back, glutes.
Bottom-right: Kettlebell swing: kettlebell between the legs hinged back vs swung up to chest height. One kettlebell, standing. RED hamstrings, ORANGE back.
```

### Grid 57

**Top-left** `leg-curl-seated` — Flexii femurale sezand  
**Top-right** `leg-curl-standing` — Flexii femurale in picioare  
**Bottom-left** `leg-curl-cable` — Flexii femurale la cablu  
**Bottom-right** `leg-curl-band` — Flexii femurale cu banda

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Seated leg curl: seated, legs straight out vs curled down under the pad. Seated leg-curl machine, thigh pad. RED hamstrings.
Top-right: Standing leg curl: one leg straight vs heel curled up to the glute. Standing leg-curl machine. RED hamstrings.
Bottom-left: Cable leg curl: ankle strapped, leg straight vs heel curled in. Low cable, ankle strap, lying or standing. RED hamstrings.
Bottom-right: Banded leg curl: band on the ankle, leg straight vs heel curled in. A resistance band, lying. RED hamstrings.
```

### Grid 58

**Top-left** `nordic-curl` — Flexii nordice femurale / Flexii nordice femurale asistate (+4 variante)  
**Top-right** `wall-hip-hinge` — Indoire sold la perete  
**Bottom-left** `hip-thrust-barbell` — Hip Thrust / Hip Thrust cu pauza (+8 variante)  
**Bottom-right** `hip-thrust-single` — Hip Thrust pe un picior

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Nordic curl: kneeling with ankles anchored, torso upright vs lowered slowly toward the floor. Ankles held under a pad, on a pad. RED hamstrings.
Top-right: Wall hip hinge: hips pushed back to tap a wall vs standing upright. Bodyweight, facing away from a wall. RED hamstrings.
Bottom-left: Barbell hip thrust: upper back on a bench, a bar across the hips, hips down vs driven up to lockout. A barbell on the hips, bench. RED glutes, ORANGE hamstrings.
Bottom-right: Single-leg hip thrust: upper back on a bench, one foot planted, hips down vs driven up. Bodyweight or a dumbbell, one leg. RED glutes, ORANGE hamstrings.
```

### Grid 59

**Top-left** `pull-through-cable` — Trecere printre picioare la cablu  
**Top-right** `pull-through-band` — Trecere printre picioare cu banda  
**Bottom-left** `hip-thrust-smith` — Hip Thrust la Smith / Hip Thrust un picior la Smith (+1 variante)  
**Bottom-right** `hip-thrust-machine` — Aparat glute drive pentru fese / Hip Thrust la belt squat (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable pull-through: rope between the legs, hips hinged back vs stood up squeezing. Low cable, rope, facing away. RED glutes, ORANGE hamstrings, back.
Top-right: Banded pull-through: band between the legs, hips hinged back vs stood up squeezing. A resistance band anchored low, facing away. RED glutes, ORANGE hamstrings, back.
Bottom-left: Smith hip thrust: upper back on a bench, bar across the hips, hips down vs driven up. Smith machine, shoulders on a bench. RED glutes, ORANGE hamstrings.
Bottom-right: Glute-drive machine: hips down vs driven up against the lever. Glute-drive hip-thrust machine. RED glutes, ORANGE hamstrings.
```

### Grid 60

**Top-left** `hip-thrust-db` — Hip Thrust cu gantera  
**Top-right** `glute-bridge-barbell` — Punte de fese cu bara  
**Bottom-left** `glute-bridge-db` — Punte de fese cu gantere / Punte de fese cu disc  
**Bottom-right** `frog-pump` — Punte fese cu picioarele departate / Punte fese picioare departate gantera

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: DB hip thrust: upper back on a bench, a dumbbell across the hips, hips down vs driven up. One dumbbell on the hips. RED glutes, ORANGE hamstrings.
Top-right: Barbell glute bridge: lying flat on the floor, a bar across the hips, down vs bridged up. A barbell on the hips. RED glutes, ORANGE hamstrings.
Bottom-left: DB glute bridge: lying flat, a dumbbell on the hips, down vs bridged up. One dumbbell on the hips. RED glutes, ORANGE hamstrings.
Bottom-right: Frog pump: lying on the floor, soles together knees out, hips down vs bridged up. Bodyweight or a dumbbell, on the floor. RED glutes.
```

### Grid 61

**Top-left** `glute-bridge-band` — Punte de fese cu banda  
**Top-right** `glute-kickback-cable` — Extensii sold pentru fese la cablu / Extensie sold la cablu (+1 variante)  
**Bottom-left** `glute-kickback-machine` — Extensii sold pentru fese aparat  
**Bottom-right** `hip-abduction-cable` — Abductie sold la cablu in picioare

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Banded glute bridge: lying, a band around the knees, hips down vs bridged up. A loop band around the knees. RED glutes, ORANGE hamstrings.
Top-right: Cable glute kickback: ankle strap, leg forward vs driven straight back. Low cable, ankle strap, standing. RED glutes, ORANGE hamstrings.
Bottom-left: Glute kickback machine: foot on the pad, leg forward vs driven straight back. Glute-kickback machine, standing. RED glutes.
Bottom-right: Cable hip abduction: ankle strap, leg in vs swept out to the side. Low cable, ankle strap, standing. RED glutes.
```

### Grid 62

**Top-left** `hip-abduction-machine` — Abductie sold la aparat  
**Top-right** `sumo-deadlift` — Indreptari sumo / Indreptari romanesti sumo  
**Bottom-left** `sumo-deadlift-db` — Indreptari sumo cu gantere  
**Bottom-right** `sumo-deadlift-smith` — Indreptari sumo la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Hip abduction machine: knees together vs pushed out wide against the pads. Seated hip-abduction machine. RED glutes.
Top-right: Sumo deadlift: wide stance, hands inside the knees, hips low vs stood up to lockout. A barbell on the floor. RED glutes, ORANGE hamstrings, back.
Bottom-left: DB sumo deadlift: wide stance, a dumbbell between the legs, hips low vs stood up. One dumbbell. RED glutes, ORANGE hamstrings, back.
Bottom-right: Smith sumo deadlift: wide stance, hips low vs stood up. Smith machine. RED glutes, ORANGE hamstrings, back.
```

### Grid 63

**Top-left** `sumo-deadlift-band` — Indreptari sumo cu banda  
**Top-right** `cossack-squat` — Genuflexiuni cazac laterale  
**Bottom-left** `glute-bridge-single` — Punte de fese pe un picior / Punte fese un picior ridicat (+1 variante)  
**Bottom-right** `glute-bridge` — Punte de fese fara greutate / Punte de fese cu pasire (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Banded sumo deadlift: wide stance over a band, hips low vs stood up. A resistance band. RED glutes, ORANGE hamstrings, back.
Top-right: Cossack squat: wide stance, weight shifted into one deep bent leg, the other straight vs centered. Bodyweight or a weight. RED glutes, ORANGE hamstrings, quads.
Bottom-left: Single-leg glute bridge: lying, one foot planted, hips down vs bridged up. Bodyweight, on the floor. RED glutes, ORANGE hamstrings.
Bottom-right: Glute bridge: lying flat on the floor, hips down vs bridged up. Bodyweight, on the floor. RED glutes, ORANGE hamstrings.
```

### Grid 64

**Top-left** `donkey-kick` — Extensie sold in patrupedie / Lovitura de magar pentru fese  
**Top-right** `fire-hydrant` — Abductie sold in patrupedie  
**Bottom-left** `clamshell` — Scoica pentru fese cu banda  
**Bottom-right** `calf-standing` — Ridicari pe varfuri / Ridicari pe varfuri in picioare aparat (+5 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Donkey kick: on hands and knees, one bent leg driven up behind vs down. Bodyweight, quadruped. RED glutes.
Top-right: Fire hydrant: on hands and knees, one bent knee lifted out to the side vs down. Bodyweight, quadruped. RED glutes.
Bottom-left: Clamshell: side-lying knees bent, top knee down vs opened up against a band. A loop band, side-lying. RED glutes.
Bottom-right: Standing calf raise: shoulders under the pads, heels down vs pressed up onto the toes. Standing calf-raise machine. RED calves.
```

### Grid 65

**Top-left** `calf-leg-press` — Ridicari pe varfuri la presa  
**Top-right** `calf-hack` — Ridicari pe varfuri la hack squat  
**Bottom-left** `calf-standing-db` — Ridicari pe varfuri in picioare gantere  
**Bottom-right** `calf-standing-barbell` — Ridicari pe varfuri in picioare cu bara

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Calf raise on the leg press: balls of the feet on the sled, toes pointed vs flexed. A leg-press machine. RED calves.
Top-right: Calf raise on a hack squat: balls of the feet on the platform, heels down vs up. Hack-squat machine. RED calves.
Bottom-left: Standing DB calf raise: dumbbells at the sides, heels down vs up onto the toes. A pair of dumbbells, balls of feet on a step. RED calves.
Bottom-right: Standing barbell calf raise: bar on the back, heels down vs up onto the toes. A barbell, balls of feet on a step. RED calves.
```

### Grid 66

**Top-left** `calf-seated` — Ridicari pe varfuri sezand aparat / Ridicari pe varfuri sezand un picior (+1 variante)  
**Top-right** `calf-seated-db` — Ridicari pe varfuri sezand gantere / Ridicari pe varfuri sezand cu disc  
**Bottom-left** `calf-seated-barbell` — Ridicari pe varfuri sezand cu bara  
**Bottom-right** `calf-donkey` — Ridicari pe varfuri donkey / Ridicari pe varfuri donkey la Smith (+3 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Seated calf raise: knees under the pad, heels down vs pressed up onto the toes. Seated calf-raise machine. RED calves.
Top-right: Seated DB/plate calf raise: a weight on the knees, heels down vs up onto the toes. A dumbbell or plate on the knees, seated. RED calves.
Bottom-left: Seated barbell calf raise: a bar across bent knees, heels down vs pressed up onto the toes. A barbell across the knees, seated. RED calves.
Bottom-right: Donkey calf raise: bent at the hips with weight on the lower back, heels down vs up onto the toes. Donkey-calf machine or partner over the hips. RED calves.
```

### Grid 67

**Top-left** `tibialis-raise` — Ridicari tibialis / Ridicari tibialis in picioare (+1 variante)  
**Top-right** `tibialis-cable` — Ridicari tibialis la cablu  
**Bottom-left** `tibialis-band` — Ridicari tibialis cu banda  
**Bottom-right** `tibialis-db` — Ridicari tibialis cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Tibialis raise: heels planted, toes lifted up toward the shins vs down. Bodyweight, back against a wall. RED calves.
Top-right: Cable tibialis raise: heels down, toes lifted up toward the shins vs down. Low cable strap on the toes, seated against a wall. RED calves.
Bottom-left: Banded tibialis raise: toes pulled up against a band vs down. A resistance band on the toes, seated. RED calves.
Bottom-right: DB tibialis raise: a dumbbell on the toes, lifted up vs down. One dumbbell on the feet, seated. RED calves.
```

### Grid 68

**Top-left** `calf-standing-bodyweight` — Ridicari pe varfuri fara greutate / Ridicari pe varfuri pe un picior (+3 variante)  
**Top-right** `plank` — Plank  
**Bottom-left** `side-plank` — Plank lateral / Plank lateral cu coborare sold  
**Bottom-right** `plank-dynamic` — Plank cu atingere umar / Plank in flotare (+2 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Standing bodyweight calf raise: heels hanging off a step, dropped down vs lifted onto the toes. Bodyweight on a step. RED calves.
Top-right: Front plank: on the forearms, body in a straight rigid line. Bodyweight, on the floor. RED core / abs, ORANGE shoulders, glutes.
Bottom-left: Side plank: on one forearm, body in a straight line, hips up vs the held position. Bodyweight, on the floor. RED core / abs, ORANGE shoulders, glutes.
Bottom-right: Dynamic plank: high plank, one hand tapping the opposite shoulder vs both planted. Bodyweight, on the floor. RED core / abs, ORANGE shoulders, triceps.
```

### Grid 69

**Top-left** `copenhagen-plank` — Plank Copenhaga (adductori)  
**Top-right** `pallof-cable` — Anti-rotatie Pallof la cablu / Anti-rotatie Pallof in genunchi  
**Bottom-left** `pallof-band` — Anti-rotatie Pallof cu banda  
**Bottom-right** `woodchop-cable` — Taietura de lemn la cablu sus-jos / Taietura de lemn la cablu jos-sus

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Copenhagen plank: side plank with the top leg on a bench, hips up vs held. Bodyweight, a bench. RED core / abs, ORANGE glutes, hamstrings.
Top-right: Cable Pallof press: cable at the side, hands at the chest vs pressed straight out resisting rotation. Cable at chest height, single handle, standing. RED core / abs, ORANGE shoulders, glutes.
Bottom-left: Banded Pallof press: band at the side, hands at the chest vs pressed straight out resisting rotation. A band anchored at chest height, standing. RED core / abs, ORANGE shoulders.
Bottom-right: Cable woodchop: handle pulled diagonally across the body high to low vs the start. Cable, single handle, standing. RED core / abs, ORANGE shoulders, back.
```

### Grid 70

**Top-left** `woodchop-medball` — Taietura de lemn cu minge medicinala  
**Top-right** `dead-bug` — Dead bug (gandac mort) / Dead bug cu banda  
**Bottom-left** `bird-dog` — Bird dog (caine de vanatoare) / Bird dog cu banda  
**Bottom-right** `hollow-hold` — Mentinere corp scobit / Balansare corp scobit

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Med-ball woodchop: a medicine ball swung diagonally from high to low across the body. A medicine ball, standing. RED core / abs, ORANGE shoulders.
Top-right: Dead bug: lying on the back, opposite arm and leg extended vs tucked. Bodyweight, on the floor. RED core / abs, ORANGE shoulders.
Bottom-left: Bird dog: on hands and knees, opposite arm and leg extended vs tucked. Bodyweight, quadruped. RED core / abs, ORANGE glutes, shoulders.
Bottom-right: Hollow hold: lying on the back, arms and legs lifted into a banana shape. Bodyweight, on the floor. RED core / abs.
```

### Grid 71

**Top-left** `reverse-crunch` — Crunch invers abdomen / Crunch invers pe banca inclinata  
**Top-right** `ab-rollout` — Amestecare in oala cu minge fitness / Rulare cu roata abdomen (+1 variante)  
**Bottom-left** `rollout-barbell` — Rulare cu bara abdomen  
**Bottom-right** `hanging-leg-raise` — Ridicari picioare la bara / Ridicari genunchi la bara (+2 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Reverse crunch: lying on the back, knees pulled to the chest vs legs lowered. Bodyweight, on the floor. RED core / abs.
Top-right: Ab-wheel rollout: kneeling, the wheel rolled out forward vs pulled back in. An ab wheel, kneeling. RED core / abs, ORANGE shoulders, back.
Bottom-left: Barbell rollout: kneeling, a loaded bar rolled out forward vs pulled back in. A barbell, kneeling. RED core / abs, ORANGE shoulders, back.
Bottom-right: Hanging leg raise: hanging from a bar, legs down vs raised straight to the bar. A pull-up bar. RED core / abs, ORANGE forearms, back.
```

### Grid 72

**Top-left** `captains-chair-raise` — Ridicari genunchi la scaun roman / Ridicari picioare la scaun roman  
**Top-right** `l-sit` — Mentinere L-sit la bare paralele / Mentinere L-sit la sol  
**Bottom-left** `russian-twist` — Rotiri ruse la cablu / Rotiri ruse cu minge medicinala (+1 variante)  
**Bottom-right** `side-bend` — Indoiri laterale la cablu / Indoiri laterale cu disc

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Captain chair raise: forearms on the pads hanging, legs down vs raised to 90 degrees. A captain-chair frame. RED core / abs.
Top-right: L-sit: supported on the hands, legs held straight out in an L. Parallel bars or the floor. RED core / abs, ORANGE triceps, shoulders.
Bottom-left: Russian twist: seated leaning back, a weight rotated from one hip to the other. A plate or medicine ball, seated. RED core / abs, ORANGE shoulders.
Bottom-right: Side bend: standing, a weight at one side, torso bent down to that side vs upright. A dumbbell or plate, standing. RED core / abs.
```

### Grid 73

**Top-left** `medball-slam` — Trantire minge medicinala  
**Top-right** `situp-bench` — Abdomene pe banca inclinata negativ / Abdomene pe banca (+1 variante)  
**Bottom-left** `situp-weighted` — Abdomene cu greutate  
**Bottom-right** `cable-crunch` — Crunch la cablu in genunchi / Crunch la cablu in picioare

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Med-ball slam: a ball raised overhead vs slammed down to the floor. A medicine ball, standing. RED core / abs, ORANGE shoulders, back.
Top-right: Decline bench sit-up: anchored on a decline bench, torso down vs curled up. A decline sit-up bench. RED core / abs.
Bottom-left: Weighted sit-up: lying, a weight on the chest, torso down vs curled up. A plate held at the chest, on the floor. RED core / abs.
Bottom-right: Cable crunch: kneeling, a rope behind the head, torso crunched down vs upright. Cable, rope, kneeling. RED core / abs.
```

### Grid 74

**Top-left** `v-up` — Pliere in V abdomen  
**Top-right** `heel-tap` — Atingeri calcaie abdomen  
**Bottom-left** `bicycle-crunch` — Crunch bicicleta abdomen  
**Bottom-right** `ball-crunch` — Crunch cu minge fitness

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: V-up: lying flat vs folding into a V touching the hands to the feet. Bodyweight, on the floor. RED core / abs.
Top-right: Heel tap: lying, shoulders curled, hands tapping side to side at the heels. Bodyweight, on the floor. RED core / abs.
Bottom-left: Bicycle crunch: lying, opposite elbow to knee, legs cycling. Bodyweight, on the floor. RED core / abs.
Bottom-right: Stability-ball crunch: lying back over a ball, torso extended vs crunched up. A stability ball. RED core / abs.
```

### Grid 75

**Top-left** `ball-pike` — Pliere cu minge fitness  
**Top-right** `plate-crunch` — Crunch cu disc  
**Bottom-left** `loaded-carry` — Carat cu bara la piept / Carat peste cap cu gantera  
**Bottom-right** `dragon-flag` — Dragon Flag abdomen

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Stability-ball pike: feet on a ball in a plank, hips piked up vs flat. A stability ball. RED core / abs, ORANGE shoulders.
Top-right: Plate crunch: lying, a plate held over the chest, torso crunched up vs flat. A plate, on the floor. RED core / abs.
Bottom-left: Loaded carry: a weight carried at the front rack or overhead, walking tall. A barbell or dumbbell. RED core / abs, ORANGE forearms, shoulders.
Bottom-right: Dragon flag: gripping a bench overhead, body lowered straight and rigid vs raised vertical. A flat bench. RED core / abs, ORANGE glutes, shoulders.
```

### Grid 76

**Top-left** `windshield-wiper` — Stergatoare de parbriz abdomen  
**Top-right** `body-saw` — Plank cu alunecare

> **Pad-note:** grid final cu doar 2 exercitii (TL/TR); restul celulelor raman goale. Managerul taie doar 2 fisiere.

- [ ] generat

```text
ONE image: a 2x2 grid with 2 DIFFERENT exercises in the top row and the bottom row left empty plain charcoal. Each filled cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Windshield wiper: lying or hanging, straight legs swept side to side. Bodyweight, on the floor or a bar. RED core / abs, ORANGE back, forearms.
Top-right: Body saw: forearm plank sliding the body back and forward. Bodyweight, on sliders. RED core / abs, ORANGE shoulders.
```

