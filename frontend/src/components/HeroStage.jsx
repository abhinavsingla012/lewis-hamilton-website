import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, Crosshair } from "lucide-react";
import { IMAGES } from "../data/content";

const Counter = ({ value, testId }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => { let frame; const start=performance.now(); const tick=(time)=>{ const p=Math.min(1,(time-start)/1200); setDisplay(Math.round(value*(1-Math.pow(1-p,3)))); if(p<1)frame=requestAnimationFrame(tick); }; frame=requestAnimationFrame(tick); return()=>cancelAnimationFrame(frame); },[value]);
  return <strong data-testid={testId}>{display}</strong>;
};

export const HeroStage = ({ stats }) => <section id="top" className="hero hero-v3 spatial-hero-stage" data-testid="hero-section">
  <div className="hero-v3-ambient" aria-hidden="true"><span/><span/><span/></div><div className="hero-grid hero-v3-grid" aria-hidden="true"/><div className="hero-v3-floor" aria-hidden="true"/>
  <motion.svg className="hero-v3-track" viewBox="0 0 1000 700" aria-hidden="true"><motion.path d="M-40 540 C170 390 250 515 386 335 S710 75 1040 180" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:2.2}}/></motion.svg>
  <div className="hero-v3-marquee" aria-hidden="true"><span>LEWIS HAMILTON · STILL WE RISE · </span><span>LEWIS HAMILTON · STILL WE RISE · </span></div>
  <div className="hero-v3-title" data-testid="hero-title"><motion.span initial={{x:-120,opacity:0}} animate={{x:0,opacity:1}}>STILL</motion.span><motion.span initial={{x:120,opacity:0}} animate={{x:0,opacity:1}}><i>WE</i> RISE</motion.span></div>
  <div className="hero-v3-stage"><span className="hero-v3-depth depth-a"/><span className="hero-v3-depth depth-b"/><motion.div className="hero-v3-card" initial={{opacity:0,y:60}} animate={{opacity:1,y:0}} transition={{duration:1}}><div className="hero-v3-cardbar"><span>LH / 44</span><span className="hero-v3-live"><i/> ARCHIVE LIVE</span></div><div className="hero-v3-window"><img src={IMAGES.hero} alt="Lewis Hamilton kissing a victory trophy" className="hero-image" data-testid="hero-image"/><div className="hero-v3-scan"/><div className="hero-v3-shine"/><span className="hero-v3-image-index">01 / LEGACY</span></div><div className="hero-v3-cardfoot"><span>THE DEFINITIVE FAN ARCHIVE</span><strong>2007—2025</strong></div></motion.div></div>
  <motion.figure className="hero-v3-token" initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}}><img src={IMAGES.helmet} alt="Lewis Hamilton helmet salute"/><figcaption><span>SECOND PLANE</span><strong>44 / SALUTE</strong></figcaption></motion.figure>
  <div className="hero-v3-number"><div><span>44</span><small>HAM</small></div><i/><i/></div><div className="hero-v3-kicker"><span>THE RECORD BEYOND RECORDS</span><p>One driver. Seven titles.<br/>A legacy measured beyond numbers.</p></div>
  <motion.div className="hero-v3-stats" initial="hidden" animate="show" variants={{hidden:{},show:{transition:{staggerChildren:.12,delayChildren:.7}}}} data-testid="hero-statistics">{[[stats?.wins??105,"GRAND PRIX WINS","hero-wins-stat"],[stats?.titles??7,"WORLD TITLES","hero-titles-stat"],[stats?.poles??104,"POLE POSITIONS","hero-poles-stat"]].map(([value,label,testId],index)=><motion.div key={label} variants={{hidden:{opacity:0,x:25},show:{opacity:1,x:0}}}><span>0{index+1}</span><Counter value={value} testId={testId}/><small>{label}</small></motion.div>)}</motion.div>
  <motion.button className="hero-v3-cta" whileHover={{y:-4}} onClick={()=>window.__spatialGo?.("circuit")} data-testid="explore-legacy-button"><span><ArrowDownRight/></span><div><small>ENTER THE SPATIAL ARCHIVE</small><strong>EXPLORE THE LEGACY</strong></div></motion.button><div className="hero-v3-telemetry"><span>HAM / GBR</span><span>51.5072° N</span><span>2007—2025</span><span><Crosshair size={12}/> PRECISION / PURPOSE / PACE</span></div>
</section>;