# DragRaceSim v31.5 — relatório de mudanças

Base: v31.4. Partes A, B e C aplicadas.

## Testes
- Temporadas completas jogadas por um bot em Regular, Legacy, Assassin, Brackets e All Winners, a 390px e 1280px, com queen fraca e forte: **0 erros no console, 0 scroll horizontal** (65+ temporadas na versão final e nas intermediárias).
- Parte A, prova de "sem mudança visual": o estilo computado de cada elemento da página, a cada passo de temporadas inteiras, foi comparado ao original. Ver o resultado na mensagem de entrega.
- Regra nº 1: nenhum banco ficou menor (tabela abaixo). Cada frase revisada aparece abaixo, lado a lado com a original.


## Parte B — visual "Transmissão de TV" (aprovada nas maquetes)
Arquivos novos: `css/tv-broadcast.css` (camada visual única, carregada depois do style.css), `js/ui/icons.js` (ícones vetoriais) e `js/ui/recap.js` (Recap da temporada).
- **Sistema:**
  - Paleta, tarjas, cores do track record da wiki, Anton/Archivo com a escala fixa, cantos de 4/6/8px.
  - Sem sombras, brilhos nem animações contínuas.
  - Os tokens antigos (--bg, --card, --accent…) apontam para a paleta nova.
- **Retratos:** diagonal tipo | personalidade, sem borda; coroa em cima (sua queen) e selo de equipe no canto (forma + cor).
- **Ícones:** 53 vetores no lugar dos emojis (humor, energia da música, equipes, escolhas, story beats, ações, categorias). Emoji sem vetor fica como está. Os textos dos bancos não mudaram.
- **Humor:** rosto preenchido numa escala tonal (ódio → amor), legível sem cor.
- **STILL IN:**
  - Cada linha tem etiqueta da última colocação, círculo, nome, persona · cidade, Front-runner e humor.
  - Os botões ficam agrupados, mais o novo "Season recap".
  - No Brackets, a etiqueta mostra os pontos.
- **Eliminação:**
  - Blocos PERFORMANCE / VERDICT / FAREWELL / OUTRO.
  - Tarjas "NOME, SHANTAY, YOU STAY." (ouro) e "NOME, SASHAY AWAY." (batom).
  - O veredito só aparece ao tocar em "Reveal the verdict".
  - Todas as variações usam a mesma estrutura: double shantay ("Shantay, you both stay." na linha de baixo), double sashay, triple bottom, Legacy, Assassin, Brackets e All Winners.
- **Críticas e decisões:**
  - Revelação em etapas: safe tops → vencedora → safe lows → bottom.
  - **Corrigido:** antes a bottom era anunciada antes das LOWs safe.
  - Os cards de crítica ficaram neutros, sem a cor que entregava a colocação.
- **Workroom:**
  - Blocos BRIEF / WORKROOM / YOUR MOVE.
  - Passos 1·2·3 visíveis, ícone por tipo de story beat, relações com ícone.
- **Recap da temporada:**
  - 3 momentos icônicos, guia de episódios, arco de cada queen (quadrados nas cores da wiki + rótulo).
  - Abas All / My queen / Rivalries.
  - Abre pela lateral a qualquer momento e abre a final.
- **O que mudou de texto na tela** (aprovado na lista "O que muda de lugar"):
  - "Queens still in" → "Still in";
  - o rótulo "Your queen" → coroa no retrato;
  - "X WIN / Y BTM" saiu da lateral (está no arco do Recap);
  - o "You both stay." do double shantay → "Shantay, you both stay.".

## Parte A — performance
- Tirados `content-visibility:auto` e `contain-intrinsic-size` dos cards (`.perf-mode`). Os placeholders de 220px redimensionavam os cards ao rolar a página e eram a causa do branco piscando.
- Tirados os 2 `backdrop-filter`, e também os overrides `none` que só existiam para cancelá-los.
- `assets/header.jpg`: uma camada fixa só, com preload no `index.html`. A primeira pintura já sai preta (`color-scheme: dark`).
- `css/style.css`:
  - 614 declarações que nunca ganhavam foram removidas, junto com 152 regras que ficaram vazias.
  - Um bloco único de tokens (52 cores) no topo; os 2 `:root` antigos entraram nele.
  - `!important`: de 1.055 para 433. Os que ficaram são necessários ou estão em estados (hover/focus) que o teste não alcança.

## Parte C — narrativa e coerência
1. **Despedidas com contexto** (`farewellLines.js`):
   - `exitByTrigger` com 6 gatilhos (lipstick, lipSyncAssassin, ownStrength, rival, ally, firstOut) × 3 tons (shade/sweet/any), mais `mirror` (batom no espelho, mostrado no Untucked) e `toneByPersonality`, com todas as variáveis pedidas.
   - O gatilho só dispara se a pessoa estiver envolvida na eliminação.
   - Quando há gatilho, 3 em cada 4 despedidas usam o contexto; as outras usam `queenExitByPersonality`, para manter as 210 falas de personalidade em rodízio.
2. **Lacunas nos bancos:** 10 tipos e 13 personalidades ganharam chaves.
   - Bug encontrado: a busca só reconhecia 9 personalidades, então as falas de saída já escritas para funny, sarcastic, humble e as outras nunca apareciam. Corrigido.
3. **Críticas:**
   - Nenhuma frase se repete no mesmo episódio (antes: ~110 repetições em 15 temporadas; agora 0 em 6.000+ falas).
   - A crítica de cada queen é escrita uma vez por episódio; antes, mudava a cada re-render.
   - A fala por atributo ≥9 só aparece se o desafio testa aquele atributo.
   - 6 desafios ganharam frases próprias, e todos os desafios ganharam +2 frases por colocação.
   - Frases que citam "semanas anteriores" não aparecem nos episódios 1–2.
