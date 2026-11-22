import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, ArrowDownLeft, ArrowUpRight, Bell, BookOpen, CalendarDays,
  Check, ChevronDown, CircleHelp, Clock3, Command, GraduationCap, LayoutDashboard,
  Menu, Moon, MoreHorizontal, Plus, Search, Settings, Sparkles, StickyNote,
  Wallet, X, Zap, RefreshCw, ExternalLink, Circle, CheckCircle2, Sun, Trash2
} from "lucide-react";
import "./styles.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}

const STORE = "lifeos-v1";
const today = new Date();
const dateLabel = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(today);
const starter = {
  tasks: [
    { id: 1, title: "Revise Engineering Mathematics", category: "College", done: false, time: "Today" },
    { id: 2, title: "Finish programming practice", category: "College", done: false, time: "Today" },
    { id: 3, title: "Plan the week", category: "Personal", done: true, time: "Today" }
  ],
  events: [
    { id: 1, title: "Semester study block", date: today.toISOString().slice(0,10), time: "18:00", category: "Study" },
    { id: 2, title: "Personal reset", date: new Date(Date.now()+86400000).toISOString().slice(0,10), time: "09:00", category: "Personal" }
  ],
  expenses: [{id:1, title:"Daily essentials", amount:80, type:"expense", date:today.toISOString().slice(0,10)}],
  notes: ["Keep college, health and personal time in balance. Small consistent steps count."]
};
function readStore() {
  try { return { ...starter, ...JSON.parse(localStorage.getItem(STORE) || "{}") }; }
  catch { return starter; }
}
function App() {
  const [data, setData] = useState(readStore);
  const [page, setPage] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [expenseText, setExpenseText] = useState("");
  const [amountText, setAmountText] = useState("");
  const [updates, setUpdates] = useState([]);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState("");
  const [collegeError, setCollegeError] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => { localStorage.setItem(STORE, JSON.stringify(data)); }, [data]);
  const notify = (message) => { setToast(message); setTimeout(() => setToast(""), 2300); };
  const checkCollege = async () => {
    setChecking(true); setCollegeError("");
    try {
      const r = await fetch("/api/college-updates");
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Unable to check updates");
      setUpdates(j.updates || []); setLastChecked(j.checkedAt);
      notify(`Checked official DCE website · ${j.updates.length} items found`);
    } catch (e) { setCollegeError(e.message); }
    finally { setChecking(false); }
  };
  useEffect(() => {
    checkCollege();
    const timer = setInterval(checkCollege, 6 * 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const completed = data.tasks.filter(t => t.done).length;
  const progress = data.tasks.length ? Math.round(completed / data.tasks.length * 100) : 0;
  const balance = data.expenses.reduce((sum, e) => sum + (e.type === "income" ? e.amount : -e.amount), 0);
  const nav = [
    { label:"Overview", icon:LayoutDashboard, group:"Workspace" },
    { label:"My tasks", icon:CheckCircle2, group:"Workspace" },
    { label:"Calendar", icon:CalendarDays, group:"Workspace" },
    { label:"College hub", icon:GraduationCap, group:"College" },
    { label:"Notes", icon:StickyNote, group:"Personal" },
    { label:"Finance", icon:Wallet, group:"Personal" }
  ];
  const addTask = (e) => {
    e.preventDefault(); if (!taskText.trim()) return;
    setData(d => ({...d, tasks:[{id:Date.now(), title:taskText.trim(), category:"Personal", done:false, time:"Today"}, ...d.tasks]}));
    setTaskText(""); setShowTaskForm(false); notify("Task added");
  };
  const toggleTask = id => setData(d => ({...d, tasks:d.tasks.map(t => t.id===id ? {...t,done:!t.done}:t)}));
  const addExpense = (e) => {
    e.preventDefault(); const amount = Number(amountText);
    if (!expenseText.trim() || !amount || amount < 0) return;
    setData(d => ({...d, expenses:[{id:Date.now(),title:expenseText.trim(),amount,type:"expense",date:today.toISOString().slice(0,10)},...d.expenses]}));
    setExpenseText(""); setAmountText(""); notify("Expense saved");
  };
  const addNote = (e) => {
    e.preventDefault(); if (!noteText.trim()) return;
    setData(d => ({...d, notes:[noteText.trim(),...d.notes]})); setNoteText(""); notify("Note saved");
  };
  const filteredTasks = data.tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  const go = label => { setPage(label); setMenuOpen(false); };
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Command size={19}/></div><div><b>lifeOS</b><span>PERSONAL WORKSPACE</span></div><button className="mobile-close icon-btn" onClick={()=>setMenuOpen(false)}><X size={18}/></button></div>
      <div className="profile-card"><div className="avatar">G</div><div><b>Gourav</b><span>CS · First year</span></div><MoreHorizontal size={18} className="muted"/></div>
      {["Workspace","College","Personal"].map(group => <div className="nav-group" key={group}><p className="nav-caption">{group}</p>{nav.filter(n=>n.group===group).map(n=><button key={n.label} className={`nav-item ${page===n.label?"active":""}`} onClick={()=>go(n.label)}><n.icon size={17}/><span>{n.label}</span>{n.label==="College hub" && updates.length>0 && <i className="nav-dot"/>}</button>)}</div>)}
      <div className="sidebar-bottom"><div className="sync-card"><div className="sync-icon"><Zap size={15}/></div><div><b>Stay in balance</b><span>One step at a time.</span></div></div><button className="nav-item"><Settings size={17}/><span>Settings</span></button><div className="version">LIFEOS · PERSONAL EDITION</div></div>
    </aside>
    {menuOpen && <div className="scrim" onClick={()=>setMenuOpen(false)}/>}
    <main className="main">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setMenuOpen(true)}><Menu size={20}/></button><div className="crumb">Workspace <span>/</span> <b>{page}</b></div><div className="top-actions"><div className="searchbox"><Search size={15}/><input placeholder="Search tasks..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd>⌘ K</kbd></div><button className="icon-btn notification" title="Notifications" onClick={()=>go("College hub")}><Bell size={18}/>{updates.length>0&&<i/>}</button><div className="mini-avatar">G</div></div></header>
      <div className="content">
        {page==="Overview" && <><div className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> YOUR SPACE, YOUR PACE</div><h1>Good {today.getHours()<12?"morning":today.getHours()<17?"afternoon":"evening"}, Gourav<span className="wave">✳</span></h1><p className="subheading">A little structure. A little breathing room. Make today count.</p></div><div className="date-pill"><CalendarDays size={15}/>{dateLabel}</div></div>
          <section className="hero-card"><div className="hero-copy"><span className="hero-kicker"><Sparkles size={13}/> DAILY CHECK-IN</span><h2>Make space for<br/><em>what matters.</em></h2><p>You have done {completed} of {data.tasks.length} tasks. Keep your day steady and intentional.</p><button className="primary-btn" onClick={()=>go("My tasks")}>View my tasks <span>↗</span></button></div><div className="hero-orbit"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-core"><Activity size={31}/></div><div className="orbit-label label-a">FOCUS</div><div className="orbit-label label-b">BALANCE</div><div className="orbit-label label-c">GROW</div></div><div className="hero-grain"/></section>
          <div className="section-heading"><div><span className="eyebrow">AT A GLANCE</span><h3>Your overview</h3></div><button className="text-btn" onClick={()=>go("Calendar")}>Open calendar <span>↗</span></button></div>
          <div className="stats-grid"><Stat icon={CheckCircle2} label="Tasks completed" value={`${completed}/${data.tasks.length}`} detail={`${progress}% of your list`} progress={progress}/><Stat icon={CalendarDays} label="Upcoming events" value={data.events.length} detail="In your personal calendar"/><Stat icon={Wallet} label="Tracked balance" value={`₹${balance.toLocaleString("en-IN")}`} detail="Income minus expenses"/><Stat icon={GraduationCap} label="College updates" value={updates.length || "—"} detail={lastChecked?"Latest official check":"Waiting for first check"}/></div>
          <div className="dashboard-grid"><section className="panel tasks-panel"><div className="panel-head"><div><span className="eyebrow">KEEP MOVING</span><h3>Today's tasks</h3></div><button className="icon-btn" onClick={()=>setShowTaskForm(v=>!v)}><Plus size={18}/></button></div>{showTaskForm&&<form className="inline-form" onSubmit={addTask}><input autoFocus value={taskText} onChange={e=>setTaskText(e.target.value)} placeholder="What needs doing?"/><button className="small-primary">Add</button></form>}<div className="task-list">{data.tasks.slice(0,5).map(t=><TaskRow key={t.id} task={t} onToggle={toggleTask}/>)}</div><button className="panel-link" onClick={()=>go("My tasks")}>See all tasks <span>→</span></button></section>
            <section className="panel college-panel"><div className="panel-head"><div><span className="eyebrow">DRONACHARYA COLLEGE</span><h3>College noticeboard</h3></div><button className={`icon-btn ${checking?"spinning":""}`} onClick={checkCollege} title="Refresh"><RefreshCw size={16}/></button></div><div className="college-feature"><div className="college-emblem"><GraduationCap size={22}/></div><div><b>Official updates</b><span>Automatically checked every 6 hours while open</span></div><span className="status-tag"><i/> LIVE CHECK</span></div>{updates.slice(0,3).map((u,i)=><a className="update-row" key={u.id||i} href={u.url} target="_blank" rel="noreferrer"><div className="update-bullet"/><div><b>{u.title}</b><span>{u.detail}</span></div><ExternalLink size={14}/></a>)}{collegeError&&<div className="error-note">{collegeError} <button onClick={checkCollege}>Retry</button></div>}{!updates.length&&!collegeError&&<p className="empty-state">Checking the official college website…</p>}<button className="panel-link" onClick={()=>go("College hub")}>Open college hub <span>→</span></button></section></div>
          <div className="bottom-grid"><section className="panel mini-panel"><div className="panel-head"><div><span className="eyebrow">COMING UP</span><h3>Next on your calendar</h3></div><button className="text-btn" onClick={()=>go("Calendar")}>View all</button></div>{data.events.slice(0,2).map(e=><div className="event-row" key={e.id}><div className="event-date"><b>{new Date(e.date+"T00:00:00").getDate()}</b><span>{new Date(e.date+"T00:00:00").toLocaleDateString("en-IN",{month:"short"})}</span></div><div><b>{e.title}</b><span>{e.time} · {e.category}</span></div></div>)}</section><section className="quote-panel"><span className="quote-mark">“</span><p>Progress is built in the quiet moments when you choose to show up.</p><span className="quote-credit">A NOTE TO YOURSELF</span></section></div>
        </>}
        {page==="My tasks" && <><PageTitle eyebrow="YOUR ACTION LIST" title="Tasks" desc="Keep the important things moving."/><form className="add-bar" onSubmit={addTask}><input value={taskText} onChange={e=>setTaskText(e.target.value)} placeholder="Add a task for today…"/><button className="primary-btn"><Plus size={16}/> Add task</button></form><section className="panel"><div className="panel-head"><h3>All tasks <span className="count">{data.tasks.length}</span></h3><span className="muted small">{completed} completed</span></div>{filteredTasks.map(t=><TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={()=>setData(d=>({...d,tasks:d.tasks.filter(x=>x.id!==t.id)}))}/>)}</section></>}
        {page==="Calendar" && <><PageTitle eyebrow="DATES THAT MATTER" title="Calendar" desc="Your personal dates, events and reminders in one place."/><div className="calendar-layout"><section className="panel"><div className="panel-head"><h3>Upcoming events</h3><span className="count">{data.events.length}</span></div>{data.events.map(e=><div className="event-row" key={e.id}><div className="event-date"><b>{new Date(e.date+"T00:00:00").getDate()}</b><span>{new Date(e.date+"T00:00:00").toLocaleDateString("en-IN",{month:"short"})}</span></div><div><b>{e.title}</b><span>{e.date} · {e.time} · {e.category}</span></div><button className="icon-btn danger" onClick={()=>setData(d=>({...d,events:d.events.filter(x=>x.id!==e.id)}))}><Trash2 size={15}/></button></div>)}{!data.events.length&&<p className="empty-state">Nothing scheduled yet.</p>}</section><EventForm onAdd={e=>setData(d=>({...d,events:[{...e,id:Date.now()},...d.events]}))}/></div></>}
        {page==="College hub" && <><PageTitle eyebrow="DRONACHARYA COLLEGE OF ENGINEERING" title="College hub" desc="A single place for official announcements and academic updates."/><div className="official-banner"><div className="college-emblem"><GraduationCap size={25}/></div><div><b>Official DCE website</b><span>ggnindia.dronacharya.info</span></div><a href="https://ggnindia.dronacharya.info/" target="_blank" rel="noreferrer" className="outline-btn">Visit website <ExternalLink size={14}/></a></div><div className="panel"><div className="panel-head"><div><h3>Latest updates</h3><span className="muted small">{lastChecked?`Last checked ${new Date(lastChecked).toLocaleString("en-IN")}`:"Not checked yet"}</span></div><button className="outline-btn" onClick={checkCollege} disabled={checking}>{checking?<RefreshCw className="spinning" size={14}/>:<RefreshCw size={14}/>} Refresh now</button></div>{collegeError&&<div className="error-note">{collegeError} Make sure the backend is running and try again.</div>}{updates.map((u,i)=><a className="notice-card" href={u.url} target="_blank" rel="noreferrer" key={u.id||i}><div className="notice-icon"><Bell size={17}/></div><div><b>{u.title}</b><p>{u.detail}</p><span>Official DCE source · Open notice ↗</span></div></a>)}{!updates.length&&!collegeError&&<p className="empty-state">Checking for college updates…</p>}<p className="source-note">Updates are read from the public official website. Some pages or PDFs may need to be opened on DCE's site for full details. Always verify important dates with the original notice.</p></div></>}
        {page==="Notes" && <><PageTitle eyebrow="THOUGHTS, IDEAS & QUICK CAPTURES" title="Notes" desc="A quiet place to put things down and come back to them."/><form className="note-compose panel" onSubmit={addNote}><textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Write something worth remembering…"/><div className="compose-footer"><span className="muted small">Saved on this device</span><button className="primary-btn"><Plus size={15}/> Save note</button></div></form><div className="notes-grid">{data.notes.map((n,i)=><article className="note-card" key={i}><StickyNote size={17}/><p>{n}</p><button className="icon-btn danger" onClick={()=>setData(d=>({...d,notes:d.notes.filter((_,j)=>i!==j)}))}><Trash2 size={14}/></button></article>)}</div></>}
        {page==="Finance" && <><PageTitle eyebrow="BE MINDFUL WITH MONEY" title="Finance" desc="A simple view of what comes in and what goes out."/><div className="finance-total panel"><span className="eyebrow">NET TRACKED BALANCE</span><h2>₹{balance.toLocaleString("en-IN")}</h2><span className="muted small">Based on entries you add here</span></div><form className="add-bar finance-form" onSubmit={addExpense}><input value={expenseText} onChange={e=>setExpenseText(e.target.value)} placeholder="What did you spend on?"/><input type="number" min="1" value={amountText} onChange={e=>setAmountText(e.target.value)} placeholder="Amount ₹"/><button className="primary-btn"><Plus size={16}/> Add expense</button></form><section className="panel"><div className="panel-head"><h3>Recent activity</h3><span className="count">{data.expenses.length}</span></div>{data.expenses.map(e=><div className="money-row" key={e.id}><div className={`money-icon ${e.type}`}><ArrowDownLeft size={17}/></div><div><b>{e.title}</b><span>{e.date}</span></div><strong className="negative">−₹{e.amount.toLocaleString("en-IN")}</strong><button className="icon-btn danger" onClick={()=>setData(d=>({...d,expenses:d.expenses.filter(x=>x.id!==e.id)}))}><Trash2 size={14}/></button></div>)}</section></>}
        <footer className="footer"><span>lifeOS <i>·</i> Made for a more balanced day</span><span>YOUR DATA STAYS IN THIS BROWSER</span></footer>
      </div>
    </main>
    {toast&&<div className="toast"><Check size={15}/>{toast}</div>}
  </div>;
}
function Stat({icon:Icon,label,value,detail,progress}) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><Icon size={17}/></div><strong>{value}</strong><div className="stat-bottom"><span>{detail}</span>{progress!==undefined&&<div className="progress"><i style={{width:`${progress}%`}}/></div>}</div></div>; }
function PageTitle({eyebrow,title,desc}) { return <div className="page-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{desc}</p></div>; }
function TaskRow({task,onToggle,onDelete}) { return <div className={`task-row ${task.done?"is-done":""}`}><button className="check-btn" onClick={()=>onToggle(task.id)}>{task.done?<Check size={13}/>:<Circle size={17}/>}</button><div className="task-copy"><b>{task.title}</b><span>{task.category} · {task.time}</span></div><span className={`task-tag ${task.category.toLowerCase()}`}>{task.category}</span>{onDelete&&<button className="icon-btn danger" onClick={()=>onDelete(task.id)}><Trash2 size={14}/></button>}</div>; }
function EventForm({onAdd}) { const [title,setTitle]=useState(""); const [date,setDate]=useState(today.toISOString().slice(0,10)); const [time,setTime]=useState("10:00"); const [category,setCategory]=useState("Personal"); return <form className="panel event-form" onSubmit={e=>{e.preventDefault();if(title.trim()){onAdd({title,date,time,category});setTitle("");}}}><span className="eyebrow">MAKE A PLAN</span><h3>Add an event</h3><label>Event name<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Assignment deadline" required/></label><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Time<input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>Personal</option><option>College</option><option>Study</option></select></label><button className="primary-btn"><Plus size={15}/> Save event</button></form>; }
createRoot(document.getElementById("root")).render(<App/>);
