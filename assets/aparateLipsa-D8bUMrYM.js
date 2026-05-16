import{s as n,g as s,a as u,V as g,b as m,c as f}from"./main-FJI7JdBr.js";import"./modulepreload-polyfill-B5Qt9EMX.js";const v=a=>String(a||"").replace(/[<>&"']/g,t=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"})[t]),h=Object.freeze({"banca-inclinata":"Banca inclinata","banca-plana":"Banca plana","bara-halterelor":"Bara halterelor",gantere:"Gantere","aparat-cablu":"Aparat cablu / scripete","power-rack":"Power rack / Smith machine","leg-press":"Leg press","aparat-extensii":"Aparat extensii / curls picioare","aparat-tractiuni":"Aparat tractiuni / bara fixa","banda-elastica":"Banda elastica"});function w(a){if(document.getElementById("aparate-lipsa-modal"))return;n.currentScreen="aparate-lipsa";const t=document.createElement("div");t.id="aparate-lipsa-modal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:8000;display:flex;align-items:flex-end;justify-content:center";const r=s(),o=u(),l=g.map(e=>{const i=r.includes(e)?"checked":"",x=h[e]||e;return`
      <label data-equipment-row="${e}" style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);cursor:pointer">
        <input type="checkbox" data-equipment="${e}" ${i} style="width:18px;height:18px;accent-color:#c8412e;flex-shrink:0"/>
        <span style="font-size:13px;font-weight:600;color:var(--text);flex:1">${x}</span>
      </label>`}).join(""),d=o.length>0?o.map(e=>{const i=v(e);return`
      <label data-exercise-row="${i}" style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);cursor:pointer">
        <input type="checkbox" data-exercise="${i}" checked style="width:18px;height:18px;accent-color:#c8412e;flex-shrink:0"/>
        <span style="font-size:13px;font-weight:600;color:var(--text);flex:1">${i}</span>
      </label>`}).join(""):'<div data-exercise-empty="true" style="font-size:11px;color:var(--text3);line-height:1.5;font-style:italic;padding:8px 4px">Nu ai eliminat niciun exercitiu permanent yet. Poti marca din Antrenor &gt; Preview cu &quot;Nu am&quot; sau &quot;Nu vreau&quot; repetat.</div>';t.innerHTML=`
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:500px;padding:22px 20px 32px;max-height:85vh;overflow-y:auto">
      <div style="font-size:15px;font-weight:700;margin-bottom:4px">Aparate lipsa</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:14px;line-height:1.5">Bifeaza aparatele pe care <strong style="color:var(--text)">nu le ai</strong>. Coach-ul va alege exercitii alternative si nu le va propune in viitor.</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:14px;line-height:1.5;font-style:italic">Poti reveni oricand sa scoti din lista daca ai acum aparatul.</div>

      <div style="font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:8px;margin-top:6px">Aparate</div>
      <div id="aparate-lipsa-stack" style="display:flex;flex-direction:column;gap:8px">
        ${l}
      </div>

      <div style="font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:8px;margin-top:18px">Exercitii refuzate permanent</div>
      <div id="exercitii-refuzate-stack" style="display:flex;flex-direction:column;gap:8px">
        ${d}
      </div>

      <p style="font-size:11px;color:var(--text3);margin-top:14px;line-height:1.5;font-style:italic">Coach-ul invata din selectiile tale. Daca lipsesc mai multe aparate, propune sesiuni bodyweight sau cu alternative.</p>
      <button class="aparate-close" style="margin-top:14px;width:100%;padding:12px;background:var(--accent);color:#000;border:none;border-radius:var(--rs);cursor:pointer;font-size:13px;font-weight:600">Gata</button>
    </div>`,document.body.appendChild(t),t.querySelectorAll('input[type="checkbox"][data-equipment]').forEach(e=>{e.addEventListener("change",()=>{const i=e.dataset.equipment;m(i),p(e.checked?"Adaugat la aparate lipsa":"Scos din aparate lipsa")})}),t.querySelectorAll('input[type="checkbox"][data-exercise]').forEach(e=>{e.addEventListener("change",()=>{const i=e.dataset.exercise;f(i),p(e.checked?"Adaugat la exercitii refuzate":"Scos din exercitii refuzate")})}),t.querySelector(".aparate-close").addEventListener("click",()=>{c(),typeof a=="function"&&a({action:"done",list:s()})}),t.addEventListener("click",e=>{e.target===t&&(c(),typeof a=="function"&&a({action:"cancel",source:"backdrop"}))})}function c(){const a=document.getElementById("aparate-lipsa-modal");a&&a.remove(),n.currentScreen==="aparate-lipsa"&&(n.currentScreen="antrenor")}function p(a){const t=document.getElementById("aparate-toast");t&&t.remove();const r=document.createElement("div");r.id="aparate-toast",r.style.cssText="position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--bg2);border:1px solid var(--accent);border-radius:var(--rs);padding:10px 16px;font-size:12px;color:var(--text);z-index:9000;max-width:300px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.4)",r.textContent=a,document.body.appendChild(r),setTimeout(()=>{r.parentNode&&r.remove()},2e3)}export{h as APARATE_LIPSA_LABELS,c as closeAparateLipsaModal,w as showAparateLipsa};