4. **Entradas:**
   - O tom depende da personalidade: queens shy, sweet, reserved, humble e kind usam só falas suaves.
   - Bordões de queens reais viram easter egg (5%).
   - As queens entram uma por vez, com "First queen in the werkroom" e reações das que já estão na sala, conforme a relação. Nenhuma fala se repete na mesma entrada.
   - Novo arquivo `js/data/entranceLines.js`.
5. **Relações:**
   - Toda mudança de relação vira um story beat visível (Workroom e Untucked), usando o banco `relationshipShifts`, que já existia e nunca era usado.
   - Pares que cruzam um limite viram arcos de rivalidade ou aliança, com callbacks: confronto no Untucked, trégua no Makeover.
   - Os arcos alimentam os gatilhos rival/ally.
6. **Lip sync:**
   - Saiu a penalidade por lip syncs anteriores, que era mais forte para lipSync ≥9.
   - No lugar: tag "Lip sync survivor" e uma narração de sobrevivente.
   - O equilíbrio se manteve (queens fortes vencem ~80% dos lip syncs); agora um mesmo assassin pode chegar a 4 vitórias.
7. **Final interativa:**
   - Estratégia escolhida antes de cada lip sync em que a sua queen está.
   - A música da coroa é escolhida entre 2 hinos de alta energia (novo `crownAnthems` em `songs.js`).
   - O resultado de cada semifinal aparece antes da próxima.
8. **Calendário:**
   - Bug encontrado: em toda final de Top 4 (80% dos elencos de 10+), o plano saía vazio. Design, Snatch Game, Makeover, Roast e Rusical ficavam por sorte.
   - Agora Design e Snatch Game são garantidos em qualquer elenco, inclusive 8–9 queens; nos elencos de 11+ os 5 entram sempre.
   - Ball só a partir de 9 queens ou menos.
   - Um desafio que ficou para trás por double sashay é retomado.
9. **Duplicatas:** fica a cópia que o jogo realmente usava, então o comportamento não muda. Os 2 `resolveVoteResult` saíram.
10. **Bolinhas de progresso:** usam o total real de episódios, contando o retorno do Legacy/Assassin e a estreia sem eliminação.
11. **Revisão editorial:**
   - 22 entradas repetidas no mesmo banco foram reescritas 1:1.
   - Pontuação uniformizada: 62 trocas de ’ por ' e de … por ..., só no texto (títulos de músicas e nomes intactos).
   - Uma fala que não fazia sentido no episódio 1 agora tem guarda de contexto.
   - Ainda falta: o polimento de humor/shade banco por banco. Peço a sua escolha da ordem dos bancos (ver mensagem).

## Frases revisadas no código (entrance.js), original × revisada
| Antes | Depois |
|---|---|
| I don't compete, babe. I dictate. | Rules? I am the rulebook, darling. |
| This is going to hurt. | Brace yourselves. I come in waves. |
| The visual impact is heavy, I know. | The lighting guy just quit. He can't top me. |
| I don't do side-character energy. Clear the set. | Roll camera. The lead has arrived. |
| Hold your reactions for camera one, girls. | Somebody get my good side. Both of them. |
| Oh. It's... you guys. | Wow. The casting budget went where, exactly? |
| This look? Custom. | Couture, not costume. Learn the difference. |
| Look, but don't touch. | Admire from a safe distance, please. |
| Take a picture, it lasts longer. | Screenshot it, darling. It's a collector's item. |
| High fashion just entered. | The runway has been waiting for me. |
| Flawless. Next question? | Is it fashion? It's always fashion. |
| Ta-da! God saved the clown. | Comedy is my cardio, and I'm already sweating. |
| My wig is sweating. | I brought jokes. Lower your expectations accordingly. |
| Cancel my contract. | My agent told me to be normal. I fired her. |
| Bow down. Or don't, I'll still win. | Kneel or don't. The crown already knows my name. |
| First place is officially taken. | Silver suits you girls. Really. |
| I don't compete, babe. I dictate. | Confidence isn't a phase. It's my brand. |
| Crown me. Thanks. | Just tell me where to stand for the coronation. |
| I am the main event. Period. | Opening act? Please. I'm the headliner. |
| Irresistible, right? I know. | Say it with me: iconic. |
| Next question? | Any questions? No? Good. |

