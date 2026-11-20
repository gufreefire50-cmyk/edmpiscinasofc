import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Activity, AlertTriangle, Boxes, CalendarClock, ChartNoAxesCombined, CircleDollarSign, ClipboardList, LogOut, PackagePlus, Search, ShieldCheck, ShoppingBag, Users } from "lucide-react";

type Product = { id: string; name: string; description: string | null; category: string; price: number; promo_price: number | null; stock: number; sku: string | null; active: boolean; image_url: string | null };
type Session = { access_token: string; refresh_token: string; user: { email?: string } };
const url = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("Visão geral");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "Produtos químicos", price: "", promo_price: "", stock: "0", sku: "" });
  const [loadingData, setLoadingData] = useState(false);

  async function api(path: string, options: RequestInit = {}) {
    if (!session) throw new Error("Faça login novamente.");
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...options,
      headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation", ...options.headers },
    });
    if (!response.ok) throw new Error((await response.text()) || "Não foi possível acessar os dados.");
    return response.status === 204 ? null : response.json();
  }

  async function loadProducts() {
    if (!session) return;
    setLoadingData(true);
    try { setProducts(await api("products?select=*&order=name.asc")); }
    catch (e) { setError(e instanceof Error ? e.message : "Erro ao carregar produtos."); }
    finally { setLoadingData(false); }
  }

  useEffect(() => { if (session) loadProducts(); }, [session]);

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (!url || !key) throw new Error("O Supabase ainda não está configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis do projeto.");
      const response = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || data.message || "E-mail ou senha inválidos.");
      setSession(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível entrar."); }
    finally { setBusy(false); }
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault(); setError("");
    try {
      await api("products", { method: "POST", body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() || null, category: form.category, price: Number(form.price), promo_price: form.promo_price ? Number(form.promo_price) : null, stock: Number(form.stock), sku: form.sku.trim() || null, active: true }) });
      setForm({ name: "", description: "", category: "Produtos químicos", price: "", promo_price: "", stock: "0", sku: "" }); setShowForm(false); await loadProducts();
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível salvar. Confira a estrutura do banco."); }
  }

  async function updateStock(product: Product, delta: number) {
    const stock = Math.max(0, product.stock + delta);
    try { await api(`products?id=eq.${product.id}`, { method: "PATCH", body: JSON.stringify({ stock }) }); await loadProducts(); }
    catch (e) { setError(e instanceof Error ? e.message : "Falha ao atualizar estoque."); }
  }

  const filtered = useMemo(() => products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase())), [products, search]);
  const lowStock = products.filter(p => p.stock <= 5 && p.active).length;

  if (!session) return <main className="min-h-screen bg-[#071426] px-5 py-10 text-white flex items-center justify-center">
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d2038] p-8 shadow-2xl">
      <div className="mb-8 flex items-center gap-3"><div className="rounded-xl bg-sky-500/15 p-3 text-sky-300"><ShieldCheck /></div><div><p className="text-xs uppercase tracking-[.22em] text-sky-300">EDM Piscinas</p><h1 className="text-2xl font-bold">Painel administrativo</h1></div></div>
      <p className="mb-6 text-sm text-slate-400">Acesso restrito à equipe autorizada.</p>
      <form onSubmit={login} className="space-y-4">
        <label className="block text-sm text-slate-300">E-mail<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#08182b] px-4 py-3 text-white outline-none focus:border-sky-400" placeholder="admin@edmpiscinas.com.br" /></label>
        <label className="block text-sm text-slate-300">Senha<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#08182b] px-4 py-3 text-white outline-none focus:border-sky-400" placeholder="Sua senha" /></label>
        {error && <p role="alert" className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-200">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-sky-500 px-4 py-3 font-bold text-white transition hover:bg-sky-400 disabled:opacity-50">{busy ? "Entrando..." : "Entrar no painel"}</button>
      </form>
      <p className="mt-6 text-xs leading-5 text-slate-500">A autenticação é feita pelo Supabase Auth. Nenhuma senha é armazenada neste site.</p>
      <a href="/" className="mt-6 inline-block text-sm text-sky-300 hover:text-white">← Voltar ao site</a>
    </div>
  </main>;

  const nav = [{ name: "Visão geral", icon: ChartNoAxesCombined }, { name: "Produtos e estoque", icon: Boxes }, { name: "Vendas e pedidos", icon: ShoppingBag }, { name: "Clientes", icon: Users }, { name: "Contas a receber", icon: CalendarClock }, { name: "Relatórios", icon: Activity }];
  return <main className="min-h-screen bg-[#071426] text-white md:flex">
    <aside className="border-b border-white/10 bg-[#0b1b30] p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <a href="/" className="mb-8 flex items-center gap-3"><div className="rounded-lg bg-sky-500/15 p-2 text-sky-300"><ShieldCheck /></div><div><strong className="block">EDM Piscinas</strong><small className="text-slate-400">Gestão da loja</small></div></a>
      <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">{nav.map(n=><button key={n.name} onClick={()=>setTab(n.name)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${tab===n.name?"bg-sky-500/15 text-sky-200":"text-slate-400 hover:bg-white/5 hover:text-white"}`}><n.icon size={18}/>{n.name}</button>)}</nav>
      <button onClick={()=>setSession(null)} className="mt-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white"><LogOut size={17}/> Sair</button>
    </aside>
    <section className="min-w-0 flex-1 p-5 md:p-9">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[.2em] text-sky-300">Administração</p><h1 className="mt-1 text-3xl font-bold">{tab}</h1><p className="mt-2 text-sm text-slate-400">Dados reais da operação da EDM Piscinas.</p></div><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">Sessão autenticada</span></header>
      {error && <p role="alert" className="mb-5 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-200">{error}</p>}
      {tab==="Visão geral" && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{label:"Produtos cadastrados",value:products.length,icon:Boxes},{label:"Estoque baixo",value:lowStock,icon:AlertTriangle},{label:"Produtos ativos",value:products.filter(p=>p.active).length,icon:PackagePlus},{label:"Pedidos",value:"—",icon:ClipboardList}].map(c=><article key={c.label} className="rounded-xl border border-white/10 bg-[#0d2038] p-5"><c.icon className="mb-4 text-sky-300"/><p className="text-sm text-slate-400">{c.label}</p><strong className="mt-1 block text-3xl">{c.value}</strong></article>)}</div><div className="mt-6 rounded-xl border border-white/10 bg-[#0d2038] p-6"><h2 className="mb-2 font-semibold">Resumo financeiro</h2><p className="text-sm leading-6 text-slate-400">Os valores de vendas, recebimentos e contas pendentes serão exibidos após a conexão das tabelas financeiras do Supabase. Nenhum valor fictício é apresentado.</p></div></>}
      {tab==="Produtos e estoque" && <><div className="mb-5 flex flex-wrap gap-3"><div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-3 text-slate-500" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar produto ou código" className="w-full rounded-lg border border-white/10 bg-[#0d2038] py-3 pl-10 pr-3 text-sm outline-none focus:border-sky-400"/></div><button onClick={()=>setShowForm(!showForm)} className="rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold hover:bg-sky-400">+ Novo produto</button></div>
      {showForm && <form onSubmit={saveProduct} className="mb-6 grid gap-3 rounded-xl border border-white/10 bg-[#0d2038] p-5 sm:grid-cols-2"><h2 className="sm:col-span-2 font-semibold">Cadastrar produto</h2><input required placeholder="Nome do produto" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="rounded-lg bg-[#071426] p-3 text-sm"/><input placeholder="Código / referência" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} className="rounded-lg bg-[#071426] p-3 text-sm"/><input required type="number" min="0.01" step="0.01" placeholder="Preço de venda (R$)" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="rounded-lg bg-[#071426] p-3 text-sm"/><input type="number" min="0" step="0.01" placeholder="Preço promocional (opcional)" value={form.promo_price} onChange={e=>setForm({...form,promo_price:e.target.value})} className="rounded-lg bg-[#071426] p-3 text-sm"/><input required type="number" min="0" step="1" placeholder="Estoque inicial" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} className="rounded-lg bg-[#071426] p-3 text-sm"/><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="rounded-lg bg-[#071426] p-3 text-sm"><option>Produtos químicos</option><option>Cloro</option><option>Algicidas</option><option>Bombas</option><option>Filtros</option><option>Aquecedores</option><option>Acessórios</option><option>Tratamento de água</option></select><textarea placeholder="Descrição" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="rounded-lg bg-[#071426] p-3 text-sm sm:col-span-2"/><div className="flex gap-2 sm:col-span-2"><button className="rounded-lg bg-sky-500 px-5 py-3 text-sm font-bold">Salvar produto</button><button type="button" onClick={()=>setShowForm(false)} className="rounded-lg border border-white/10 px-5 py-3 text-sm">Cancelar</button></div></form>}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0d2038]"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-slate-500"><tr><th className="p-4">Produto</th><th className="p-4">Categoria</th><th className="p-4">Preço</th><th className="p-4">Estoque</th><th className="p-4">Ajuste</th></tr></thead><tbody>{filtered.map(p=><tr key={p.id} className="border-b border-white/5"><td className="p-4"><strong>{p.name}</strong><small className="block text-slate-500">{p.sku||"Sem código"}</small></td><td className="p-4 text-slate-400">{p.category}</td><td className="p-4">{money(p.promo_price||p.price)}</td><td className="p-4"><span className={p.stock<=5?"text-amber-300":"text-emerald-300"}>{p.stock}</span></td><td className="p-4"><div className="flex gap-2"><button onClick={()=>updateStock(p,-1)} disabled={p.stock<=0} className="rounded bg-white/10 px-3 py-1 disabled:opacity-30">−</button><button onClick={()=>updateStock(p,1)} className="rounded bg-white/10 px-3 py-1">+</button></div></td></tr>)}{!filtered.length&&<tr><td colSpan={5} className="p-10 text-center text-slate-400">{loadingData?"Carregando produtos...":"Nenhum produto cadastrado ainda."}</td></tr>}</tbody></table></div></>}
      {!["Visão geral","Produtos e estoque"].includes(tab) && <div className="rounded-xl border border-white/10 bg-[#0d2038] p-7"><div className="mb-3 flex items-center gap-3 text-sky-300"><CircleDollarSign/><span className="font-semibold">Módulo {tab}</span></div><p className="text-sm leading-6 text-slate-400">Esta área depende da configuração das tabelas e regras do banco de dados no Supabase. Ela não exibirá dados de demonstração nem lançamentos inventados.</p></div>}
    </section>
  </main>;
}
