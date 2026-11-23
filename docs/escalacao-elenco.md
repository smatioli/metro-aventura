# Escalação — São Paulo FC

Source: https://www.saopaulofc.net/esporte/futebol-masculino-profissional/
Retrieved: 2026-11-23.

The game contains a static snapshot of all 38 players listed in the official men's first-team roster at retrieval time. Names, shirt numbers, position labels (the official image alt text), athlete links and original image URLs are recorded in `src/games/escalacao/players.json`. Images are stored locally in `public/games/escalacao/img/sao-paulo/`. Photo credit: São Paulo FC; the club retains the rights to its images.

The lineup uses a playful fixed 4–3–3 formation. Official central defenders fill either center-back slot; midfielders and defensive midfielders share the three midfield slots; forwards and center-forwards share the three attacking slots. The generic “Lateral” label is accepted on either flank. These are game selection rules, not claims about the club's current starting lineup or each player's preferred side. Players cannot occupy two positions simultaneously.

The roster is not refreshed automatically. No availability, injury status, match eligibility or tactical recommendation is inferred.

## Shirt numbers and portrait treatment

Numbers were checked against the ESPN Brazil squad page on 2026-11-23:
https://www.espn.com.br/futebol/time/elenco/_/id/2026/bra.sao_paulo

The ESPN athlete URL is stored in `numberSource` for each matched player. ESPN lists Cédric as 6 and Bobadilla as 21; those values take precedence over the club page's 21 and 16. André Silva was not matched in the ESPN squad, so his club number 17 is retained. The ESPN entry “André Oliveira” was not assumed to be the same athlete. The remaining 37 athletes were matched by name/identity, including the abbreviated club names. This remains a dated snapshot, not a live roster feed.

The game displays each shirt number in a contrasting badge beside a circular portrait, both in the picker and on the field. Accessible names and spoken lineup announcements also include the shirt number.

Portrait backgrounds were removed using the built-in ImageGen tool. The prompt for each original image requested: “Remove only the black background to true transparency. Preserve this exact person, face, hair, skin, original pose and football uniform with all original details and logos. Do not redraw or replace the person, do not add anything. Keep the existing framing and entire person.” Edited cutouts are stored in `public/games/escalacao/img/sao-paulo/`; the original photos remain in `public/games/escalacao/originais/sao-paulo/`.

Both image folders follow `<team>/<shirt-number>-<player-name>.png`, with portable lowercase filenames (for example, `sao-paulo/23-rafael.png`). The runtime `photo` paths point only to the transparent cutouts.

Clicking any filled position on the field explicitly announces that player's name and shirt number, during selection or after completion. This direct request works even when automatic narration is disabled; the existing replacement picker still opens. Empty active positions instead repeat the position question.