## Pontuação (original → só aspas/reticências trocadas)
- [js/ui/workroom.js] I’m sorry, my dear. You will have to lip sync again for your life.
- [js/ui/entrance.js] If I were you, I’d start filling out the application for next season.
- [js/ui/entrance.js] I don't compete, babe. I dictate.
- [js/ui/entrance.js] This is going to hurt.
- [js/ui/entrance.js] This look? You’d need an expensive filter just to copy it.
- [js/ui/entrance.js] I’m not just a queen, I’m an optimized dataset.
- [js/ui/entrance.js] I don't do side-character energy. Clear the set.
- [js/ui/entrance.js] Hold your reactions for camera one, girls.
- [js/ui/entrance.js] I’ve survived rowdy crowds at 4 AM, you girls are a walk in the park.
- [js/ui/entrance.js] Save your energy for the lipsync, sweeties. You’re gonna need it.
- [js/ui/entrance.js] Five, six, seven, eight—let’s go!
- [js/ui/entrance.js] I don’t walk runways, I leap through them.
- [js/ui/entrance.js] I’m hitting every single beat. Try to keep up.
- [js/ui/entrance.js] Don’t laugh at the outfit, it took three rolls of tape.
- [js/ui/entrance.js] Oh. It’s... you guys. Fun.
- [js/ui/entrance.js] One disaster at a time, ladies. Today I’m yours.
- [js/ui/entrance.js] High fashion just entered.
- [js/ui/entrance.js] ${entranceQueens.map(q=>
- [js/ui/entrance.js] card entrance-card
- [js/ui/entrance.js] entrance-head
- [js/ui/entrance.js] entrance-copy
- [js/ui/entrance.js] entrance-quote
- [js/ui/lipsync.js] She didn’t just look sad; she made the judges remember their own exes.
- [js/ui/lipsync.js] She knew the words, but she didn’t quite look like she approved of them.
- [js/ui/lipsync.js] The stunts weren’t desperation; they were calculated strikes.
- [js/ui/lipsync.js] It was a perfectly adequate performance that won’t make anyone mad, or excited.
- [js/ui/lipsync.js] She stood her ground, but she didn’t conquer any new territory.
- [js/ui/lipsync.js] The aggression was there, but she didn’t have the choreography to back it up.
- [js/ui/lipsync.js] She tried to hog the camera, but the camera didn’t seem particularly interested.
- [js/ui/lipsync.js] She got in her opponent’s face, but the other queen just smiled through it.
- [js/ui/lipsync.js] She didn’t just perform; she actively reduced her opponent to a footnote.
- [js/ui/lipsync.js] I’m sorry, my dears, but neither of you survived this lip sync.
- [js/ui/lipsync.js] , I’m sorry, my dears, but neither of you survived this lip sync.
- [js/ui/runway.js] Based on this week’s challenge and your runway presentation.
- [js/ui/runway.js] Continue to Judges’ Critiques
- [js/ui/runway.js] . You are the winner of this week’s challenge.
- [js/ui/runway.js] . You are the winners of this week’s challenge.
- [js/ui/runway.js] I’m sorry, but you are up for elimination.
- [js/ui/runway.js] I’m sorry, my dear, but you are also up for elimination.
- [js/ui/runway.js] Judges’ Critiques
- [js/systems/social.js] {a} and {b} make a tiny pact to watch each other’s backs.
- [js/data/snatchCharacters.js] RuPaul’s evil twin
- [js/data/designChallenges.js] Create a look inspired by spring’s first bloom, with petals, fresh greens, and soft romantic movement.
- [js/data/roastTargets.js] RuPaul’s inner saboteur
- [js/data/roastTargets.js] the queens’ own track records
- [js/data/roastTargets.js] the season’s messiest moments
- [js/data/events.js] Michelle squints and suggests the chosen lip color washes out the queen’s complexion.
- [js/data/events.js] RuPaul beams slightly, noting that the queen’s posture commanded the entire room.
- [js/data/farewellLines.js] "I’m already drafting my All Stars alliances in my head. Well played."
- [js/data/farewellLines.js] "Thank you, Ru. I can’t wait to see how the producers edit this outcome."
- [js/data/farewellLines.js] "I spent hours making this perfect. I’m glad you got to see it."
- [js/data/farewellLines.js] "The placement was right, the face was right. I’m content. Thank you, Ru."
- [js/data/farewellLines.js] "I’m not good with goodbyes. Thank you for everything."
- [js/data/farewellLines.js] "I may not speak much, but I’ve heard everything. Thank you."
- [js/data/critiques.js] I’m not mad, I’m just disappointed.
- [js/data/guestJudges.js] She’s the one Italian girl from New York who will judge in a room with 100 people.
- [js/data/guestJudges.js] Twerking choreography, a business mindset, and making sure you know she’s from Honório Gurgel.
- [js/data/guestJudges.js] Soulful church vocals so intense they’ll make her take her shoes off.
- [js/data/guestJudges.js] Diamond glasses and a gay legacy older than RuPaul’s original face.
- [js/data/guestJudges.js] Confused as to why she’s on another British panel, but ready to press a fake golden buzzer.
- [js/data/guestJudges.js] Narcoleptic witch comedy and Broadway dominance. Reminding you it’s always Monsoon season.
- [js/data/guestJudges.js] Loud wigs, comedy, and attacking queens who rely on looks because 'it’s fashion' *burp*.
- [js/data/guestJudges.js] Your hips might not lie, but she’s definitely checking if your tax returns do.
- [js/data/guestJudges.js] Tumblr nostalgia. Checking if your look was bought on a budget because she’s poor.
- [js/data/guestJudges.js] Vitiligo structural silhouettes, runway styling, and checking if she’ll complain about hospitality.
- [js/data/danceChallenges.js] Work out, but make it fashion. Neon leotards and high-intensity cardio that says 'I’m a winner, baby'.
- [js/data/danceChallenges.js] It’s hard to breathe, but your cheeks need to move. Show us how to twerk while cinched for the gods.
- [js/data/danceChallenges.js] It’s a Sunday show in a cramped bar. Make your movements big enough to reach the back, even if you’re touching the walls.

## Contagem por banco (dados em GAME_DATA)
Total strings: 16988 → 17324

## Banks changed
| Bank | Before | After | Revised | New |
|---|---:|---:|---:|---:|
| `critiques.generic.negative` | 34 | 34 | 1 | 0 |
| `crownAnthems[0]` | 0 | 2 | 0 | 2 |
| `crownAnthems[10]` | 0 | 2 | 0 | 2 |
| `crownAnthems[11]` | 0 | 2 | 0 | 2 |
| `crownAnthems[12]` | 0 | 2 | 0 | 2 |
| `crownAnthems[13]` | 0 | 2 | 0 | 2 |
| `crownAnthems[14]` | 0 | 2 | 0 | 2 |
| `crownAnthems[15]` | 0 | 2 | 0 | 2 |
| `crownAnthems[16]` | 0 | 2 | 0 | 2 |
| `crownAnthems[17]` | 0 | 2 | 0 | 2 |
| `crownAnthems[18]` | 0 | 2 | 0 | 2 |
| `crownAnthems[19]` | 0 | 2 | 0 | 2 |
| `crownAnthems[1]` | 0 | 2 | 0 | 2 |
| `crownAnthems[20]` | 0 | 2 | 0 | 2 |
| `crownAnthems[21]` | 0 | 2 | 0 | 2 |
| `crownAnthems[22]` | 0 | 2 | 0 | 2 |
| `crownAnthems[23]` | 0 | 2 | 0 | 2 |
| `crownAnthems[24]` | 0 | 2 | 0 | 2 |
| `crownAnthems[25]` | 0 | 2 | 0 | 2 |
| `crownAnthems[26]` | 0 | 2 | 0 | 2 |
| `crownAnthems[27]` | 0 | 2 | 0 | 2 |
| `crownAnthems[28]` | 0 | 2 | 0 | 2 |
| `crownAnthems[29]` | 0 | 2 | 0 | 2 |
| `crownAnthems[2]` | 0 | 2 | 0 | 2 |
| `crownAnthems[3]` | 0 | 2 | 0 | 2 |
| `crownAnthems[4]` | 0 | 2 | 0 | 2 |
| `crownAnthems[5]` | 0 | 2 | 0 | 2 |
| `crownAnthems[6]` | 0 | 2 | 0 | 2 |
| `crownAnthems[7]` | 0 | 2 | 0 | 2 |
| `crownAnthems[8]` | 0 | 2 | 0 | 2 |
| `crownAnthems[9]` | 0 | 2 | 0 | 2 |
| `danceChallenges[23].*` | 2 | 2 | 1 | 0 |
| `danceChallenges[25].*` | 2 | 2 | 1 | 0 |
| `danceChallenges[5].*` | 2 | 2 | 1 | 0 |
| `designChallenges[65].challenges[4].*` | 2 | 2 | 1 | 0 |
| `entranceLines.byPersonality.ambitious` | 0 | 2 | 0 | 2 |
| `entranceLines.byPersonality.charming` | 0 | 2 | 0 | 2 |
| `entranceLines.byPersonality.eccentric` | 0 | 2 | 0 | 2 |
| `entranceLines.byPersonality.funny` | 0 | 2 | 0 | 2 |
| `entranceLines.byPersonality.hotheaded` | 0 | 2 | 0 | 2 |
| `entranceLines.byPersonality.humble` | 0 | 2 | 0 | 2 |
| `entranceLines.byPersonality.perfectionist` | 0 | 2 | 0 | 2 |
| `entranceLines.byPersonality.reserved` | 0 | 2 | 0 | 2 |
| `entranceLines.byPersonality.sarcastic` | 0 | 2 | 0 | 2 |
| `entranceLines.byPersonality.shy` | 0 | 2 | 0 | 2 |
| `entranceLines.firstIn` | 0 | 3 | 0 | 3 |
| `entranceLines.reactions.neutral` | 0 | 5 | 0 | 5 |
| `entranceLines.reactions.shade` | 0 | 6 | 0 | 6 |
| `entranceLines.reactions.warm` | 0 | 5 | 0 | 5 |
| `entranceLines.soft` | 0 | 8 | 0 | 8 |
| `events[297].*` | 3 | 3 | 1 | 0 |
| `events[309].*` | 3 | 3 | 1 | 0 |
| `farewellLines.exitByTrigger.ally.any` | 0 | 3 | 0 | 3 |
| `farewellLines.exitByTrigger.ally.shade` | 0 | 3 | 0 | 3 |
| `farewellLines.exitByTrigger.ally.sweet` | 0 | 4 | 0 | 4 |
| `farewellLines.exitByTrigger.firstOut.any` | 0 | 3 | 0 | 3 |
| `farewellLines.exitByTrigger.firstOut.shade` | 0 | 4 | 0 | 4 |
| `farewellLines.exitByTrigger.firstOut.sweet` | 0 | 4 | 0 | 4 |
| `farewellLines.exitByTrigger.lipSyncAssassin.any` | 0 | 3 | 0 | 3 |
| `farewellLines.exitByTrigger.lipSyncAssassin.shade` | 0 | 4 | 0 | 4 |
| `farewellLines.exitByTrigger.lipSyncAssassin.sweet` | 0 | 4 | 0 | 4 |
| `farewellLines.exitByTrigger.lipstick.any` | 0 | 4 | 0 | 4 |
| `farewellLines.exitByTrigger.lipstick.shade` | 0 | 5 | 0 | 5 |
| `farewellLines.exitByTrigger.lipstick.sweet` | 0 | 4 | 0 | 4 |
| `farewellLines.exitByTrigger.ownStrength.any` | 0 | 3 | 0 | 3 |
| `farewellLines.exitByTrigger.ownStrength.shade` | 0 | 4 | 0 | 4 |
| `farewellLines.exitByTrigger.ownStrength.sweet` | 0 | 4 | 0 | 4 |
| `farewellLines.exitByTrigger.rival.any` | 0 | 3 | 0 | 3 |
| `farewellLines.exitByTrigger.rival.shade` | 0 | 5 | 0 | 5 |
| `farewellLines.exitByTrigger.rival.sweet` | 0 | 4 | 0 | 4 |
| `farewellLines.mirror.any` | 0 | 5 | 0 | 5 |
| `farewellLines.mirror.shade` | 0 | 6 | 0 | 6 |
| `farewellLines.mirror.sweet` | 0 | 5 | 0 | 5 |
| `farewellLines.qualitiesByPersonality.ambitious` | 0 | 4 | 0 | 4 |
| `farewellLines.qualitiesByPersonality.calculating` | 0 | 4 | 0 | 4 |
| `farewellLines.qualitiesByPersonality.charming` | 0 | 4 | 0 | 4 |
| `farewellLines.qualitiesByPersonality.competitive` | 0 | 4 | 0 | 4 |
| `farewellLines.qualitiesByPersonality.eccentric` | 0 | 4 | 0 | 4 |
| `farewellLines.qualitiesByPersonality.fearless` | 0 | 4 | 0 | 4 |
| `farewellLines.qualitiesByPersonality.funny` | 0 | 4 | 0 | 4 |
| `farewellLines.qualitiesByPersonality.hotheaded` | 0 | 4 | 0 | 4 |
| `farewellLines.qualitiesByPersonality.humble` | 0 | 4 | 0 | 4 |
| `farewellLines.qualitiesByPersonality.perfectionist` | 0 | 4 | 0 | 4 |
| `farewellLines.qualitiesByPersonality.reserved` | 0 | 4 | 0 | 4 |
| `farewellLines.qualitiesByPersonality.sarcastic` | 0 | 4 | 0 | 4 |
| `farewellLines.qualitiesByPersonality.sweet` | 0 | 4 | 0 | 4 |
| `farewellLines.queenExitByPersonality.perfectionist` | 10 | 10 | 2 | 0 |
| `farewellLines.queenExitByPersonality.reserved` | 10 | 10 | 2 | 0 |
| `farewellLines.queenExitByPersonality.strategic` | 10 | 10 | 2 | 0 |
| `farewellLines.talentsByType.ballroom` | 0 | 4 | 0 | 4 |
| `farewellLines.talentsByType.club` | 0 | 4 | 0 | 4 |
| `farewellLines.talentsByType.cosplay` | 0 | 4 | 0 | 4 |
| `farewellLines.talentsByType.glamour` | 0 | 4 | 0 | 4 |
| `farewellLines.talentsByType.horror` | 0 | 4 | 0 | 4 |
| `farewellLines.talentsByType.hostess` | 0 | 4 | 0 | 4 |
| `farewellLines.talentsByType.influencer` | 0 | 4 | 0 | 4 |
| `farewellLines.talentsByType.lipsync` | 0 | 4 | 0 | 4 |
| `farewellLines.talentsByType.sewing` | 0 | 4 | 0 | 4 |
| `farewellLines.talentsByType.versatile` | 0 | 4 | 0 | 4 |
| `farewellLines.toneByPersonality.*` | 0 | 21 | 0 | 21 |
| `guestJudges[0].*` | 2 | 2 | 1 | 0 |
| `guestJudges[111].*` | 2 | 2 | 1 | 0 |
| `guestJudges[123].*` | 2 | 2 | 1 | 0 |
| `guestJudges[126].*` | 2 | 2 | 1 | 0 |
| `guestJudges[172].*` | 2 | 2 | 1 | 0 |
| `guestJudges[185].*` | 2 | 2 | 1 | 0 |
| `guestJudges[23].*` | 2 | 2 | 1 | 0 |
| `guestJudges[283].*` | 2 | 2 | 1 | 0 |
| `guestJudges[29].*` | 2 | 2 | 1 | 0 |
| `guestJudges[50].*` | 2 | 2 | 1 | 0 |
| `lipSyncComments.survivor.*` | 0 | 1 | 0 | 1 |
| `lipSyncComments.survivor.lose` | 0 | 4 | 0 | 4 |
| `lipSyncComments.survivor.win` | 0 | 5 | 0 | 5 |
| `narrativeExpansion.relationshipShifts.allianceTested` | 0 | 2 | 0 | 2 |
| `narrativeExpansion.relationshipShifts.confrontation` | 0 | 5 | 0 | 5 |
| `narrativeExpansion.relationshipShifts.reconciliation` | 0 | 4 | 0 | 4 |
| `narrativeText.relationshipShifts.allianceTested` | 0 | 2 | 0 | 2 |
| `narrativeText.relationshipShifts.confrontation` | 0 | 5 | 0 | 5 |
| `narrativeText.relationshipShifts.reconciliation` | 0 | 4 | 0 | 4 |
| `roastTargets` | 111 | 111 | 3 | 0 |
| `snatchCharacters[104].*` | 2 | 2 | 1 | 0 |

## Revised lines (original → revised)
- `critiques.generic.negative`
  - antes: I’m not mad, I’m just disappointed.
  - depois: I'm not mad, I'm just disappointed.
- `danceChallenges[23].*`
  - antes: prompt=It’s hard to breathe, but your cheeks need to move. Show us how to twerk while cinched for the gods.
  - depois: prompt=It's hard to breathe, but your cheeks need to move. Show us how to twerk while cinched for the gods.
- `danceChallenges[25].*`
  - antes: prompt=It’s a Sunday show in a cramped bar. Make your movements big enough to reach the back, even if you’re touching the walls.
  - depois: prompt=It's a Sunday show in a cramped bar. Make your movements big enough to reach the back, even if you're touching the walls.
- `danceChallenges[5].*`
  - antes: prompt=Work out, but make it fashion. Neon leotards and high-intensity cardio that says 'I’m a winner, baby'.
  - depois: prompt=Work out, but make it fashion. Neon leotards and high-intensity cardio that says 'I'm a winner, baby'.
- `designChallenges[65].challenges[4].*`
  - antes: prompt=Create a look inspired by spring’s first bloom, with petals, fresh greens, and soft romantic movement.
  - depois: prompt=Create a look inspired by spring's first bloom, with petals, fresh greens, and soft romantic movement.
- `events[297].*`
  - antes: text=Michelle squints and suggests the chosen lip color washes out the queen’s complexion.
  - depois: text=Michelle squints and suggests the chosen lip color washes out the queen's complexion.
- `events[309].*`
  - antes: text=RuPaul beams slightly, noting that the queen’s posture commanded the entire room.
  - depois: text=RuPaul beams slightly, noting that the queen's posture commanded the entire room.
- `farewellLines.queenExitByPersonality.perfectionist`
  - antes: "I spent hours making this perfect. I’m glad you got to see it."
  - depois: "I spent hours making this perfect. I'm glad you got to see it."
- `farewellLines.queenExitByPersonality.perfectionist`
  - antes: "The placement was right, the face was right. I’m content. Thank you, Ru."
  - depois: "The placement was right, the face was right. I'm content. Thank you, Ru."
- `farewellLines.queenExitByPersonality.reserved`
  - antes: "I’m not good with goodbyes. Thank you for everything."
  - depois: "I'm not good with goodbyes. Thank you for everything."
- `farewellLines.queenExitByPersonality.reserved`
  - antes: "I may not speak much, but I’ve heard everything. Thank you."
  - depois: "I may not speak much, but I've heard everything. Thank you."
- `farewellLines.queenExitByPersonality.strategic`
  - antes: "I’m already drafting my All Stars alliances in my head. Well played."
  - depois: "I'm already drafting my All Stars alliances in my head. Well played."
- `farewellLines.queenExitByPersonality.strategic`
  - antes: "Thank you, Ru. I can’t wait to see how the producers edit this outcome."
  - depois: "Thank you, Ru. I can't wait to see how the producers edit this outcome."
- `guestJudges[0].*`
  - antes: note=She’s the one Italian girl from New York who will judge in a room with 100 people.
  - depois: note=She's the one Italian girl from New York who will judge in a room with 100 people.
- `guestJudges[111].*`
  - antes: note=Confused as to why she’s on another British panel, but ready to press a fake golden buzzer.
  - depois: note=Confused as to why she's on another British panel, but ready to press a fake golden buzzer.
- `guestJudges[123].*`
  - antes: note=Narcoleptic witch comedy and Broadway dominance. Reminding you it’s always Monsoon season.
  - depois: note=Narcoleptic witch comedy and Broadway dominance. Reminding you it's always Monsoon season.
- `guestJudges[126].*`
  - antes: note=Loud wigs, comedy, and attacking queens who rely on looks because 'it’s fashion' *burp*.
  - depois: note=Loud wigs, comedy, and attacking queens who rely on looks because 'it's fashion' *burp*.
- `guestJudges[172].*`
  - antes: note=Your hips might not lie, but she’s definitely checking if your tax returns do.
  - depois: note=Your hips might not lie, but she's definitely checking if your tax returns do.
- `guestJudges[185].*`
  - antes: note=Tumblr nostalgia. Checking if your look was bought on a budget because she’s poor.
  - depois: note=Tumblr nostalgia. Checking if your look was bought on a budget because she's poor.
- `guestJudges[23].*`
  - antes: note=Twerking choreography, a business mindset, and making sure you know she’s from Honório Gurgel.
  - depois: note=Twerking choreography, a business mindset, and making sure you know she's from Honório Gurgel.
- `guestJudges[283].*`
  - antes: note=Vitiligo structural silhouettes, runway styling, and checking if she’ll complain about hospitality.
  - depois: note=Vitiligo structural silhouettes, runway styling, and checking if she'll complain about hospitality.
- `guestJudges[29].*`
  - antes: note=Soulful church vocals so intense they’ll make her take her shoes off.
  - depois: note=Soulful church vocals so intense they'll make her take her shoes off.
- `guestJudges[50].*`
  - antes: note=Diamond glasses and a gay legacy older than RuPaul’s original face.
  - depois: note=Diamond glasses and a gay legacy older than RuPaul's original face.
- `roastTargets`
  - antes: RuPaul’s inner saboteur
  - depois: RuPaul's inner saboteur
- `roastTargets`
  - antes: the queens’ own track records
  - depois: the queens' own track records
- `roastTargets`
  - antes: the season’s messiest moments
  - depois: the season's messiest moments
- `snatchCharacters[104].*`
  - antes: name=RuPaul’s evil twin
  - depois: name=RuPaul's evil twin


# Parte B — rodada 2 (feedback de 21/10)

## Escolhas aplicadas
- Fonte do texto corrido: **Barlow** (rótulos pequenos em Barlow Semi Condensed). Anton continua nos títulos. Corpo passou de 15 para 16px.
- Tags de colocação (WIN, HIGH, BTM…): **bloco cheio**, como estavam.
- Tags de história (Front-runner, Fan favorite, Winner, Runner-up, Finalist, toot/boot da passarela): **pílula fina** com ponto ou ícone de cor.
- Selo success/fail: **carimbo** inclinado de borda dupla.

## Telas
- **Main Stage** em blocos TV: BRIEF (jurada convidada + desafio), YOUR MOVE (resultado com carimbo SUCCESS!/FAIL/CLEAN WALK), RUNWAY (categoria em Anton, uma linha por queen com toot/boot à direita, Top Toot em dourado), DECISIONS (fala da Ru + chips das safes).
- **Desafios em dupla/grupo**: passarela e críticas agrupadas por equipe, com selo da equipe e química.
- **Críticas**: cada jurado numa linha (nome à esquerda, frase à direita), Ru em rosa, "Judging moment" como rodapé. O momento agora cita o jurado certo da bancada (Ross nos episódios pares, Carson nos ímpares).
- **Vencedora do desafio**: card próprio dourado com "CONDRAGULATIONS!" e retrato grande. Bottom 2 com filete batom.
- **Lip sync**: tudo alinhado à esquerda (título, música, energia, queens). Carimbo da estratégia da jogadora no bloco Performance (Success!/Shaky/Fail/Iconic!). A linha de "lip sync survivor" saiu da Performance (entregava o resultado) e foi para o Verdict; corrigido "1 lip sync wins".
- **Untucked** em blocos TV: UNTUCKED (espelho + lounge), YOUR MOVE, RESULTS.
- **Entrance**: cards mais limpos; borda de bracket virou filete.
- **Final**: Miss Congeniality ordenada da melhor para a pior relação com a sua queen, com a carinha de humor e o texto ("Likes you"); lista de retorno em grade com retrato; títulos à esquerda; card de Season Recap + botão no fim da página.
- **Season Recap** abre a partir da tela final, com "Back to the results".

## Correções
- Brackets: a entrance mostrava as 18 queens a partir do 2º clique (o status da temporada mudava). Agora a entrance em curso fica guardada e mostra só a chave atual.
- Botões que avançam ficam à direita (Next episode, Continue, Watch the Lip Sync, Start…); Back/Season recap à esquerda; Go to Main Stage segue em largura total.
- Coroa no slot de humor da sua queen na lista STILL IN.
- Emojis restantes viram vetores (final, Congeniality, download, criador, dados de risco, rostos de humor); sem vetor = removido. 0 emojis encontrados em 30 temporadas de teste.
- Espaçamentos: padding único dos cards, títulos duplicados dentro dos blocos removidos, listas sem marcador duplo, linha decorativa que cortava o "The music starts…" removida, prompt repetido no BRIEF do Workroom removido.

## Testes
- 30 temporadas (Regular, Legacy, Assassin, Brackets, All Winners × 3 seeds × 390/1280 px): 0 erros de console, 0 scroll horizontal, 0 emojis.
- Nenhum texto narrativo removido (Regra nº 1); as únicas mudanças de texto são a troca de jurado no "Judging moment" e a concordância de "1 win".

# Parte B — rodada 3 (feedback de 22/10)
- **Botões de ação principal sempre rosa**: todo botão que avança (incl. os que eram "secondary", como Reveal, Go to Main Stage) usa o rosa; Back continua contornado.
- **Lip syncs finais (semifinais e Lip Sync for the Crown)**: novo "palco" — dois retratos grandes frente a frente, VS gigante (dourado + coroa no da coroa), nomes em Anton, música como cartela (título grande, artista, energia), "You" na sua queen. Depois: PERFORMANCE (narração + carimbo da sua estratégia) e, nas semifinais, VERDICT com as faixas Shantay / Sashay só depois de "Reveal the verdict". O anúncio do Final Two também usa o palco.
- **Coroação**: tela própria antes dos resultados. 1) "The winner is…" com as duas finalistas e a fala da Ru; 2) momento da coroa: raios dourados, coroa caindo sobre o retrato, nome gigante em dourado, "Condragulations… You're the winner, baby!". Se for você: selo "THAT'S YOU!" e seus números (wins, highs, bottoms). Se você perdeu na final: card "So close." de runner-up. A animação roda uma vez só (e respeita "reduzir movimento").
- **Resultados da temporada**: abrem com o mesmo momento da coroa (estático).
- **Season recap** ao lado do botão Download da tabela.
- Heróis do Grand Finale, Draw e Final Cut no padrão TV; removido o "💡 ✦ 💡" que o CSS antigo injetava na música.
- Texto novo (adição, Regra nº 1): abertura da narração nas semifinais — "The music starts. Only one of them walks on to the crown."
- Testes: 36 temporadas (5 formatos, 390/1280), incluindo coroação, resultados e recap final: 0 erros, 0 scroll horizontal, 0 emojis.

