const $ = s => document.querySelector(s);
const STORAGE = "meme-arena-v1";
const initial = [
 {id:"demo1",caption:"Когда сказал «я только на пять минут» и уже рассвет",category:"Жиза",image:"https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=900&q=80",author:"ArenaBot",votes:18,created:Date.now()-3000},
 {id:"demo2",caption:"Мой мозг на контрольной: обновление не найдено",category:"Школа",image:"https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",author:"Pixel",votes:12,created:Date.now()-2000},
 {id:"demo3",caption:"Когда тиммейт говорит «я всё контролирую»",category:"Игры",image:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",author:"NoScope",votes:9,created:Date.now()-1000}
];
let state = JSON.parse(localStorage.getItem(STORAGE) || "null") || {user:null,memes:initial,users:[]};
let category = "Все";
function save(){localStorage.setItem(STORAGE,JSON.stringify(state))}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
 const list = state.memes.filter(m=>category==="Все"||m.category===category).sort((a,b)=>$("#sortSelect").value==="top"?b.votes-a.votes:b.created-a.created);
 $("#memeGrid").innerHTML=list.map(m=>`<article class="meme-card"><img src="${escapeHTML(m.image)}" alt="Мем: ${escapeHTML(m.caption)}" onerror="this.src='https://placehold.co/800x500/21172e/ffffff?text=Image+not+available'"><div class="meme-info"><div class="meme-caption">${escapeHTML(m.caption)}</div><div class="meme-meta">${escapeHTML(m.category)} · автор ${escapeHTML(m.author)}</div><div class="meme-actions"><button class="vote ${m.voters?.includes(state.user?.name)?'voted':''}" data-vote="${m.id}">${m.voters?.includes(state.user?.name)?'✓ Голос учтён':'▲ Голосовать'}</button><span class="score">${m.votes} голосов</span></div></div></article>`).join("");
 $("#emptyState").classList.toggle("hidden",list.length!==0);
 $("#memeCount").textContent=state.memes.length;
 $("#voteCount").textContent=state.memes.reduce((n,m)=>n+m.votes,0);
 $("#userCount").textContent=state.users.length;
 const scores={};state.memes.forEach(m=>scores[m.author]=(scores[m.author]||0)+m.votes);
 const leaders=Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,10);
 $("#leaderboard").innerHTML=leaders.length?leaders.map(([name,score],i)=>`<div class="leader-row"><span class="rank">#${i+1}</span><span class="avatar">${escapeHTML(name[0].toUpperCase())}</span><span class="leader-name">${escapeHTML(name)}</span><span class="leader-score">${score} очков</span></div>`).join(""):'<p class="muted">Пока нет участников. Будь первым!</p>';
 $("#accountArea").innerHTML=state.user?`Привет, <b>${escapeHTML(state.user.name)}</b> <button class="filter" id="logout">Выйти</button>`:`<button class="filter" id="loginOpen">Войти</button>`;
 $("#loginOpen")?.addEventListener("click",()=>$("#authDialog").showModal());
 $("#logout")?.addEventListener("click",()=>{state.user=null;save();render()});
}
$("#filters").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;category=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));render()});
$("#sortSelect").addEventListener("change",render);
$("#memeGrid").addEventListener("click",e=>{const b=e.target.closest("[data-vote]");if(!b)return;if(!state.user){$("#authDialog").showModal();return}const m=state.memes.find(x=>x.id===b.dataset.vote);m.voters=m.voters||[];if(m.voters.includes(state.user.name)){alert("Ты уже голосовал за этот мем.");return}m.voters.push(state.user.name);m.votes++;save();render()});
$("#authForm").addEventListener("submit",e=>{e.preventDefault();const name=$("#nickname").value.trim().replace(/[<>]/g,"");if(name.length<2)return;state.user={name};if(!state.users.includes(name))state.users.push(name);save();$("#authDialog").close();render()});
$("#memeForm").addEventListener("submit",e=>{e.preventDefault();if(!state.user){$("#authDialog").showModal();return}const image=$("#imageUrl").value.trim();try{const u=new URL(image);if(!["http:","https:"].includes(u.protocol))throw 0}catch{alert("Введи корректную ссылку на изображение.");return}state.memes.unshift({id:crypto.randomUUID(),caption:$("#caption").value.trim(),category:$("#category").value,image,author:state.user.name,votes:0,voters:[],created:Date.now()});save();e.target.reset();render();location.hash="#arena"});
render();