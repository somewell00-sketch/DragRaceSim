(function(){
  function isDebugUrl(){
    try{return new URLSearchParams(window.location.search).has('debug');}
    catch(e){return false;}
  }
  function backupCurrentSave(){
    try{
      const raw=localStorage.getItem('dragRaceSave');
      if(raw && !localStorage.getItem('dragRaceSaveBeforeDebug')) localStorage.setItem('dragRaceSaveBeforeDebug',raw);
    }catch(e){console.warn('Could not backup save before debug run',e);}
  }
  function restoreBackedUpSave(){
    const raw=localStorage.getItem('dragRaceSaveBeforeDebug');
    if(raw){localStorage.setItem('dragRaceSave',raw); localStorage.removeItem('dragRaceSaveBeforeDebug'); loadGame(); routeAfterLoad();}
  }
  function debugPlayerQueen(){
    if(typeof createQueenFromForm==='function'){
      return createQueenFromForm({
        name:'Granada',
        type:'Jack of All Trades',
        personalityId:'confident',
        location:'Porto, Portugal',
        attributes:{cunt:8,lipSync:8,acting:6,runway:9,sewing:8,makeup:6},
        ambition:4,
        portrait:{type:'gradient',image:null}
      });
    }
    return {id:'player_debug_'+Date.now(),name:'Granada',type:'Jack of All Trades',personalityId:'confident',isPlayer:true,isEliminated:false,attributes:{cunt:8,lipSync:8,acting:6,runway:9,sewing:8,makeup:6},energy:80,stress:20,publicScores:{production:0,queens:0,fans:0},inventory:{reveals:3},statistics:{wins:0,highs:0,safes:0,lows:0,bottoms:0,lipSyncWins:0,lipSyncLosses:0,miniChallengeWins:0,episodesCompeted:0},episodeHistory:[],confessionals:[]};
  }
  function baseSeason(format='regular'){
    return {number:1,status:'in_progress',format,finaleSize:4,originalCastSize:8,episodeCount:null,returnTwist:{type:'legacy_smackdown',used:false},returnAnnouncement:null,doubleShantayUsed:false,doubleSashayUsed:false,challengePlan:{},finale:null,iconicLipSyncs:[],lalaparuzaDone:true,lalaparuzaChecked:true,reunionDone:false,reunionChecked:false,usedRunwayActions:[],currentBlockedQueen:null,allWinnersTop4:[],allWinnersSecondary4:[],allWinnersSecondaryWinnerId:null,debugMode:true};
  }
  function debugCast(count=8, includePlayer=true){
    const cast=[];
    if(includePlayer) cast.push(debugPlayerQueen());
    const needed=Math.max(0,count-cast.length);
    if(typeof buildNpcCastExact==='function') cast.push(...buildNpcCastExact(needed));
    else {
      for(let i=0;i<needed;i++) cast.push({id:'debug_npc_'+i+'_'+Date.now(),name:'Debug Queen '+(i+1),type:'Performer',personalityId:'confident',isPlayer:false,isEliminated:false,attributes:{cunt:7,lipSync:7,acting:7,runway:7,sewing:7,makeup:7},energy:80,stress:20,publicScores:{production:0,queens:0,fans:0},inventory:{reveals:3},statistics:{wins:0,highs:0,safes:0,lows:0,bottoms:0,lipSyncWins:0,lipSyncLosses:0,miniChallengeWins:0,episodesCompeted:0},episodeHistory:[],confessionals:[]});
    }
    return cast.map((q,i)=>({...q,id:q.id || ('debug_q_'+i+'_'+Date.now()),isPlayer:includePlayer && i===0,isEliminated:false}));
  }
  function prepareDebugState({count=8,includePlayer=true,format='regular'}={}){
    backupCurrentSave();
    if(typeof resetState==='function') resetState();
    gameState.data=window.GAME_DATA;
    gameState.queens=debugCast(count,includePlayer);
    gameState.playerQueenId=includePlayer ? gameState.queens[0].id : null;
    gameState.season=baseSeason(format);
    gameState.episodeHistory=[];
    gameState.eliminatedQueens=[];
    if(typeof initializeRelationships==='function') initializeRelationships();
    if(typeof initializePerformanceArcs==='function') initializePerformanceArcs();
    if(typeof ensureAllSocialStats==='function') ensureAllSocialStats();
  }
  function startLalaparuza(opts={}){
    const includePlayer=opts.includePlayer!==false;
    const count=Number(opts.count||8);
    prepareDebugState({count,includePlayer,format:'regular'});
    const active=gameState.queens.filter(q=>!q.isEliminated).slice(0,count);
    gameState.currentEpisode={
      number:1,activeCount:active.length,challengeType:'lalaparuza',challengeName:'Lalaparuza',themeId:'lalaparuza',themeName:'Lalaparuza Smackdown',themeNotes:'Debug test episode.',runwayCategory:'Lip Sync Survival',runwayCategories:['Lip Sync Survival'],song:sample(gameState.data.songs),events:[],guestJudge:null,structure:{id:'smackdown',label:'Lip Sync Smackdown'},teams:[],judgingMode:'individual',placements:[],bottomQueens:[],eliminatedQueenId:null,lipSyncResult:null,special:'lalaparuza',lalaparuzaMode:'callout_song_choice',participantIds:active.map(q=>q.id),socialEvents:[],npcSocialEvents:[],relationshipDriftNotes:[],lalaparuzaIntroGenerated:true,debugMode:true
    };
    saveGame();
    renderWorkroom();
  }
  function startLalaparuzaFinal(opts={}){
    startLalaparuza({...opts,count:2});
    const ep=gameState.currentEpisode;
    const st=initLalaparuzaState(ep);
    st.stage='final';
    st.phase='draw';
    st.activeQueenIds=ep.participantIds.slice(0,2);
    st.availableSongs=pickLipSyncSongs(1);
    saveGame();
    renderWorkroom();
  }
  function makeEliminatedOrder(count=6, includePlayer=true){
    const cast=debugCast(count,includePlayer);
    cast.forEach((q,i)=>{q.isEliminated=true; q.eliminatedEpisode=i+1; q.placement=count-i; q.finalPlacement=count-i;});
    return cast;
  }
  function smackdownTypeFromMode(mode='random') {
    const normalized=String(mode||'random').toLowerCase();
    if(normalized==='bracket' || normalized==='legacy') return 'legacy_smackdown';
    if(normalized==='gauntlet' || normalized==='redemption') return 'redemption_smackdown';
    if(normalized==='firstboot' || normalized==='first_boot' || normalized==='boot_order') return 'boot_order_gauntlet';
    const pool=['legacy_smackdown','redemption_smackdown','boot_order_gauntlet'];
    return pool[Math.floor(Math.random()*pool.length)];
  }
  function labelForSmackdownType(type, reunion=false){
    if(reunion) return 'Queen of She Already Done Had Herses';
    if(type==='redemption_smackdown') return 'Redemption Lip Sync Smackdown';
    if(type==='boot_order_gauntlet'||type==='elimination_order_gauntlet') return 'Boot Order Lip Sync Smackdown';
    return 'Lip Sync Smackdown Return';
  }
  function startSmackdown(type='legacy_smackdown', opts={}){
    const includePlayer=opts.includePlayer!==false;
    const count=Number(opts.count||6);
    backupCurrentSave();
    if(typeof resetState==='function') resetState();
    gameState.data=window.GAME_DATA;
    const eliminated=makeEliminatedOrder(count,includePlayer);
    const active=debugCast(4,false).map(q=>({...q,isEliminated:false}));
    gameState.queens=[...active,...eliminated];
    gameState.eliminatedQueens=eliminated.slice();
    gameState.playerQueenId=includePlayer ? eliminated[0].id : null;
    gameState.season=baseSeason('regular');
    gameState.season.returnTwist={type,used:true};
    if(typeof initializeRelationships==='function') initializeRelationships();
    if(typeof ensureAllSocialStats==='function') ensureAllSocialStats();
    gameState.currentEpisode={
      number:1,activeCount:active.length,challengeType:'return_smackdown',challengeName:labelForSmackdownType(type,false),themeId:'return_smackdown',themeName:labelForSmackdownType(type,false),themeNotes:'Debug test episode.',runwayCategory:'Lip Sync Survival',runwayCategories:['Lip Sync Survival'],song:sample(gameState.data.songs),events:[],guestJudge:null,structure:{id:'return_smackdown',label:'Return Smackdown'},teams:[],judgingMode:'individual',placements:[],bottomQueens:[],eliminatedQueenId:null,lipSyncResult:null,special:'return_smackdown',returnSmackdownType:type,participantIds:eliminated.map(q=>q.id),socialEvents:[],npcSocialEvents:[],relationshipDriftNotes:[],lalaparuzaIntroGenerated:true,debugMode:true
    };
    saveGame();
    renderWorkroom();
  }
  function startReunionSmackdown(opts={}){
    const includePlayer=opts.includePlayer!==false;
    const count=Number(opts.count||6);
    const type=smackdownTypeFromMode(opts.mode||'bracket');
    backupCurrentSave();
    if(typeof resetState==='function') resetState();
    gameState.data=window.GAME_DATA;
    const eliminated=makeEliminatedOrder(count,includePlayer);
    const finalists=debugCast(4,false).map(q=>({...q,isEliminated:false}));
    gameState.queens=[...finalists,...eliminated];
    gameState.eliminatedQueens=eliminated.slice();
    gameState.playerQueenId=includePlayer ? eliminated[0].id : null;
    gameState.season=baseSeason('regular');
    gameState.season.reunionDone=false;
    gameState.season.reunionChecked=true;
    gameState.season.returnTwist={type,used:true,reunionOnly:true};
    if(typeof initializeRelationships==='function') initializeRelationships();
    if(typeof ensureAllSocialStats==='function') ensureAllSocialStats();
    gameState.currentEpisode={
      number:99,activeCount:finalists.length,challengeType:'reunion_smackdown',challengeName:'Queen of She Already Done Had Herses',themeId:'reunion_smackdown',themeName:'Queen of She Already Done Had Herses',themeNotes:'Debug test reunion tournament.',runwayCategory:'Lip Sync Survival',runwayCategories:['Lip Sync Survival'],song:sample(gameState.data.songs),events:[],guestJudge:null,structure:{id:'reunion_smackdown',label:'Reunion Smackdown'},teams:[],judgingMode:'individual',placements:[],bottomQueens:[],eliminatedQueenId:null,lipSyncResult:null,special:'return_smackdown',returnSmackdownType:type,reunionOnly:true,participantIds:eliminated.map(q=>q.id),socialEvents:[],npcSocialEvents:[],relationshipDriftNotes:[],lalaparuzaIntroGenerated:true,debugMode:true
    };
    saveGame();
    renderWorkroom();
  }

  function renderDebugMenu(){
    const backed=!!localStorage.getItem('dragRaceSaveBeforeDebug');
    const button=(id,label,sub='')=>`<button id="${id}" class="secondary" type="button"><strong>${label}</strong>${sub?`<span class="small">${sub}</span>`:''}</button>`;
    setHTML(`<main class="screen home-screen invitation-screen-v2">
      <section class="invite-letter-card">
        <div class="invite-letter-rule"><span>✦</span></div>
        <h2>Developer Mode</h2>
        <p>Teste Lalaparuza, Lip Sync Smackdown e Queen of She Already Done Had Herses sem simular uma temporada inteira.</p>
        <div class="invite-letter-rule"><span>✦</span></div>
      </section>
      <section class="invite-letter-card">
        <h3>Lalaparuza</h3>
        <div class="options debug-options">
          ${button('debugLalaPlayer','Normal','Player participa')}
          ${button('debugLalaNpc','Normal','NPC only')}
          ${button('debugLalaFinal','Final Duel','Duelo final direto')}
        </div>
      </section>
      <section class="invite-letter-card">
        <h3>Lip Sync Smackdown</h3>
        <div class="options debug-options">
          ${button('debugSmackBracket','Bracket','Chaveamento clássico')}
          ${button('debugSmackGauntlet','Gauntlet','Redemption')}
          ${button('debugSmackFirstBoot','First Boot','Boot order')}
          ${button('debugSmackRandom','Random','Formato aleatório')}
          ${button('debugSmackNpc','Bracket NPC','Sem player')}
        </div>
      </section>
      <section class="invite-letter-card">
        <h3>Queen of She Already Done Had Herses</h3>
        <div class="options debug-options">
          ${button('debugReunionBracket','Bracket','Chaveamento clássico')}
          ${button('debugReunionGauntlet','Gauntlet','Redemption')}
          ${button('debugReunionFirstBoot','First Boot','Boot order')}
          ${button('debugReunionRandom','Random','Formato aleatório')}
        </div>
      </section>
      <section class="invite-letter-card"><p class="small">Console: <code>DEBUG.startSmackdown({mode:"bracket"})</code>, <code>DEBUG.startSmackdown({reunion:true,mode:"gauntlet"})</code>, <code>DEBUG.startLalaparuza({finalOnly:true})</code>.</p><div class="options"><button id="debugHome" class="secondary">Voltar ao jogo normal</button>${backed?'<button id="debugRestore" class="secondary">Restaurar save anterior</button>':''}</div></section>
    </main>`);
    document.querySelector('#debugLalaPlayer')?.addEventListener('click',()=>startLalaparuza({includePlayer:true}));
    document.querySelector('#debugLalaNpc')?.addEventListener('click',()=>startLalaparuza({includePlayer:false}));
    document.querySelector('#debugLalaFinal')?.addEventListener('click',()=>startLalaparuzaFinal({includePlayer:true}));
    document.querySelector('#debugSmackBracket')?.addEventListener('click',()=>startSmackdown(smackdownTypeFromMode('bracket'),{includePlayer:true}));
    document.querySelector('#debugSmackGauntlet')?.addEventListener('click',()=>startSmackdown(smackdownTypeFromMode('gauntlet'),{includePlayer:true}));
    document.querySelector('#debugSmackFirstBoot')?.addEventListener('click',()=>startSmackdown(smackdownTypeFromMode('firstboot'),{includePlayer:true}));
    document.querySelector('#debugSmackRandom')?.addEventListener('click',()=>startSmackdown(smackdownTypeFromMode('random'),{includePlayer:true}));
    document.querySelector('#debugSmackNpc')?.addEventListener('click',()=>startSmackdown(smackdownTypeFromMode('bracket'),{includePlayer:false}));
    document.querySelector('#debugReunionBracket')?.addEventListener('click',()=>startReunionSmackdown({mode:'bracket',includePlayer:true}));
    document.querySelector('#debugReunionGauntlet')?.addEventListener('click',()=>startReunionSmackdown({mode:'gauntlet',includePlayer:true}));
    document.querySelector('#debugReunionFirstBoot')?.addEventListener('click',()=>startReunionSmackdown({mode:'firstboot',includePlayer:true}));
    document.querySelector('#debugReunionRandom')?.addEventListener('click',()=>startReunionSmackdown({mode:'random',includePlayer:true}));
    document.querySelector('#debugHome')?.addEventListener('click',()=>{history.replaceState(null,'',location.pathname); routeAfterLoad();});
    document.querySelector('#debugRestore')?.addEventListener('click',restoreBackedUpSave);
  }
  window.DEBUG_MODE=isDebugUrl();
  window.renderDebugMenu=renderDebugMenu;
  window.DEBUG={
    menu:renderDebugMenu,
    startLalaparuza:({includePlayer=true,finalOnly=false,queens=8}={})=>finalOnly?startLalaparuzaFinal({includePlayer,count:queens}):startLalaparuza({includePlayer,count:queens}),
    startSmackdown:({mode='random',reunion=false,includePlayer=true,queens=6}={})=>reunion?startReunionSmackdown({mode,includePlayer,count:queens}):startSmackdown(smackdownTypeFromMode(mode),{includePlayer,count:queens}),
    lalaparuza:(opts)=>startLalaparuza(opts||{}),
    lalaparuzaNpc:()=>startLalaparuza({includePlayer:false}),
    lalaparuzaFinal:(opts)=>startLalaparuzaFinal(opts||{}),
    smackdown:(opts)=>startSmackdown('legacy_smackdown',opts||{}),
    smackdownNpc:()=>startSmackdown('legacy_smackdown',{includePlayer:false}),
    smackdownBracket:(opts)=>startSmackdown('legacy_smackdown',opts||{}),
    smackdownGauntlet:(opts)=>startSmackdown('redemption_smackdown',opts||{}),
    smackdownFirstBoot:(opts)=>startSmackdown('boot_order_gauntlet',opts||{}),
    smackdownRandom:(opts)=>startSmackdown(smackdownTypeFromMode('random'),opts||{}),
    gauntlet:(opts)=>startSmackdown('redemption_smackdown',opts||{}),
    queenOfShe:(opts)=>startReunionSmackdown(opts||{}),
    reunion:(opts)=>startReunionSmackdown(opts||{}),
    restore:restoreBackedUpSave
  };})();