# Parte B — rodada 4
- **Moldura única para todas as telas**: largura máxima 1320px, margens de 32px (16px no celular), mesmas bordas em todas as telas.
  - Com a lista STILL IN: coluna do episódio + lista de 400px, sempre na mesma proporção (antes a coluna variava de 728 a 1028px conforme o conteúdo).
  - Sem a lista (entrance, final, resultados): o episódio ocupa a moldura inteira, com as mesmas bordas.
  - Abaixo de 1080px a lista desce para baixo do episódio (antes a coluna chegava a 378px).

# v31.6 (rodada de 22/10, a partir da análise)

## Jogabilidade
- **Preparo contextual:** o efeito de "Prioritize the runway" acompanha o peso da passarela no desafio (×0,35 no Snatch Game até ×1,2 no Ball); "Rehearse" faz o contrário (×0,75 a ×1,1). A tela de preparo diz o peso da semana ("Big runway week" / "Balanced week" / "Runway barely counts").
- **Pedir ajuda** vale pela relação: +1,5 a +3,5 (×1,45 na nota); quem odeia a sua queen recusa.
- **Aliada que ajuda sozinha:** numa semana difícil (bottom recente ou estresse alto), uma queen que gosta muito de você pode aparecer na sua bancada (+1,5).
- **Sabotagem:** a chance depende de C.U.N.T, da personalidade da alvo e de o elenco já desconfiar de você (20% a 85%); o efeito na alvo vai de −2,2 a −3,7; se der errado, você também perde na nota. A sabotagem entre NPCs agora mira a rival (−2 a −4 e +estresse), inclusive você.
- **Equipes:** em "free choice" a sua queen escolhe a parceira ou o time entre quem topa trabalhar com ela; a química vai até ±5 na nota da equipe, vale ±1 também quando o desafio é julgado individualmente, e aparece no Workroom ("Chemistry: strong / good / messy / toxic").
- **Torcida no lip sync:** cada aliada (afinidade ≥ 40) vale +0,12 e cada inimiga −0,12 (máx. ±0,4), e a narração diz quem gritava do lado do palco.
- **Ritmo:** as decisões dos jurados se revelam num clique só; no modo espectadora há "Watch at fast pace" (um ecrã de resultados por episódio).

