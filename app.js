const a=window.ADDONS||[];
const x=a[0];
const FORM_ENDPOINT="https://formspree.io/f/xppwlrlz";
const RELEASE_API="https://api.github.com/repos/peetrmi-art/Muj-Mix/releases/tags/downloads";
const RELEASE_BASE="https://github.com/peetrmi-art/Muj-Mix/releases/download/downloads/";

document.getElementById("year").textContent=new Date().getFullYear();

const featuredImage=document.getElementById("featuredImage");
const thumbs=document.getElementById("thumbs");
const addonTitle=document.getElementById("addonTitle");
const addonSubtitle=document.getElementById("addonSubtitle");
const descriptionText=document.getElementById("descriptionText");
const hintText=document.getElementById("hintText");
const updateBox=document.getElementById("updateBox");
const meta=document.getElementById("meta");
const downloadBtn=document.getElementById("downloadBtn");
const galleryBtn=document.getElementById("galleryBtn");
const mainPreview=document.getElementById("mainPreview");

addonTitle.textContent=x.name;
addonSubtitle.textContent=x.subtitle||"";
descriptionText.textContent=x.description||"";
hintText.textContent=x.hint||"";
updateBox.textContent=x.update||"";
featuredImage.src=x.images[0];
featuredImage.alt=x.name;

x.images.forEach((src,i)=>{
  const b=document.createElement("button");
  b.className="thumb"+(i===0?" active":"");
  b.type="button";
  b.innerHTML='<img src="'+src+'" alt="'+x.name+' screenshot '+(i+1)+'">';
  b.onclick=()=>{
    featuredImage.src=src;
    document.querySelectorAll(".thumb").forEach(t=>t.classList.remove("active"));
    b.classList.add("active");
  };
  thumbs.appendChild(b);
});

meta.innerHTML=
  '<span>'+x.fileType+'</span>'+
  '<span>'+x.fileSize+'</span>'+
  '<span>Verze '+x.version+'</span>'+
  '<span id="downloadCount">⬇ načítám…</span>';

const fileName=decodeURIComponent(x.download.split("/").pop());
downloadBtn.href=RELEASE_BASE+encodeURIComponent(fileName);

async function loadDownloadCount(){
  try{
    const response=await fetch(RELEASE_API,{headers:{"Accept":"application/vnd.github+json"}});
    if(!response.ok) throw new Error("GitHub API");
    const release=await response.json();
    const asset=(release.assets||[]).find(a=>a.name===fileName);
    if(!asset) throw new Error("asset");
    const total=(Number(x.downloadOffset)||0)+asset.download_count;
    document.getElementById("downloadCount").textContent="⬇ "+total+" stažení";
    downloadBtn.href=asset.browser_download_url;
  }catch(err){
    document.getElementById("downloadCount").textContent="⬇ počet nedostupný";
  }
}
loadDownloadCount();

let gi=0;
const dialog=document.getElementById("gallery");
const galleryImage=document.getElementById("galleryImage");
const pos=document.getElementById("pos");
function showGallery(){
  galleryImage.src=x.images[gi];
  galleryImage.alt=x.name;
  pos.textContent=(gi+1)+" / "+x.images.length;
}
function openGallery(start=0){
  gi=start;showGallery();dialog.showModal();
}
mainPreview.onclick=()=>openGallery(0);
galleryBtn.onclick=()=>openGallery(0);
document.getElementById("closeGallery").onclick=()=>dialog.close();
document.getElementById("prev").onclick=()=>{gi=(gi-1+x.images.length)%x.images.length;showGallery()};
document.getElementById("next").onclick=()=>{gi=(gi+1)%x.images.length;showGallery()};

const feedbackToggle=document.getElementById("feedbackToggle");
const feedbackForm=document.getElementById("feedbackForm");
document.getElementById("feedbackPage").value=location.href;
feedbackToggle.onclick=()=>{
  const opening=feedbackForm.hidden;
  feedbackForm.hidden=!opening;
  feedbackToggle.textContent=opening?"✕ Zavřít formulář":"💬 Napsat připomínku nebo nápad";
};
feedbackForm.addEventListener("submit",async(e)=>{
  e.preventDefault();
  const submit=feedbackForm.querySelector(".feedback-submit");
  const status=feedbackForm.querySelector(".feedback-status");
  submit.disabled=true;
  submit.textContent="Odesílám…";
  status.className="feedback-status";
  status.textContent="";
  try{
    const response=await fetch(FORM_ENDPOINT,{method:"POST",body:new FormData(feedbackForm),headers:{"Accept":"application/json"}});
    if(response.ok){
      feedbackForm.reset();
      feedbackForm.querySelector('input[name="addon"]').value=x.name;
      document.getElementById("feedbackPage").value=location.href;
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