const KEY="signcrm_pro_v1";
const stages=["New Lead","Contacted","Requirement","Quotation Sent","Follow-up","Negotiation","Won","Lost"];
const seed={
 settings:{company:"Signage Sales CRM",currency:"₹"},
 leads:[
  {id:"LD-1001",name:"Rahul Sharma",company:"ABC Restaurant",phone:"9876543210",email:"",source:"WhatsApp",service:"LED Signage",value:45000,stage:"Quotation Sent",owner:"Admin",created:"2026-10-02",next:"2026-10-07",notes:"Front elevation sign. Follow up on quotation.",priority:"Hot"},
  {id:"LD-1002",name:"Priya Das",company:"Das Boutique",phone:"",email:"",source:"Instagram",service:"Glow Sign + ACP",value:28000,stage:"Requirement",owner:"Admin",created:"2026-10-04",next:"2026-10-06",notes:"Needs site visit.",priority:"Warm"},
  {id:"LD-1003",name:"Amit",company:"New Cafe",phone:"",email:"",source:"Referral",service:"Neon Sign",value:18000,stage:"New Lead",owner:"Admin",created:"2026-10-05",next:"2026-10-06",notes:"Initial enquiry.",priority:"Hot"}
 ],
 customers:[],
 activities:[
  {id:"ACT-1",leadId:"LD-1001",date:"2026-10-06",type:"Follow-up",subject:"Call about quotation",status:"Pending",notes:"Ask for approval.",owner:"Admin"},
  {id:"ACT-2",leadId:"LD-1002",date:"2026-10-06",type:"Site Visit",subject:"Measure storefront",status:"Pending",notes:"Take photos and dimensions.",owner:"Admin"}
 ],
 quotes:[
  {id:"Q-1001",leadId:"LD-1001",customer:"ABC Restaurant",date:"2026-10-03",valid:"2026-10-13",amount:45000,status:"Sent",items:"Front LED signage",notes:"50% advance on confirmation."}
 ],
 communications:[],
 team:[{name:"Admin",role:"Administrator"}]
};
let db=load();
function load(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(seed)}catch(e){return structuredClone(seed)}}
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function uid(p){return p+"-"+Math.random().toString(36).slice(2,7).toUpperCase()+Date.now().toString().slice(-4)}
function money(n){return "₹"+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2})}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function lead(id){return db.leads.find(x=>x.id===id)}
function customer(id){return db.customers.find(x=>x.id===id)}
function stageClass(s){return s==="Won"?"s-won":s==="Lost"?"s-lost":s==="Follow-up"||s==="Negotiation"?"s-follow":s==="Quotation Sent"?"s-hot":"s-new"}
function toast(m){const t=document.getElementById("toast");t.textContent=m;t.className="show";setTimeout(()=>t.className="",2200)}
function modal(title,body){document.getElementById("modalTitle").textContent=title;document.getElementById("modalBody").innerHTML=body;document.getElementById("modal").classList.remove("hidden")}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
document.getElementById("close").onclick=closeModal;
document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
document.getElementById("menu").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
document.getElementById("quickLead").onclick=()=>leadForm();
document.getElementById("nav").onclick=e=>{const b=e.target.closest(".nav");if(!b)return;document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.view);document.querySelector(".sidebar").classList.remove("open")};
document.getElementById("date").textContent=new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
function render(v="dashboard"){
 document.getElementById("title").textContent=({dashboard:"Dashboard",leads:"Leads",pipeline:"Sales Pipeline",customers:"Customers",activities:"Activities & Follow-ups",quotes:"Quotations","lost":"Won / Lost History",reports:"Reports",backup:"Backup & Settings"})[v];
 document.getElementById("content").innerHTML=({dashboard,leads:leadsView,pipeline:pipelineView,customers:customersView,activities:activitiesView,quotes:quotesView,lost:lostView,reports:reportsView,backup:backupView})[v]();
}
function dashboard(){
 const total=db.leads.reduce((a,x)=>a+(x.value||0),0),won=db.leads.filter(x=>x.stage==="Won"),wonVal=won.reduce((a,x)=>a+(x.value||0),0),open=db.leads.filter(x=>!["Won","Lost"].includes(x.stage)),due=db.activities.filter(x=>x.status!=="Done"&&x.date<=new Date().toISOString().slice(0,10));
 return `<div class="section"><div class="grid cards">
 ${metric("Pipeline Value",money(open.reduce((a,x)=>a+(x.value||0),0)),"Open opportunities","orange")}
 ${metric("Won Value",money(wonVal),`${won.length} won deals`,"green")}
 ${metric("Open Leads",open.length,"Active opportunities","blue")}
 ${metric("Follow-ups Due",due.length,due.length?"Needs action":"All clear","red")}
 </div>
 <div class="grid two" style="margin-top:16px">
 <div class="card"><div class="toolbar"><div><b>Sales funnel</b><div class="muted">Leads by pipeline stage</div></div><button class="btn small secondary" onclick="render('pipeline')">Open Pipeline</button></div>
 ${stages.slice(0,7).map(s=>{const n=db.leads.filter(x=>x.stage===s).length,val=db.leads.filter(x=>x.stage===s).reduce((a,x)=>a+(x.value||0),0);return `<div class="list-item"><div><b>${s}</b><br><span class="muted">${n} opportunity${n===1?"":"ies"}</span></div><b>${money(val)}</b></div>`}).join("")}</div>
 <div class="card"><div class="toolbar"><div><b>Today's follow-ups</b><div class="muted">Calls, visits and pending actions</div></div><button class="btn small primary" onclick="activityForm()">+ Activity</button></div>
 ${due.slice(0,6).map(a=>`<div class="list-item"><div><b>${esc(a.subject)}</b><br><span class="muted">${esc(a.type)} · ${esc(lead(a.leadId)?.company||"")}</span></div><span class="status s-follow">${esc(a.date)}</span></div>`).join("")||`<div class="empty">No follow-ups due.</div>`}</div>
 </div>
 <div class="grid two" style="margin-top:16px">
 <div class="card"><div class="toolbar"><div><b>Recent leads</b><div class="muted">Latest enquiries</div></div><button class="btn small secondary" onclick="render('leads')">View all</button></div>
 ${db.leads.slice(-6).reverse().map(l=>`<div class="list-item"><div><b>${esc(l.company||l.name)}</b><br><span class="muted">${esc(l.service)} · ${esc(l.name)}</span></div><div style="text-align:right"><b>${money(l.value)}</b><br><span class="status ${stageClass(l.stage)}">${esc(l.stage)}</span></div></div>`).join("")}</div>
 <div class="card"><div class="toolbar"><div><b>Lead sources</b><div class="muted">Where enquiries are coming from</div></div></div>
 ${sourceStats().map(x=>`<div class="list-item"><span>${esc(x.name)}</span><b>${x.n}</b></div>`).join("")}</div>
 </div></div>`
}
function metric(a,b,c,cls){return `<div class="card"><div class="kicker">${a}</div><div class="metric ${cls}">${b}</div><div class="muted">${c}</div></div>`}
function sourceStats(){const m={};db.leads.forEach(l=>m[l.source]=(m[l.source]||0)+1);return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([name,n])=>({name,n}))}
function leadsView(){
 return `<div class="section"><div class="toolbar"><div class="toolbar-left"><input class="search" id="leadSearch" placeholder="Search name, company, phone..." oninput="filterLeads()"><select class="select" id="leadStage" style="width:170px" onchange="filterLeads()"><option value="">All stages</option>${stages.map(s=>`<option>${s}</option>`).join("")}</select></div><div class="toolbar-right"><button class="btn secondary" onclick="customerForm()">+ Customer</button><button class="btn primary" onclick="leadForm()">+ New Lead</button></div></div><div class="card"><div id="leadTable">${leadTable()}</div></div></div>`
}
function leadTable(list=db.leads){
 return `<div class="table-wrap"><table class="table"><thead><tr><th>Lead</th><th>Contact</th><th>Service</th><th>Value</th><th>Source</th><th>Stage</th><th>Next Follow-up</th><th>Priority</th><th></th></tr></thead><tbody>${list.map(l=>`<tr><td><b>${esc(l.id)}</b><br>${esc(l.company||l.name)}<br><span class="muted">${esc(l.name)}</span></td><td>${esc(l.phone||"-")}<br>${esc(l.email||"")}</td><td>${esc(l.service)}</td><td><b>${money(l.value)}</b></td><td>${esc(l.source)}</td><td><span class="status ${stageClass(l.stage)}">${esc(l.stage)}</span></td><td>${esc(l.next||"-")}</td><td>${esc(l.priority)}</td><td><button class="btn small secondary" onclick="leadDetail('${l.id}')">Open</button></td></tr>`).join("")||`<tr><td colspan="9" class="empty">No leads.</td></tr>`}</tbody></table></div>`
}
function filterLeads(){const q=document.getElementById("leadSearch").value.toLowerCase(),s=document.getElementById("leadStage").value;document.getElementById("leadTable").innerHTML=leadTable(db.leads.filter(l=>(!q||`${l.name} ${l.company} ${l.phone} ${l.service}`.toLowerCase().includes(q))&&(!s||l.stage===s)))}
function leadForm(id){
 const l=id?lead(id):{id:uid("LD"),name:"",company:"",phone:"",email:"",source:"WhatsApp",service:"LED Signage",value:0,stage:"New Lead",owner:"Admin",created:new Date().toISOString().slice(0,10),next:new Date().toISOString().slice(0,10),notes:"",priority:"Warm"};
 modal(id?"Edit Lead":"New Lead",`<form id="f" class="form-grid">
 <div class="field"><label>Lead ID</label><input class="input" name="id" value="${esc(l.id)}" readonly></div>
 <div class="field"><label>Stage</label><select class="select" name="stage">${stages.map(s=>`<option ${l.stage===s?"selected":""}>${s}</option>`).join("")}</select></div>
 <div class="field"><label>Contact Person *</label><input class="input" name="name" required value="${esc(l.name)}"></div>
 <div class="field"><label>Company / Business</label><input class="input" name="company" value="${esc(l.company)}"></div>
 <div class="field"><label>Phone</label><input class="input" name="phone" value="${esc(l.phone)}"></div>
 <div class="field"><label>Email</label><input class="input" type="email" name="email" value="${esc(l.email)}"></div>
 <div class="field"><label>Lead Source</label><select class="select" name="source">${["WhatsApp","Phone Call","Instagram","Facebook","Google","Website","Referral","Walk-in","Existing Customer","Other"].map(x=>`<option ${l.source===x?"selected":""}>${x}</option>`).join("")}</select></div>
 <div class="field"><label>Service / Requirement</label><input class="input" name="service" value="${esc(l.service)}" placeholder="LED signage / Neon / ACP / Printing..."></div>
 <div class="field"><label>Estimated Deal Value (₹)</label><input class="input" type="number" name="value" step=".01" value="${l.value}"></div>
 <div class="field"><label>Priority</label><select class="select" name="priority">${["Hot","Warm","Cold"].map(x=>`<option ${l.priority===x?"selected":""}>${x}</option>`).join("")}</select></div>
 <div class="field"><label>Next Follow-up</label><input class="input" type="date" name="next" value="${l.next}"></div>
 <div class="field"><label>Owner</label><select class="select" name="owner">${db.team.map(x=>`<option ${l.owner===x.name?"selected":""}>${esc(x.name)}</option>`).join("")}</select></div>
 <div class="field full"><label>Notes / Requirement</label><textarea class="textarea" name="notes" rows="3">${esc(l.notes)}</textarea></div>
 <div class="actions full"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Save Lead</button></div></form>`);
 document.getElementById("f").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e));d.value=+d.value||0;if(id)Object.assign(l,d);else db.leads.push(d);save();closeModal();render("leads");toast("Lead saved")}
}
function leadDetail(id){
 const l=lead(id),acts=db.activities.filter(a=>a.leadId===id),qs=db.quotes.filter(q=>q.leadId===id);
 modal(`${l.id} — ${l.company||l.name}`,`<div class="grid two">
 <div><div class="card"><div class="metric-row"><div><b>${esc(l.name)}</b><div class="muted">${esc(l.company||"Individual")}</div></div><span class="status ${stageClass(l.stage)}">${esc(l.stage)}</span></div><p class="small">📞 ${esc(l.phone||"-")} &nbsp; ✉ ${esc(l.email||"-")}</p><p class="small"><b>Requirement:</b> ${esc(l.service)}</p><p class="small"><b>Estimated:</b> ${money(l.value)} · <b>Source:</b> ${esc(l.source)}</p><p class="small"><b>Notes:</b> ${esc(l.notes||"-")}</p><div class="actions"><button class="btn secondary small" onclick="leadForm('${l.id}')">Edit</button><button class="btn secondary small" onclick="activityForm('${l.id}')">+ Activity</button><button class="btn primary small" onclick="quoteForm('${l.id}')">+ Quotation</button></div></div></div>
 <div><div class="card"><b>Timeline</b><div class="timeline" style="margin-top:14px">${acts.slice().reverse().map(a=>`<div class="event"><b>${esc(a.subject)}</b><div class="muted">${esc(a.date)} · ${esc(a.type)} · ${esc(a.status)}</div><div class="small">${esc(a.notes||"")}</div></div>`).join("")||`<div class="empty">No activity yet.</div>`}</div></div></div>
 </div>
 <div class="card" style="margin-top:14px"><div class="toolbar"><b>Quotations</b><button class="btn small primary" onclick="quoteForm('${l.id}')">+ Quotation</button></div>${qs.map(q=>`<div class="list-item"><div><b>${esc(q.id)}</b> · ${esc(q.items)}<br><span class="muted">Valid till ${esc(q.valid)} · ${esc(q.status)}</span></div><b>${money(q.amount)}</b></div>`).join("")||`<div class="empty">No quotations.</div>`}</div>
 <div class="actions"><button class="btn secondary" onclick="closeModal()">Close</button><button class="btn ${l.stage==="Won"?"secondary":"primary"}" onclick="setStage('${l.id}','Won')">Mark Won</button><button class="btn danger" onclick="setStage('${l.id}','Lost')">Mark Lost</button></div>`)
}
function setStage(id,s){const l=lead(id);l.stage=s;if(s==="Won"&&!db.customers.some(c=>c.leadId===id)){db.customers.push({id:uid("CUS"),leadId:id,name:l.name,company:l.company,phone:l.phone,email:l.email,created:new Date().toISOString().slice(0,10),tags:l.service})}save();closeModal();render("dashboard");toast(`Lead marked ${s}`)}
function pipelineView(){
 return `<div class="section"><div class="toolbar"><div><b>Sales Pipeline</b><div class="muted">Drag-and-drop style view using stage actions</div></div><button class="btn primary" onclick="leadForm()">+ New Lead</button></div><div class="kanban">${stages.map(s=>`<div class="col"><div class="colhead"><span>${s}</span><span>${db.leads.filter(l=>l.stage===s).length}</span></div>${db.leads.filter(l=>l.stage===s).map(l=>`<div class="deal"><h4>${esc(l.company||l.name)}</h4><p>${esc(l.service)}</p><p><b>${money(l.value)}</b> · ${esc(l.name)}</p><span class="tag">${esc(l.priority)}</span><div style="margin-top:8px"><select class="select" style="font-size:10px;padding:6px" onchange="moveLead('${l.id}',this.value)">${stages.map(x=>`<option ${x===l.stage?"selected":""}>${x}</option>`).join("")}</select></div></div>`).join("")||`<div class="muted small" style="padding:15px 3px">No leads</div>`}</div>`).join("")}</div></div>`
}
function moveLead(id,s){lead(id).stage=s;save();render("pipeline");toast("Pipeline updated")}
function customersView(){
 return `<div class="section"><div class="toolbar"><div class="toolbar-left"><input class="search" id="custSearch" placeholder="Search customer..." oninput="filterCustomers()"></div><button class="btn primary" onclick="customerForm()">+ Customer</button></div><div class="card"><div id="custTable">${customerTable()}</div></div></div>`
}
function customerTable(list=db.customers){
 return `<div class="table-wrap"><table class="table"><thead><tr><th>Customer</th><th>Company</th><th>Phone</th><th>Email</th><th>Since</th><th>Tags</th><th></th></tr></thead><tbody>${list.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.company||"-")}</td><td>${esc(c.phone||"-")}</td><td>${esc(c.email||"-")}</td><td>${esc(c.created)}</td><td>${esc(c.tags||"-")}</td><td><button class="btn small secondary" onclick="customerForm('${c.id}')">Edit</button></td></tr>`).join("")||`<tr><td colspan="7" class="empty">No customers yet. Won leads can be converted into customers.</td></tr>`}</tbody></table></div>`
}
function filterCustomers(){const q=document.getElementById("custSearch").value.toLowerCase();document.getElementById("custTable").innerHTML=customerTable(db.customers.filter(c=>`${c.name} ${c.company} ${c.phone} ${c.email}`.toLowerCase().includes(q)))}
function customerForm(id){
 const c=id?customer(id):{id:uid("CUS"),name:"",company:"",phone:"",email:"",created:new Date().toISOString().slice(0,10),tags:""};
 modal(id?"Edit Customer":"New Customer",`<form id="f" class="form-grid"><div class="field"><label>Name *</label><input class="input" name="name" required value="${esc(c.name)}"></div><div class="field"><label>Company</label><input class="input" name="company" value="${esc(c.company)}"></div><div class="field"><label>Phone</label><input class="input" name="phone" value="${esc(c.phone)}"></div><div class="field"><label>Email</label><input class="input" name="email" value="${esc(c.email)}"></div><div class="field full"><label>Tags / Customer Type</label><input class="input" name="tags" value="${esc(c.tags)}"></div><div class="actions full"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Save Customer</button></div></form>`);
 document.getElementById("f").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e));if(id)Object.assign(c,d);else db.customers.push({...c,...d});save();closeModal();render("customers");toast("Customer saved")}
}
function activitiesView(){
 const arr=db.activities.slice().sort((a,b)=>a.date.localeCompare(b.date));
 return `<div class="section"><div class="toolbar"><div><b>Activities & Follow-ups</b><div class="muted">Calls, meetings, site visits, WhatsApp and reminders</div></div><button class="btn primary" onclick="activityForm()">+ Activity</button></div><div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Lead</th><th>Type</th><th>Subject</th><th>Owner</th><th>Status</th><th>Notes</th><th></th></tr></thead><tbody>${arr.map(a=>`<tr><td>${esc(a.date)}</td><td>${esc(lead(a.leadId)?.company||lead(a.leadId)?.name||"-")}</td><td>${esc(a.type)}</td><td><b>${esc(a.subject)}</b></td><td>${esc(a.owner)}</td><td><span class="status ${a.status==="Done"?"s-won":"s-follow"}">${esc(a.status)}</span></td><td>${esc(a.notes||"")}</td><td>${a.status!=="Done"?`<button class="btn small secondary" onclick="doneActivity('${a.id}')">Done</button>`:""}</td></tr>`).join("")||`<tr><td colspan="8" class="empty">No activities.</td></tr>`}</tbody></table></div></div></div>`
}
function activityForm(leadId=""){
 modal("New Activity / Follow-up",`<form id="f" class="form-grid"><div class="field"><label>Lead *</label><select class="select" name="leadId" required><option value="">Select lead</option>${db.leads.map(l=>`<option value="${l.id}" ${l.id===leadId?"selected":""}>${l.id} — ${esc(l.company||l.name)}</option>`).join("")}</select></div><div class="field"><label>Date</label><input class="input" type="date" name="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="field"><label>Type</label><select class="select" name="type">${["Follow-up","Call","WhatsApp","Meeting","Site Visit","Email","Quotation Follow-up","Payment Follow-up","Other"].map(x=>`<option>${x}</option>`).join("")}</select></div><div class="field"><label>Status</label><select class="select" name="status"><option>Pending</option><option>Done</option></select></div><div class="field full"><label>Subject *</label><input class="input" name="subject" required placeholder="Call customer for approval"></div><div class="field full"><label>Notes</label><textarea class="textarea" name="notes" rows="3"></textarea></div><div class="field"><label>Owner</label><select class="select" name="owner">${db.team.map(x=>`<option>${esc(x.name)}</option>`).join("")}</select></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Save Activity</button></div></form>`);
 document.getElementById("f").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e));db.activities.push({id:uid("ACT"),...d});const l=lead(d.leadId);if(l)l.next=d.date;save();closeModal();render("activities");toast("Activity saved")}
}
function doneActivity(id){const a=db.activities.find(x=>x.id===id);a.status="Done";save();render("activities");toast("Activity completed")}
function quotesView(){
 return `<div class="section"><div class="toolbar"><div><b>Quotation Register</b><div class="muted">Track quotation issue, validity, value and outcome</div></div><button class="btn primary" onclick="quoteForm()">+ Quotation</button></div><div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Quotation</th><th>Customer</th><th>Date</th><th>Valid Till</th><th>Amount</th><th>Status</th><th>Requirement</th></tr></thead><tbody>${db.quotes.slice().reverse().map(q=>`<tr><td><b>${esc(q.id)}</b></td><td>${esc(q.customer)}</td><td>${esc(q.date)}</td><td>${esc(q.valid)}</td><td><b>${money(q.amount)}</b></td><td><span class="status ${q.status==="Accepted"?"s-won":q.status==="Rejected"?"s-lost":"s-hot"}">${esc(q.status)}</span></td><td>${esc(q.items)}</td></tr>`).join("")||`<tr><td colspan="7" class="empty">No quotations.</td></tr>`}</tbody></table></div></div></div>`
}
function quoteForm(leadId=""){
 const l=leadId?lead(leadId):null;
 modal("New Quotation",`<form id="f" class="form-grid"><div class="field"><label>Lead</label><select class="select" name="leadId"><option value="">Standalone quotation</option>${db.leads.map(x=>`<option value="${x.id}" ${x.id===leadId?"selected":""}>${x.id} — ${esc(x.company||x.name)}</option>`).join("")}</select></div><div class="field"><label>Quotation No.</label><input class="input" name="id" value="${uid("Q")}"></div><div class="field"><label>Customer</label><input class="input" name="customer" value="${esc(l?.company||l?.name||"")}"></div><div class="field"><label>Issue Date</label><input class="input" type="date" name="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="field"><label>Valid Till</label><input class="input" type="date" name="valid"></div><div class="field"><label>Amount (₹)</label><input class="input" type="number" name="amount" value="${l?.value||0}"></div><div class="field"><label>Status</label><select class="select" name="status"><option>Draft</option><option>Sent</option><option>Accepted</option><option>Rejected</option><option>Expired</option></select></div><div class="field"><label>Requirement / Items</label><input class="input" name="items" value="${esc(l?.service||"")}"></div><div class="field full"><label>Terms / Notes</label><textarea class="textarea" name="notes" rows="3" placeholder="Advance, validity, delivery terms, etc."></textarea></div><div class="actions full"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Save Quotation</button></div></form>`);
 document.getElementById("f").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e));d.amount=+d.amount||0;db.quotes.push(d);if(d.leadId){const l=lead(d.leadId);if(d.status==="Accepted")l.stage="Won";else if(d.status==="Rejected")l.stage="Lost";else if(d.status==="Sent")l.stage="Quotation Sent"}save();closeModal();render("quotes");toast("Quotation saved")}
}
function lostView(){
 const won=db.leads.filter(l=>l.stage==="Won"),lost=db.leads.filter(l=>l.stage==="Lost");
 return `<div class="section"><div class="grid two"><div class="card"><div class="toolbar"><div><b>Won Deals</b><div class="muted">Successful opportunities</div></div><b class="green">${money(won.reduce((a,x)=>a+x.value,0))}</b></div>${won.map(l=>`<div class="list-item"><div><b>${esc(l.company||l.name)}</b><br><span class="muted">${esc(l.service)}</span></div><b>${money(l.value)}</b></div>`).join("")||`<div class="empty">No won deals.</div>`}</div><div class="card"><div class="toolbar"><div><b>Lost Deals</b><div class="muted">Review lost opportunities</div></div><b class="red">${money(lost.reduce((a,x)=>a+x.value,0))}</b></div>${lost.map(l=>`<div class="list-item"><div><b>${esc(l.company||l.name)}</b><br><span class="muted">${esc(l.service)}</span></div><b>${money(l.value)}</b></div>`).join("")||`<div class="empty">No lost deals.</div>`}</div></div></div>`
}
function reportsView(){
 const total=db.leads.reduce((a,x)=>a+x.value,0),won=db.leads.filter(x=>x.stage==="Won"),lost=db.leads.filter(x=>x.stage==="Lost"),conv=db.leads.length?won.length/db.leads.length*100:0;
 const src=sourceStats(),max=src[0]?.n||1;
 return `<div class="section"><div class="grid cards">${metric("Total Leads",db.leads.length,"All enquiries","blue")}${metric("Pipeline Value",money(total),"All deal values","orange")}${metric("Win Rate",conv.toFixed(1)+"%","Won ÷ total leads","green")}${metric("Lost Value",money(lost.reduce((a,x)=>a+x.value,0)),"Review reasons","red")}</div><div class="grid two" style="margin-top:16px"><div class="card"><b>Lead source performance</b><div class="bar-wrap">${src.map(x=>`<div class="bar" style="height:${Math.max(5,x.n/max*175)}px"><span>${x.n}</span><b>${esc(x.name.slice(0,9))}</b></div>`).join("")}</div></div><div class="card"><b>Stage conversion</b><div style="margin-top:12px">${stages.map(s=>{const n=db.leads.filter(x=>x.stage===s).length;return `<div class="list-item"><span>${s}</span><b>${n}</b></div>`}).join("")}</div></div></div></div>`
}
function backupView(){return `<div class="section"><div class="grid two"><div class="card"><h3>CRM Backup</h3><p class="muted">Download all CRM leads, customers, activities, quotations and settings as JSON.</p><button class="btn primary" onclick="backup()">Download CRM Backup</button></div><div class="card"><h3>Restore CRM Backup</h3><p class="muted">Restoring replaces current CRM browser data.</p><input class="input" type="file" id="restore" accept=".json"><div style="margin-top:10px"><button class="btn danger" onclick="restore()">Restore</button></div></div></div><div class="card" style="margin-top:16px"><h3>Data separation</h3><div class="notice"><b>This CRM is completely independent from SignStock Pro.</b><br>No stock tables, stock quantities, job-card material issues, wastage, purchases or inventory values are stored or linked here.</div><ul class="muted"><li>CRM has its own browser database key.</li><li>Leads can become customers when marked Won.</li><li>Quotations and activities remain CRM-only.</li><li>For multi-device use, this can later be moved to a separate Supabase database/project.</li></ul><button class="btn danger" onclick="resetDemo()">Reset Demo CRM</button></div></div>`}
function backup(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:"application/json"}));a.download="signcrm-backup-"+new Date().toISOString().slice(0,10)+".json";a.click()}
function restore(){const f=document.getElementById("restore").files[0];if(!f)return toast("Choose a JSON backup");const r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);save();render("dashboard");toast("CRM restored")}catch(e){toast("Invalid backup")}};r.readAsText(f)}
function resetDemo(){if(confirm("Reset CRM to demo data?")){db=structuredClone(seed);save();render("dashboard");toast("CRM reset")}}
render("dashboard");