## Narrativa
- **TOOT/BOOT:** a nota sai da posição da queen no episódio; a frase sai da nota (TOOT → great/legendary, SOFT TOOT → banco novo "solid" com 22 frases, SOFT BOOT → safe/mixed, BOOT → weak/mixed, SCOOT → flop) e fica salva.
- **Tags num só sistema** (`seasonTagProfile`): no máximo uma por família (trajetória, edição, assinatura, final). Fan favorite e Producer's dream só para as 2 primeiras do elenco; Lip sync assassin com 3 vitórias, ou 2 e a melhor marca; um único Robbed por temporada; Villain exige relações ruins.
- **Histórias novas:** Late bloomer, Peaked too early e The mother, com falas novas da Ru (6 + 4, 4 + 6, 5 + 5) e frases de fecho na recepção.
- **Sem repetição na temporada:** as falas de jurados, Ru e passarela evitam o que já foi dito na temporada.
- **"1 wins" / "1 bottoms"** corrigidos em todos os textos com número.

## Design
- Painel **Your queen** no topo da lista STILL IN: energia, estresse e quantas queens amam, gostam, estão neutras, dão sombra ou odeiam você. Fãs e produção seguem só no fim.
- **Judges' expectations:** barra discreta de 5 tracinhos, sem rótulo, no BRIEF do Workroom.
- **Retorno depois da escolha:** a frase da escolha e setas (▲/▼) para desafio, passarela, energia, estresse, confiança e a relação com a queen envolvida.
- **Celular:** a lista STILL IN vira uma barra fixa no rodapé (energia, estresse, carinha do elenco) que abre como gaveta; críticas recolhidas por queen (a sua fica aberta); listas de relações com 3 itens + "Show more".
- **Home e criador** no sistema TV; o criador explica o que o tipo e a personalidade fazem.
- **Semifinais** sem a sua queen usam o mesmo palco (versão compacta); heróis antigos (Lalaparuza, Reunion, votos do Assassin, formação de equipes) seguem o estilo de título do episódio.
- **Contraste:** botões em #E0157A com texto branco (4,6:1); ícone "hate" em #C42752.

