"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import {
  Aperture, Search, Plus, ChevronDown, ChevronRight, Home, Inbox, CalendarDays,
  Clapperboard, FileText, Lightbulb, Film, Instagram, Youtube, MoreHorizontal,
  Clock3, CheckCircle2, Circle, ArrowUpRight, Sparkles, Menu, X, Play, ListChecks,
  PanelLeftClose, Hash, Send, Settings2, WandSparkles, Copy, Trash2
} from "lucide-react";

type Project = { id: number; title: string; platform: "YouTube" | "Instagram"; status: string; date: string; color: string; description: string; source: string; thumbnail: string; videoTitle: string; videoDescription: string; tags: string };
type Task = { id: number; title: string; project: string; due: string; done: boolean };
type Script = { id: number; title: string; platform: string; hook: string; body: string; cta: string };

const starterProjects: Project[] = [
  { id: 1, title: "Why your 20s feel confusing", platform: "YouTube", status: "Scripting", date: "Oct 28", color: "#e9e4ff", description: "A thoughtful long-form video about finding direction.", source: "Personal story + audience questions", thumbnail: "", videoTitle: "Why Your 20s Feel So Confusing (And What To Do)", videoDescription: "Feeling behind in your twenties? Let's talk about progress, comparison, and finding your own direction.", tags: "self improvement, life advice, personal growth, twenties" },
  { id: 2, title: "3 editing tricks that feel cinematic", platform: "Instagram", status: "Editing", date: "Oct 26", color: "#ffe7d8", description: "A fast-paced Reel with visual examples.", source: "Editing tutorial research", thumbnail: "", videoTitle: "3 Editing Tricks That Feel Cinematic", videoDescription: "Three simple editing techniques to make your videos feel more cinematic.", tags: "video editing, reels tips, cinematic editing" },
  { id: 3, title: "My creator morning routine", platform: "YouTube", status: "Filming", date: "Oct 30", color: "#dff3e8", description: "Behind the scenes of a realistic creator workflow.", source: "Personal experience", thumbnail: "", videoTitle: "A Realistic Morning Routine as a Small Creator", videoDescription: "A behind-the-scenes look at how I plan and create content.", tags: "creator routine, content creator, productivity" },
  { id: 4, title: "Stop making these thumbnail mistakes", platform: "Instagram", status: "Idea", date: "Nov 02", color: "#e0efff", description: "A practical carousel or short video for creators.", source: "Creator feedback", thumbnail: "", videoTitle: "Stop Making These Thumbnail Mistakes", videoDescription: "Simple ways to make your video covers clearer and more clickable.", tags: "thumbnail tips, creator tips, design" }
];
const starterTasks: Task[] = [
  { id: 1, title: "Finalize opening hook", project: "Why your 20s feel confusing", due: "Today", done: false },
  { id: 2, title: "Record voice-over", project: "3 editing tricks that feel cinematic", due: "Today", done: false },
  { id: 3, title: "Collect B-roll references", project: "My creator morning routine", due: "Tomorrow", done: true },
  { id: 4, title: "Export vertical cut", project: "3 editing tricks that feel cinematic", due: "Oct 27", done: false }
];
const starterScripts: Script[] = [
  { id: 1, title: "Why your 20s feel confusing", platform: "YouTube", hook: "Nobody tells you that your twenties can feel like you're falling behind—even when you're doing your best.", body: "Start with a personal moment. Explain the pressure to have a career, money, relationships and a plan. Break down three reminders: progress isn't linear, comparison hides context, and small consistent actions compound. Add a personal story and a practical takeaway.", cta: "If this felt familiar, tell me one thing you're working on right now—and subscribe for more honest creator stories." },
  { id: 2, title: "3 editing tricks that feel cinematic", platform: "Instagram", hook: "Your videos can look 10x better with these three simple edits.", body: "Trick 1: cut on movement. Trick 2: layer quiet room tone under transitions. Trick 3: use a motivated push-in instead of random zooms. Show a before-and-after for each trick, keeping each example under five seconds.", cta: "Save this for your next edit and follow for more creator tips." }
];

const navItems = [
  { name: "Home", icon: Home }, { name: "Inbox", icon: Inbox, badge: "3" },
  { name: "Content calendar", icon: CalendarDays }, { name: "Video projects", icon: Clapperboard },
  { name: "Script library", icon: FileText }, { name: "Idea bank", icon: Lightbulb }
];
const statusColors: Record<string, string> = { Idea: "#8b8d87", Scripting: "#6655d9", Filming: "#e49a45", Editing: "#318a73", Published: "#2f8a53" };

