import { useState, useEffect } from "react";

// ===== CONFIGURATION =====
// To collect responses automatically, create a free Google Apps Script webhook:
// 1. Go to script.google.com → New Project
// 2. Paste the code from GOOGLE_SCRIPT_SETUP.md
// 3. Deploy as Web App → Copy the URL here:
const WEBHOOK_URL = "https://script.google.com/macros/s/TON_ID_ICI/exec";

const QUESTIONS = [
  { id:"q1", section:"Profil du praticien", si:0, text:"Depuis combien d'années exercez-vous l'ostéopathie ?", type:"single", options:["Moins de 2 ans","2 à 5 ans","5 à 10 ans","Plus de 10 ans"] },
  { id:"q2", section:"Profil du praticien", si:0, text:"Quelle est votre situation d'exercice ?", type:"single", options:["Seul(e) en cabinet","Cabinet partagé (2-3 praticiens)","Centre pluridisciplinaire","Maison de santé / clinique"] },
  { id:"q3", section:"Profil du praticien", si:0, text:"Combien de patients recevez-vous par semaine en moyenne ?", type:"single", options:["Moins de 15","15 à 25","25 à 35","Plus de 35"] },
  { id:"q4", section:"Profil du praticien", si:0, text:"Quel chiffre d'affaires annuel réalisez-vous approximativement ?", type:"single", options:["Moins de 25 000€","25 000€ – 40 000€","40 000€ – 60 000€","Plus de 60 000€"] },
  { id:"q5", section:"Profil du praticien", si:0, text:"Utilisez-vous déjà un logiciel de gestion de cabinet ?", type:"single", options:["Non, tout est papier/Excel","Oui — Doctolib uniquement","Oui — un logiciel dédié (Noterro, Caspen...)","Oui — plusieurs outils combinés"] },

  { id:"q6", section:"Votre quotidien", si:1, text:"En début de consultation, combien de temps passez-vous en questionnaire / anamnèse avec un nouveau patient ?", type:"single", options:["Moins de 5 minutes","5 à 10 minutes","10 à 20 minutes","Plus de 20 minutes"] },
  { id:"q7", section:"Votre quotidien", si:1, text:"Considérez-vous ce temps de questionnaire comme...", type:"single", options:["Du temps utile et nécessaire","Un mal nécessaire, j'aimerais le réduire","Du temps perdu qui me frustre","Le principal frein à ma productivité"] },
  { id:"q8", section:"Votre quotidien", si:1, text:"Vos patients arrivent-ils généralement bien préparés pour la consultation ?", type:"single", options:["Oui, ils expliquent clairement leur problème","Plus ou moins, je dois creuser beaucoup","Rarement, je repars souvent de zéro","Non, la plupart ne savent pas verbaliser leur douleur"] },
  { id:"q9", section:"Votre quotidien", si:1, text:"Combien de fois par semaine devez-vous re-poser les mêmes questions à un patient déjà vu ?", type:"single", options:["Jamais, j'ai un bon suivi","1-3 fois par semaine","Presque tous les jours","À chaque patient récurrent"] },
  { id:"q10", section:"Votre quotidien", si:1, text:"Sur une échelle de 1 à 10, à quel point ce questionnaire pré-consultation est un irritant dans votre quotidien ?", type:"scale", min:1, max:10 },

  { id:"q11", section:"Et si on changeait ça ?", si:2, text:"Si vos patients pouvaient, AVANT le RDV, remplir un formulaire en ligne et cliquer sur un corps humain pour localiser leurs douleurs — à quel point cela vous serait utile ?", type:"scale", min:1, max:10 },
  { id:"q12", section:"Et si on changeait ça ?", si:2, text:"Si une IA vous générait une synthèse structurée de l'état du patient avant qu'il arrive — cela changerait-il votre pratique ?", type:"single", options:["Pas vraiment, je préfère découvrir par moi-même","Intéressant mais pas indispensable","Oui, ça me ferait gagner un temps considérable","Ce serait révolutionnaire pour ma pratique"] },
  { id:"q13", section:"Et si on changeait ça ?", si:2, text:"Que penseriez-vous d'un outil qui génère automatiquement des recommandations d'exercices, nutrition et sport adaptées à votre patient ?", type:"single", options:["Je n'en voudrais pas — c'est mon expertise","Pourquoi pas, si c'est personnalisable","Très intéressant, ça enrichirait mes consultations","Indispensable — je fais déjà ça manuellement"] },
  { id:"q14", section:"Et si on changeait ça ?", si:2, text:"Partagez-vous actuellement des recommandations écrites avec vos patients après la consultation ?", type:"single", options:["Non, jamais","Parfois, à l'oral uniquement","Oui, sur papier ou via un document","Oui, via email ou application"] },
  { id:"q15", section:"Et si on changeait ça ?", si:2, text:"Seriez-vous à l'aise avec l'idée qu'une IA assiste (sans remplacer) votre jugement clinique ?", type:"single", options:["Non, je suis opposé(e) à l'IA","Méfiant(e), mais ouvert(e) à tester","Oui, si ça reste un outil d'aide","Absolument, j'attends ça depuis longtemps"] },

  { id:"q16", section:"Budget & investissement", si:3, text:"Combien dépensez-vous actuellement par mois en outils numériques pour votre cabinet ?", type:"single", options:["0€ — rien","1€ – 30€/mois","30€ – 60€/mois","Plus de 60€/mois"] },
  { id:"q17", section:"Budget & investissement", si:3, text:"Pour un outil qui vous fait gagner 15 min par patient (synthèse IA + body map + suivi), quel prix mensuel serait acceptable ?", type:"single", options:["Gratuit uniquement","Jusqu'à 29€/mois","Jusqu'à 49€/mois","Jusqu'à 99€/mois","Plus de 99€/mois si la valeur est là"] },
  { id:"q18", section:"Budget & investissement", si:3, text:"Préfèreriez-vous un modèle...", type:"single", options:["Abonnement mensuel fixe","Paiement à l'usage (par patient)","Freemium (gratuit limité + premium)","Achat unique (licence)"] },

  { id:"q19", section:"Vos habitudes", si:4, text:"Comment découvrez-vous habituellement de nouveaux outils pour votre pratique ?", type:"multi", options:["Bouche-à-oreille entre confrères","Réseaux sociaux (Instagram, LinkedIn...)","Congrès et formations continues","Recherche Google","Recommandation d'un syndicat","Newsletter ou blog spécialisé"] },
  { id:"q20", section:"Vos habitudes", si:4, text:"Si un confrère que vous respectez vous recommandait cet outil, quelle serait votre réaction ?", type:"single", options:["Je l'ignorerais","Je regarderais par curiosité","Je testerais probablement","Je m'inscrirais immédiatement"] },
  { id:"q21", section:"Vos habitudes", si:4, text:"Seriez-vous prêt(e) à tester gratuitement une version beta pendant 1 mois ?", type:"single", options:["Non, je n'ai pas le temps","Peut-être, si c'est très simple","Oui, ça m'intéresse","Oui, et je donnerais du feedback actif"] },
  { id:"q22", section:"Vos habitudes", si:4, text:"Quel est le SEUL frein qui vous empêcherait d'adopter cet outil ?", type:"single", options:["Le prix","La confidentialité des données patients","La complexité d'utilisation","La peur que l'IA remplace mon expertise","Le manque de temps pour changer mes habitudes"] },

  { id:"q23", section:"Pour conclure", si:5, text:"Si cet outil existait aujourd'hui, vous...", type:"single", options:["Ne l'utiliseriez pas","Attendriez les retours d'autres praticiens","Vous inscrieriez pour la version gratuite","Paieriez immédiatement si ça tient ses promesses"] },
  { id:"q24", section:"Pour conclure", si:5, text:"Y a-t-il une fonctionnalité qui vous manque cruellement aujourd'hui et qu'aucun outil ne propose ?", type:"open", optional:true },
  { id:"q25", section:"Pour conclure", si:5, text:"Seriez-vous disponible pour un appel de 15 min pour approfondir ? Si oui, laissez votre email :", type:"open", optional:true, placeholder:"votre@email.com (optionnel)" },
];