## v31.6 — rodada 2 (22/10, noite)
### Workroom numa tela (versão limpa aprovada)
- Uma linha por escolha: First move / Preparation / Approach, com pílulas de texto.
- Só a opção marcada mostra descrição e efeito (setas ▲/▼, sem fãs/produção).
- As escolhas da semana anterior vêm pré-marcadas. Ask for help / Sabotage abrem a seleção de queen na própria linha.
- Um único botão "Go to Main Stage" aplica tudo na ordem antiga (first move → prep → approach). O retorno das escolhas aparece no topo do Main Stage ("Your week").
- O aviso da semana (Big runway week / Runway barely counts) virou uma linha dentro de Preparation.
- Funções antigas (renderWorkroomChoice, renderPreparationChoice, renderChallengeApproachChoice, bindSkipWorkroom) mantidas no código.

### Lip sync: estratégias com perfil
- 13 estratégias (9 antigas + Comedy Lip Sync, Play to the Audience, Signature Move, Match Her Energy).
- Todas usam o atributo Lip Sync; cada uma soma outro atributo (Acting, C.U.N.T, Runway, Makeup).
- O cálculo antigo continua inteiro: apoio da sala, habilidade (lipSync/cunt), histórico, momentum, produção, overshadow.
- Cada estratégia tem encaixe com a energia da música, risco (variação) e custo (reveals gastos, energia, uma vez por temporada).
- Resultado em 4 níveis: Iconic / Clean / Slip / Disaster, ligados aos textos já existentes (legendary/outstanding → Iconic, strong → Clean, partial → Slip, failed → Disaster).
- Eventos de palco: peruca voa, peruca embaixo da peruca, queda (−15 energia), reveal travado, death drop, Ru emocionada, painel rindo.
- Chips antes da escolha: encaixe com a música, risco, custo. Carimbo do resultado com o nível.
- NPCs escolhem pela força em cada estratégia + música + personalidade.
- Uma lista só para lip sync normal, Lalaparuza, smackdown, reunion e final.
- Reveals agora são gastos (só no lip sync semanal); Signature Move uma vez por temporada (zera no All Stars).
- Textos novos para as 4 estratégias novas; nenhum texto antigo removido.

