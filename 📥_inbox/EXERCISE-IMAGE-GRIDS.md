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
Top-left: Cable fly, FRONT VIEW, standing: arms wide at chest height vs squeezed together in front. Dual cables. RED chest, ORANGE triceps.
Top-right: Incline barbell bench, SIDE VIEW, body reclined ~45 degrees lying back on an incline bench inside a power rack with tall upright posts and J-hooks: bar at upper chest vs pressed up. RED chest, ORANGE shoulders, triceps.
Bottom-left: Decline barbell bench, SIDE VIEW, body head-down on a decline bench inside a power rack with tall upright posts and J-hooks: bar at lower chest vs pressed up. RED chest, ORANGE triceps.
Bottom-right: Barbell board press, SIDE VIEW, body lying flat and fully horizontal on a bench inside a power rack with tall upright posts and J-hooks: bar lowered to wooden boards on the chest vs pressed up. RED chest, ORANGE triceps.
```

### Grid 3

**Top-left** `floor-press-barbell` — Impins de la sol cu bara  
**Top-right** `press-db-decline` — Impins inclinat negativ cu gantere  
**Bottom-left** `press-db-single` — Impins din piept un brat gantera  
**Bottom-right** `floor-press-db` — Impins de la sol cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell floor press, SIDE VIEW, lying flat on the floor inside a power rack with tall upright posts: bar down until elbows touch the floor vs pressed up. RED chest, ORANGE triceps.
Top-right: Decline DB press, SIDE VIEW, body head-down on a decline bench: dumbbells at lower chest vs pressed straight up. RED chest, ORANGE triceps.
Bottom-left: Single-arm DB press, SIDE VIEW, body lying flat and fully horizontal on a bench: one dumbbell at chest vs pressed straight up. RED chest, ORANGE triceps.
Bottom-right: DB floor press, SIDE VIEW, lying flat on the floor: dumbbells down until elbows touch the floor vs pressed up. RED chest, ORANGE triceps.
```

### Grid 4