export default function HomePage() {
  const [section, setSection] = useState("Home");
  const [projects, setProjects] = useState<Project[]>(starterProjects);
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [scripts, setScripts] = useState<Script[]>(starterScripts);
  const [search, setSearch] = useState("");
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [scriptOpen, setScriptOpen] = useState<Script | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState<"YouTube" | "Instagram">("YouTube");
  const [newStatus, setNewStatus] = useState("Idea");
  const [newSource, setNewSource] = useState("");
  const [newThumbnail, setNewThumbnail] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoDescription, setNewVideoDescription] = useState("");
  const [newTags, setNewTags] = useState("");
  const [toast, setToast] = useState("");
  const [saved, setSaved] = useState(false);
  const [authSession, setAuthSession] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authBusy, setAuthBusy] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudError, setCloudError] = useState("");
  const supabase = getSupabase();

  useEffect(() => {
    let alive = true;
    const loadLocal = () => {
      try {
        const p = localStorage.getItem("studio-projects"); if (p) setProjects(JSON.parse(p));
        const t = localStorage.getItem("studio-tasks"); if (t) setTasks(JSON.parse(t));
        const s = localStorage.getItem("studio-scripts"); if (s) setScripts(JSON.parse(s));
      } catch {}
    };
    if (!supabase) {
      loadLocal();
      setCloudReady(true);
      setCloudError("Supabase is not configured yet. Add the environment variables to enable cross-device sync.");
      return () => { alive = false; };
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setAuthSession(data.session);
      if (!data.session) setCloudReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setAuthSession(session);
      if (!session) setCloudReady(true);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadCloud = async () => {
      if (!supabase || !authSession?.user?.id) return;
      setCloudReady(false);
      setCloudError("");
      const { data, error } = await supabase.from("workspace_data").select("payload").eq("user_id", authSession.user.id).maybeSingle();
      if (cancelled) return;
      if (error) {
        setCloudError("Cloud load failed: " + error.message);
        setCloudReady(true);
        return;
      }
      if (data?.payload) {
        const payload = data.payload as any;
        setProjects(Array.isArray(payload.projects) ? payload.projects : starterProjects);
        setTasks(Array.isArray(payload.tasks) ? payload.tasks : starterTasks);
        setScripts(Array.isArray(payload.scripts) ? payload.scripts : starterScripts);
      } else {
        try {
          const p = localStorage.getItem("studio-projects"); if (p) setProjects(JSON.parse(p));
          const t = localStorage.getItem("studio-tasks"); if (t) setTasks(JSON.parse(t));
          const s = localStorage.getItem("studio-scripts"); if (s) setScripts(JSON.parse(s));
        } catch {}
      }
      setCloudReady(true);
    };
    loadCloud();
    return () => { cancelled = true; };
  }, [authSession?.user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem("studio-projects", JSON.stringify(projects));
      localStorage.setItem("studio-tasks", JSON.stringify(tasks));
      localStorage.setItem("studio-scripts", JSON.stringify(scripts));
    } catch {}
  }, [projects, tasks, scripts]);

  useEffect(() => {
    if (!supabase || !authSession?.user?.id || !cloudReady) return;
    const timer = window.setTimeout(async () => {
      const payload = { projects, tasks, scripts, updatedAt: new Date().toISOString() };
      const { error } = await supabase.from("workspace_data").upsert(
        { user_id: authSession.user.id, payload, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      if (error) setCloudError("Cloud sync issue: " + error.message);
      else setCloudError("");
    }, 800);
    return () => window.clearTimeout(timer);
  }, [projects, tasks, scripts, authSession?.user?.id, cloudReady]);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) { setCloudError("Configure Supabase URL and anon key first."); return; }
    setAuthBusy(true); setCloudError("");
    const result = authMode === "signup"
      ? await supabase.auth.signUp({ email: authEmail, password: authPassword })
      : await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    setAuthBusy(false);
    if (result.error) setCloudError(result.error.message);
    else if (authMode === "signup" && !result.data.session) setCloudError("Check your email to confirm your account, then sign in.");
    else notify(authMode === "signup" ? "Account created" : "Signed in");
  };
  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setAuthSession(null);
    notify("Signed out");
  };

  const filteredProjects = useMemo(() => projects.filter(p => `${p.title} ${p.platform} ${p.status}`.toLowerCase().includes(search.toLowerCase())), [projects, search]);
  const doneTasks = tasks.filter(t => t.done).length;
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };
  const addProject = () => {
    if (!newTitle.trim()) return;
    const project: Project = { id: Date.now(), title: newTitle.trim(), platform: newPlatform, status: newStatus, date: "No date", color: ["#e9e4ff", "#ffe7d8", "#dff3e8", "#e0efff"][projects.length % 4], description: "Add your brief, references, and production notes.", source: newSource.trim(), thumbnail: newThumbnail.trim(), videoTitle: newVideoTitle.trim() || newTitle.trim(), videoDescription: newVideoDescription.trim(), tags: newTags.trim() };
    setProjects(prev => [project, ...prev]); setNewTitle(""); setNewSource(""); setNewThumbnail(""); setNewVideoTitle(""); setNewVideoDescription(""); setNewTags(""); setNewProjectOpen(false); setSection("Video projects"); notify("Project created");
  };
  const toggleTask = (id: number) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const createScript = () => {
    const s: Script = { id: Date.now(), title: "Untitled video script", platform: "YouTube", hook: "", body: "", cta: "" };
    setScripts(prev => [s, ...prev]); setScriptOpen(s); setSection("Script library");
  };
  const updateScript = (updated: Script) => { setScripts(prev => prev.map(s => s.id === updated.id ? updated : s)); setScriptOpen(updated); };
  const copyScript = async (s: Script) => {
    try { await navigator.clipboard.writeText(`${s.title}\n\nHOOK\n${s.hook}\n\nSCRIPT\n${s.body}\n\nCTA\n${s.cta}`); notify("Script copied to clipboard"); }
    catch { notify("Select and copy your script manually"); }
  };

  if (supabase && !authSession) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] p-4">
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="w-full max-w-md rounded-2xl border border-[#e8e8e2] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#6655d9] text-white"><Aperture size={22}/></div>
        <div className="text-[11px] font-semibold uppercase tracking-[.15em] text-[#85877f]">Studio OS · Creator workspace</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{authMode === "signin" ? "Welcome back" : "Create your workspace account"}</h1>
        <p className="mt-2 text-[12px] leading-5 text-[#85877f]">Sign in to sync your projects, scripts, tasks, and production details across your phone, tablet, and computer.</p>
        <form onSubmit={handleAuth} className="mt-6 space-y-3">
          <label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Email</span><input type="email" required value={authEmail} onChange={e=>setAuthEmail(e.target.value)} autoComplete="email" className="w-full rounded-xl border border-[#e8e8e2] px-3 py-3 text-[12px] outline-none focus:border-[#bdb5ff]" placeholder="you@example.com"/></label>
          <label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Password</span><input type="password" required minLength={6} value={authPassword} onChange={e=>setAuthPassword(e.target.value)} autoComplete={authMode==="signin"?"current-password":"new-password"} className="w-full rounded-xl border border-[#e8e8e2] px-3 py-3 text-[12px] outline-none focus:border-[#bdb5ff]" placeholder="At least 6 characters"/></label>
          {cloudError && <div className="rounded-lg bg-[#fff0ed] p-3 text-[11px] leading-5 text-[#b34639]">{cloudError}</div>}
          <button disabled={authBusy} type="submit" className="w-full rounded-xl bg-[#6655d9] px-4 py-3 text-[12px] font-semibold text-white disabled:opacity-60">{authBusy ? "Please wait…" : authMode === "signin" ? "Sign in and sync" : "Create account"}</button>
        </form>
        <button onClick={()=>{setAuthMode(authMode==="signin"?"signup":"signin");setCloudError("");}} className="mt-4 w-full text-[11px] font-medium text-[#6655d9]">{authMode==="signin"?"New here? Create an account":"Already have an account? Sign in"}</button>
        <p className="mt-5 text-center text-[10px] leading-5 text-[#a0a197]">Your data is private to your account using Supabase Row Level Security.</p>
      </motion.div>
    </div>;
  }

  return (
    <div className="min-h-screen">
      {cloudError && authSession && <div className="fixed bottom-4 right-4 z-[90] max-w-sm rounded-xl border border-[#f0d4b2] bg-[#fff7eb] px-4 py-3 text-[11px] text-[#8a5a1d] shadow-lg">{cloudError}</div>}
      <div className="flex min-h-screen">
        <AnimatePresence>{mobileNav && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileNav(false)} />}</AnimatePresence>
        <aside className={`${mobileNav ? "translate-x-0" : "-translate-x-full"} fixed z-50 flex h-screen w-[258px] flex-col border-r border-[#e8e8e2] bg-[#fbfbf9] p-3 transition-transform lg:sticky lg:top-0 lg:z-10 lg:translate-x-0`}>
          <div className="flex items-center justify-between px-2 py-3">
            <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6655d9] text-white"><Aperture size={20}/></div><div><div className="text-[14px] font-bold tracking-tight">Studio OS</div><div className="text-[11px] text-[#85877f]">Creator workspace</div></div></div>
            <button onClick={() => setMobileNav(false)} className="rounded-lg p-1 text-[#85877f] hover:bg-[#efefeb] lg:hidden"><X size={17}/></button>
          </div>
          <button className="mt-4 flex items-center gap-2 rounded-xl border border-[#e8e8e2] bg-white px-3 py-2.5 text-left text-[12px] text-[#77796f] shadow-sm" onClick={() => document.getElementById("workspace-search")?.focus()}><Search size={15}/> Search anything <span className="ml-auto rounded border border-[#e8e8e2] px-1.5 py-0.5 text-[10px]">⌘ K</span></button>
          <div className="mt-6 px-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#a0a197]">Workspace</div>
          <nav className="mt-2 space-y-1">
            {navItems.map(item => { const Icon = item.icon; return <button key={item.name} onClick={() => { setSection(item.name); setMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${section === item.name ? "bg-[#eeecff] font-semibold text-[#5141bf]" : "text-[#62645c] hover:bg-[#efefeb]"}`}><Icon size={16}/><span>{item.name}</span>{item.badge && <span className="ml-auto rounded-md bg-white px-1.5 py-0.5 text-[10px]">{item.badge}</span>}</button>; })}
          </nav>
          <div className="mt-7 flex items-center justify-between px-3"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#a0a197]">Your channels</span><button className="text-[#85877f] hover:text-[#242521]" onClick={() => notify("Channel settings are ready to connect")}><Plus size={14}/></button></div>
          <div className="mt-2 space-y-1">
            <button onClick={() => {setSearch("YouTube"); setSection("Video projects");}} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-[#62645c] hover:bg-[#efefeb]"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#ffe5e3] text-[#e4483f]"><Youtube size={15}/></span>YouTube Studio</button>
            <button onClick={() => {setSearch("Instagram"); setSection("Video projects");}} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-[#62645c] hover:bg-[#efefeb]"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#fbe4ee] text-[#bf4d87]"><Instagram size={15}/></span>Instagram Reels</button>
          </div>
          <div className="mt-7 px-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#a0a197]">Favorites</div>
          <button onClick={() => setSection("Script library")} className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-[#62645c] hover:bg-[#efefeb]"><span className="text-[#d5a343]">★</span> Best video hooks</button>
          <button onClick={() => setSection("Idea bank")} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-[#62645c] hover:bg-[#efefeb]"><span className="text-[#d5a343]">★</span> Future video ideas</button>
          <div className="mt-auto">
            <div className="mb-3 rounded-xl bg-[#f0effb] p-3"><div className="flex items-center gap-2 text-[12px] font-semibold text-[#5141bf]"><Sparkles size={15}/> Creator tip</div><p className="mt-1.5 text-[11px] leading-5 text-[#7772a0]">A strong hook earns attention. A clear story keeps it.</p></div>
            <button onClick={() => notify("Settings panel coming soon")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] text-[#77796f] hover:bg-[#efefeb]"><Settings2 size={15}/> Settings</button>
            <div className="mt-1 flex items-center gap-2 rounded-xl border-t border-[#e8e8e2] px-2 pt-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d7e7dd] text-xs font-bold text-[#35624c]">C</div><div className="min-w-0 flex-1"><div className="truncate text-[12px] font-semibold">Creator workspace</div><div className="text-[10px] text-[#85877f]">Free plan</div></div><MoreHorizontal size={16} className="text-[#85877f]"/></div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[58px] items-center justify-between border-b border-[#e8e8e2] bg-[#f7f7f5]/90 px-4 backdrop-blur-md sm:px-7">
            <div className="flex items-center gap-2 text-[12px] text-[#85877f]"><button className="lg:hidden" onClick={() => setMobileNav(true)}><Menu size={18}/></button><span>Studio OS</span><ChevronRight size={13}/><span className="font-semibold text-[#353630]">{section}</span></div>
            <div className="flex items-center gap-2"><div className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-medium sm:flex ${authSession ? "bg-[#e4f3e9] text-[#397751]" : "bg-[#fff0dd] text-[#9b6a20]"}`}><span className={`h-1.5 w-1.5 rounded-full ${authSession ? "bg-[#42a86b]" : "bg-[#d99a35]"}`}/>{authSession ? "Cloud sync enabled" : "Local mode"}</div>{authSession && <button onClick={signOut} title={authSession.user?.email || "Sign out"} className="hidden rounded-lg border border-[#e8e8e2] bg-white px-2.5 py-2 text-[10px] text-[#62645c] sm:block">Sign out</button>}<button onClick={createScript} className="flex items-center gap-1.5 rounded-lg bg-[#6655d9] px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#5545c6]"><Plus size={14}/> New script</button></div>
          </header>

          <div className="mx-auto max-w-[1400px] px-4 py-7 sm:px-7 lg:px-9">
            {section === "Home" && <>
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.35}} className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.15em] text-[#8d8e84]"><span className="h-px w-5 bg-[#a5a69d]"/> Sunday, October 25, 2026</div><h1 className="text-[29px] font-semibold tracking-[-.045em] sm:text-[35px]">Make something <span className="text-[#6655d9]">worth watching.</span></h1><p className="mt-2 max-w-xl text-[13px] leading-6 text-[#85877f]">Your creative home base. Capture ideas, write better scripts, and move every video from first thought to publish.</p></div>
                <button onClick={() => setNewProjectOpen(true)} className="flex w-fit items-center gap-2 rounded-xl bg-[#242521] px-4 py-3 text-[12px] font-semibold text-white transition hover:bg-black"><Plus size={15}/> Create a project</button>
              </motion.div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={<Clapperboard size={17}/>} label="Active projects" value={String(projects.filter(p => p.status !== "Published").length).padStart(2,"0")} detail="Across all channels" tint="#eeecff"/>
                <StatCard icon={<ListChecks size={17}/>} label="Tasks completed" value={`${doneTasks}/${tasks.length}`} detail="Your current task list" tint="#e3f4e9"/>
                <StatCard icon={<FileText size={17}/>} label="Scripts in library" value={String(scripts.length).padStart(2,"0")} detail="Ideas becoming stories" tint="#fff0dd"/>
                <StatCard icon={<CalendarDays size={17}/>} label="Next publish date" value="Oct 26" detail="3 editing tricks · Reel" tint="#e2efff"/>
              </div>
              <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
                <section className="panel p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between"><div><h2 className="text-[16px] font-semibold tracking-tight">In the works</h2><p className="mt-1 text-[11px] text-[#85877f]">Keep every video moving forward.</p></div><button onClick={() => setSection("Video projects")} className="flex items-center gap-1 text-[11px] font-semibold text-[#6655d9]">All projects <ArrowUpRight size={13}/></button></div>
                  <div className="space-y-3">{projects.slice(0,4).map((p,i) => <motion.button initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*.05}} key={p.id} onClick={() => setSelectedProject(p)} className="group flex w-full items-center gap-3 rounded-xl border border-[#eeeeea] p-3 text-left transition hover:border-[#d9d4ff] hover:bg-[#fdfcff]"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{background:p.color}}>{p.platform==="YouTube"?<Youtube size={20} className="text-[#d94c43]"/>:<Instagram size={20} className="text-[#b84e88]"/>}</div><div className="min-w-0 flex-1"><div className="truncate text-[12px] font-semibold">{p.title}</div><div className="mt-1 flex items-center gap-2 text-[10px] text-[#85877f]"><span>{p.platform}</span><span>·</span><span>Due {p.date}</span></div></div><span className="hidden rounded-full px-2.5 py-1 text-[10px] font-medium sm:inline-flex" style={{background:`${statusColors[p.status]||"#888"}18`,color:statusColors[p.status]||"#888"}}>{p.status}</span><ChevronRight size={15} className="text-[#b1b2aa] transition group-hover:translate-x-0.5"/></motion.button>)}</div>
                </section>
                <section className="panel p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between"><div><h2 className="text-[16px] font-semibold tracking-tight">Your next moves</h2><p className="mt-1 text-[11px] text-[#85877f]">A little progress every day.</p></div><span className="rounded-full bg-[#f2f1ed] px-2.5 py-1 text-[10px] font-medium">{doneTasks} of {tasks.length}</span></div>
                  <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-[#f0f0ec]"><motion.div initial={{width:0}} animate={{width:`${tasks.length?doneTasks/tasks.length*100:0}%`}} className="h-full rounded-full bg-[#6655d9]"/></div>
                  <div className="space-y-1">{tasks.map(t => <button key={t.id} onClick={() => toggleTask(t.id)} className="flex w-full items-start gap-3 rounded-lg px-1 py-3 text-left hover:bg-[#fafaf8]"><span className={`mt-0.5 ${t.done?"text-[#3b9a65]":"text-[#b7b8b0]"}`}>{t.done?<CheckCircle2 size={17}/>:<Circle size={17}/>}</span><span className="min-w-0 flex-1"><span className={`block text-[12px] ${t.done?"text-[#a1a29b] line-through":"font-medium"}`}>{t.title}</span><span className="mt-1 block truncate text-[10px] text-[#85877f]">{t.project}</span></span><span className="whitespace-nowrap text-[10px] text-[#85877f]">{t.due}</span></button>)}</div>
                  <button onClick={() => { const title = window.prompt("What do you need to do?"); if (title?.trim()) { const project = window.prompt("Related project (optional)", "") || "General"; setTasks(prev => [{id:Date.now(),title:title.trim(),project,due:"Today",done:false},...prev]); notify("Task added"); } }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#dcdcd5] py-2.5 text-[11px] font-medium text-[#77796f] hover:border-[#bdb5ff] hover:text-[#6655d9]"><Plus size={13}/> Add a task</button>
                </section>
              </div>
              <section className="mt-6 rounded-2xl bg-[#242521] p-5 text-white sm:p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#c5bcff]"><Sparkles size={21}/></div><div className="flex-1"><div className="text-[14px] font-semibold">Your next great video starts with one idea.</div><p className="mt-1 text-[11px] leading-5 text-white/60">Open the idea bank, shape the hook, and turn the concept into a production-ready script.</p></div><button onClick={() => setSection("Idea bank")} className="flex w-fit items-center gap-2 rounded-lg bg-white px-3.5 py-2.5 text-[11px] font-semibold text-[#242521] hover:bg-[#eeecff]">Explore idea bank <ArrowUpRight size={14}/></button></div></section>
            </>}

            {section === "Video projects" && <section><SectionHeading title="Video projects" subtitle="Every video, from the first rough idea to the final export." action={() => setNewProjectOpen(true)} actionLabel="New project"/><div className="mb-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9b93]"/><input id="workspace-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects, platforms, status…" className="w-full rounded-xl border border-[#e8e8e2] bg-white py-3 pl-9 pr-3 text-[12px] outline-none focus:border-[#bdb5ff]"/></div><select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className="rounded-xl border border-[#e8e8e2] bg-white px-3 py-3 text-[12px] outline-none"><option>Idea</option><option>Scripting</option><option>Editing</option><option>Published</option></select></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredProjects.map(p=><button key={p.id} onClick={()=>setSelectedProject(p)} className="panel group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"><div className="mb-5 flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl" style={{background:p.color}}>{p.thumbnail ? <img src={p.thumbnail} alt="" className="h-full w-full object-cover"/> : p.platform==="YouTube"?<Youtube size={20} className="text-[#d94c43]"/>:<Instagram size={20} className="text-[#b84e88]"/>}</div><span className="rounded-full px-2.5 py-1 text-[10px] font-medium" style={{background:`${statusColors[p.status]||"#888"}18`,color:statusColors[p.status]||"#888"}}>{p.status}</span></div><h3 className="text-[14px] font-semibold">{p.title}</h3><p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#85877f]">{p.description}</p><div className="mt-5 flex items-center justify-between border-t border-[#eeeeea] pt-4 text-[10px] text-[#85877f]"><span>{p.platform}</span><span className="flex items-center gap-1"><Clock3 size={12}/> {p.date}</span></div></button>)}</div>{filteredProjects.length===0&&<EmptyState title="No projects found" body="Try another search or create a new project." action={()=>setNewProjectOpen(true)}/>}</section>}

            {section === "Script library" && <section><SectionHeading title="Script library" subtitle="Hooks, talking points, voice-over drafts, and calls to action." action={createScript} actionLabel="New script"/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{scripts.map(s=><div key={s.id} className="panel p-5"><div className="mb-4 flex items-center justify-between"><span className="rounded-lg bg-[#f0effb] px-2.5 py-1.5 text-[10px] font-semibold text-[#6655d9]">{s.platform}</span><button onClick={()=>copyScript(s)} className="rounded-lg p-2 text-[#85877f] hover:bg-[#f5f5f1]" title="Copy script"><Copy size={14}/></button></div><h3 className="text-[14px] font-semibold">{s.title}</h3><p className="mt-2 line-clamp-3 text-[11px] leading-5 text-[#85877f]">{s.hook || "Your opening hook goes here. Give the viewer a reason to keep watching."}</p><div className="mt-5 flex gap-2"><button onClick={()=>setScriptOpen(s)} className="flex-1 rounded-lg bg-[#242521] py-2.5 text-[11px] font-semibold text-white hover:bg-black">Open script</button><button onClick={()=>{setScripts(prev=>prev.filter(x=>x.id!==s.id));notify("Script deleted");}} className="rounded-lg border border-[#e8e8e2] px-3 text-[#85877f] hover:text-red-500"><Trash2 size={14}/></button></div></div>)}</div>{scripts.length===0&&<EmptyState title="Your script library is empty" body="Create your first script and keep every draft in one place." action={createScript}/>}</section>}

            {section === "Content calendar" && <section><SectionHeading title="Content calendar" subtitle="A lightweight view of what's coming up next." action={()=>setNewProjectOpen(true)} actionLabel="Schedule content"/><div className="panel overflow-hidden"><div className="grid grid-cols-7 border-b border-[#e8e8e2] bg-[#fbfbf9]">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="border-r border-[#e8e8e2] px-1 py-3 text-center text-[10px] font-semibold text-[#85877f] last:border-r-0 sm:px-3">{d}</div>)}</div><div className="grid grid-cols-7">{Array.from({length:35},(_,i)=>{const day=i-5;const valid=day>=1&&day<=30;const events=projects.filter(p=>p.date.startsWith(["Oct","Nov"].includes(p.date.split(" ")[0])?p.date.split(" ")[1]:"-"));return <div key={i} className="min-h-[90px] border-b border-r border-[#eeeeea] p-1.5 last:border-r-0 sm:min-h-[115px] sm:p-2"><div className={`mb-2 text-[10px] ${day===25?"flex h-5 w-5 items-center justify-center rounded-full bg-[#6655d9] font-bold text-white":"text-[#85877f]"}`}>{valid?day:""}</div>{valid&&projects.filter(p=>p.date===`Oct ${day}`||p.date===`Nov ${day}`).slice(0,2).map(p=><button key={p.id} onClick={()=>setSelectedProject(p)} className="mb-1 block w-full truncate rounded-md px-1 py-1 text-left text-[9px] font-medium sm:px-1.5 sm:text-[10px]" style={{background:p.color}}>{p.title}</button>)}</div>})}</div></div><p className="mt-3 text-[10px] text-[#85877f]">Tip: assign a due date to each project to make your publishing rhythm visible.</p></section>}

            {section === "Idea bank" && <section><SectionHeading title="Idea bank" subtitle="Capture sparks before they disappear. Turn the best ones into projects." action={()=>setNewProjectOpen(true)} actionLabel="Develop an idea"/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[{tag:"Storytelling",title:"The advice I wish I heard earlier",body:"Personal story + 3 lessons. Great for a reflective YouTube video."},{tag:"Creator tips",title:"Make your phone footage look expensive",body:"Lighting, composition, movement. Show each tip with a quick before-and-after."},{tag:"Behind the scenes",title:"A realistic week as a small creator",body:"Show planning, filming, editing, and what did not go to plan."},{tag:"Instagram Reel",title:"3 hooks that stop the scroll",body:"Demonstrate a question hook, a bold claim, and a curiosity gap."},{tag:"Educational",title:"Explain a complex idea in 60 seconds",body:"Choose one topic and explain it with a visual analogy."},{tag:"Community",title:"Answer the question people ask you most",body:"Turn a recurring comment or DM into a helpful video."}].map((idea,i)=><div key={idea.title} className="panel p-5"><div className="mb-4 flex items-center gap-2 text-[#6655d9]"><Lightbulb size={17}/><span className="text-[10px] font-semibold uppercase tracking-wide">{idea.tag}</span></div><h3 className="text-[14px] font-semibold">{idea.title}</h3><p className="mt-2 min-h-[42px] text-[11px] leading-5 text-[#85877f]">{idea.body}</p><button onClick={()=>{setNewTitle(idea.title);setNewProjectOpen(true);}} className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#6655d9]">Turn into project <ArrowUpRight size={13}/></button></div>)}</div></section>}

            {section === "Inbox" && <section><SectionHeading title="Inbox" subtitle="A home for feedback, comments, and things to follow up on."/><div className="panel divide-y divide-[#eeeeea]">{[{title:"Review your next video hook",desc:"Your script has a hook draft waiting for review.",time:"Today",icon:<FileText size={16}/>},{title:"Production checklist reminder",desc:"B-roll references still need to be collected.",time:"Today",icon:<ListChecks size={16}/>},{title:"Publishing plan",desc:"You have a Reel planned for October 26.",time:"Yesterday",icon:<CalendarDays size={16}/>}].map((n,i)=><div key={n.title} className="flex items-start gap-3 p-5"><div className="rounded-lg bg-[#f0effb] p-2 text-[#6655d9]">{n.icon}</div><div className="flex-1"><div className="text-[12px] font-semibold">{n.title}</div><p className="mt-1 text-[11px] text-[#85877f]">{n.desc}</p></div><span className="text-[10px] text-[#85877f]">{n.time}</span></div>)}</div></section>}
          </div>
        </main>
      </div>

      <AnimatePresence>{newProjectOpen && <Modal title="Create a video project" subtitle="Start with a title. You can refine the details later." close={()=>setNewProjectOpen(false)}><form onSubmit={e=>{e.preventDefault();addProject();}} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Project / internal name *</span><input autoFocus value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. 5 storytelling tips for Reels" className="w-full rounded-xl border border-[#e8e8e2] px-3 py-3 text-[12px] outline-none focus:border-[#bdb5ff]" required/></label>
<div className="grid grid-cols-2 gap-3">
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Platform</span><select value={newPlatform} onChange={e=>setNewPlatform(e.target.value as "YouTube"|"Instagram")} className="w-full rounded-xl border border-[#e8e8e2] bg-white px-3 py-3 text-[12px] outline-none"><option>YouTube</option><option>Instagram</option></select></label>
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Work progress</span><select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className="w-full rounded-xl border border-[#e8e8e2] bg-white px-3 py-3 text-[12px] outline-none"><option>Idea</option><option>Scripting</option><option>Editing</option><option>Published</option></select></label>
</div>
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Source / inspiration</span><input value={newSource} onChange={e=>setNewSource(e.target.value)} placeholder="Reference URL, research source, or original idea" className="w-full rounded-xl border border-[#e8e8e2] px-3 py-3 text-[12px] outline-none focus:border-[#bdb5ff]"/></label>
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Thumbnail image URL</span><input value={newThumbnail} onChange={e=>setNewThumbnail(e.target.value)} placeholder="https://… (optional)" className="w-full rounded-xl border border-[#e8e8e2] px-3 py-3 text-[12px] outline-none focus:border-[#bdb5ff]"/>{newThumbnail && <img src={newThumbnail} alt="Thumbnail preview" className="mt-2 max-h-36 rounded-lg border border-[#e8e8e2] object-cover"/>}</label>
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Video title</span><input value={newVideoTitle} onChange={e=>setNewVideoTitle(e.target.value)} placeholder="Final title viewers will see" className="w-full rounded-xl border border-[#e8e8e2] px-3 py-3 text-[12px] outline-none focus:border-[#bdb5ff]"/></label>
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Description / caption</span><textarea value={newVideoDescription} onChange={e=>setNewVideoDescription(e.target.value)} rows={3} placeholder="Video description, Instagram caption, links, credits, hashtags…" className="w-full resize-y rounded-xl border border-[#e8e8e2] px-3 py-3 text-[12px] leading-5 outline-none focus:border-[#bdb5ff]"/></label>
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Tags / keywords</span><input value={newTags} onChange={e=>setNewTags(e.target.value)} placeholder="video editing, creator tips, tutorial (comma separated)" className="w-full rounded-xl border border-[#e8e8e2] px-3 py-3 text-[12px] outline-none focus:border-[#bdb5ff]"/></label>
<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={()=>setNewProjectOpen(false)} className="rounded-lg border border-[#e8e8e2] px-4 py-2.5 text-[11px] font-semibold">Cancel</button><button type="submit" className="rounded-lg bg-[#6655d9] px-4 py-2.5 text-[11px] font-semibold text-white">Create project</button></div>
</form></Modal>}</AnimatePresence>

      <AnimatePresence>{selectedProject && <Modal title={selectedProject.title} subtitle={`${selectedProject.platform} · ${selectedProject.status}`} close={()=>setSelectedProject(null)}><div className="space-y-4"><div className="rounded-xl p-4" style={{background:selectedProject.color}}><div className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Creative brief</div><p className="mt-2 text-[12px] leading-6">{selectedProject.description}</p></div><div className="grid gap-3 sm:grid-cols-2">
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Video title</span><input value={selectedProject.videoTitle} onChange={e=>{const next={...selectedProject,videoTitle:e.target.value};setSelectedProject(next);setProjects(prev=>prev.map(p=>p.id===next.id?next:p));}} placeholder="Final title for publishing" className="w-full rounded-xl border border-[#e8e8e2] px-3 py-2.5 text-[11px] outline-none focus:border-[#bdb5ff]"/></label>
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Source / reference</span><input value={selectedProject.source} onChange={e=>{const next={...selectedProject,source:e.target.value};setSelectedProject(next);setProjects(prev=>prev.map(p=>p.id===next.id?next:p));}} placeholder="URL, research source, or inspiration" className="w-full rounded-xl border border-[#e8e8e2] px-3 py-2.5 text-[11px] outline-none focus:border-[#bdb5ff]"/></label>
<label className="block sm:col-span-2"><span className="mb-1.5 block text-[11px] font-semibold">Thumbnail image URL</span><input value={selectedProject.thumbnail} onChange={e=>{const next={...selectedProject,thumbnail:e.target.value};setSelectedProject(next);setProjects(prev=>prev.map(p=>p.id===next.id?next:p));}} placeholder="https://example.com/thumbnail.jpg" className="w-full rounded-xl border border-[#e8e8e2] px-3 py-2.5 text-[11px] outline-none focus:border-[#bdb5ff]"/>{selectedProject.thumbnail && <img src={selectedProject.thumbnail} alt="Thumbnail preview" className="mt-2 max-h-36 rounded-lg border border-[#e8e8e2] object-cover"/>}</label>
<label className="block sm:col-span-2"><span className="mb-1.5 block text-[11px] font-semibold">Video description</span><textarea value={selectedProject.videoDescription} onChange={e=>{const next={...selectedProject,videoDescription:e.target.value};setSelectedProject(next);setProjects(prev=>prev.map(p=>p.id===next.id?next:p));}} rows={3} placeholder="Write the YouTube description or Instagram caption…" className="w-full rounded-xl border border-[#e8e8e2] px-3 py-3 text-[11px] leading-5 outline-none focus:border-[#bdb5ff]"/></label>
<label className="block sm:col-span-2"><span className="mb-1.5 block text-[11px] font-semibold">Tags (comma-separated)</span><input value={selectedProject.tags} onChange={e=>{const next={...selectedProject,tags:e.target.value};setSelectedProject(next);setProjects(prev=>prev.map(p=>p.id===next.id?next:p));}} placeholder="youtube SEO, video editing, creator tips" className="w-full rounded-xl border border-[#e8e8e2] px-3 py-2.5 text-[11px] outline-none focus:border-[#bdb5ff]"/></label>
</div>
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold">Production stage</span><select value={selectedProject.status} onChange={e=>{const next={...selectedProject,status:e.target.value};setSelectedProject(next);setProjects(prev=>prev.map(p=>p.id===next.id?next:p));}} className="w-full rounded-xl border border-[#e8e8e2] bg-white px-3 py-3 text-[12px] outline-none"><option>Idea</option><option>Scripting</option><option>Editing</option><option>Published</option></select></label>
<div><div className="mb-2 text-[11px] font-semibold">Work progress</div><div className="grid grid-cols-4 gap-1.5">{["Idea","Scripting","Editing","Published"].map((stage,idx)=>{const current=["Idea","Scripting","Editing","Published"].indexOf(selectedProject.status);const active=current>=idx;return <button key={stage} onClick={()=>{const next={...selectedProject,status:stage};setSelectedProject(next);setProjects(prev=>prev.map(p=>p.id===next.id?next:p));}} className={`rounded-lg border px-1 py-2 text-[9px] font-semibold sm:text-[10px] ${selectedProject.status===stage?"border-[#6655d9] bg-[#eeecff] text-[#5141bf]":active?"border-[#d8d4ff] bg-[#f8f7ff] text-[#6655d9]":"border-[#e8e8e2] text-[#85877f]"}`}>{stage}</button>})}</div></div>
<div className="grid grid-cols-2 gap-3"><button onClick={()=>{const s={id:Date.now(),title:selectedProject.title,platform:selectedProject.platform,hook:"",body:"",cta:""};setScripts(prev=>[s,...prev]);setSelectedProject(null);setScriptOpen(s);setSection("Script library");}} className="flex items-center justify-center gap-2 rounded-lg bg-[#6655d9] px-3 py-3 text-[11px] font-semibold text-white"><FileText size={14}/> Write script</button><button onClick={()=>{setProjects(prev=>prev.filter(p=>p.id!==selectedProject.id));setSelectedProject(null);notify("Project deleted");}} className="flex items-center justify-center gap-2 rounded-lg border border-[#e8e8e2] px-3 py-3 text-[11px] font-semibold text-[#c74a4a]"><Trash2 size={14}/> Delete project</button></div></div></Modal>}</AnimatePresence>

      <AnimatePresence>{scriptOpen && <Modal wide title="Script editor" subtitle="Write for the ear, not just the page. Keep the viewer moving." close={()=>setScriptOpen(null)}><div className="mb-4 flex flex-col gap-3 sm:flex-row"><input value={scriptOpen.title} onChange={e=>updateScript({...scriptOpen,title:e.target.value})} className="min-w-0 flex-1 rounded-xl border border-[#e8e8e2] px-3 py-2.5 text-[13px] font-semibold outline-none focus:border-[#bdb5ff]"/><select value={scriptOpen.platform} onChange={e=>updateScript({...scriptOpen,platform:e.target.value})} className="rounded-xl border border-[#e8e8e2] bg-white px-3 py-2.5 text-[11px] outline-none"><option>YouTube</option><option>Instagram</option></select></div><div className="grid gap-4 md:grid-cols-2"><ScriptField label="01 · The hook" hint="Earn the next 3 seconds." value={scriptOpen.hook} onChange={v=>updateScript({...scriptOpen,hook:v})} placeholder="Open with a question, tension, surprising claim, or promise…"/><ScriptField label="02 · Main script" hint="One clear idea at a time." value={scriptOpen.body} onChange={v=>updateScript({...scriptOpen,body:v})} placeholder="Outline the story, beats, examples, visuals, and transitions…"/><ScriptField label="03 · Call to action" hint="Make the next step natural." value={scriptOpen.cta} onChange={v=>updateScript({...scriptOpen,cta:v})} placeholder="What should the viewer do or remember?"/><div className="rounded-xl bg-[#f7f6ff] p-4"><div className="flex items-center gap-2 text-[11px] font-semibold text-[#6655d9]"><WandSparkles size={15}/> Script checklist</div><div className="mt-3 space-y-2 text-[11px] text-[#68658a]">{["Hook makes a clear promise","One main idea / story arc","Visuals or B-roll noted","Ending has a clear CTA"].map((x,i)=><div key={x} className="flex items-center gap-2"><Circle size={13}/>{x}</div>)}</div><p className="mt-4 text-[10px] leading-5 text-[#8580aa]">AI writing is not connected in this starter. Add an AI provider API route to generate hooks, outlines, shot lists, or captions securely.</p></div></div><div className="mt-4 flex flex-wrap justify-end gap-2"><button onClick={()=>copyScript(scriptOpen)} className="flex items-center gap-2 rounded-lg border border-[#e8e8e2] px-4 py-2.5 text-[11px] font-semibold"><Copy size={14}/> Copy script</button><button onClick={()=>{setScriptOpen(null);notify("Script saved");}} className="rounded-lg bg-[#6655d9] px-4 py-2.5 text-[11px] font-semibold text-white">Done</button></div></Modal>}</AnimatePresence>

      <AnimatePresence>{toast && <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}} className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-[#242521] px-4 py-3 text-[12px] font-medium text-white shadow-xl">{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

function StatCard({icon,label,value,detail,tint}:{icon:React.ReactNode;label:string;value:string;detail:string;tint:string}) {
  return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[11px] text-[#85877f]">{label}</span><span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{background:tint}}>{icon}</span></div><div className="mt-3 text-[27px] font-semibold tracking-[-.04em]">{value}</div><div className="mt-1 text-[10px] text-[#85877f]">{detail}</div></motion.div>
}
function SectionHeading({title,subtitle,action,actionLabel}:{title:string;subtitle:string;action?:()=>void;actionLabel?:string}) {
  return <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-[27px] font-semibold tracking-[-.04em]">{title}</h1><p className="mt-2 text-[12px] text-[#85877f]">{subtitle}</p></div>{action&&<button onClick={action} className="flex w-fit items-center gap-2 rounded-lg bg-[#6655d9] px-3.5 py-2.5 text-[11px] font-semibold text-white"><Plus size={14}/>{actionLabel||"Create new"}</button>}</div>
}
function EmptyState({title,body,action}:{title:string;body:string;action:()=>void}) {
  return <div className="panel flex flex-col items-center px-5 py-14 text-center"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eeecff] text-[#6655d9]"><FileText size={22}/></div><h3 className="text-[14px] font-semibold">{title}</h3><p className="mt-2 text-[11px] text-[#85877f]">{body}</p><button onClick={action} className="mt-4 rounded-lg bg-[#6655d9] px-4 py-2.5 text-[11px] font-semibold text-white">Get started</button></div>
}
function Modal({title,subtitle,close,children,wide=false}:{title:string;subtitle:string;close:()=>void;children:React.ReactNode;wide?:boolean}) {
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#19191a]/35 p-3 backdrop-blur-[2px]" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}><motion.div initial={{opacity:0,y:12,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8,scale:.98}} className={`my-auto w-full ${wide?"max-w-3xl":"max-w-lg"} rounded-2xl border border-[#e8e8e2] bg-white p-5 shadow-2xl sm:p-6`}><div className="mb-5 flex items-start justify-between"><div><h2 className="text-[17px] font-semibold tracking-tight">{title}</h2><p className="mt-1 text-[11px] text-[#85877f]">{subtitle}</p></div><button onClick={close} className="rounded-lg p-1.5 text-[#85877f] hover:bg-[#f2f2ee]"><X size={17}/></button></div>{children}</motion.div></motion.div>
}
function ScriptField({label,hint,value,onChange,placeholder}:{label:string;hint:string;value:string;onChange:(v:string)=>void;placeholder:string}) {
  return <label className="block"><span className="block text-[11px] font-semibold">{label}</span><span className="mt-1 block text-[10px] text-[#85877f]">{hint}</span><textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={5} className="mt-2 w-full resize-y rounded-xl border border-[#e8e8e2] bg-white p-3 text-[11px] leading-5 outline-none placeholder:text-[#b4b5ae] focus:border-[#bdb5ff]"/></label>
}
