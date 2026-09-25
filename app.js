const a=window.ADDONS||[];
const g=document.getElementById("addonsGrid");
document.getElementById("year").textContent=new Date().getFullYear();

const count=document.getElementById("addonCount");
if(count){
  const n=a.length;
  count.textContent=n+" "+(n===1?"addon":n>=2&&n<=4?"addony":"addonů");
}

const FORM_ENDPOINT="https://formspree.io/f/xppwlrlz";
const RELEASE_API="https://api.github.com/repos/peetrmi-art/Muj-Mix/releases/tags/downloads";
const RELEASE_BASE="https://github.com/peetrmi-art/Muj-Mix/releases/download/downloads/";

let ai=0,ii=0;
const d=document.getElementById("gallery");
const im=document.getElementById("galleryImage");
const pos=document.getElementById("pos");

function show(){
  const x=a[ai];
  im.src=x.images[ii];
  im.alt=x.name;
  pos.textContent=(ii+1)+" / "+x.images.length;
}

function openG(i){
  ai=i;
  ii=0;
  show();
  d.showModal();
}

function addonFileName(x){
  return decodeURIComponent(x.download.split("/").pop());
}

a.forEach((x,i)=>{
  const fileName=addonFileName(x);
  const releaseUrl=RELEASE_BASE+encodeURIComponent(fileName);

  const c=document.createElement("article");
  c.className="card";
  c.dataset.file=fileName;
  c.innerHTML=
    '<div class="cover">'+
      '<img src="'+x.images[0]+'" alt="'+x.name+'">'+
      '<span class="badge">'+x.badge+'</span>'+
    '</div>'+
    '<div class="body">'+
      '<h3>'+x.name+'</h3>'+
      '<p>'+x.description+'</p>'+
      (x.update?'<div class="update-note">'+x.update+'</div>':'')+
      '<div class="meta">'+
        '<span>'+x.fileType+'</span>'+
        '<span>'+x.fileSize+'</span>'+
        '<span>Verze '+x.version+'</span>'+
        '<span class="download-count">⬇ 0 stažení</span>'+
      '</div>'+
      '<div class="actions">'+
        '<a class="btn primary download-link" href="'+releaseUrl+'">⬇ Stáhnout</a>'+
        '<button class="btn ghost gallery-btn" type="button">Obrázky</button>'+
      '</div>'+
      '<button class="feedback-toggle" type="button">💬 Napsat připomínku nebo nápad</button>'+
      '<form class="feedback-form" hidden>'+
        '<input type="hidden" name="addon" value="'+x.name.replace(/"/g,"&quot;")+'">'+
        '<input type="hidden" name="page" value="'+location.href.replace(/"/g,"&quot;")+'">'+
        '<label>Přezdívka <small>(volitelné)</small>'+
          '<input type="text" name="nickname" maxlength="60" autocomplete="nickname" placeholder="Tvoje přezdívka">'+
        '</label>'+
        '<label>Zpráva / připomínka'+
          '<textarea name="message" maxlength="1500" rows="4" required placeholder="Co nefunguje, co by šlo zlepšit nebo jaký máš nápad?"></textarea>'+
        '</label>'+
        '<button class="btn primary feedback-submit" type="submit">Odeslat připomínku</button>'+
        '<div class="feedback-status" role="status" aria-live="polite"></div>'+
      '</form>'+
    '</div>';

  c.querySelector(".cover").onclick=()=>openG(i);
  c.querySelector(".gallery-btn").onclick=()=>openG(i);

  const toggle=c.querySelector(".feedback-toggle");
  const form=c.querySelector(".feedback-form");
  toggle.onclick=()=>{
    const opening=form.hidden;
    form.hidden=!opening;
    toggle.textContent=opening?"✕ Zavřít formulář":"💬 Napsat připomínku nebo nápad";
    if(opening){
      const field=form.querySelector("textarea");
      setTimeout(()=>field.focus(),0);
    }
  };

  form.addEventListener("submit",async(e)=>{
    e.preventDefault();
    const submit=form.querySelector(".feedback-submit");
    const status=form.querySelector(".feedback-status");
    submit.disabled=true;
    submit.textContent="Odesílám…";
    status.className="feedback-status";
    status.textContent="";

    try{
      const response=await fetch(FORM_ENDPOINT,{
        method:"POST",
        body:new FormData(form),
        headers:{"Accept":"application/json"}
      });

      if(response.ok){
        form.reset();
        form.querySelector('input[name="addon"]').value=x.name;
        form.querySelector('input[name="page"]').value=location.href;
        status.classList.add("success");
        status.textContent="✓ Díky, připomínka byla odeslána.";
      }else{
        status.classList.add("error");
        status.textContent="Nepodařilo se odeslat zprávu. Zkus to prosím znovu.";
      }
    }catch(err){
      status.classList.add("error");
      status.textContent="Nepodařilo se odeslat zprávu. Zkontroluj připojení a zkus to znovu.";
    }finally{
      submit.disabled=false;
      submit.textContent="Odeslat připomínku";
    }
  });

  g.appendChild(c);
});

async function loadDownloadCounts(){
  try{
    const response=await fetch(RELEASE_API,{headers:{"Accept":"application/vnd.github+json"}});
    if(!response.ok) throw new Error("GitHub API");
    const release=await response.json();
    const assets=new Map((release.assets||[]).map(asset=>[asset.name,asset]));

    document.querySelectorAll(".card[data-file]").forEach(card=>{
      const asset=assets.get(card.dataset.file);
      if(!asset) return;

      const counter=card.querySelector(".download-count");
      const link=card.querySelector(".download-link");
      counter.textContent="⬇ "+asset.download_count+" stažení";
      link.href=asset.browser_download_url;
    });
  }catch(err){
    document.querySelectorAll(".download-count").forEach(el=>{
      el.textContent="⬇ počet stažení nedostupný";
    });
  }
}

loadDownloadCounts();

document.getElementById("closeGallery").onclick=()=>d.close();
document.getElementById("prev").onclick=()=>{
  ii=(ii-1+a[ai].images.length)%a[ai].images.length;
  show();
};
document.getElementById("next").onclick=()=>{
  ii=(ii+1)%a[ai].images.length;
  show();
};