**Top-left** `bench-smith-flat` — Impins din piept la Smith / Impins din piept la Smith cu pauza (+2 variante)  
**Top-right** `bench-smith-incline` — Impins inclinat la Smith  
**Bottom-left** `bench-smith-decline` — Impins inclinat negativ la Smith  
**Bottom-right** `press-machine-flat` — Impins din piept plat la aparat / Impins la aparat priza ciocan (+8 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Smith flat bench, SIDE VIEW, body lying flat and fully horizontal on a bench under a Smith machine: bar to mid-chest vs pressed up. RED chest, ORANGE shoulders, triceps.
Top-right: Smith incline bench, SIDE VIEW, body reclined ~45 degrees lying back on an incline bench under a Smith machine: bar to upper chest vs pressed up. RED chest, ORANGE shoulders, triceps.
Bottom-left: Smith decline bench, SIDE VIEW, body head-down on a decline bench under a Smith machine: bar to lower chest vs pressed up. RED chest, ORANGE triceps.
Bottom-right: Chest press machine, FRONT VIEW, seated upright on the machine: handles at chest vs pressed forward. RED chest, ORANGE triceps, shoulders.
```

### Grid 5

**Top-left** `press-machine-incline` — Impins din piept inclinat la aparat / Impins inclinat priza ciocan (+1 variante)  
**Top-right** `press-machine-decline` — Impins din piept inclinat negativ / Impins inclinat negativ priza ciocan (+1 variante)  
**Bottom-left** `press-cable-flat` — Impins din piept la cablu  
**Bottom-right** `press-cable-incline` — Impins inclinat la cablu

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Incline chest press machine, FRONT VIEW, seated upright on the machine: handles at upper chest vs pressed forward. RED chest, ORANGE shoulders, triceps.
Top-right: Decline chest press machine, FRONT VIEW, seated on the machine: handles low vs pressed forward-down. RED chest, ORANGE triceps.
Bottom-left: Cable chest press, FRONT VIEW, standing: dual handles at chest vs pressed forward together. RED chest, ORANGE triceps.
Bottom-right: Incline cable press, SIDE VIEW, body reclined ~45 degrees lying back on an incline bench: dual cable handles at upper chest vs pressed up-forward. RED chest, ORANGE shoulders, triceps.
```

### Grid 6

**Top-left** `fly-cable-high` — Fluturari la cablu de sus in jos  
**Top-right** `fly-cable-low` — Fluturari la cablu de jos in sus  
**Bottom-left** `fly-cable-incline` — Fluturari la cablu inclinat  
**Bottom-right** `fly-cable-decline` — Fluturari la cablu inclinat negativ

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable crossover high-to-low, FRONT VIEW, standing: arms wide up high vs swept down and together at the hips. Dual high cables. RED chest.
Top-right: Cable fly low-to-high, FRONT VIEW, standing: arms wide down low vs swept up and together at the face. Dual low cables. RED chest.
Bottom-left: Incline cable fly, SIDE VIEW, body reclined ~45 degrees lying back on an incline bench: arms wide vs squeezed together above the chest. Dual cables. RED chest, ORANGE shoulders.
Bottom-right: Decline cable fly, SIDE VIEW, body head-down on a decline bench: arms wide vs squeezed together. Dual cables. RED chest.
```

### Grid 7

**Top-left** `fly-pec-deck-cable` — Pec Deck la cablu  
**Top-right** `fly-db-flat` — Fluturari cu gantere / Fluturari un brat cu gantera  
**Bottom-left** `fly-db-incline` — Fluturari inclinat cu gantere  
**Bottom-right** `fly-db-decline` — Fluturari inclinat negativ gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable pec-deck fly, FRONT VIEW, seated upright on the station: arms wide vs squeezed together in front. RED chest.
Top-right: Flat DB fly, SIDE VIEW, body lying flat and fully horizontal on a bench: dumbbells wide arms open vs arced together above the chest. RED chest.
Bottom-left: Incline DB fly, SIDE VIEW, body reclined ~45 degrees lying back on an incline bench: dumbbells wide vs arced together above the chest. RED chest, ORANGE shoulders.
Bottom-right: Decline DB fly, SIDE VIEW, body head-down on a decline bench: dumbbells wide vs arced together above the chest. RED chest.
```

### Grid 8

**Top-left** `fly-db-floor` — Fluturari la sol cu gantere  
**Top-right** `pullover-db` — Pullover cu gantera  
**Bottom-left** `dip-chest` — Flotari la paralele / Flotari la paralele fara greutate (+1 variante)  
**Bottom-right** `dip-assisted` — Flotari la paralele asistate aparat / Flotari la paralele asistate cu banda

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Floor DB fly, SIDE VIEW, lying flat on the floor: dumbbells wide vs arced together above the chest. RED chest.
Top-right: DB pullover, SIDE VIEW, body lying flat across a bench: one dumbbell overhead behind the head vs pulled over the chest. RED chest, ORANGE back.
Bottom-left: Chest dip, 3/4 view, upright between parallel dip bars, torso leaning forward: lowered between the bars vs pressed up. RED chest, ORANGE triceps.
Bottom-right: Assisted dip, 3/4 view, knees on the machine pad: body lowered between the bars vs pressed up. Assisted-dip machine. RED chest, ORANGE triceps.
```

### Grid 9

**Top-left** `pushup-standard` — Flotari / Flotari lente  
**Top-right** `pushup-knee` — Flotari pe genunchi  
**Bottom-left** `pushup-wall` — Flotari la perete / Flotari la perete inclinat  
**Bottom-right** `pushup-wide` — Flotari priza larga / Flotari larg pe genunchi

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Standard push-up, SIDE VIEW, body straight and horizontal in a plank on the floor: chest lowered to the floor vs pressed up. RED chest, ORANGE triceps, shoulders.
Top-right: Knee push-up, SIDE VIEW, body angled with knees on the floor: chest lowered vs pressed up. RED chest, ORANGE triceps.
Bottom-left: Wall push-up, SIDE VIEW, standing leaning into a wall with hands on it: body in vs pressed away. RED chest, ORANGE triceps.
Bottom-right: Wide push-up, SIDE VIEW, body horizontal in a plank, hands set wide: chest lowered vs pressed up. RED chest, ORANGE shoulders.
```

### Grid 10

**Top-left** `pushup-decline` — Flotari inclinate negativ / Flotari pe genunchi inclinat negativ  
**Top-right** `pushup-incline` — Flotari inclinate  
**Bottom-left** `pushup-plyo` — Flotari pliometrice / Flotari cu bataie palme  
**Bottom-right** `pushup-archer` — Flotari archer

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Decline push-up, SIDE VIEW, body horizontal in a plank with feet elevated on a bench: chest lowered vs pressed up. RED chest, ORANGE shoulders, triceps.
Top-right: Incline push-up, SIDE VIEW, body angled with hands elevated on a bench: chest lowered vs pressed up. RED chest, ORANGE triceps.
Bottom-left: Plyometric push-up, SIDE VIEW, body horizontal in a plank on the floor: chest at the floor vs pushed explosively off with a clap. RED chest, ORANGE triceps, shoulders.
Bottom-right: Archer push-up, SIDE VIEW, body horizontal in a plank: weight shifted to one bent arm, other arm straight vs both extended. RED chest, ORANGE triceps.
```

### Grid 11

**Top-left** `pushup-onearm` — Flotari un brat asistate / Flotari pe genunchi un brat  
**Top-right** `bench-barbell-pin` — Impins din pini la piept  
**Bottom-left** `bench-smith-pin` — Impins din pini la Smith  
**Bottom-right** `floor-press-smith` — Impins de la sol la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: One-arm push-up, SIDE VIEW, body horizontal in a plank on the floor, one hand down: body lowered vs pressed up. RED chest, ORANGE triceps.
Top-right: Barbell pin press, SIDE VIEW, body lying flat and fully horizontal on a bench inside a power rack with tall upright posts and J-hooks: bar resting on the rack pins at chest vs pressed up. RED chest, ORANGE triceps.
Bottom-left: Smith pin press, SIDE VIEW, body lying flat and fully horizontal on a bench under a Smith machine: bar starting on the safety pins at chest vs pressed up. RED chest, ORANGE triceps.
Bottom-right: Smith floor press, SIDE VIEW, lying flat on the floor under a Smith machine: bar lowered until elbows touch vs pressed up. RED chest, ORANGE triceps.
```

### Grid 12

**Top-left** `pullover-cable` — Pullover la cablu  
**Top-right** `pullover-barbell` — Pullover cu bara EZ  
**Bottom-left** `lat-pulldown` — Lat Pulldown / Lat Pulldown priza larga (+5 variante)  
**Bottom-right** `row-cable` — Ramat la cablu / Ramat la cablu lent (+7 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable pullover, FRONT VIEW, standing: arms overhead vs pulled down over the chest. High cable, straight-arm bar. RED chest, ORANGE back.
Top-right: EZ-bar pullover, SIDE VIEW, body lying flat across a bench: bar overhead behind the head vs pulled over the chest. RED chest, ORANGE back.
Bottom-left: Lat pulldown, FRONT VIEW, seated at the station with a thigh pad: bar overhead arms extended vs pulled to the upper chest. RED back / lats, ORANGE biceps.
Bottom-right: Seated cable row, 3/4 view, seated upright at the station with a foot platform: handle forward arms extended vs pulled to the abdomen. RED back / lats, ORANGE biceps.
```

### Grid 13

**Top-left** `row-chest-supported` — Ramat cu piept sprijinit / Ramat cu piept sprijinit la aparat (+1 variante)  
**Top-right** `pullup` — Tractiuni / Tractiuni priza larga (+9 variante)  
**Bottom-left** `pullup-assisted` — Tractiuni asistate cu banda / Tractiuni supinate asistate cu banda (+1 variante)  
**Bottom-right** `chinup` — Tractiuni priza supinata / Tractiuni priza supinata cu greutate (+9 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Chest-supported row, 3/4 view, seated with chest against the pad: handles forward vs rowed back. Chest-supported row machine. RED back / lats, ORANGE biceps.
Top-right: Pull-up, FRONT VIEW, hanging from a pull-up bar, overhand grip: dead hang vs chin over the bar. RED back / lats, ORANGE biceps.
Bottom-left: Band-assisted pull-up, FRONT VIEW, hanging from a pull-up bar with a band under the feet: body down vs pulled up. RED back / lats, ORANGE biceps.
Bottom-right: Chin-up, FRONT VIEW, hanging from a pull-up bar, underhand shoulder-width grip: dead hang vs chin over the bar. RED back / lats, ORANGE biceps, forearms.
```

### Grid 14

**Top-left** `chinup-lsit` — Tractiuni supinate in L-sit  
**Top-right** `pulldown-single` — Lat Pulldown cu un brat / Lat Pulldown un brat supinat  
**Bottom-left** `pulldown-machine` — Lat Pulldown la aparat Hammer  
**Bottom-right** `straight-arm-pulldown` — Lat Pulldown cu brate intinse

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: L-sit chin-up, FRONT VIEW, hanging from a pull-up bar with legs held straight out in an L: hanging vs pulled up. RED back / lats, ORANGE biceps.
Top-right: Single-arm lat pulldown, FRONT VIEW, seated at a high pulley: one handle overhead vs pulled down to the side. RED back / lats, ORANGE biceps.
Bottom-left: Machine lat pulldown, FRONT VIEW, seated at a plate-loaded machine: handles overhead vs pulled to the chest. RED back / lats, ORANGE biceps.
Bottom-right: Straight-arm pulldown, FRONT VIEW, standing at a high pulley: bar overhead arms straight vs swept down to the thighs. RED back / lats.
```

### Grid 15

**Top-left** `row-barbell` — Ramat cu bara / Ramat Yates cu bara (+2 variante)  
**Top-right** `row-tbar` — Ramat la T-bar / Ramat la T-bar la aparat  
**Bottom-left** `row-pendlay` — Ramat Pendlay cu bara  
**Bottom-right** `row-landmine` — Ramat Meadows landmine / Ramat la T-bar landmine

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Bent-over barbell row, 3/4 view, standing with torso hinged forward: bar hanging vs rowed to the lower chest. A barbell. RED back / lats, ORANGE biceps.
Top-right: T-bar row, 3/4 view, standing bent over a T-bar platform with a V-handle: handles low vs rowed to the chest. RED back / lats, ORANGE biceps.
Bottom-left: Pendlay row, 3/4 view, standing bent fully over, torso horizontal: bar dead on the floor vs rowed explosively to the chest. A barbell. RED back / lats, ORANGE biceps.
Bottom-right: Landmine row, 3/4 view, standing bent over a landmine: handle at the floor vs rowed to the hip. One end of a barbell anchored in a landmine. RED back / lats, ORANGE biceps.
```

### Grid 16

**Top-left** `row-db` — Ramat cu gantera / Ramat cu gantera priza supinata (+3 variante)  
**Top-right** `row-chest-supported-db` — Ramat cu piept sprijinit gantere  
**Bottom-left** `row-cable-high` — Ramat la cablu de sus  
**Bottom-right** `row-machine` — Ramat la aparat Hammer / Ramat iso-lateral sus la aparat (+2 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Single-arm DB row, 3/4 view, one knee and hand on a flat bench, torso horizontal: dumbbell hanging vs rowed to the hip. RED back / lats, ORANGE biceps.
Top-right: Chest-supported DB row, 3/4 view, chest face-down on an incline bench: dumbbells hanging vs rowed up. A pair of dumbbells. RED back / lats, ORANGE biceps.
Bottom-left: High cable row, FRONT VIEW, seated at a high pulley: handle forward vs pulled down to the chest. RED back / lats, ORANGE biceps.
Bottom-right: Machine row, 3/4 view, seated with chest against a pad: handles forward vs rowed back. Iso-lateral plate-loaded row machine. RED back / lats, ORANGE biceps.
```

### Grid 17

**Top-left** `row-smith` — Ramat la Smith / Ramat aplecat la Smith  
**Top-right** `pullover-machine` — Pullover la aparat  
**Bottom-left** `shrug-barbell` — Ridicari de umeri cu bara / Ridicari de umeri cu bara la spate  
**Bottom-right** `shrug-db` — Ridicari de umeri cu gantere / Ridicari de umeri cu disc

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Smith bent-over row, 3/4 view, standing bent forward under a Smith machine: bar low vs rowed to the waist. RED back / lats, ORANGE biceps.
Top-right: Machine pullover, FRONT VIEW, seated upright on the machine: elbows overhead vs pulled forward. RED back / lats, ORANGE chest.
Bottom-left: Barbell shrug, FRONT VIEW, standing: bar at thighs, shoulders down vs shrugged up to the ears. A barbell. RED back / lats.
Bottom-right: DB shrug, FRONT VIEW, standing: dumbbells at sides, shoulders down vs shrugged up to the ears. A pair of dumbbells. RED back / lats.
```

### Grid 18

**Top-left** `shrug-trap-bar` — Ridicari de umeri cu trap bar  
**Top-right** `shrug-cable` — Ridicari de umeri la cablu  
**Bottom-left** `shrug-machine` — Ridicari de umeri la aparat / Ridicari de umeri la Smith  
**Bottom-right** `back-extension` — Extensii lombare la scaun roman / Extensii lombare la 45 grade (+7 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Trap-bar shrug, FRONT VIEW, standing inside a hex bar: shoulders down vs shrugged up. RED back / lats.
Top-right: Cable shrug, FRONT VIEW, standing at a low cable with a straight bar at thighs: shoulders down vs shrugged up. RED back / lats.
Bottom-left: Machine shrug, FRONT VIEW, standing at the machine: handles down vs shrugged up. Shrug machine. RED back / lats.
Bottom-right: 45-degree back extension, SIDE VIEW, body angled on a 45-degree hyperextension bench: torso bent down over the pad vs raised to straight. RED back / lats, ORANGE hamstrings.
```

### Grid 19

**Top-left** `good-morning` — Good Morning cu bara / Good Morning la Smith (+3 variante)  
**Top-right** `good-morning-band` — Good Morning cu banda  
**Bottom-left** `good-morning-seated` — Good Morning sezand  
**Bottom-right** `rdl-single-leg` — Romanian Deadlift pe un picior / Romanian Deadlift un picior liber (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell good morning, 3/4 view, standing with bar on the shoulders: torso hinged forward at the hips vs upright. A barbell. RED back / lats, ORANGE hamstrings, glutes.
Top-right: Banded good morning, 3/4 view, standing with a band over the shoulders: torso hinged forward vs upright. A resistance band. RED back / lats, ORANGE hamstrings, glutes.
Bottom-left: Seated good morning, SIDE VIEW, seated on a bench with bar on the shoulders: torso hinged forward vs upright. A barbell. RED back / lats, ORANGE hamstrings, glutes.
Bottom-right: Single-leg RDL, 3/4 view, standing on one leg: torso hinged forward with the back leg lifting vs upright. A dumbbell or bodyweight. RED back / lats, ORANGE hamstrings, glutes.
```

### Grid 20

**Top-left** `inverted-row` — Ramat orizontal la bara / Ramat orizontal priza larga (+8 variante)  
**Top-right** `superman` — Superman extensie spate la sol  
**Bottom-left** `prone-raise` — Ridicari in Y la pronatie / Ridicari in T la pronatie  
**Bottom-right** `scapular-pullup` — Tractiuni scapulare

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Inverted row, SIDE VIEW, body hanging horizontal under a fixed bar at hip height: arms straight vs chest pulled to the bar. RED back / lats, ORANGE biceps.
Top-right: Superman, SIDE VIEW, lying face-down flat on the floor: arms and legs flat vs lifted off the floor. RED back / lats.
Bottom-left: Prone Y/T raise, SIDE VIEW, lying face-down on the floor: arms hanging vs raised into a Y or T. Bodyweight or light dumbbells. RED back / lats, ORANGE shoulders.
Bottom-right: Scapular pull-up, FRONT VIEW, hanging from a pull-up bar arms straight: shoulders up vs shoulder-blades pulled down. RED back / lats.
```

### Grid 21

**Top-left** `rack-pull` — Indreptari partiale din rack  
**Top-right** `pullup-commando` — Tractiuni comando priza incrucisata  
**Bottom-left** `row-trap-bar` — Ramat cu trap bar  
**Bottom-right** `power-clean` — Aruncare la piept exploziva / Aruncare la piept din atarnare

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell rack pull, 3/4 view, standing inside a power rack with tall upright posts: bar resting on the rack pins at knee height vs pulled to lockout. RED back / lats, ORANGE hamstrings.
Top-right: Commando pull-up, FRONT VIEW, hanging from a pull-up bar gripped lengthwise: head pulled to one side then the other. RED back / lats, ORANGE biceps.
Bottom-left: Trap-bar row, 3/4 view, standing inside a hex bar bent over: bar low vs rowed to the waist. A trap bar. RED back / lats, ORANGE biceps.
Bottom-right: Barbell power clean, 3/4 view, standing: bar at the knees vs pulled explosively to the shoulders. A barbell. RED back / lats, ORANGE glutes, quads.
```

### Grid 22

**Top-left** `ohp-db` — Impins militar sezand cu gantere / Impins umeri sezand cu gantere (+3 variante)  
**Top-right** `lateral-raise-db` — Ridicari laterale / Ridicari laterale cu gantere (+5 variante)  
**Bottom-left** `lateral-raise-cable` — Ridicari laterale (cable) / Ridicari laterale la cablu (+2 variante)  
**Bottom-right** `rear-delt-machine` — Fluturari deltoid posterior / Pec Deck deltoid posterior (+2 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Seated DB shoulder press, FRONT VIEW, seated upright on a bench: dumbbells at shoulders vs pressed overhead. A pair of dumbbells. RED shoulders / delts, ORANGE triceps.
Top-right: DB lateral raise, FRONT VIEW, standing: dumbbells at sides vs raised out wide to shoulder height. A pair of dumbbells. RED shoulders / delts.
Bottom-left: Cable lateral raise, FRONT VIEW, standing at a low pulley with a single handle: arm down across the body vs raised out to the side to shoulder height. RED shoulders / delts.
Bottom-right: Reverse pec-deck, FRONT VIEW, seated chest against the pad: arms forward together vs pulled out wide to the rear. Reverse pec-deck machine. RED shoulders / delts, ORANGE back.
```

### Grid 23

**Top-left** `rear-delt-cable` — Deltoid posterior la cablu / Fluturari deltoid posterior la cablu (+3 variante)  
**Top-right** `face-pull-cable` — Face Pulls / Face Pull pe banca (+4 variante)  
**Bottom-left** `pike-pushup` — Flotari pike pentru umeri / Flotari pike lente umeri  
**Bottom-right** `wall-pike-pushup` — Flotari pike la perete umeri

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable rear delt fly, FRONT VIEW, standing at dual high cables: cables crossed in front vs pulled out wide. RED shoulders / delts, ORANGE back.
Top-right: Cable rope face pull, FRONT VIEW, standing at a cable rope set at face height: rope extended vs pulled to the face, elbows flared high. RED shoulders / delts, ORANGE back.
Bottom-left: Pike push-up, SIDE VIEW, hands and feet on the floor with hips piked high: head lowered to the floor vs arms extended. RED shoulders / delts, ORANGE triceps, chest.
Bottom-right: Wall pike push-up, SIDE VIEW, hands on the floor with feet walked up a wall: head lowered vs extended. RED shoulders / delts, ORANGE chest.
```

### Grid 24

**Top-left** `face-pull-band` — Face Pull cu banda  
**Top-right** `ohp-barbell` — Impins militar / Impins militar din pini (+3 variante)  
**Bottom-left** `push-press-barbell` — Push Press / Push Press priza smuls (+1 variante)  
**Bottom-right** `ohp-barbell-behind-neck` — Impins din spatele cefei

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Band face pull, FRONT VIEW, standing at a band anchored at head height: arms extended vs pulled to the face, elbows high. RED shoulders / delts, ORANGE back.
Top-right: Barbell overhead press, FRONT VIEW, standing inside a power rack with tall upright posts and J-hooks: bar at shoulders vs pressed overhead to lockout. RED shoulders / delts, ORANGE triceps.
Bottom-left: Barbell push press, FRONT VIEW, standing inside a power rack with tall upright posts and J-hooks: bar at shoulders with a knee dip vs driven overhead. RED shoulders / delts, ORANGE triceps, hamstrings.
Bottom-right: Barbell behind-neck press, FRONT VIEW, seated inside a power rack with tall upright posts and J-hooks: bar behind the head vs pressed overhead. RED shoulders / delts, ORANGE triceps.
```

### Grid 25

**Top-left** `z-press-barbell` — Impins sezand pe sol  
**Top-right** `bradford-press-barbell` — Impins Bradford peste cap  
**Bottom-left** `ohp-db-single` — Impins umeri un brat cu gantera / Impins umeri intr-un genunchi gantere  
**Bottom-right** `arnold-press-db` — Impins Arnold cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell Z-press, FRONT VIEW, seated on the floor legs straight inside a power rack with tall upright posts and J-hooks: bar at shoulders vs pressed overhead. RED shoulders / delts, ORANGE triceps.
Top-right: Barbell Bradford press, FRONT VIEW, seated inside a power rack with tall upright posts and J-hooks: bar at the front vs pressed just over the head behind. RED shoulders / delts, ORANGE triceps.
Bottom-left: Single-arm DB press, FRONT VIEW, standing: one dumbbell at the shoulder vs pressed overhead. One dumbbell. RED shoulders / delts, ORANGE triceps.
Bottom-right: DB Arnold press, FRONT VIEW, seated: dumbbells at the front of the shoulders palms-in vs pressed overhead rotating out. A pair of dumbbells. RED shoulders / delts, ORANGE triceps.
```

### Grid 26

**Top-left** `cuban-press-db` — Impins cuban umeri  
**Top-right** `bradford-press-db` — Impins Bradford cu gantere  
**Bottom-left** `z-press-db` — Impins sezand pe sol cu gantere  
**Bottom-right** `ohp-smith` — Impins militar la Smith / Impins militar sezand la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: DB Cuban press, FRONT VIEW, standing: dumbbells low vs externally rotated then pressed overhead. A pair of dumbbells. RED shoulders / delts.
Top-right: DB Bradford press, FRONT VIEW, seated: dumbbells in front vs pressed just over the head. A pair of dumbbells. RED shoulders / delts, ORANGE triceps.
Bottom-left: DB Z-press, FRONT VIEW, seated on the floor legs straight: dumbbells at shoulders vs pressed overhead. A pair of dumbbells. RED shoulders / delts, ORANGE triceps.
Bottom-right: Smith shoulder press, FRONT VIEW, seated on a bench under a Smith machine: bar at shoulders vs pressed overhead. RED shoulders / delts, ORANGE triceps.
```

### Grid 27

**Top-left** `ohp-smith-behind-neck` — Impins din spatele cefei la Smith  
**Top-right** `ohp-machine` — Impins militar la aparat / Impins umeri la aparat (+4 variante)  
**Bottom-left** `lateral-raise-machine` — Ridicari laterale Hammer Strength / Ridicari laterale la aparat  
**Bottom-right** `scaption-db` — Ridicari in Y umeri / Ridicari Lu pentru umeri (+4 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Smith behind-neck press, FRONT VIEW, seated on a bench under a Smith machine: bar at the base of the neck vs pressed overhead. RED shoulders / delts, ORANGE triceps.
Top-right: Machine shoulder press, FRONT VIEW, seated at the machine: handles at shoulders vs pressed overhead. Shoulder-press machine. RED shoulders / delts, ORANGE triceps.
Bottom-left: Machine lateral raise, FRONT VIEW, seated with pads against the outer arms: arms at the sides vs lifted out wide. Lateral-raise machine. RED shoulders / delts.
Bottom-right: DB scaption / Y-raise, FRONT VIEW, standing: dumbbells down vs raised diagonally forward into a Y. A pair of dumbbells. RED shoulders / delts, ORANGE back.
```

### Grid 28

**Top-left** `front-raise-db` — Ridicari frontale cu gantere / Ridicari frontale cu un brat (+4 variante)  
**Top-right** `front-raise-cable` — Ridicari frontale la cablu  
**Bottom-left** `front-raise-barbell` — Ridicari frontale cu bara  
**Bottom-right** `front-raise-plate` — Ridicari frontale cu disc

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: DB front raise, FRONT VIEW, standing: dumbbells at thighs vs raised forward to shoulder height. A pair of dumbbells. RED shoulders / delts, ORANGE biceps.
Top-right: Cable front raise, FRONT VIEW, standing at a low cable with a single handle: handle at thigh vs arm raised straight forward to shoulder height. RED shoulders / delts.
Bottom-left: Barbell front raise, FRONT VIEW, standing: bar at thighs vs raised straight forward to shoulder height. A barbell. RED shoulders / delts.
Bottom-right: Plate front raise, FRONT VIEW, standing: a round weight plate held two-handed at the hips vs raised forward to eye level. RED shoulders / delts, ORANGE biceps.
```

### Grid 29

**Top-left** `front-raise-machine` — Ridicari frontale la aparat  
**Top-right** `rear-delt-db` — Ridicari laterale aplecat gantere / Deltoid posterior sezand (+2 variante)  
**Bottom-left** `band-pull-apart` — Departare banda elastica umeri  
**Bottom-right** `landmine-press` — Impins landmine pentru umeri / Impins landmine cu un brat (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Machine front raise, FRONT VIEW, seated at the machine: arm low vs raised forward. Front-raise machine. RED shoulders / delts.
Top-right: Bent-over DB rear delt fly, 3/4 view, standing with torso bent forward: dumbbells hanging down vs raised out wide. A pair of dumbbells. RED shoulders / delts, ORANGE back.
Bottom-left: Band pull-apart, FRONT VIEW, standing: band held in front arms straight vs pulled apart to the chest. A resistance band. RED shoulders / delts, ORANGE back.
Bottom-right: Landmine press, 3/4 view, half-kneeling at a landmine: barbell end at the shoulder vs pressed up and forward. One end of a barbell anchored in a landmine. RED shoulders / delts, ORANGE triceps.
```

### Grid 30

**Top-left** `landmine-180` — Landmine 180 grade  
**Top-right** `kb-press` — Impins kettlebell rasturnat / Impins umeri un brat kettlebell  
**Bottom-left** `handstand-pushup` — Flotari in stand pe maini / Flotari in stand la perete  
**Bottom-right** `push-press-behind-neck` — Push Press din spatele cefei

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Landmine 180, 3/4 view, standing at a landmine: barbell end held at the shoulder swept in an arc across to the other side. One end of a barbell anchored in a landmine. RED shoulders / delts, ORANGE triceps.
Top-right: Kettlebell overhead press, FRONT VIEW, standing: kettlebell at the shoulder vs pressed overhead. A single kettlebell. RED shoulders / delts, ORANGE triceps.
Bottom-left: Handstand push-up, SIDE VIEW, inverted upside-down with feet against a wall: arms bent vs extended. Bodyweight. RED shoulders / delts, ORANGE triceps.
Bottom-right: Barbell behind-neck push press, FRONT VIEW, standing inside a power rack with tall upright posts and J-hooks: bar behind the head with a knee dip vs driven overhead. RED shoulders / delts, ORANGE triceps, hamstrings.
```

### Grid 31

**Top-left** `ohp-barbell-single` — Impins militar cu un brat  
**Top-right** `rotator-cuff-cable` — Rotatie externa umar la cablu / Rotatie interna umar la cablu  
**Bottom-left** `clean-and-press` — Aruncare la piept si impins  
**Bottom-right** `incline-curl-db` — Flexii inclinate cu gantere / Flexii inclinate alternative gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Single-arm barbell press, FRONT VIEW, standing: short bar at one shoulder vs pressed overhead. A barbell. RED shoulders / delts, ORANGE triceps.
Top-right: Cable shoulder rotation, FRONT VIEW, standing at a cable set at elbow height with a single handle: forearm across the body vs rotated out, elbow pinned. RED shoulders / delts.
Bottom-left: Barbell clean and press, FRONT VIEW, standing: bar at hips vs cleaned to shoulders then pressed overhead. A barbell. RED shoulders / delts, ORANGE triceps, hamstrings.
Bottom-right: Incline DB curl, SIDE VIEW, body reclined ~45 degrees lying back on an incline bench: arms hanging straight down vs curled up. A pair of dumbbells. RED biceps.
```

### Grid 32

**Top-left** `bayesian-curl` — Flexii biceps la cablu in spate  
**Top-right** `cable-curl-bar` — Flexii la cablu / Flexii la cablu cu bara dreapta (+4 variante)  
**Bottom-left** `preacher-curl-machine` — Flexii la pupitru / Flexii la pupitru la aparat  
**Bottom-right** `hammer-curl-db` — Hammer Curl / Hammer Curl in picioare cu gantere (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Bayesian cable curl, FRONT VIEW, standing at a cable set at shoulder height with a single handle: arm extended back vs curled forward. RED biceps.
Top-right: Cable curl, FRONT VIEW, standing at a low cable with a straight bar: bar at the thighs vs curled to the chest. RED biceps, ORANGE forearms.
Bottom-left: Machine preacher curl, FRONT VIEW, seated with arms over the pad: extended vs curled up. Preacher-curl machine. RED biceps.
Bottom-right: DB hammer curl, FRONT VIEW, standing: dumbbells at the thighs neutral grip vs curled to the shoulders. A pair of dumbbells. RED biceps, ORANGE forearms.
```

### Grid 33

**Top-left** `barbell-curl` — Flexii cu bara in picioare / Flexii cu bara priza larga (+8 variante)  
**Top-right** `preacher-curl-barbell` — Flexii la pupitru cu bara EZ  
**Bottom-left** `spider-curl-barbell` — Flexii spider cu bara / Flexii spider cu bara EZ  
**Bottom-right** `concentration-curl-barbell` — Flexii concentrate sezand cu bara

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell curl, FRONT VIEW, standing: bar at the thighs vs curled to the chest. A straight barbell. RED biceps, ORANGE back.
Top-right: EZ-bar preacher curl, FRONT VIEW, seated with arms over the angled pad: extended vs curled up. An EZ-bar, preacher bench. RED biceps.
Bottom-left: Barbell spider curl, SIDE VIEW, chest face-down on an incline bench: bar hanging vs curled up. An EZ-bar. RED biceps.
Bottom-right: Seated barbell concentration curl, FRONT VIEW, seated with arms between the knees: extended vs curled. A barbell. RED biceps.
```

### Grid 34

**Top-left** `db-curl` — Flexii in picioare cu gantere / Flexii alternative in picioare gantere (+3 variante)  
**Top-right** `hammer-curl-crossbody` — Hammer Curl incrucisat cu gantera  
**Bottom-left** `spider-curl-db` — Flexii spider cu gantere  
**Bottom-right** `preacher-curl-db` — Flexii la pupitru cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Standing DB curl, FRONT VIEW, standing: dumbbells at the thighs vs curled to the shoulders, palms up. A pair of dumbbells. RED biceps.
Top-right: Cross-body hammer curl, FRONT VIEW, standing: dumbbell curled across the body to the opposite shoulder vs down. A pair of dumbbells. RED biceps, ORANGE forearms.
Bottom-left: DB spider curl, SIDE VIEW, chest face-down on an incline bench: dumbbells hanging vs curled up. A pair of dumbbells. RED biceps.
Bottom-right: DB preacher curl, FRONT VIEW, seated with one arm over the pad: extended vs curled. A dumbbell, preacher bench. RED biceps.
```

### Grid 35

**Top-left** `zottman-curl` — Flexii Zottman cu gantere  
**Top-right** `concentration-curl-db` — Flexii concentrate in picioare gantere / Flexii concentrate in genunchi gantere  
**Bottom-left** `cable-curl-single` — Flexii la cablu cu un brat / Flexii la cablu incrucisate un brat  
**Bottom-right** `hammer-curl-cable` — Hammer Curl la cablu cu coarda

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Zottman curl, FRONT VIEW, standing: dumbbells curled up palms-up vs lowered palms-down rotated. A pair of dumbbells. RED biceps, ORANGE forearms.
Top-right: DB concentration curl, FRONT VIEW, seated with the elbow braced on the inner thigh: arm extended vs curled. One dumbbell. RED biceps.
Bottom-left: Single-arm cable curl, FRONT VIEW, standing at a cable with a single handle: extended vs curled. RED biceps.
Bottom-right: Cable rope hammer curl, FRONT VIEW, standing at a low cable with a rope: at the thighs neutral grip vs curled to the shoulders. RED biceps, ORANGE forearms.
```

### Grid 36

**Top-left** `cable-curl-lying` — Flexii la cablu culcat pe banca  
**Top-right** `machine-curl` — Flexii la aparat sezand  
**Bottom-left** `concentration-curl-cable` — Flexii concentrate la cablu  
**Bottom-right** `preacher-curl-cable` — Flexii la pupitru la cablu

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Lying cable curl, SIDE VIEW, body lying flat and fully horizontal on a bench at a low cable: bar at full stretch vs curled. RED biceps.
Top-right: Machine curl, FRONT VIEW, seated with arms over the pad: extended vs curled up. Seated curl machine. RED biceps.
Bottom-left: Cable concentration curl, FRONT VIEW, seated with the elbow braced on the thigh at a low cable: extended vs curled. RED biceps.
Bottom-right: Cable preacher curl, FRONT VIEW, seated with arms over a pad at a low cable: extended vs curled. A preacher bench. RED biceps.
```

### Grid 37

**Top-left** `spider-curl-cable` — Flexii spider la cablu  
**Top-right** `triceps-overhead-cable` — Extensii triceps peste cap / Extensii triceps peste cap cu coarda (+3 variante)  
**Bottom-left** `triceps-pushdown` — Extensii triceps la cablu jos / Extensii triceps la cablu bara dreapta (+4 variante)  
**Bottom-right** `cgbp` — Bench Press priza ingusta

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable spider curl, SIDE VIEW, chest face-down on an incline bench at a low cable: arms hanging vs curled up. RED biceps.
Top-right: Cable overhead triceps extension, FRONT VIEW, standing facing away from a cable rope: rope behind the head vs extended overhead. RED triceps.
Bottom-left: Cable triceps pushdown, FRONT VIEW, standing at a high pulley, elbows pinned: handle at the chest vs pressed down to the thighs. RED triceps.
Bottom-right: Close-grip bench press, SIDE VIEW, body lying flat and fully horizontal on a bench inside a power rack with tall upright posts and J-hooks: narrow grip, bar to the lower chest elbows tucked vs pressed up. RED triceps, ORANGE chest.
```

### Grid 38

**Top-left** `bench-dip` — Flotari triceps pe banca / Flotari triceps pe banca picioare jos (+1 variante)  
**Top-right** `diamond-pushup` — Flotari diamant  
**Bottom-left** `diamond-pushup-knee` — Flotari diamant pe genunchi  
**Bottom-right** `cgbp-smith` — Impins priza ingusta la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Bench dip, SIDE VIEW, hands behind on a flat bench, legs out front: hips lowered vs pressed up. RED triceps, ORANGE chest.
Top-right: Diamond push-up, SIDE VIEW, body horizontal in a plank on the floor, hands in a diamond under the chest: lowered vs pressed up. RED triceps, ORANGE chest.
Bottom-left: Knee diamond push-up, SIDE VIEW, body angled with knees on the floor, hands in a diamond: chest lowered vs pressed up. RED triceps, ORANGE chest.
Bottom-right: Smith close-grip bench, SIDE VIEW, body lying flat and fully horizontal on a bench under a Smith machine: narrow grip, bar to the lower chest vs pressed up. RED triceps, ORANGE chest.
```

### Grid 39

**Top-left** `triceps-press-machine` — Impins triceps la aparat  
**Top-right** `skullcrusher-barbell` — Extensii triceps culcat cu bara / Extensii triceps culcat cu bara EZ (+1 variante)  
**Bottom-left** `triceps-overhead-barbell` — Extensii triceps sezand cu bara / Extensii triceps sezand cu bara EZ (+1 variante)  
**Bottom-right** `jm-press` — Impins JM triceps

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Triceps press machine, FRONT VIEW, seated at the machine: handles at the chest vs pressed down-forward. RED triceps, ORANGE chest.
Top-right: Skullcrusher, SIDE VIEW, body lying flat and fully horizontal on a bench: bar lowered to the forehead vs extended up. An EZ-bar. RED triceps.
Bottom-left: EZ-bar overhead triceps extension, FRONT VIEW, seated: bar behind the head vs extended overhead. An EZ-bar. RED triceps.
Bottom-right: JM press, SIDE VIEW, body lying flat and fully horizontal on a bench: bar lowered toward the neck elbows tucked vs pressed up. A barbell. RED triceps, ORANGE chest.
```

### Grid 40

**Top-left** `triceps-kickback-cable` — Extensii triceps inapoi cu coarda / Extensii triceps inapoi cu un brat  
**Top-right** `skullcrusher-db` — Extensii triceps culcat cu gantere / Extensii triceps culcat incrucisat (+3 variante)  
**Bottom-left** `triceps-overhead-db` — Extensii triceps peste cap doua maini / Extensii triceps peste cap un brat sezand (+2 variante)  
**Bottom-right** `triceps-kickback-db` — Extensii triceps inapoi in picioare / Extensii triceps inapoi sprijinit

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable triceps kickback, 3/4 view, standing with torso bent forward at a low cable: elbow high, forearm down vs extended back. RED triceps.
Top-right: DB lying triceps extension, SIDE VIEW, body lying flat and fully horizontal on a bench: dumbbells lowered beside the head vs extended up. A pair of dumbbells. RED triceps, ORANGE chest.
Bottom-left: DB overhead triceps extension, FRONT VIEW, seated: one dumbbell two-handed behind the head vs extended overhead. RED triceps.
Bottom-right: DB triceps kickback, 3/4 view, standing with torso bent forward: elbow high, forearm down vs extended straight back. A dumbbell. RED triceps.
```

### Grid 41

**Top-left** `triceps-dip` — Flotari la paralele triceps / Flotari la paralele triceps cu greutate  
**Top-right** `triceps-dip-machine` — Flotari triceps la aparat  
**Bottom-left** `wrist-curl-barbell` — Flexii incheietura cu bara sezand sus / Flexii incheietura cu bara sezand jos (+1 variante)  
**Bottom-right** `wrist-curl-db` — Flexii incheietura gantere palme sus / Flexii incheietura gantere palme jos

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Triceps dip, 3/4 view, torso upright between parallel dip bars: lowered vs pressed up. Parallel dip bars. RED triceps, ORANGE chest.
Top-right: Triceps dip machine, FRONT VIEW, seated upright at the machine: handles pressed down vs up. Dip machine. RED triceps, ORANGE chest.
Bottom-left: Barbell wrist curl, FRONT VIEW, seated with forearms on the thighs palms-up: hands dropped vs curled up. A barbell. RED forearms.
Bottom-right: DB wrist curl, FRONT VIEW, seated with forearms on the thighs palms-up: hands dropped vs curled up. A pair of dumbbells. RED forearms.
```

### Grid 42

**Top-left** `reverse-wrist-curl-barbell` — Flexii inverse incheietura cu bara  
**Top-right** `reverse-wrist-curl-db` — Flexii inverse incheietura cu gantere  
**Bottom-left** `reverse-wrist-curl-cable` — Flexii inverse incheietura la cablu / Extensii incheietura la cablu  
**Bottom-right** `wrist-curl-cable` — Flexii incheietura la cablu

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell reverse wrist curl, FRONT VIEW, seated with forearms on the thighs palms-down: knuckles dropped vs curled up. A barbell. RED forearms.
Top-right: DB reverse wrist curl, FRONT VIEW, seated with forearms on the thighs palms-down: knuckles dropped vs curled up. A pair of dumbbells. RED forearms.
Bottom-left: Cable reverse wrist curl, FRONT VIEW, seated at a low cable, forearms on the thighs palms-down: knuckles dropped vs curled up. RED forearms.
Bottom-right: Cable wrist curl, FRONT VIEW, seated at a low cable, forearms on the thighs palms-up: hands dropped vs curled up. RED forearms.
```

### Grid 43

**Top-left** `wrist-roller` — Rulator incheietura antebrate  
**Top-right** `plate-pinch` — Mentinere prindere disc antebrate  
**Bottom-left** `farmers-walk` — Mers fermierului cu gantere / Mers fermierului cu trap bar (+3 variante)  
**Bottom-right** `dead-hang` — Atarnare cu prosop la bara / Atarnare pasiva la bara (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Wrist roller, FRONT VIEW, standing with arms out front: winding a weight up on a cord vs unwound. A wrist-roller bar with a hanging weight. RED forearms.
Top-right: Plate pinch, FRONT VIEW, standing: weight plates pinched between the fingers and thumb, held at the side. Two weight plates. RED forearms.
Bottom-left: Farmer carry, FRONT VIEW, standing tall walking: heavy weights held at the sides. A pair of dumbbells or kettlebells. RED forearms, ORANGE back.
Bottom-right: Dead hang, FRONT VIEW, hanging from a pull-up bar by the hands, arms straight. RED forearms.
```

### Grid 44

**Top-left** `gripper` — Strangere gripper antebrate  
**Top-right** `reverse-curl-barbell` — Flexii inverse cu bara / Flexii inverse cu bara EZ (+1 variante)  
**Bottom-left** `reverse-curl-cable` — Flexii inverse la cablu  
**Bottom-right** `reverse-curl-db` — Flexii inverse cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Hand gripper, FRONT VIEW, standing: a spring gripper open vs squeezed shut in one hand. A hand gripper. RED forearms.
Top-right: Barbell reverse curl, FRONT VIEW, standing, overhand grip: bar at the thighs vs curled to the chest. A barbell. RED forearms, ORANGE biceps.
Bottom-left: Cable reverse curl, FRONT VIEW, standing at a low cable, overhand grip: bar at the thighs vs curled to the chest. RED forearms, ORANGE biceps.
Bottom-right: DB reverse curl, FRONT VIEW, standing, overhand grip: dumbbells at the thighs vs curled to the chest. A pair of dumbbells. RED forearms, ORANGE biceps.
```

### Grid 45

**Top-left** `pinwheel-curl` — Flexii pinwheel cu gantere  
**Top-right** `plate-curl` — Flexii cu disc  
**Bottom-left** `sledgehammer` — Parghie cu baros antebrate  
**Bottom-right** `fat-grip-hold` — Mentinere priza groasa antebrate / Flexii cu bara priza groasa (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Pinwheel curl, FRONT VIEW, standing: dumbbell neutral grip curled up across to the opposite chest vs down. A dumbbell. RED forearms, ORANGE biceps.
Top-right: Plate curl, FRONT VIEW, standing: a weight plate pinched and curled up vs down. One weight plate. RED forearms.
Bottom-left: Sledgehammer lever, FRONT VIEW, standing: a hammer held at the end of the handle, raised vertical vs levered down. A sledgehammer. RED forearms.
Bottom-right: Fat-grip hold, FRONT VIEW, standing: thick-handled weights gripped and held at the sides. Thick-grip dumbbells. RED forearms, ORANGE biceps.
```

### Grid 46

**Top-left** `leg-press` — Presa de picioare / Presa de picioare la 45 grade (+3 variante)  
**Top-right** `leg-extension` — Extensii cvadriceps / Extensii cvadriceps cu tempo (+1 variante)  
**Bottom-left** `squat-back` — Genuflexiuni cu bara sus / Genuflexiuni cu bara jos (+6 variante)  
**Bottom-right** `squat-front` — Genuflexiuni frontale

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Leg press, 3/4 view, seated on a 45-degree leg-press machine: knees bent toward the chest vs legs extended pushing the sled. RED quads.
Top-right: Leg extension, FRONT VIEW, seated with shins under the pad: knees bent vs legs extended straight. Leg-extension machine. RED quads.
Bottom-left: Barbell back squat, FRONT VIEW, standing in a squat rack with tall upright posts and J-hooks: bar on the upper back, deep squat vs stood up to lockout. RED quads, ORANGE back, glutes.
Bottom-right: Front squat, FRONT VIEW, standing in a squat rack with tall upright posts and J-hooks: bar racked on the front shoulders elbows high, deep squat vs stood up. RED quads.
```

### Grid 47

**Top-left** `squat-box` — Genuflexiuni pe cutie  
**Top-right** `squat-zercher` — Genuflexiuni Zercher  
**Bottom-left** `squat-overhead` — Genuflexiuni deasupra capului  
**Bottom-right** `squat-smith` — Genuflexiuni la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Box squat, FRONT VIEW, standing in a squat rack with tall upright posts and J-hooks, a box behind: bar on the back, sitting back to the box vs stood up. RED quads, ORANGE back.
Top-right: Zercher squat, FRONT VIEW, standing in a squat rack with tall upright posts: bar held in the crooks of the elbows, deep squat vs stood up. RED quads, ORANGE back.
Bottom-left: Overhead squat, FRONT VIEW, standing: bar locked out overhead, deep squat vs stood up. A barbell, arms overhead. RED quads, ORANGE shoulders, back.
Bottom-right: Smith back squat, FRONT VIEW, standing under a Smith machine: bar on the back, deep squat vs stood up. RED quads.
```

### Grid 48

**Top-left** `squat-smith-front` — Genuflexiuni frontale la Smith  
**Top-right** `hack-squat` — Genuflexiuni hack la aparat / Genuflexiuni hack verticale  
**Bottom-left** `hack-squat-reverse` — Genuflexiuni hack inverse  
**Bottom-right** `belt-squat` — Genuflexiuni la belt squat

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Smith front squat, FRONT VIEW, standing under a Smith machine: bar on the front of the shoulders, deep squat vs stood up. RED quads.
Top-right: Hack squat, 3/4 view, back on the angled pad of a hack-squat machine: deep squat vs stood up. RED quads, ORANGE glutes.
Bottom-left: Reverse hack squat, 3/4 view, facing the pad of a hack-squat machine, hips back: deep squat vs stood up. RED quads.
Bottom-right: Belt squat, FRONT VIEW, standing on the platforms of a belt-squat machine, weight hung from a hip belt: deep squat vs stood up. RED quads.
```

### Grid 49

**Top-left** `pendulum-squat` — Genuflexiuni pendulum  
**Top-right** `goblet-squat` — Genuflexiuni goblet / Genuflexiuni goblet kettlebell  
**Bottom-left** `db-squat` — Genuflexiuni cu gantere  
**Bottom-right** `db-sumo-squat` — Genuflexiuni sumo cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Pendulum squat, 3/4 view, shoulders under the pads of a pendulum-squat machine: deep squat vs stood up. RED quads.
Top-right: Goblet squat, FRONT VIEW, standing holding one weight at the chest: deep squat vs stood up. One kettlebell or dumbbell. RED quads, ORANGE glutes.
Bottom-left: DB squat, FRONT VIEW, standing: dumbbells at the shoulders or sides, deep squat vs stood up. A pair of dumbbells. RED quads.
Bottom-right: DB sumo squat, FRONT VIEW, standing wide stance: one dumbbell hanging between the legs, deep squat vs stood up. RED quads.
```

### Grid 50

**Top-left** `bulgarian-split-squat` — Genuflexiuni bulgaresti  
**Top-right** `pistol-squat-assisted` — Genuflexiuni pe un picior asistate  
**Bottom-left** `leg-press-single` — Presa de picioare pe un picior  
**Bottom-right** `lunge-db` — Fandari cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Bulgarian split squat, 3/4 view, standing with the rear foot elevated on a bench: front knee bent deep vs stood up. A pair of dumbbells. RED quads.
Top-right: Assisted pistol squat, 3/4 view, standing on one leg holding a rail: one leg out front, deep squat vs standing. RED quads.
Bottom-left: Single-leg leg press, 3/4 view, seated on a 45-degree leg-press machine with one foot on the sled: knee bent vs extended. RED quads.
Bottom-right: Forward lunge, 3/4 view, standing: one leg forward in a deep lunge vs standing. A pair of dumbbells. RED quads.
```

### Grid 51

**Top-left** `lunge-walking` — Fandari mers / Fandari mers pentru fese  
**Top-right** `lunge-reverse` — Fandari inapoi / Fandari inapoi cu deficit (+2 variante)  
**Bottom-left** `lunge-lateral` — Fandari laterale  
**Bottom-right** `lunge-curtsy` — Fandari curtsy

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Walking lunge, 3/4 view, standing: stepping forward into a deep lunge vs standing tall to the next step. A pair of dumbbells. RED quads, ORANGE hamstrings.
Top-right: Reverse lunge, 3/4 view, standing: stepping back into a deep lunge vs standing tall. A pair of dumbbells. RED quads, ORANGE hamstrings, glutes.
Bottom-left: Lateral lunge, 3/4 view, standing: stepping wide to one side, that knee bent vs standing centered. A dumbbell. RED quads.
Bottom-right: Curtsy lunge, 3/4 view, standing: one leg crossing behind into a bent lunge vs standing. A dumbbell. RED quads.
```

### Grid 52

**Top-left** `lunge-barbell` — Fandari cu bara / Fandari cu bara safety  
**Top-right** `leg-extension-single` — Extensii cvadriceps pe un picior  
**Bottom-left** `leg-extension-cable` — Extensii cvadriceps la cablu  
**Bottom-right** `sissy-squat-machine` — Genuflexiuni sissy la aparat

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell lunge, 3/4 view, standing with bar on the shoulders: one leg forward in a deep lunge vs standing. A barbell. RED quads, ORANGE glutes.
Top-right: Single-leg leg extension, FRONT VIEW, seated with one shin under the pad: knee bent vs extended. Leg-extension machine. RED quads.
Bottom-left: Cable leg extension, FRONT VIEW, seated at a low cable with an ankle strap: knee bent vs leg extended straight. RED quads.
Bottom-right: Sissy squat machine, SIDE VIEW, knees driven forward, torso leaning back vs upright. Sissy-squat station. RED quads.
```

### Grid 53

**Top-left** `leg-extension-band` — Extensii cvadriceps cu banda  
**Top-right** `sissy-squat` — Genuflexiuni sissy fara greutate  
**Bottom-left** `step-up-db` — Pasire pe banca cu gantere / Pasire pe banca focus fese  
**Bottom-right** `step-up-barbell` — Pasire pe banca cu bara

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Banded leg extension, FRONT VIEW, seated with a band on the ankle: knee bent vs extended. A resistance band. RED quads.
Top-right: Sissy squat, SIDE VIEW, standing on the toes holding a support, knees forward torso leaning back vs upright. RED quads.
Bottom-left: DB step-up, 3/4 view, standing: foot on a box, driving up to stand on it vs foot down. A pair of dumbbells. RED quads, ORANGE hamstrings.
Bottom-right: Barbell step-up, 3/4 view, standing with bar on the back: foot on a box, driving up to stand on it vs foot down. RED quads.
```

### Grid 54

**Top-left** `pistol-squat` — Genuflexiuni pe un picior  
**Top-right** `wall-sit` — Sezut la perete static  
**Bottom-left** `bodyweight-squat` — Genuflexiuni cu greutatea corpului  
**Bottom-right** `split-squat-smith` — Genuflexiuni split la Smith / Genuflexiuni bulgaresti la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Pistol squat, 3/4 view, standing on one leg, the other straight out front: deep single-leg squat vs standing. Bodyweight. RED quads.
Top-right: Wall sit, SIDE VIEW, back against a wall, knees bent to 90 degrees holding the position. Bodyweight. RED quads.
Bottom-left: Bodyweight squat, FRONT VIEW, standing, arms forward: deep squat vs stood up. Bodyweight. RED quads.
Bottom-right: Smith split squat, 3/4 view, standing under a Smith machine with the rear foot on a bench: front knee bent deep vs stood up. RED quads, ORANGE glutes.
```

### Grid 55

**Top-left** `rdl-barbell` — Romanian Deadlift / Indreptari cu picioare drepte (+7 variante)  
**Top-right** `leg-curl-lying` — Flexii femurale / Flexii femurale pe un picior (+1 variante)  
**Bottom-left** `deadlift-conventional` — Indreptari clasice  
**Bottom-right** `rdl-smith` — Romanian Deadlift la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Barbell Romanian deadlift, 3/4 view, standing: bar at thighs, hips hinged back knees soft vs upright. A barbell. RED hamstrings, ORANGE back, glutes.
Top-right: Lying leg curl, SIDE VIEW, lying face-down flat on a lying leg-curl machine with an ankle pad: legs straight vs heels curled to the glutes. RED hamstrings.
Bottom-left: Conventional deadlift, 3/4 view, standing: bar on the floor, hips low vs stood up to lockout. A barbell on the floor. RED hamstrings, ORANGE back.
Bottom-right: Smith RDL, 3/4 view, standing under a Smith machine: bar at thighs, hips hinged back vs upright. RED hamstrings, ORANGE back.
```

### Grid 56

**Top-left** `ghr` — Glute-ham raise la aparat / Glute-ham raise natural  
**Top-right** `deadlift-trap-bar` — Indreptari cu trap bar / Romanian Deadlift cu trap bar  
**Bottom-left** `rdl-db` — Romanian Deadlift cu gantere / Romanian Deadlift B-stance gantere (+3 variante)  
**Bottom-right** `kb-swing` — Balans cu kettlebell

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Glute-ham raise, SIDE VIEW, body on a glute-ham developer (GHD) bench: torso down horizontal vs raised to upright. RED hamstrings.
Top-right: Trap-bar deadlift, 3/4 view, standing inside a hex bar: hips low vs stood up to lockout. A trap bar on the floor. RED hamstrings, ORANGE back, glutes.
Bottom-left: DB Romanian deadlift, 3/4 view, standing: dumbbells at thighs, hips hinged back knees soft vs upright. A pair of dumbbells. RED hamstrings, ORANGE back, glutes.
Bottom-right: Kettlebell swing, 3/4 view, standing: kettlebell between the legs hinged back vs swung up to chest height. One kettlebell. RED hamstrings, ORANGE back.
```

### Grid 57

**Top-left** `leg-curl-seated` — Flexii femurale sezand  
**Top-right** `leg-curl-standing` — Flexii femurale in picioare  
**Bottom-left** `leg-curl-cable` — Flexii femurale la cablu  
**Bottom-right** `leg-curl-band` — Flexii femurale cu banda

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Seated leg curl, 3/4 view, seated on a leg-curl machine with a thigh pad: legs straight out vs curled down under the pad. RED hamstrings.
Top-right: Standing leg curl, 3/4 view, standing at a leg-curl machine: one leg straight vs heel curled up to the glute. RED hamstrings.
Bottom-left: Cable leg curl, SIDE VIEW, lying flat at a low cable with an ankle strap: leg straight vs heel curled in. RED hamstrings.
Bottom-right: Banded leg curl, SIDE VIEW, lying flat with a band on the ankle: leg straight vs heel curled in. A resistance band. RED hamstrings.
```

### Grid 58

**Top-left** `nordic-curl` — Flexii nordice femurale / Flexii nordice femurale asistate (+4 variante)  
**Top-right** `wall-hip-hinge` — Indoire sold la perete  
**Bottom-left** `hip-thrust-barbell` — Hip Thrust / Hip Thrust cu pauza (+8 variante)  
**Bottom-right** `hip-thrust-single` — Hip Thrust pe un picior

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Nordic curl, SIDE VIEW, kneeling with ankles anchored under a pad: torso upright vs lowered slowly toward the floor. RED hamstrings.
Top-right: Wall hip hinge, 3/4 view, standing facing away from a wall: hips pushed back to tap the wall vs standing upright. Bodyweight. RED hamstrings.
Bottom-left: Barbell hip thrust, SIDE VIEW, upper back on a bench with a bar across the hips: hips down vs driven up to lockout. A barbell. RED glutes, ORANGE hamstrings.
Bottom-right: Single-leg hip thrust, SIDE VIEW, upper back on a bench, one foot planted: hips down vs driven up. Bodyweight or a dumbbell. RED glutes, ORANGE hamstrings.
```

### Grid 59

**Top-left** `pull-through-cable` — Trecere printre picioare la cablu  
**Top-right** `pull-through-band` — Trecere printre picioare cu banda  
**Bottom-left** `hip-thrust-smith` — Hip Thrust la Smith / Hip Thrust un picior la Smith (+1 variante)  
**Bottom-right** `hip-thrust-machine` — Aparat glute drive pentru fese / Hip Thrust la belt squat (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Cable pull-through, 3/4 view, standing facing away from a low cable rope: rope between the legs, hips hinged back vs stood up squeezing. RED glutes, ORANGE hamstrings, back.
Top-right: Banded pull-through, 3/4 view, standing facing away from a band anchored low: band between the legs, hips hinged back vs stood up squeezing. RED glutes, ORANGE hamstrings, back.
Bottom-left: Smith hip thrust, SIDE VIEW, upper back on a bench under a Smith machine, bar across the hips: hips down vs driven up. RED glutes, ORANGE hamstrings.
Bottom-right: Glute-drive machine, SIDE VIEW, seated on a glute-drive hip-thrust machine: hips down vs driven up against the lever. RED glutes, ORANGE hamstrings.
```

### Grid 60

**Top-left** `hip-thrust-db` — Hip Thrust cu gantera  
**Top-right** `glute-bridge-barbell` — Punte de fese cu bara  
**Bottom-left** `glute-bridge-db` — Punte de fese cu gantere / Punte de fese cu disc  
**Bottom-right** `frog-pump` — Punte fese cu picioarele departate / Punte fese picioare departate gantera

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: DB hip thrust, SIDE VIEW, upper back on a bench, a dumbbell across the hips: hips down vs driven up. RED glutes, ORANGE hamstrings.
Top-right: Barbell glute bridge, SIDE VIEW, lying flat on the floor, a bar across the hips: down vs bridged up. RED glutes, ORANGE hamstrings.
Bottom-left: DB glute bridge, SIDE VIEW, lying flat on the floor, a dumbbell on the hips: down vs bridged up. RED glutes, ORANGE hamstrings.
Bottom-right: Frog pump, SIDE VIEW, lying flat on the floor, soles together knees out: hips down vs bridged up. Bodyweight or a dumbbell. RED glutes.
```

### Grid 61

**Top-left** `glute-bridge-band` — Punte de fese cu banda  
**Top-right** `glute-kickback-cable` — Extensii sold pentru fese la cablu / Extensie sold la cablu (+1 variante)  
**Bottom-left** `glute-kickback-machine` — Extensii sold pentru fese aparat  
**Bottom-right** `hip-abduction-cable` — Abductie sold la cablu in picioare

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Banded glute bridge, SIDE VIEW, lying flat on the floor, a loop band around the knees: hips down vs bridged up. RED glutes, ORANGE hamstrings.
Top-right: Cable glute kickback, 3/4 view, standing at a low cable with an ankle strap: leg forward vs driven straight back. RED glutes, ORANGE hamstrings.
Bottom-left: Glute kickback machine, 3/4 view, standing with a foot on the pad: leg forward vs driven straight back. Glute-kickback machine. RED glutes.
Bottom-right: Cable hip abduction, FRONT VIEW, standing at a low cable with an ankle strap: leg in vs swept out to the side. RED glutes.
```

### Grid 62

**Top-left** `hip-abduction-machine` — Abductie sold la aparat  
**Top-right** `sumo-deadlift` — Indreptari sumo / Indreptari romanesti sumo  
**Bottom-left** `sumo-deadlift-db` — Indreptari sumo cu gantere  
**Bottom-right** `sumo-deadlift-smith` — Indreptari sumo la Smith

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Hip abduction machine, FRONT VIEW, seated on a hip-abduction machine: knees together vs pushed out wide against the pads. RED glutes.
Top-right: Sumo deadlift, 3/4 view, standing wide stance, hands inside the knees: hips low vs stood up to lockout. A barbell on the floor. RED glutes, ORANGE hamstrings, back.
Bottom-left: DB sumo deadlift, 3/4 view, standing wide stance, a dumbbell between the legs: hips low vs stood up. One dumbbell. RED glutes, ORANGE hamstrings, back.
Bottom-right: Smith sumo deadlift, 3/4 view, standing wide stance under a Smith machine: hips low vs stood up. RED glutes, ORANGE hamstrings, back.
```

### Grid 63

**Top-left** `sumo-deadlift-band` — Indreptari sumo cu banda  
**Top-right** `cossack-squat` — Genuflexiuni cazac laterale  
**Bottom-left** `glute-bridge-single` — Punte de fese pe un picior / Punte fese un picior ridicat (+1 variante)  
**Bottom-right** `glute-bridge` — Punte de fese fara greutate / Punte de fese cu pasire (+1 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Banded sumo deadlift, 3/4 view, standing wide stance over a band: hips low vs stood up. RED glutes, ORANGE hamstrings, back.
Top-right: Cossack squat, 3/4 view, standing wide stance: weight shifted into one deep bent leg, the other straight vs centered. Bodyweight or a weight. RED glutes, ORANGE hamstrings, quads.
Bottom-left: Single-leg glute bridge, SIDE VIEW, lying flat on the floor, one foot planted: hips down vs bridged up. Bodyweight. RED glutes, ORANGE hamstrings.
Bottom-right: Glute bridge, SIDE VIEW, lying flat on the floor: hips down vs bridged up. Bodyweight. RED glutes, ORANGE hamstrings.
```

### Grid 64

**Top-left** `donkey-kick` — Extensie sold in patrupedie / Lovitura de magar pentru fese  
**Top-right** `fire-hydrant` — Abductie sold in patrupedie  
**Bottom-left** `clamshell` — Scoica pentru fese cu banda  
**Bottom-right** `calf-standing` — Ridicari pe varfuri / Ridicari pe varfuri in picioare aparat (+5 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Donkey kick, SIDE VIEW, on hands and knees: one bent leg driven up behind vs down. Bodyweight, quadruped. RED glutes.
Top-right: Fire hydrant, 3/4 view, on hands and knees: one bent knee lifted out to the side vs down. Bodyweight, quadruped. RED glutes.
Bottom-left: Clamshell, SIDE VIEW, side-lying knees bent: top knee down vs opened up against a band. A loop band. RED glutes.
Bottom-right: Standing calf raise, 3/4 view, standing with shoulders under the pads: heels down vs pressed up onto the toes. Standing calf-raise machine. RED calves.
```

### Grid 65

**Top-left** `calf-leg-press` — Ridicari pe varfuri la presa  
**Top-right** `calf-hack` — Ridicari pe varfuri la hack squat  
**Bottom-left** `calf-standing-db` — Ridicari pe varfuri in picioare gantere  
**Bottom-right** `calf-standing-barbell` — Ridicari pe varfuri in picioare cu bara

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Calf raise on the leg press, 3/4 view, seated on a leg-press machine, balls of the feet on the sled: toes pointed vs flexed. RED calves.
Top-right: Calf raise on a hack squat, 3/4 view, on a hack-squat machine, balls of the feet on the platform: heels down vs up. RED calves.
Bottom-left: Standing DB calf raise, 3/4 view, standing, balls of the feet on a step: dumbbells at the sides, heels down vs up onto the toes. A pair of dumbbells. RED calves.
Bottom-right: Standing barbell calf raise, 3/4 view, standing with bar on the back, balls of the feet on a step: heels down vs up onto the toes. RED calves.
```

### Grid 66

**Top-left** `calf-seated` — Ridicari pe varfuri sezand aparat / Ridicari pe varfuri sezand un picior (+1 variante)  
**Top-right** `calf-seated-db` — Ridicari pe varfuri sezand gantere / Ridicari pe varfuri sezand cu disc  
**Bottom-left** `calf-seated-barbell` — Ridicari pe varfuri sezand cu bara  
**Bottom-right** `calf-donkey` — Ridicari pe varfuri donkey / Ridicari pe varfuri donkey la Smith (+3 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Seated calf raise, 3/4 view, seated with knees under the pad: heels down vs pressed up onto the toes. Seated calf-raise machine. RED calves.
Top-right: Seated DB/plate calf raise, 3/4 view, seated with a weight on the knees: heels down vs up onto the toes. A dumbbell or plate on the knees. RED calves.
Bottom-left: Seated barbell calf raise, 3/4 view, seated with a bar across bent knees: heels down vs pressed up onto the toes. A barbell. RED calves.
Bottom-right: Donkey calf raise, SIDE VIEW, bent at the hips with weight on the lower back: heels down vs up onto the toes. Donkey-calf machine or partner over the hips. RED calves.
```

### Grid 67

**Top-left** `tibialis-raise` — Ridicari tibialis / Ridicari tibialis in picioare (+1 variante)  
**Top-right** `tibialis-cable` — Ridicari tibialis la cablu  
**Bottom-left** `tibialis-band` — Ridicari tibialis cu banda  
**Bottom-right** `tibialis-db` — Ridicari tibialis cu gantere

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Tibialis raise, SIDE VIEW, standing with the back against a wall, heels planted: toes lifted up toward the shins vs down. Bodyweight. RED calves.
Top-right: Cable tibialis raise, SIDE VIEW, seated against a wall with a low cable strap on the toes: toes lifted up toward the shins vs down. RED calves.
Bottom-left: Banded tibialis raise, SIDE VIEW, seated with a resistance band on the toes: toes pulled up vs down. RED calves.
Bottom-right: DB tibialis raise, SIDE VIEW, seated with a dumbbell on the toes: lifted up vs down. One dumbbell. RED calves.
```

### Grid 68

**Top-left** `calf-standing-bodyweight` — Ridicari pe varfuri fara greutate / Ridicari pe varfuri pe un picior (+3 variante)  
**Top-right** `plank` — Plank  
**Bottom-left** `side-plank` — Plank lateral / Plank lateral cu coborare sold  
**Bottom-right** `plank-dynamic` — Plank cu atingere umar / Plank in flotare (+2 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Standing bodyweight calf raise, 3/4 view, standing on a step, heels hanging off: dropped down vs lifted onto the toes. Bodyweight. RED calves.
Top-right: Front plank, SIDE VIEW, body in a straight rigid horizontal line on the forearms on the floor. RED core / abs, ORANGE shoulders, glutes.
Bottom-left: Side plank, SIDE VIEW, body in a straight line on one forearm on the floor: hips up vs the held position. RED core / abs, ORANGE shoulders, glutes.
Bottom-right: Dynamic plank, SIDE VIEW, body horizontal in a high plank on the floor: one hand tapping the opposite shoulder vs both planted. RED core / abs, ORANGE shoulders, triceps.
```

### Grid 69

**Top-left** `copenhagen-plank` — Plank Copenhaga (adductori)  
**Top-right** `pallof-cable` — Anti-rotatie Pallof la cablu / Anti-rotatie Pallof in genunchi  
**Bottom-left** `pallof-band` — Anti-rotatie Pallof cu banda  
**Bottom-right** `woodchop-cable` — Taietura de lemn la cablu sus-jos / Taietura de lemn la cablu jos-sus

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Copenhagen plank, SIDE VIEW, side plank with the top leg on a bench: hips up vs held. Bodyweight. RED core / abs, ORANGE glutes, hamstrings.
Top-right: Cable Pallof press, 3/4 view, standing side-on to a cable at chest height with a single handle: hands at the chest vs pressed straight out resisting rotation. RED core / abs, ORANGE shoulders, glutes.
Bottom-left: Banded Pallof press, 3/4 view, standing side-on to a band anchored at chest height: hands at the chest vs pressed straight out resisting rotation. RED core / abs, ORANGE shoulders.
Bottom-right: Cable woodchop, 3/4 view, standing at a cable with a single handle: handle pulled diagonally across the body high to low vs the start. RED core / abs, ORANGE shoulders, back.
```

### Grid 70

**Top-left** `woodchop-medball` — Taietura de lemn cu minge medicinala  
**Top-right** `dead-bug` — Dead bug (gandac mort) / Dead bug cu banda  
**Bottom-left** `bird-dog` — Bird dog (caine de vanatoare) / Bird dog cu banda  
**Bottom-right** `hollow-hold` — Mentinere corp scobit / Balansare corp scobit

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Med-ball woodchop, 3/4 view, standing: a medicine ball swung diagonally from high to low across the body. A medicine ball. RED core / abs, ORANGE shoulders.
Top-right: Dead bug, SIDE VIEW, lying on the back on the floor: opposite arm and leg extended vs tucked. Bodyweight. RED core / abs, ORANGE shoulders.
Bottom-left: Bird dog, SIDE VIEW, on hands and knees: opposite arm and leg extended vs tucked. Bodyweight, quadruped. RED core / abs, ORANGE glutes, shoulders.
Bottom-right: Hollow hold, SIDE VIEW, lying on the back on the floor: arms and legs lifted into a banana shape. Bodyweight. RED core / abs.
```

### Grid 71

**Top-left** `reverse-crunch` — Crunch invers abdomen / Crunch invers pe banca inclinata  
**Top-right** `ab-rollout` — Amestecare in oala cu minge fitness / Rulare cu roata abdomen (+1 variante)  
**Bottom-left** `rollout-barbell` — Rulare cu bara abdomen  
**Bottom-right** `hanging-leg-raise` — Ridicari picioare la bara / Ridicari genunchi la bara (+2 variante)

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Reverse crunch, SIDE VIEW, lying on the back on the floor: knees pulled to the chest vs legs lowered. Bodyweight. RED core / abs.
Top-right: Ab-wheel rollout, SIDE VIEW, kneeling on the floor: the wheel rolled out forward vs pulled back in. An ab wheel. RED core / abs, ORANGE shoulders, back.
Bottom-left: Barbell rollout, SIDE VIEW, kneeling on the floor: a loaded bar rolled out forward vs pulled back in. A barbell. RED core / abs, ORANGE shoulders, back.
Bottom-right: Hanging leg raise, SIDE VIEW, hanging from a pull-up bar: legs down vs raised straight to the bar. RED core / abs, ORANGE forearms, back.
```

### Grid 72

**Top-left** `captains-chair-raise` — Ridicari genunchi la scaun roman / Ridicari picioare la scaun roman  
**Top-right** `l-sit` — Mentinere L-sit la bare paralele / Mentinere L-sit la sol  
**Bottom-left** `russian-twist` — Rotiri ruse la cablu / Rotiri ruse cu minge medicinala (+1 variante)  
**Bottom-right** `side-bend` — Indoiri laterale la cablu / Indoiri laterale cu disc

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Captain chair raise, SIDE VIEW, forearms on the pads of a captain-chair frame, back supported: legs down vs raised to 90 degrees. RED core / abs.
Top-right: L-sit, SIDE VIEW, supported on the hands on parallel bars or the floor: legs held straight out in an L. RED core / abs, ORANGE triceps, shoulders.
Bottom-left: Russian twist, 3/4 view, seated leaning back: a weight rotated from one hip to the other. A plate or medicine ball. RED core / abs, ORANGE shoulders.
Bottom-right: Side bend, FRONT VIEW, standing with a weight at one side: torso bent down to that side vs upright. A dumbbell or plate. RED core / abs.
```

### Grid 73

**Top-left** `medball-slam` — Trantire minge medicinala  
**Top-right** `situp-bench` — Abdomene pe banca inclinata negativ / Abdomene pe banca (+1 variante)  
**Bottom-left** `situp-weighted` — Abdomene cu greutate  
**Bottom-right** `cable-crunch` — Crunch la cablu in genunchi / Crunch la cablu in picioare

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Med-ball slam, 3/4 view, standing: a ball raised overhead vs slammed down to the floor. A medicine ball. RED core / abs, ORANGE shoulders, back.
Top-right: Decline bench sit-up, SIDE VIEW, body head-down anchored on a decline bench: torso down vs curled up. RED core / abs.
Bottom-left: Weighted sit-up, SIDE VIEW, lying on the floor, a plate held at the chest: torso down vs curled up. RED core / abs.
Bottom-right: Cable crunch, 3/4 view, kneeling at a cable rope: rope behind the head, torso crunched down vs upright. RED core / abs.
```

### Grid 74

**Top-left** `v-up` — Pliere in V abdomen  
**Top-right** `heel-tap` — Atingeri calcaie abdomen  
**Bottom-left** `bicycle-crunch` — Crunch bicicleta abdomen  
**Bottom-right** `ball-crunch` — Crunch cu minge fitness

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: V-up, SIDE VIEW, lying flat on the floor: flat vs folding into a V touching the hands to the feet. Bodyweight. RED core / abs.
Top-right: Heel tap, SIDE VIEW, lying on the floor, shoulders curled: hands tapping side to side at the heels. Bodyweight. RED core / abs.
Bottom-left: Bicycle crunch, SIDE VIEW, lying on the floor: opposite elbow to knee, legs cycling. Bodyweight. RED core / abs.
Bottom-right: Stability-ball crunch, SIDE VIEW, lying back over a stability ball: torso extended vs crunched up. RED core / abs.
```

### Grid 75

**Top-left** `ball-pike` — Pliere cu minge fitness  
**Top-right** `plate-crunch` — Crunch cu disc  
**Bottom-left** `loaded-carry` — Carat cu bara la piept / Carat peste cap cu gantera  
**Bottom-right** `dragon-flag` — Dragon Flag abdomen

- [ ] generat

```text
ONE image: a 2x2 grid of 4 DIFFERENT exercises. Each cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the 4 cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Stability-ball pike, SIDE VIEW, body horizontal in a plank with feet on a stability ball: hips piked up vs flat. RED core / abs, ORANGE shoulders.
Top-right: Plate crunch, SIDE VIEW, lying on the floor, a plate held over the chest: torso crunched up vs flat. RED core / abs.
Bottom-left: Loaded carry, 3/4 view, standing tall walking: a weight carried at the front rack or overhead. A barbell or dumbbell. RED core / abs, ORANGE forearms, shoulders.
Bottom-right: Dragon flag, SIDE VIEW, lying on a flat bench gripping it overhead: body lowered straight and rigid vs raised vertical. RED core / abs, ORANGE glutes, shoulders.
```

### Grid 76

**Top-left** `windshield-wiper` — Stergatoare de parbriz abdomen  
**Top-right** `body-saw` — Plank cu alunecare

> **Pad-note:** grid final cu doar 2 exercitii (TL/TR); restul celulelor raman goale. Managerul taie doar 2 fisiere.

- [ ] generat

```text
ONE image: a 2x2 grid with 2 DIFFERENT exercises in the top row and the bottom row left empty plain charcoal. Each filled cell is a 2-panel diptych (left = bottom/stretched position, right = top/contracted position) of the SAME matte clay-grey muscular male anatomical mannequin (smooth featureless face, no hair), 3/4 front view. Thin clean divider lines between the cells AND between the 2 panels inside each cell. Plain dark charcoal background, soft studio light. Muscle overlay: RED = primary muscle, ORANGE = secondary, rest plain grey. ABSOLUTELY NO text, titles, exercise names, numbers, captions or labels anywhere in the image.
Top-left: Windshield wiper, SIDE VIEW, lying flat on the floor: straight legs swept side to side. Bodyweight. RED core / abs, ORANGE back, forearms.
Top-right: Body saw, SIDE VIEW, body horizontal in a forearm plank on sliders: sliding the body back and forward. Bodyweight. RED core / abs, ORANGE shoulders.
```