const SNAMES = ["Profil du praticien","Votre quotidien","Et si on changeait ça ?","Budget & investissement","Vos habitudes","Pour conclure"];
const SICONS = ["👤","🔥","💡","💰","🚀","🎯"];

export default function App() {
  const [ci, setCi] = useState(-1);
  const [ans, setAns] = useState({});
  const [multi, setMulti] = useState({});
  const [done, setDone] = useState(false);
  const [trans, setTrans] = useState(false);
  const [fade, setFade] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const total = QUESTIONS.length;
  const pct = ci >= 0 ? ((ci + 1) / total) * 100 : 0;
  const q = ci >= 0 && ci < total ? QUESTIONS[ci] : null;
  const prevSi = ci > 0 ? QUESTIONS[ci - 1]?.si : -1;
  const currSi = q?.si ?? -1;

  useEffect(() => {
    if (ci >= 0 && currSi !== prevSi && ci > 0) {
      setTrans(true);
      const t = setTimeout(() => setTrans(false), 1100);
      return () => clearTimeout(t);
    }
  }, [ci]);

  const go = (next) => {
    setFade(false);
    setTimeout(() => {
      if (next >= total) setDone(true);
      else setCi(next);
      setFade(true);
    }, 180);
  };

  const pickSingle = (i) => {
    setAns(p => ({ ...p, [q.id]: q.options[i] }));
    setTimeout(() => go(ci + 1), 300);
  };

  const pickScale = (v) => {
    setAns(p => ({ ...p, [q.id]: v }));
    setTimeout(() => go(ci + 1), 300);
  };

  const toggleMulti = (i) => {
    setMulti(p => {
      const c = p[q.id] || [];
      return { ...p, [q.id]: c.includes(i) ? c.filter(x => x !== i) : [...c, i] };
    });
  };

  const submitMulti = () => {
    const sel = (multi[q.id] || []).map(i => q.options[i]);
    setAns(p => ({ ...p, [q.id]: sel.join(" | ") }));
    go(ci + 1);
  };

  const submitOpen = () => go(ci + 1);

  // Submit to webhook
  const submitToWebhook = async () => {
    if (!WEBHOOK_URL || sent) return;
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp: new Date().toISOString(), ...ans }),
      });
      setSent(true);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (done && WEBHOOK_URL) submitToWebhook();
  }, [done]);

  const exportCSV = () => {
    const h = QUESTIONS.map(q => q.id);
    const v = QUESTIONS.map(q => `"${String(ans[q.id] || "").replace(/"/g, '""')}"`);
    const csv = h.join(",") + "\n" + v.join(",");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `osteoai-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = () => {
    const t = QUESTIONS.map(q => `${q.id}: ${q.text}\n→ ${ans[q.id] || "(non répondu)"}`).join("\n\n");
    navigator.clipboard.writeText(t).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  // ===== WELCOME =====
  if (ci === -1) return (
    <div style={S.page}>
      <div style={S.center}>
        <div style={S.wCard}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <span style={{ fontSize:40 }}>🩺</span>
            <h1 style={S.wLogo}><span style={{color:"#0d9488"}}>Osteo</span><span style={{color:"#8b5cf6"}}>AI</span></h1>
          </div>
          <h2 style={S.wTitle}>Aidez-nous à construire l'outil que vous méritez</h2>
          <p style={S.wDesc}>
            Ce questionnaire confidentiel de <strong style={{color:"#e2e8f0"}}>7 minutes</strong> nous aide
            à comprendre vos vrais besoins au quotidien. Vos réponses orientent directement le développement
            d'un outil conçu pour vous faire gagner du temps.
          </p>
          <div style={S.wMeta}>
            {[["⏱️","Durée","7 min"],["📊","Questions","25"],["🔒","Données","Anonyme"]].map(([ic,la,va],i)=>(
              <div key={i} style={S.wMetaItem}>
                <span style={{fontSize:20}}>{ic}</span>
                <div><p style={S.wMetaL}>{la}</p><p style={S.wMetaV}>{va}</p></div>
              </div>
            ))}
          </div>
          <button onClick={()=>go(0)} style={S.cta}>Commencer →</button>
          <p style={{fontSize:11,color:"#475569",textAlign:"center",marginTop:14}}>
            Étude menée dans le cadre d'un projet HealthTech · MBA Data & IA
          </p>
        </div>
      </div>
    </div>
  );

  // ===== DONE =====
  if (done) return (
    <div style={S.page}>
      <div style={S.center}>
        <div style={S.wCard}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <span style={{fontSize:52}}>🙏</span>
            <h2 style={{...S.wTitle,marginTop:14}}>Merci infiniment !</h2>
            <p style={S.wDesc}>
              Vos réponses sont précieuses et contribuent directement à créer un outil pensé par et pour les ostéopathes.
            </p>
          </div>
          {WEBHOOK_URL && <p style={{textAlign:"center",fontSize:12,color: sent?"#10b981":"#f59e0b",marginBottom:16}}>
            {sent ? "✓ Réponses envoyées avec succès" : "⏳ Envoi en cours..."}
          </p>}
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
            <button onClick={exportCSV} style={{...S.cta,background:"#0d9488"}}>📥 Télécharger (CSV)</button>
            <button onClick={copyAll} style={{...S.cta,background:"#8b5cf6"}}>
              {copied ? "✓ Copié !" : "📋 Copier mes réponses"}
            </button>
          </div>
          <div style={{padding:18,borderRadius:14,background:"#ffffff05",border:"1px dashed #ffffff15",textAlign:"center"}}>
            <p style={{fontSize:14,color:"#e2e8f0",fontWeight:700,margin:"0 0 6px"}}>
              Connaissez-vous un(e) confrère qui pourrait répondre ?
            </p>
            <p style={{fontSize:12,color:"#64748b",margin:0}}>
              Partagez ce lien — chaque réponse supplémentaire compte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ===== TRANSITION =====
  if (trans) return (
    <div style={S.page}>
      <div style={S.center}>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:52,margin:"0 0 10px"}}>{SICONS[currSi]}</p>
          <h2 style={{fontSize:24,fontWeight:800,color:"#f1f5f9",margin:0}}>{SNAMES[currSi]}</h2>
          <p style={{fontSize:13,color:"#64748b",marginTop:8}}>Section {currSi+1} sur 6</p>
        </div>
      </div>
    </div>
  );

  // ===== QUESTION =====
  return (
    <div style={S.page}>
      {/* Progress */}
      <div style={S.progWrap}><div style={{...S.progBar,width:`${pct}%`}}/></div>

      {/* Header */}
      <div style={S.qHead}>
        <span style={{fontSize:12,color:"#64748b",fontWeight:600}}>{SICONS[q.si]} {q.section}</span>
        <span style={{fontSize:11,color:"#334155",fontWeight:700,background:"#ffffff06",padding:"4px 10px",borderRadius:20}}>
          {ci+1}/{total}
        </span>
      </div>

      {/* Content */}
      <div style={{
        ...S.qWrap,
        opacity: fade?1:0,
        transform: fade?"translateY(0)":"translateY(10px)",
        transition:"opacity 0.18s,transform 0.18s",
      }}>
        <h2 style={S.qText}>{q.text}</h2>

        {q.type==="single" && (
          <div style={S.opts}>
            {q.options.map((o,i)=>{
              const sel = ans[q.id]===o;
              return (
                <button key={i} onClick={()=>pickSingle(i)} style={{
                  ...S.optBtn,
                  borderColor: sel?"#0d9488":"#ffffff0d",
                  background: sel?"#0d948812":"#ffffff03",
                }}>
                  <span style={{
                    ...S.optL,
                    background: sel?"#0d9488":"#ffffff0a",
                    color: sel?"#fff":"#94a3b8",
                  }}>{String.fromCharCode(65+i)}</span>
                  <span style={{color:sel?"#e2e8f0":"#cbd5e1",fontSize:15}}>{o}</span>
                </button>
              );
            })}
          </div>
        )}

        {q.type==="multi" && (
          <div style={S.opts}>
            {q.options.map((o,i)=>{
              const sel = (multi[q.id]||[]).includes(i);
              return (
                <button key={i} onClick={()=>toggleMulti(i)} style={{
                  ...S.optBtn,
                  borderColor: sel?"#8b5cf6":"#ffffff0d",
                  background: sel?"#8b5cf612":"#ffffff03",
                }}>
                  <span style={{
                    width:22,height:22,borderRadius:5,flexShrink:0,
                    border:`2px solid ${sel?"#8b5cf6":"#ffffff20"}`,
                    background:sel?"#8b5cf6":"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:12,color:"#fff",
                  }}>{sel?"✓":""}</span>
                  <span style={{color:sel?"#e2e8f0":"#cbd5e1",fontSize:15}}>{o}</span>
                </button>
              );
            })}
            <p style={{fontSize:11,color:"#475569",margin:"4px 0 0"}}>Plusieurs choix possibles</p>
            <button onClick={submitMulti} disabled={!(multi[q.id]||[]).length}
              style={{...S.cta,opacity:(multi[q.id]||[]).length?1:0.3,cursor:(multi[q.id]||[]).length?"pointer":"default",marginTop:8}}
            >Valider →</button>
          </div>
        )}

        {q.type==="scale" && (
          <div>
            <div style={S.scaleRow}>
              {Array.from({length:q.max-q.min+1},(_,i)=>q.min+i).map(n=>{
                const sel = ans[q.id]===n;
                const c = n>=8?"#ef4444":n>=6?"#f59e0b":n>=4?"#0d9488":"#64748b";
                return (
                  <button key={n} onClick={()=>pickScale(n)} style={{
                    ...S.scaleBtn,
                    borderColor:sel?c:"#ffffff0d",
                    background:sel?c+"1a":"#ffffff03",
                    color:sel?c:"#94a3b8",
                    fontWeight:sel?800:600,
                    transform:sel?"scale(1.12)":"scale(1)",
                  }}>{n}</button>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
              <span style={{fontSize:11,color:"#475569"}}>Pas du tout</span>
              <span style={{fontSize:11,color:"#475569"}}>Énormément</span>
            </div>
          </div>
        )}

        {q.type==="open" && (
          <div>
            <textarea value={ans[q.id]||""} onChange={e=>setAns(p=>({...p,[q.id]:e.target.value}))}
              placeholder={q.placeholder||"Votre réponse..."} rows={4} style={S.ta} />
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button onClick={submitOpen} style={S.cta}>
                {ans[q.id]?"Valider →":"Passer →"}
              </button>
            </div>
            {q.optional && <p style={{fontSize:11,color:"#475569",marginTop:8}}>Cette question est optionnelle</p>}
          </div>
        )}
      </div>

      {ci>0 && <button onClick={()=>go(ci-1)} style={S.back}>← Précédent</button>}

      <div style={{textAlign:"center",padding:"0 24px 20px"}}>
        <span style={{fontSize:11,color:"#1e293b"}}>
          {q.type==="single"?"Cliquez sur une réponse pour continuer":
           q.type==="scale"?"Cliquez sur un chiffre":""}
        </span>
      </div>
    </div>
  );
}

const S = {
  page:{fontFamily:"'DM Sans',sans-serif",background:"#08081a",color:"#e2e8f0",minHeight:"100vh",display:"flex",flexDirection:"column"},
  center:{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 20px"},
  wCard:{maxWidth:480,width:"100%"},
  wLogo:{fontSize:34,fontWeight:900,margin:"8px 0 0",letterSpacing:-1,textAlign:"center"},
  wTitle:{fontSize:22,fontWeight:800,textAlign:"center",color:"#f1f5f9",lineHeight:1.3,margin:"0 0 12px"},
  wDesc:{fontSize:14,color:"#94a3b8",textAlign:"center",lineHeight:1.7,marginBottom:28},
  wMeta:{display:"flex",justifyContent:"center",gap:24,marginBottom:28,flexWrap:"wrap"},
  wMetaItem:{display:"flex",alignItems:"center",gap:8},
  wMetaL:{fontSize:10,color:"#475569",margin:0,textTransform:"uppercase",letterSpacing:.5},
  wMetaV:{fontSize:14,color:"#e2e8f0",fontWeight:700,margin:0},
  cta:{display:"block",width:"100%",padding:"14px 24px",borderRadius:12,background:"linear-gradient(135deg,#0d9488,#0f766e)",color:"#fff",border:"none",cursor:"pointer",fontSize:16,fontWeight:700,letterSpacing:.3},
  progWrap:{height:3,background:"#ffffff06",position:"sticky",top:0,zIndex:10},
  progBar:{height:"100%",background:"linear-gradient(90deg,#0d9488,#8b5cf6)",borderRadius:"0 2px 2px 0",transition:"width 0.4s"},
  qHead:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 24px 0"},
  qWrap:{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"28px 24px",maxWidth:580,margin:"0 auto",width:"100%"},
  qText:{fontSize:20,fontWeight:700,lineHeight:1.4,color:"#f1f5f9",marginBottom:28},
  opts:{display:"flex",flexDirection:"column",gap:8},
  optBtn:{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:12,border:"1.5px solid",cursor:"pointer",textAlign:"left",transition:"all 0.12s",width:"100%",background:"transparent"},
  optL:{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,flexShrink:0,transition:"all 0.12s"},
  scaleRow:{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"},
  scaleBtn:{width:48,height:48,borderRadius:12,border:"1.5px solid",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",transition:"all 0.12s",background:"transparent"},
  ta:{width:"100%",padding:"14px 16px",borderRadius:12,border:"1.5px solid #ffffff0d",background:"#ffffff05",color:"#e2e8f0",fontSize:15,fontFamily:"inherit",resize:"vertical",outline:"none",lineHeight:1.5,boxSizing:"border-box"},
  back:{position:"fixed",bottom:24,left:24,padding:"8px 16px",borderRadius:8,background:"#ffffff08",color:"#64748b",border:"1px solid #ffffff0d",cursor:"pointer",fontSize:12,fontWeight:600},
};