### Ajustes (22/10, 23h)
- Sem número de season: "Season results", "The winner of the season" e o kicker da coroação mostram só o título.
- Home: "Create a new queen" com o botão ao lado do texto no desktop.
- Eliminada: duas opções (continuar como espectadora / ir para o resultado final). Sem bloco "Spectator mode", sem botão de ritmo e sem Untucked; o espectador vê "Episode N results". Na tela da própria eliminação fica só o recado no espelho, a escolha e os resultados.

### Rodada 4 (22/10, meia-noite)
- Approach: chip "Challenge · steady / big swing / wild swing" com cor (verde, dourado, vermelho).
- Painel "You" no topo da lista: retrato e nome; a lista mostra "Thinks of you" sobre as carinhas e não repete a sua queen.
- Energy e Stress: cor e palavra pelo estado (Fresh/Tired/Drained, Calm/Tense/Spiraling), também na barra do celular.
- Vencedoras: nome grande em dourado com o título embaixo (lip sync for the win, legacy, assassin, Top All Star, pontos extra, smackdown/reunion, All Winners); no card de vencedora do desafio o nome também aparece em dourado; nome da coroação em dourado.

### Rodada 5 (23/10)
- Workroom: removida a linha "Big runway week / Runway barely counts" (o cálculo continua).
- Runway: o dado com % virou tag de risco (No risk, Very low ≥80%, Low 60–79%, Medium 40–59%, High 20–39%, Very high <20%); o % fica no tooltip.
- Painel You: mostra a última colocação da sua queen (WIN, HIGH, SAFE...).
- Untucked: ícones das escolhas sempre convertidos (sem emoji).
