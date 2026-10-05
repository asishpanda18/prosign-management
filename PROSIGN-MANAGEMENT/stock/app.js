const KEY="signstock_pro_v1";
const seed={
 settings:{workshop:"Signage Workshop",currency:"₹"},
 items:[
  {id:"ITM-001",sku:"ACR-3-WHT",name:"Acrylic 3mm White",category:"Sheet",unit:"sheet",location:"Acrylic Rack",min:5,qty:18,cost:1650,sale:0,active:true},
  {id:"ITM-002",sku:"ACR-3-CLR",name:"Acrylic 3mm Clear",category:"Sheet",unit:"sheet",location:"Acrylic Rack",min:5,qty:11,cost:1450,sale:0,active:true},
  {id:"ITM-003",sku:"ACP-3-BLK",name:"ACP 3mm Black",category:"Sheet",unit:"sheet",location:"ACP Rack",min:4,qty:9,cost:1850,sale:0,active:true},
  {id:"ITM-004",sku:"FLEX-440",name:"Flex 440 GSM",category:"Media",unit:"sqm",location:"Media Rack",min:20,qty:84,cost:85,sale:0,active:true},
  {id:"ITM-005",sku:"LED-12V-3W",name:"LED Module 12V 3W",category:"LED",unit:"pcs",location:"LED Bin",min:200,qty:920,cost:18,sale:0,active:true},
  {id:"ITM-006",sku:"SMPS-12-400",name:"SMPS 12V 400W",category:"Electrical",unit:"pcs",location:"Electrical Rack",min:8,qty:24,cost:780,sale:0,active:true},
  {id:"ITM-007",sku:"WIRE-1SQ",name:"Copper Wire 1.0 sqmm",category:"Electrical",unit:"m",location:"Wire Rack",min:100,qty:650,cost:12,sale:0,active:true},
  {id:"ITM-008",sku:"VINYL-WHT",name:"Self Adhesive Vinyl White",category:"Media",unit:"sqm",location:"Media Rack",min:15,qty:42,cost:110,sale:0,active:true},
  {id:"ITM-009",sku:"SS-ANGLE",name:"SS Angle 1 inch",category:"Hardware",unit:"m",location:"Metal Rack",min:20,qty:125,cost:95,sale:0,active:true},
  {id:"ITM-010",sku:"LED-TUBE",name:"LED Tube 12V",category:"Lighting",unit:"m",location:"LED Rack",min:25,qty:140,cost:160,sale:0,active:true}
 ],
 suppliers:[
  {id:"SUP-001",name:"ABC Acrylics",phone:"",gst:"",contact:""},
  {id:"SUP-002",name:"Bright LED Solutions",phone:"",gst:"",contact:""}
 ],
 transactions:[],
 jobs:[
  {id:"JC-1001",customer:"Demo Client",title:"Front LED Sign",date:"2026-10-05",delivery:"2026-10-08",status:"Production",notes:"Demo job",materials:[
   {itemId:"ITM-001",planned:1,issued:1,returned:0,waste:0},
   {itemId:"ITM-005",planned:120,issued:120,returned:0,waste:6},
   {itemId:"ITM-006",planned:1,issued:1,returned:0,waste:0}
  ]}
 ],
 wastage:[],
 purchases:[]
};
let db=load();
function load(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(seed)}catch(e){return structuredClone(seed)}}
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function uid(prefix){return prefix+"-"+Math.random().toString(36).slice(2,7).toUpperCase()+Date.now().toString().slice(-4)}
function money(n){return "₹"+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2})}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function item(id){return db.items.find(x=>x.id===id)}
function job(id){return db.jobs.find(x=>x.id===id)}
function qty(n){return Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:3})}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.className="show";setTimeout(()=>t.className="",2200)}
function openModal(title,body){document.getElementById("modalTitle").textContent=title;document.getElementById("modalBody").innerHTML=body;document.getElementById("modal").classList.remove("hidden")}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
document.getElementById("closeModal").onclick=closeModal;
document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
document.getElementById("mobileMenu").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
document.getElementById("quickStock").onclick=()=>stockForm();
document.getElementById("nav").onclick=e=>{const b=e.target.closest(".nav");if(!b)return;document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.view);document.querySelector(".sidebar").classList.remove("open")};
document.getElementById("today").textContent=new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
function render(view="dashboard"){
 document.getElementById("pageTitle").textContent=({dashboard:"Dashboard",items:"Item Master",transactions:"Stock Movements",jobs:"Job Cards",wastage:"Wastage & Scrap",purchases:"Purchases",suppliers:"Suppliers",reports:"Reports",backup:"Backup & Settings"})[view];
 document.getElementById("content").innerHTML=({dashboard:dashboard,items:itemsView,transactions:transactionsView,jobs:jobsView,wastage:wastageView,purchases:purchasesView,suppliers:suppliersView,reports:reportsView,backup:backupView})[view]();
}
function dashboard(){
 const total=db.items.reduce((a,x)=>a+x.qty*x.cost,0), low=db.items.filter(x=>x.qty<=x.min), open=db.jobs.filter(x=>!["Delivered","Cancelled"].includes(x.status));
 const issued=db.transactions.filter(x=>x.type==="OUT").reduce((a,x)=>a+x.qty*x.rate,0), waste=db.wastage.reduce((a,x)=>a+x.qty*x.rate,0);
 return `<div class="section">
 <div class="grid cards">
  ${metric("Stock Value",money(total),"Current book value","orange")}
  ${metric("Low Stock",low.length,low.length?"Needs attention":"All healthy","red")}
  ${metric("Open Job Cards",open.length,"In production / pending","blue")}
  ${metric("Wastage Value",money(waste),"Recorded scrap cost","green")}
 </div>
 <div class="grid two" style="margin-top:16px">
  <div class="card"><div class="toolbar"><div><b>Stock health</b><div class="muted">Items at or below reorder level</div></div><span class="pill">${db.items.length} SKUs</span></div>
   ${low.length?`<div class="table-wrap"><table class="table"><thead><tr><th>Item</th><th>Available</th><th>Min</th><th>Value</th><th>Status</th></tr></thead><tbody>${low.map(x=>`<tr><td><b>${esc(x.name)}</b><br><span class="muted">${esc(x.sku)}</span></td><td>${qty(x.qty)} ${esc(x.unit)}</td><td>${qty(x.min)}</td><td>${money(x.qty*x.cost)}</td><td><span class="status ${x.qty<=0?"out":"low"}">${x.qty<=0?"OUT":"LOW"}</span></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">✓ No low-stock items right now.</div>`}
  </div>
  <div class="card"><div class="toolbar"><div><b>Recent movements</b><div class="muted">Latest stock activity</div></div><button class="btn small secondary" onclick="render('transactions')">View all</button></div>
   ${db.transactions.slice(-6).reverse().map(t=>`<div class="list-item"><div><b>${esc(item(t.itemId)?.name||"Unknown")}</b><br><span class="muted">${esc(t.reason||t.type)} · ${esc(t.jobId||"")}</span></div><div class="${t.type==="IN"?"green":"red"}">${t.type==="IN"?"+":"-"}${qty(t.qty)} ${esc(item(t.itemId)?.unit||"")}</div></div>`).join("")||`<div class="empty">No movements yet.</div>`}
  </div>
 </div>
 <div class="grid two" style="margin-top:16px">
  <div class="card"><div class="toolbar"><div><b>Active Job Cards</b><div class="muted">Material accountability by job</div></div><button class="btn small primary" onclick="jobForm()">+ Job Card</button></div>
   ${open.slice(0,5).map(j=>`<div class="list-item"><div><b>${esc(j.id)} · ${esc(j.title)}</b><br><span class="muted">${esc(j.customer)} · Delivery ${esc(j.delivery||"-")}</span></div><span class="status blue">${esc(j.status)}</span></div>`).join("")||`<div class="empty">No active jobs.</div>`}
  </div>
  <div class="card"><div class="toolbar"><div><b>Wastage snapshot</b><div class="muted">Material lost during production</div></div><button class="btn small secondary" onclick="render('wastage')">Open log</button></div>
   <div class="metric">${money(waste)}</div><div class="muted">Total recorded wastage cost</div>
   <div style="margin-top:18px">${wasteByItem().slice(0,4).map(x=>`<div class="list-item"><div>${esc(x.name)}</div><b>${money(x.value)}</b></div>`).join("")||`<div class="empty">No wastage logged.</div>`}</div>
  </div>
 </div>
 </div>`
}
function metric(a,b,c,cls){return `<div class="card"><div class="metric-row"><div><div class="kicker">${a}</div><div class="metric ${cls}">${b}</div><div class="muted">${c}</div></div></div></div>`}
function itemsView(){
 return `<div class="section"><div class="toolbar"><div class="toolbar-left"><input class="search" id="itemSearch" placeholder="Search SKU, item, category..." oninput="filterItems()"><select class="select" id="itemCat" style="width:160px" onchange="filterItems()"><option value="">All categories</option>${[...new Set(db.items.map(x=>x.category))].sort().map(c=>`<option>${esc(c)}</option>`).join("")}</select></div><div class="toolbar-right"><button class="btn secondary" onclick="stockForm('IN')">+ Stock In</button><button class="btn primary" onclick="itemForm()">+ New Item</button></div></div><div class="card"><div id="itemsTable">${itemsTable()}</div></div></div>`
}
function itemsTable(list=db.items){
 if(!list.length)return `<div class="empty">No items found.</div>`;
 return `<div class="table-wrap"><table class="table"><thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>Location</th><th>On Hand</th><th>Min</th><th>Avg Cost</th><th>Stock Value</th><th>Status</th><th></th></tr></thead><tbody>${list.map(x=>`<tr><td><b>${esc(x.sku)}</b></td><td>${esc(x.name)}<br><span class="muted">${esc(x.id)}</span></td><td>${esc(x.category)}</td><td>${esc(x.location)}</td><td><b>${qty(x.qty)}</b> ${esc(x.unit)}</td><td>${qty(x.min)}</td><td>${money(x.cost)}</td><td>${money(x.qty*x.cost)}</td><td><span class="status ${x.qty<=0?"out":x.qty<=x.min?"low":"ok"}">${x.qty<=0?"OUT":x.qty<=x.min?"LOW":"OK"}</span></td><td><button class="btn small secondary" onclick="itemForm('${x.id}')">Edit</button></td></tr>`).join("")}</tbody></table></div>`
}
function filterItems(){const q=document.getElementById("itemSearch").value.toLowerCase(),c=document.getElementById("itemCat").value;document.getElementById("itemsTable").innerHTML=itemsTable(db.items.filter(x=>(!q||`${x.sku} ${x.name} ${x.category}`.toLowerCase().includes(q))&&(!c||x.category===c)))}
function itemForm(id){
 const x=id?item(id):{sku:"",name:"",category:"Sheet",unit:"pcs",location:"",min:0,qty:0,cost:0};
 openModal(id?"Edit Item":"New Stock Item",`<form id="f" class="form-grid">
 <div class="field"><label>SKU *</label><input class="input" name="sku" required value="${esc(x.sku)}"></div>
 <div class="field"><label>Item Name *</label><input class="input" name="name" required value="${esc(x.name)}"></div>
 <div class="field"><label>Category</label><select class="select" name="category">${["Sheet","Media","LED","Electrical","Lighting","Hardware","Ink","Consumable","Tool","Other"].map(v=>`<option ${x.category===v?"selected":""}>${v}</option>`).join("")}</select></div>
 <div class="field"><label>Unit</label><select class="select" name="unit">${["pcs","sheet","sqm","sqft","m","kg","ltr","roll","set"].map(v=>`<option ${x.unit===v?"selected":""}>${v}</option>`).join("")}</select></div>
 <div class="field"><label>Storage Location</label><input class="input" name="location" value="${esc(x.location)}" placeholder="Rack / Bin"></div>
 <div class="field"><label>Minimum / Reorder Level</label><input class="input" type="number" step="0.001" name="min" value="${x.min}"></div>
 <div class="field"><label>Unit Cost (₹)</label><input class="input" type="number" step="0.01" name="cost" value="${x.cost}"></div>
 <div class="field"><label>Opening Quantity ${id?"(current stock not changed here)":""}</label><input class="input" type="number" step="0.001" name="qty" value="${x.qty}"></div>
 <div class="field full"><div class="notice">For stock changes, use <b>Stock Movements</b> so every adjustment gets a reason, reference and audit trail.</div></div>
 <div class="form-actions full"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Save Item</button></div></form>`);
 document.getElementById("f").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e));if(id){Object.assign(x,{sku:d.sku,name:d.name,category:d.category,unit:d.unit,location:d.location,min:+d.min,cost:+d.cost})}else{db.items.push({id:uid("ITM"),sku:d.sku,name:d.name,category:d.category,unit:d.unit,location:d.location,min:+d.min,qty:+d.qty,cost:+d.cost,sale:0,active:true});}save();closeModal();render("items");toast("Item saved")}
}
function transactionsView(){
 return `<div class="section"><div class="toolbar"><div><b>Stock Ledger</b><div class="muted">Every receipt, issue, return and adjustment</div></div><button class="btn primary" onclick="stockForm()">+ Record Movement</button></div><div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Type</th><th>Item</th><th>Qty</th><th>Rate</th><th>Reference</th><th>Job Card</th><th>Reason</th><th>User</th></tr></thead><tbody>${db.transactions.slice().reverse().map(t=>`<tr><td>${esc(t.date)}</td><td><span class="status ${t.type==="IN"?"ok":t.type==="RETURN"?"blue":"out"}">${esc(t.type)}</span></td><td>${esc(item(t.itemId)?.name||"Deleted")}</td><td>${qty(t.qty)} ${esc(item(t.itemId)?.unit||"")}</td><td>${money(t.rate)}</td><td>${esc(t.ref||"-")}</td><td>${esc(t.jobId||"-")}</td><td>${esc(t.reason||"-")}</td><td>${esc(t.user||"Admin")}</td></tr>`).join("")||`<tr><td colspan="9" class="empty">No stock movements.</td></tr>`}</tbody></table></div></div></div>`
}
function stockForm(forceType){
 openModal("Record Stock Movement",`<form id="f" class="form-grid">
 <div class="field"><label>Movement Type</label><select class="select" name="type">${["IN","OUT","RETURN","ADJUSTMENT"].map(v=>`<option ${forceType===v?"selected":""}>${v}</option>`).join("")}</select></div>
 <div class="field"><label>Date</label><input class="input" type="date" name="date" value="${new Date().toISOString().slice(0,10)}"></div>
 <div class="field full"><label>Item *</label><select class="select" name="itemId" required><option value="">Select item</option>${db.items.map(x=>`<option value="${x.id}">${esc(x.sku)} — ${esc(x.name)} (${qty(x.qty)} ${esc(x.unit)})</option>`).join("")}</select></div>
 <div class="field"><label>Quantity *</label><input class="input" type="number" step="0.001" min="0.001" name="qty" required></div>
 <div class="field"><label>Rate / Unit Cost (₹)</label><input class="input" type="number" step="0.01" name="rate" value="0"></div>
 <div class="field"><label>Reference / GRN / Invoice</label><input class="input" name="ref" placeholder="PO- / Invoice-"></div>
 <div class="field"><label>Job Card (for OUT/RETURN)</label><select class="select" name="jobId"><option value="">Not job-linked</option>${db.jobs.map(j=>`<option value="${j.id}">${j.id} — ${esc(j.title)}</option>`).join("")}</select></div>
 <div class="field full"><label>Reason / Notes</label><textarea class="textarea" name="reason" rows="2" placeholder="Purchase, production issue, return, correction..."></textarea></div>
 <div class="form-actions full"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Post Movement</button></div></form>`);
 document.getElementById("f").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e)),x=item(d.itemId),n=+d.qty;let delta=0;if(d.type==="IN"||d.type==="RETURN")delta=n;else if(d.type==="OUT")delta=-n;else delta=n-(x.qty);if(d.type==="OUT"&&n>x.qty){toast("Not enough stock available");return}x.qty+=delta;db.transactions.push({id:uid("TXN"),...d,qty:n,rate:+d.rate||x.cost,user:"Admin"});save();closeModal();render("transactions");toast("Movement posted")}
}
const statuses=["Draft","Material Issued","Production","QC","Ready","Delivered","Cancelled"];
function jobsView(){
 return `<div class="section"><div class="toolbar"><div><b>Job Cards</b><div class="muted">Track material planned vs issued vs returned vs wastage</div></div><button class="btn primary" onclick="jobForm()">+ Create Job Card</button></div>
 <div class="kanban">${statuses.slice(0,6).map(s=>`<div class="kanban-col"><div class="kanban-head"><span>${s}</span><span class="pill">${db.jobs.filter(j=>j.status===s).length}</span></div>${db.jobs.filter(j=>j.status===s).map(j=>`<div class="job-card"><h4>${esc(j.id)} · ${esc(j.title)}</h4><p>${esc(j.customer)}</p><p>Delivery: ${esc(j.delivery||"-")}</p><p>${j.materials?.length||0} materials linked</p><span class="tag">${esc(j.status)}</span><button class="btn small secondary" style="float:right" onclick="jobDetail('${j.id}')">Open</button><div style="clear:both"></div></div>`).join("")||`<div class="muted small" style="padding:15px 3px">No jobs</div>`}</div>`).join("")}</div>
 <div class="card" style="margin-top:16px"><div class="toolbar"><b>Job accountability</b><span class="muted">A job cannot hide material consumption</span></div><div class="table-wrap"><table class="table"><thead><tr><th>Job</th><th>Customer</th><th>Status</th><th>Planned Cost</th><th>Issued Cost</th><th>Wastage Cost</th><th>Variance</th></tr></thead><tbody>${db.jobs.map(j=>jobStatsRow(j)).join("")}</tbody></table></div></div></div>`
}
function jobStats(j){let p=0,i=0,w=0;(j.materials||[]).forEach(m=>{const x=item(m.itemId),c=x?.cost||0;p+=m.planned*c;i+=m.issued*c;w+=m.waste*c});return{p,i,w,var:i-p}}
function jobStatsRow(j){const s=jobStats(j);return `<tr><td><b>${esc(j.id)}</b><br>${esc(j.title)}</td><td>${esc(j.customer)}</td><td><span class="status blue">${esc(j.status)}</span></td><td>${money(s.p)}</td><td>${money(s.i)}</td><td class="red">${money(s.w)}</td><td class="${s.var>0?"red":"green"}">${money(s.var)}</td></tr>`}
function jobForm(id){
 const j=id?job(id):{id:uid("JC"),customer:"",title:"",date:new Date().toISOString().slice(0,10),delivery:"",status:"Draft",notes:"",materials:[]};
 openModal(id?"Edit Job Card":"Create Job Card",`<form id="f" class="form-grid">
 <div class="field"><label>Job Card No.</label><input class="input" name="id" value="${esc(j.id)}" readonly></div>
 <div class="field"><label>Status</label><select class="select" name="status">${statuses.map(s=>`<option ${j.status===s?"selected":""}>${s}</option>`).join("")}</select></div>
 <div class="field"><label>Customer *</label><input class="input" name="customer" required value="${esc(j.customer)}"></div>
 <div class="field"><label>Job / Sign Name *</label><input class="input" name="title" required value="${esc(j.title)}"></div>
 <div class="field"><label>Job Date</label><input class="input" type="date" name="date" value="${j.date}"></div>
 <div class="field"><label>Delivery Date</label><input class="input" type="date" name="delivery" value="${j.delivery}"></div>
 <div class="field full"><label>Notes</label><textarea class="textarea" name="notes" rows="2">${esc(j.notes)}</textarea></div>
 <div class="field full"><div class="notice">After creating the job, open it to <b>issue materials</b>, record returns and post wastage against the exact job card.</div></div>
 <div class="form-actions full"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Save Job Card</button></div></form>`);
 document.getElementById("f").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e));if(id)Object.assign(j,d);else db.jobs.push({...j,...d});save();closeModal();render("jobs");toast("Job card saved")}
}
function jobDetail(id){
 const j=job(id);
 openModal(`${j.id} — Material Accountability`,`<div class="notice">Planned = estimate. Issued = physically released to production. Returned = usable material returned to stores. Wastage = unusable scrap recorded against this job.</div>
 <div class="toolbar" style="margin-top:15px"><div><b>${esc(j.title)}</b><div class="muted">${esc(j.customer)} · ${esc(j.status)}</div></div><button class="btn primary" onclick="jobMaterialForm('${j.id}')">+ Add / Issue Material</button></div>
 <div class="table-wrap"><table class="table"><thead><tr><th>Material</th><th>Planned</th><th>Issued</th><th>Returned</th><th>Wastage</th><th>Net Used</th><th>Waste %</th><th></th></tr></thead><tbody>${(j.materials||[]).map((m,idx)=>{const x=item(m.itemId),net=m.issued-m.returned,wp=m.issued?m.waste/m.issued*100:0;return `<tr><td><b>${esc(x?.name||"Unknown")}</b><br><span class="muted">${esc(x?.unit||"")}</span></td><td>${qty(m.planned)}</td><td>${qty(m.issued)}</td><td>${qty(m.returned)}</td><td class="red">${qty(m.waste)}</td><td><b>${qty(net)}</b></td><td>${wp.toFixed(1)}%</td><td><button class="btn small secondary" onclick="wasteForm('${j.id}','${m.itemId}')">Waste</button></td></tr>`}).join("")||`<tr><td colspan="8" class="empty">No materials linked.</td></tr>`}</tbody></table></div>
 <div class="form-actions"><button class="btn secondary" onclick="jobForm('${j.id}')">Edit Job</button><button class="btn primary" onclick="closeModal();render('jobs')">Close</button></div>`)
}
function jobMaterialForm(jobId){
 const j=job(jobId);
 openModal("Issue / Plan Material",`<form id="f" class="form-grid">
 <div class="field full"><label>Material *</label><select class="select" name="itemId" required><option value="">Select</option>${db.items.map(x=>`<option value="${x.id}">${esc(x.sku)} — ${esc(x.name)} (${qty(x.qty)} ${esc(x.unit)} in stock)</option>`).join("")}</select></div>
 <div class="field"><label>Planned Qty</label><input class="input" type="number" step=".001" name="planned" value="0"></div>
 <div class="field"><label>Issue Qty *</label><input class="input" type="number" step=".001" name="issued" required value="0"></div>
 <div class="field"><label>Return Qty</label><input class="input" type="number" step=".001" name="returned" value="0"></div>
 <div class="field full"><label>Note</label><input class="input" name="note" placeholder="Cutting, assembly, installation, etc."></div>
 <div class="form-actions full"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Save & Issue</button></div></form>`);
 document.getElementById("f").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e)),x=item(d.itemId),issued=+d.issued,ret=+d.returned;if(issued>x.qty){toast("Insufficient stock");return}let m=j.materials.find(z=>z.itemId===d.itemId);if(!m){m={itemId:d.itemId,planned:+d.planned,issued:0,returned:0,waste:0};j.materials.push(m)}else if(+d.planned)m.planned=+d.planned;m.issued+=issued;m.returned+=ret;x.qty-=issued-ret;db.transactions.push({id:uid("TXN"),date:new Date().toISOString().slice(0,10),type:"OUT",itemId:d.itemId,qty:issued,rate:x.cost,ref:j.id,jobId:j.id,reason:d.note||"Job material issue",user:"Admin"});if(ret)db.transactions.push({id:uid("TXN"),date:new Date().toISOString().slice(0,10),type:"RETURN",itemId:d.itemId,qty:ret,rate:x.cost,ref:j.id,jobId:j.id,reason:"Usable material returned",user:"Admin"});save();closeModal();jobDetail(jobId);toast("Material issued and job updated")}
}
function wastageView(){
 const total=db.wastage.reduce((a,w)=>a+w.qty*w.rate,0);
 return `<div class="section"><div class="toolbar"><div><b>Wastage & Scrap Register</b><div class="muted">Every scrap quantity and cost tied to a job, reason and material</div></div><button class="btn primary" onclick="wasteForm()">+ Record Wastage</button></div>
 <div class="grid cards"><div class="card"><div class="kicker">Total Waste Qty</div><div class="metric">${qty(db.wastage.reduce((a,w)=>a+w.qty,0))}</div></div><div class="card"><div class="kicker">Waste Cost</div><div class="metric red">${money(total)}</div></div><div class="card"><div class="kicker">Waste Entries</div><div class="metric">${db.wastage.length}</div></div><div class="card"><div class="kicker">Waste % of Issued</div><div class="metric">${wastePercent().toFixed(1)}%</div></div></div>
 <div class="card" style="margin-top:16px"><div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Job Card</th><th>Material</th><th>Qty</th><th>Rate</th><th>Cost</th><th>Reason</th><th>Type</th></tr></thead><tbody>${db.wastage.slice().reverse().map(w=>`<tr><td>${esc(w.date)}</td><td><b>${esc(w.jobId||"-")}</b></td><td>${esc(item(w.itemId)?.name||"Unknown")}</td><td>${qty(w.qty)} ${esc(item(w.itemId)?.unit||"")}</td><td>${money(w.rate)}</td><td class="red">${money(w.qty*w.rate)}</td><td>${esc(w.reason)}</td><td>${esc(w.kind)}</td></tr>`).join("")||`<tr><td colspan="8" class="empty">No wastage recorded.</td></tr>`}</tbody></table></div></div></div>`
}
function wastePercent(){const issued=db.jobs.reduce((a,j)=>a+(j.materials||[]).reduce((s,m)=>s+m.issued,0),0),w=db.wastage.reduce((a,x)=>a+x.qty,0);return issued?w/issued*100:0}
function wasteByItem(){const map={};db.wastage.forEach(w=>{const n=item(w.itemId)?.name||"Unknown";map[n]=(map[n]||0)+w.qty*w.rate});return Object.entries(map).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value)}
function wasteForm(jobId,itemId){
 const j=jobId?job(jobId):null;
 openModal("Record Wastage / Scrap",`<form id="f" class="form-grid">
 <div class="field"><label>Job Card</label><select class="select" name="jobId"><option value="">General / Workshop</option>${db.jobs.map(j=>`<option value="${j.id}" ${j.id===jobId?"selected":""}>${j.id} — ${esc(j.title)}</option>`).join("")}</select></div>
 <div class="field"><label>Date</label><input class="input" type="date" name="date" value="${new Date().toISOString().slice(0,10)}"></div>
 <div class="field full"><label>Material *</label><select class="select" name="itemId" required><option value="">Select</option>${db.items.map(x=>`<option value="${x.id}" ${x.id===itemId?"selected":""}>${esc(x.name)} (${esc(x.unit)})</option>`).join("")}</select></div>
 <div class="field"><label>Wastage Qty *</label><input class="input" type="number" step=".001" min=".001" name="qty" required></div>
 <div class="field"><label>Rate (₹)</label><input class="input" type="number" step=".01" name="rate" value="${item(itemId)?.cost||0}"></div>
 <div class="field"><label>Reason</label><select class="select" name="reason">${["Cutting offcut","Wrong cut","Damaged material","Printing error","Installation damage","Electrical failure","Rework","Expired/defective","Other"].map(x=>`<option>${x}</option>`).join("")}</select></div>
 <div class="field"><label>Scrap Type</label><select class="select" name="kind"><option>Scrap</option><option>Reusable Remnant</option><option>Defective</option><option>Production Loss</option></select></div>
 <div class="field full"><label>Notes</label><textarea class="textarea" name="notes" rows="2"></textarea></div>
 <div class="form-actions full"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Record Wastage</button></div></form>`);
 document.getElementById("f").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e));const x=item(d.itemId);const w={id:uid("WST"),...d,qty:+d.qty,rate:+d.rate||x.cost};db.wastage.push(w);if(d.jobId){const j=job(d.jobId),m=j.materials.find(z=>z.itemId===d.itemId);if(m)m.waste+=+d.qty;else j.materials.push({itemId:d.itemId,planned:0,issued:0,returned:0,waste:+d.qty})}save();closeModal();render("wastage");toast("Wastage recorded against "+(d.jobId||"workshop"))}
}
function purchasesView(){
 return `<div class="section"><div class="toolbar"><div><b>Purchase Register</b><div class="muted">GRN / supplier purchases feed stock-in records</div></div><button class="btn primary" onclick="purchaseForm()">+ New Purchase</button></div><div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>PO / GRN</th><th>Date</th><th>Supplier</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>${db.purchases.slice().reverse().map(p=>`<tr><td><b>${esc(p.id)}</b></td><td>${esc(p.date)}</td><td>${esc(db.suppliers.find(s=>s.id===p.supplierId)?.name||"-")}</td><td>${p.lines.length}</td><td>${money(p.total)}</td><td><span class="status ok">${esc(p.status)}</span></td></tr>`).join("")||`<tr><td colspan="6" class="empty">No purchases recorded.</td></tr>`}</tbody></table></div></div></div>`
}
function purchaseForm(){
 openModal("New Purchase / GRN",`<form id="f" class="form-grid"><div class="field"><label>Supplier</label><select class="select" name="supplierId"><option value="">Select</option>${db.suppliers.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("")}</select></div><div class="field"><label>Date</label><input class="input" type="date" name="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="field full"><label>Item</label><select class="select" name="itemId">${db.items.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></div><div class="field"><label>Quantity</label><input class="input" type="number" step=".001" name="qty"></div><div class="field"><label>Rate</label><input class="input" type="number" step=".01" name="rate"></div><div class="field"><label>Invoice No.</label><input class="input" name="invoice"></div><div class="field full"><label>Notes</label><input class="input" name="notes"></div><div class="form-actions full"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Receive Purchase</button></div></form>`);
 document.getElementById("f").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e)),x=item(d.itemId),n=+d.qty,r=+d.rate||x.cost;x.qty+=n;x.cost=((x.qty-n)*x.cost+n*r)/x.qty;const p={id:uid("GRN"),date:d.date,supplierId:d.supplierId,lines:[{itemId:d.itemId,qty:n,rate:r}],total:n*r,status:"Received"};db.purchases.push(p);db.transactions.push({id:uid("TXN"),date:d.date,type:"IN",itemId:d.itemId,qty:n,rate:r,ref:p.id,jobId:"",reason:"Purchase / GRN",user:"Admin"});save();closeModal();render("purchases");toast("Purchase received and stock updated")}
}
function suppliersView(){
 return `<div class="section"><div class="toolbar"><div><b>Suppliers</b><div class="muted">Material vendors and purchase contacts</div></div><button class="btn primary" onclick="supplierForm()">+ Supplier</button></div><div class="grid three">${db.suppliers.map(s=>`<div class="card"><div class="metric-row"><b>${esc(s.name)}</b><button class="btn small secondary" onclick="supplierForm('${s.id}')">Edit</button></div><p class="muted">${esc(s.contact||"No contact")}</p><p class="small">${esc(s.phone||"")} ${s.gst?"· GST "+esc(s.gst):""}</p></div>`).join("")}</div></div>`
}
function supplierForm(id){
 const s=id?db.suppliers.find(x=>x.id===id):{name:"",contact:"",phone:"",gst:""};
 openModal(id?"Edit Supplier":"New Supplier",`<form id="f" class="form-grid"><div class="field full"><label>Supplier Name *</label><input class="input" name="name" required value="${esc(s.name)}"></div><div class="field"><label>Contact Person</label><input class="input" name="contact" value="${esc(s.contact)}"></div><div class="field"><label>Phone</label><input class="input" name="phone" value="${esc(s.phone)}"></div><div class="field full"><label>GSTIN</label><input class="input" name="gst" value="${esc(s.gst)}"></div><div class="form-actions full"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Save</button></div></form>`);
 document.getElementById("f").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e));if(id)Object.assign(s,d);else db.suppliers.push({id:uid("SUP"),...d});save();closeModal();render("suppliers");toast("Supplier saved")}
}
function reportsView(){
 const cat={};db.items.forEach(x=>cat[x.category]=(cat[x.category]||0)+x.qty*x.cost);const cats=Object.entries(cat).sort((a,b)=>b[1]-a[1]).slice(0,8);const max=cats[0]?.[1]||1;
 return `<div class="section"><div class="toolbar"><div><b>Inventory Reports</b><div class="muted">Cost, consumption and wastage visibility</div></div><button class="btn secondary" onclick="exportCSV()">Export Stock CSV</button></div>
 <div class="grid two"><div class="card"><b>Stock value by category</b><div class="chartbar">${cats.map(([n,v])=>`<div class="bar" style="height:${Math.max(5,v/max*175)}px"><b>${money(v)}</b><span>${esc(n.slice(0,9))}</span></div>`).join("")}</div></div>
 <div class="card"><b>Job cost summary</b><div style="margin-top:12px">${db.jobs.slice(-8).reverse().map(j=>{const s=jobStats(j);return `<div class="list-item"><div><b>${esc(j.id)}</b><br><span class="muted">${esc(j.title)}</span></div><b>${money(s.i+s.w)}</b></div>`}).join("")||`<div class="empty">No jobs.</div>`}</div></div></div>
 <div class="grid three" style="margin-top:16px"><div class="card"><div class="kicker">Inventory SKUs</div><div class="metric">${db.items.length}</div></div><div class="card"><div class="kicker">Total Stock Value</div><div class="metric">${money(db.items.reduce((a,x)=>a+x.qty*x.cost,0))}</div></div><div class="card"><div class="kicker">Transactions</div><div class="metric">${db.transactions.length}</div></div></div></div>`
}
function exportCSV(){const rows=[["SKU","Item","Category","Unit","Location","Qty","Min","Cost","Stock Value"],...db.items.map(x=>[x.sku,x.name,x.category,x.unit,x.location,x.qty,x.min,x.cost,x.qty*x.cost])];const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="signstock-inventory.csv";a.click();URL.revokeObjectURL(a.href)}
function backupView(){return `<div class="section"><div class="grid two"><div class="card"><h3>Data Backup</h3><p class="muted">Export the complete local database as JSON. Keep regular backups.</p><button class="btn primary" onclick="backup()">Download Backup</button></div><div class="card"><h3>Restore Backup</h3><p class="muted">Restore a previously exported SignStock JSON file. This replaces current browser data.</p><input class="input" type="file" accept=".json" id="restore"><div style="margin-top:10px"><button class="btn danger" onclick="restore()">Restore Selected File</button></div></div></div><div class="card" style="margin-top:16px"><h3>System rules</h3><ul class="muted"><li>Never adjust stock silently — use a movement.</li><li>Issue production material against a Job Card.</li><li>Record unusable scrap as Wastage and reusable offcuts separately.</li><li>Back up before major changes or device migration.</li></ul><button class="btn danger" onclick="resetDemo()">Reset Demo Data</button></div></div>`}
function backup(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:"application/json"}));a.download="signstock-backup-"+new Date().toISOString().slice(0,10)+".json";a.click()}
function restore(){const f=document.getElementById("restore").files[0];if(!f)return toast("Choose a JSON backup first");const r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);save();render("dashboard");toast("Backup restored")}catch(e){toast("Invalid backup file")}};r.readAsText(f)}
function resetDemo(){if(confirm("Reset all local data to demo data?")){db=structuredClone(seed);save();render("dashboard");toast("Demo data reset")}}
render("dashboard");
