import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Minus, Plus, Search, ShoppingBag, Store, Trash2 } from "lucide-react";

type Product = { id: string; name: string; description: string | null; category: string; price: number; promo_price: number | null; stock: number; image_url: string | null; active: boolean };
type CartItem = { product: Product; quantity: number };
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const phone = "5511961350125";
const brl = (v:number) => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

export const Route = createFileRoute("/catalogo")({ component: CatalogPage });

function CatalogPage() {
  const [products,setProducts] = useState<Product[]>([]);
  const [cart,setCart] = useState<CartItem[]>([]);
  const [query,setQuery] = useState("");
  const [category,setCategory] = useState("Todas");
  const [name,setName] = useState("");
  const [customerPhone,setCustomerPhone] = useState("");
  const [notes,setNotes] = useState("");
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  useEffect(()=>{
    let alive=true;
    async function load(){
      if(!supabaseUrl||!anonKey){setError("O catálogo será liberado assim que o banco de produtos da loja for conectado.");setLoading(false);return;}
      try{
        const res=await fetch(`${supabaseUrl}/rest/v1/products?select=id,name,description,category,price,promo_price,stock,image_url,active&active=eq.true&order=name.asc`,{headers:{apikey:anonKey,Authorization:`Bearer ${anonKey}`}});
        if(!res.ok) throw new Error("Não foi possível carregar os produtos.");
        const rows=await res.json(); if(alive)setProducts(rows);
      }catch(e){if(alive)setError(e instanceof Error?e.message:"Erro ao carregar catálogo.");}
      finally{if(alive)setLoading(false);}
    }
    load(); return ()=>{alive=false;};
  },[]);
  const categories=useMemo(()=>["Todas",...Array.from(new Set(products.map(p=>p.category))).sort()],[products]);
  const visible=products.filter(p=>(category==="Todas"||p.category===category)&&(`${p.name} ${p.description||""}`).toLowerCase().includes(query.toLowerCase()));
  const total=cart.reduce((sum,item)=>sum+(item.product.promo_price||item.product.price)*item.quantity,0);
  function add(product:Product){setCart(current=>{const found=current.find(i=>i.product.id===product.id);if(found)return current.map(i=>i.product.id===product.id?{...i,quantity:Math.min(product.stock,i.quantity+1)}:i);return [...current,{product,quantity:1}];});}
  function change(id:string,delta:number){setCart(current=>current.map(i=>i.product.id===id?{...i,quantity:Math.max(0,Math.min(i.product.stock,i.quantity+delta))}:i).filter(i=>i.quantity>0));}
  function sendOrder(){
    if(!name.trim()||customerPhone.replace(/\D/g,"").length<10||!cart.length)return;
    const lines=cart.map(i=>`• ${i.quantity}x ${i.product.name} — ${brl((i.product.promo_price||i.product.price)*i.quantity)}`).join("\n");
    const message=`Olá! Quero fazer um pedido para RETIRADA NA LOJA EDM Piscinas.\n\nNome: ${name}\nWhatsApp: ${customerPhone}\n\n${lines}\n\nTotal: ${brl(total)}\nObservações: ${notes||"Nenhuma"}\n\nConfirmar disponibilidade e retirada, por favor.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
  }
  return <main className="min-h-screen bg-[#071426] text-white"><header className="border-b border-white/10 bg-[#0b1b30]"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5"><a href="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft size={18}/> Voltar ao site</a><strong className="tracking-wide">EDM <span className="text-sky-300">PISCINAS</span></strong><a href="/admin" className="text-xs text-slate-500 hover:text-white">Área administrativa</a></div></header>
    <div className="mx-auto max-w-7xl px-5 py-10"><div className="mb-8"><p className="text-xs uppercase tracking-[.25em] text-sky-300">Loja EDM Piscinas</p><h1 className="mt-2 text-4xl font-bold">Catálogo de produtos</h1><p className="mt-3 text-slate-400">Escolha seus produtos e envie o pedido pelo WhatsApp. Pagamento e retirada são combinados diretamente com a loja.</p><div className="mt-4 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs text-sky-200"><Store size={15}/> Retirada somente na loja física · Sem entrega</div></div>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]"><section><div className="mb-5 flex flex-wrap gap-3"><div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-3 text-slate-500" size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pesquisar produtos..." className="w-full rounded-lg border border-white/10 bg-[#0d2038] py-3 pl-10 pr-4 outline-none focus:border-sky-400"/></div><select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-lg border border-white/10 bg-[#0d2038] px-4 py-3">{categories.map(c=><option key={c}>{c}</option>)}</select></div>
      {error&&<div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-5 text-sm text-amber-100">{error}</div>}
      {loading&&<p className="p-10 text-center text-slate-400">Carregando catálogo...</p>}
      {!loading&&!error&&!visible.length&&<div className="rounded-xl border border-white/10 bg-[#0d2038] p-10 text-center text-slate-400">Nenhum produto disponível nesta categoria no momento.</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map(p=><article key={p.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#0d2038]">{p.image_url?<img src={p.image_url} alt={p.name} className="h-48 w-full object-cover"/>:<div className="flex h-40 items-center justify-center bg-[#102944] text-sky-300"><ShoppingBag size={36}/></div>}<div className="p-4"><small className="text-xs text-sky-300">{p.category}</small><h2 className="mt-1 font-semibold">{p.name}</h2><p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">{p.description}</p><div className="mt-4 flex items-center justify-between gap-3"><div><strong className="text-lg">{brl(p.promo_price||p.price)}</strong>{p.promo_price&&<small className="ml-2 text-slate-500 line-through">{brl(p.price)}</small>}<small className="block text-slate-500">{p.stock>0?`${p.stock} disponíveis`:"Indisponível"}</small></div><button disabled={p.stock<=0} onClick={()=>add(p)} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">Adicionar</button></div></div></article>)}</div></section>
      <aside className="h-fit rounded-xl border border-white/10 bg-[#0d2038] p-5 lg:sticky lg:top-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Seu carrinho</h2><span className="rounded-full bg-sky-400/15 px-2 py-1 text-xs text-sky-200">{cart.reduce((s,i)=>s+i.quantity,0)} itens</span></div>{!cart.length?<p className="py-8 text-center text-sm text-slate-500">Seu carrinho está vazio.</p>:<div className="space-y-4">{cart.map(i=><div key={i.product.id} className="border-b border-white/10 pb-3"><div className="flex justify-between gap-2"><strong className="text-sm">{i.product.name}</strong><button onClick={()=>change(i.product.id,-i.quantity)} aria-label="Remover produto" className="text-slate-500 hover:text-red-300"><Trash2 size={16}/></button></div><div className="mt-2 flex items-center justify-between"><span className="text-sm text-slate-400">{brl((i.product.promo_price||i.product.price)*i.quantity)}</span><div className="flex items-center gap-3"><button onClick={()=>change(i.product.id,-1)} className="rounded bg-white/10 p-1"><Minus size={14}/></button><span className="text-sm">{i.quantity}</span><button onClick={()=>change(i.product.id,1)} disabled={i.quantity>=i.product.stock} className="rounded bg-white/10 p-1 disabled:opacity-30"><Plus size={14}/></button></div></div></div>)}</div>}
      <div className="my-5 flex justify-between border-t border-white/10 pt-4"><span className="text-slate-400">Total</span><strong className="text-xl">{brl(total)}</strong></div><div className="space-y-3"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" className="w-full rounded-lg bg-[#071426] p-3 text-sm outline-none focus:ring-1 focus:ring-sky-400"/><input value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} placeholder="Seu WhatsApp com DDD" className="w-full rounded-lg bg-[#071426] p-3 text-sm outline-none focus:ring-1 focus:ring-sky-400"/><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Observações (opcional)" className="w-full rounded-lg bg-[#071426] p-3 text-sm outline-none focus:ring-1 focus:ring-sky-400"/><button onClick={sendOrder} disabled={!cart.length||!name.trim()||customerPhone.replace(/\D/g,"").length<10} className="w-full rounded-lg bg-sky-500 px-4 py-3 font-bold disabled:opacity-40">Enviar pedido pelo WhatsApp</button><p className="text-center text-xs leading-5 text-slate-500">O pedido não é pago pelo site. A equipe confirma disponibilidade, pagamento e horário de retirada.</p></div></aside></div>
    </div></main>;
}
