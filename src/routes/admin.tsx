import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle, Boxes, CalendarClock, ChartNoAxesCombined,
  CircleDollarSign, ClipboardList, LogOut,
  Pencil, Plus, Search, ShieldCheck, ShoppingBag, Trash2, Users
} from "lucide-react";
import { EDM_ADMIN_EMAIL, supabase } from "@/lib/supabase";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string; name: string; description: string; category_id: string | null;
  sku: string | null; price: number; promo_price: number | null; stock: number;
  image_url: string | null; active: boolean; created_at: string;
  categories?: { name?: string } | null;
};
type WebsiteOrder = {
  id: string; customer_name: string; whatsapp: string;
  items: Array<{ name?: string; quantity?: number; price?: number }>;
  total: number; notes: string; status: string; created_at: string;
};
type Balance = {
  id: string; sale_id: string; amount_due: number; amount_received: number;
  balance: number; due_date: string | null; promised_payment_date: string | null;
  payment_status: string;
};
type Customer = {
  id: string; name: string; whatsapp: string; cpf: string | null;
  address: string | null; notes: string; created_at: string;
};
type Sale = {
  id: string; sale_number: number; customer_id: string | null; status: string;
  sale_date: string; total: number; payment_method: string | null;
  promised_payment_date: string | null; notes: string;
  customers?: { name?: string } | null;
  sale_items?: Array<{ product_name: string; quantity: number; unit_price: number }>;
};
const money = (value: number) =>
  Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const date = (value: string) => new Date(value).toLocaleDateString("pt-BR");
const slugify = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [loginMode, setLoginMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState(EDM_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState("Visão geral");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<WebsiteOrder[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [customerDraft, setCustomerDraft] = useState({ name: "", whatsapp: "", cpf: "", address: "", notes: "" });
  const [saleDraft, setSaleDraft] = useState({ customerId: "", productId: "", quantity: "1", saleDate: new Date().toISOString().slice(0,10), dueDate: "", promisedDate: "", method: "Dinheiro", initialReceived: "0", notes: "" });
  const [paymentDraft, setPaymentDraft] = useState({ balanceId: "", amount: "", paidDate: new Date().toISOString().slice(0,10), method: "Pix", notes: "" });
  const [loadingData, setLoadingData] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", category: "Produtos químicos", sku: "",
    price: "", promoPrice: "", stock: "0", imageUrl: "", active: true
  });

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4000);
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      const current = data.session?.user;
      if (error || !current || current.email?.toLowerCase() !== EDM_ADMIN_EMAIL) {
        if (current) void supabase.auth.signOut();
        setUserEmail("");
      } else {
        setUserEmail(current.email);
      }
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const current = session?.user;
      if (current?.email?.toLowerCase() === EDM_ADMIN_EMAIL) {
        setUserEmail(current.email);
      } else {
        setUserEmail("");
        if (current) void supabase.auth.signOut();
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");
    if (email.trim().toLowerCase() !== EDM_ADMIN_EMAIL) {
      setAuthError("Somente o e-mail administrativo autorizado pode acessar este painel.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: EDM_ADMIN_EMAIL,
      password
    });
    setBusy(false);
    if (error) setAuthError("Não foi possível entrar. Confira a senha e confirme o e-mail, caso solicitado.");
    else setPassword("");
  }

  async function handleSignup(event: FormEvent) {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");
    if (email.trim().toLowerCase() !== EDM_ADMIN_EMAIL) {
      setAuthError("O primeiro acesso só pode ser criado para o e-mail administrativo autorizado.");
      return;
    }
    if (password.length < 8) {
      setAuthError("Use uma senha com pelo menos 8 caracteres.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: EDM_ADMIN_EMAIL,
      password
    });
    setBusy(false);
    if (error) {
      setAuthError(error.message.includes("already registered")
        ? "Esse e-mail já possui cadastro. Volte para Entrar."
        : "Não foi possível criar o acesso: " + error.message);
      return;
    }
    setPassword("");
    if (data.session?.user.email?.toLowerCase() === EDM_ADMIN_EMAIL) {
      setUserEmail(data.session.user.email);
      setAuthMessage("Primeiro acesso criado e autenticado.");
    } else {
      setAuthMessage("Cadastro enviado. Abra o e-mail da EDM Piscinas, confirme o endereço e depois entre no painel.");
      setLoginMode("login");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUserEmail("");
    setPassword("");
  }

  async function loadData() {
    setLoadingData(true);
    const [productResult, categoryResult, orderResult, balanceResult, salesResult, customerResult] =
      await Promise.all([
        supabase.from("products").select("id,name,description,category_id,sku,price,promo_price,stock,image_url,active,created_at,categories(name)").order("created_at", { ascending: false }),
        supabase.from("categories").select("id,name,slug").order("position").order("name"),
        supabase.from("website_orders").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("receivable_balances").select("*").order("due_date"),
        supabase.from("sales").select("id,sale_number,customer_id,status,sale_date,total,payment_method,promised_payment_date,notes,customers(name),sale_items(product_name,quantity,unit_price)").order("sale_date", { ascending: false }),
        supabase.from("customers").select("*").order("created_at", { ascending: false })
      ]);
    const failed = [productResult.error, categoryResult.error, orderResult.error, balanceResult.error, salesResult.error, customerResult.error].find(Boolean);
    if (failed) notify("Erro ao carregar alguns dados: " + failed.message);
    setProducts((productResult.data || []) as Product[]);
    setCategories((categoryResult.data || []) as Category[]);
    setOrders((orderResult.data || []) as WebsiteOrder[]);
    setBalances((balanceResult.data || []) as Balance[]);
    setSales((salesResult.data || []) as Sale[]);
    setCustomers((customerResult.data || []) as Customer[]);
    setLoadingData(false);
  }

  useEffect(() => {
    if (userEmail === EDM_ADMIN_EMAIL) void loadData();
  }, [userEmail]);

  const filteredProducts = useMemo(() => products.filter((item) =>
    (item.name + " " + (item.sku || "") + " " + (item.categories?.name || "")).toLowerCase().includes(search.toLowerCase())
  ), [products, search]);
  const lowStock = products.filter((item) => item.active && item.stock <= 5);
  const received = balances.reduce((sum, item) => sum + Number(item.amount_received || 0), 0);
  const pending = balances.reduce((sum, item) => sum + Number(item.balance || 0), 0);
  const revenue = sales.reduce((sum, item) => sum + Number(item.total || 0), 0);

  function resetForm() {
    setForm({ name: "", description: "", category: categories[0]?.name || "Produtos químicos", sku: "", price: "", promoPrice: "", stock: "0", imageUrl: "", active: true });
    setEditingId(null);
    setSelectedImage(null);
  }

  function editProduct(item: Product) {
    setForm({
      name: item.name,
      description: item.description || "",
      category: item.categories?.name || "Produtos químicos",
      sku: item.sku || "",
      price: String(item.price),
      promoPrice: item.promo_price == null ? "" : String(item.promo_price),
      stock: String(item.stock),
      imageUrl: item.image_url || "",
      active: item.active
    });
    setEditingId(item.id);
    setSelectedImage(null);
    setModalOpen(true);
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    const price = Number(form.price);
    const promo = form.promoPrice.trim() ? Number(form.promoPrice) : null;
    const stock = Number(form.stock);
    if (!form.name.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0 ||
        (promo !== null && (!Number.isFinite(promo) || promo < 0 || promo > price))) {
      notify("Confira nome, preço, promoção e estoque.");
      return;
    }
    setBusy(true);
    let categoryId: string | null = categories.find((item) => item.name.toLowerCase() === form.category.trim().toLowerCase())?.id || null;
    if (!categoryId && form.category.trim()) {
      const { data, error } = await supabase.from("categories").insert({
        name: form.category.trim(), slug: slugify(form.category.trim()), active: true
      }).select("id,name,slug").single();
      if (error) {
        setBusy(false);
        notify("Não foi possível salvar a categoria: " + error.message);
        return;
      }
      categoryId = data.id;
    }

    let imageUrl = form.imageUrl || null;
    if (selectedImage) {
      const extension = selectedImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = "products/" + crypto.randomUUID() + "." + extension;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, selectedImage, {
        cacheControl: "3600", upsert: false, contentType: selectedImage.type
      });
      if (uploadError) {
        setBusy(false);
        notify("Falha ao enviar a foto: " + uploadError.message);
        return;
      }
      imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category_id: categoryId,
      sku: form.sku.trim() || null,
      price,
      promo_price: promo,
      stock,
      image_url: imageUrl,
      active: form.active,
      updated_at: new Date().toISOString()
    };
    const result = editingId
      ? await supabase.from("products").update(payload).eq("id", editingId)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (result.error) {
      notify("Não foi possível salvar o produto: " + result.error.message);
      return;
    }
    setModalOpen(false);
    resetForm();
    await loadData();
    notify("Produto salvo no banco de dados.");
  }

  async function deleteProduct(item: Product) {
    if (!window.confirm("Excluir " + item.name + "?")) return;
    const { error } = await supabase.from("products").delete().eq("id", item.id);
    if (error) notify("Não foi possível excluir: " + error.message);
    else {
      await loadData();
      notify("Produto excluído.");
    }
  }

  async function changeStock(item: Product, delta: number) {
    const nextStock = item.stock + delta;
    if (nextStock < 0) return;
    const { error } = await supabase.from("products").update({ stock: nextStock, updated_at: new Date().toISOString() }).eq("id", item.id);
    if (error) {
      notify("Não foi possível atualizar o estoque: " + error.message);
      return;
    }
    const { error: movementError } = await supabase.from("stock_movements").insert({
      product_id: item.id,
      movement_type: delta > 0 ? "in" : "out",
      quantity: Math.abs(delta),
      previous_stock: item.stock,
      new_stock: nextStock,
      reason: "Ajuste manual pelo painel"
    });
    await loadData();
    notify(movementError ? "Estoque atualizado; não foi possível registrar o histórico." : "Estoque atualizado e movimentação registrada.");
  }

  async function saveCustomer(event: FormEvent) {
    event.preventDefault();
    if (!customerDraft.name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("customers").insert({
      name: customerDraft.name.trim(),
      whatsapp: customerDraft.whatsapp.trim(),
      cpf: customerDraft.cpf.trim() || null,
      address: customerDraft.address.trim() || null,
      notes: customerDraft.notes.trim()
    });
    setBusy(false);
    if (error) notify("Não foi possível cadastrar o cliente: " + error.message);
    else {
      setCustomerDraft({ name: "", whatsapp: "", cpf: "", address: "", notes: "" });
      setShowCustomerForm(false);
      await loadData();
      notify("Cliente salvo no banco de dados.");
    }
  }

  async function saveSale(event: FormEvent) {
    event.preventDefault();
    const product = products.find((item) => item.id === saleDraft.productId);
    const quantity = Number(saleDraft.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
      notify("Selecione um produto e confira a quantidade disponível.");
      return;
    }
    const unitPrice = Number(product.promo_price ?? product.price);
    const total = unitPrice * quantity;
    const initial = Number(saleDraft.initialReceived || 0);
    if (!Number.isFinite(initial) || initial < 0 || initial > total) {
      notify("O valor recebido inicialmente não pode ser maior que o total da venda.");
      return;
    }
    const status = initial >= total ? "paid" : initial > 0 ? "partially_paid" : "pending";
    setBusy(true);
    const { data: sale, error: saleError } = await supabase.from("sales").insert({
      customer_id: saleDraft.customerId || null,
      status,
      sale_date: new Date(saleDraft.saleDate + "T12:00:00").toISOString(),
      subtotal: total,
      discount: 0,
      total,
      payment_method: saleDraft.method,
      promised_payment_date: saleDraft.promisedDate || null,
      notes: saleDraft.notes.trim()
    }).select("id").single();
    if (saleError || !sale) {
      setBusy(false);
      notify("Não foi possível registrar a venda: " + (saleError?.message || "erro desconhecido"));
      return;
    }
    const { error: itemError } = await supabase.from("sale_items").insert({
      sale_id: sale.id,
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: unitPrice,
      line_total: total
    });
    const { error: receivableError } = await supabase.from("receivables").insert({
      sale_id: sale.id,
      amount_due: total,
      due_date: saleDraft.dueDate || null,
      promised_payment_date: saleDraft.promisedDate || null,
      installment_count: 1,
      notes: saleDraft.notes.trim()
    });
    if (itemError || receivableError) {
      await supabase.from("sales").delete().eq("id", sale.id);
      setBusy(false);
      notify("A venda não foi concluída. Confira as informações e tente novamente.");
      return;
    }
    let paymentWarning = "";
    if (initial > 0) {
      const { data: receivable } = await supabase.from("receivables").select("id").eq("sale_id", sale.id).single();
      if (receivable?.id) {
        const { error: paymentError } = await supabase.from("payments").insert({
          receivable_id: receivable.id,
          amount: initial,
          paid_at: new Date(saleDraft.saleDate + "T12:00:00").toISOString(),
          method: saleDraft.method,
          notes: "Pagamento inicial da venda"
        });
        if (paymentError) paymentWarning = " A venda foi salva, mas o recebimento inicial não foi lançado.";
      }
    }
    const nextStock = product.stock - quantity;
    const { error: stockError } = await supabase.from("products").update({ stock: nextStock }).eq("id", product.id);
    if (!stockError) {
      await supabase.from("stock_movements").insert({
        product_id: product.id, movement_type: "out", quantity,
        previous_stock: product.stock, new_stock: nextStock,
        reason: "Saída por venda", sale_id: sale.id
      });
    } else {
      paymentWarning += " O estoque não foi atualizado automaticamente.";
    }
    setBusy(false);
    setShowSaleForm(false);
    setSaleDraft({ customerId: "", productId: "", quantity: "1", saleDate: new Date().toISOString().slice(0,10), dueDate: "", promisedDate: "", method: "Dinheiro", initialReceived: "0", notes: "" });
    await loadData();
    notify("Venda registrada." + paymentWarning);
  }

  async function receivePayment(event: FormEvent) {
    event.preventDefault();
    const balance = balances.find((item) => item.id === paymentDraft.balanceId);
    const amount = Number(paymentDraft.amount);
    if (!balance || !Number.isFinite(amount) || amount <= 0 || amount > Number(balance.balance)) {
      notify("Informe um valor válido, até o saldo pendente.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("payments").insert({
      receivable_id: balance.id,
      amount,
      paid_at: new Date(paymentDraft.paidDate + "T12:00:00").toISOString(),
      method: paymentDraft.method,
      notes: paymentDraft.notes.trim()
    });
    if (!error) {
      const newReceived = Number(balance.amount_received) + amount;
      const newStatus = newReceived >= Number(balance.amount_due) ? "paid" : "partially_paid";
      await supabase.from("sales").update({ status: newStatus }).eq("id", balance.sale_id);
    }
    setBusy(false);
    if (error) notify("Não foi possível lançar o recebimento: " + error.message);
    else {
      setShowPaymentForm(false);
      setPaymentDraft({ balanceId: "", amount: "", paidDate: new Date().toISOString().slice(0,10), method: "Pix", notes: "" });
      await loadData();
      notify("Recebimento lançado e saldo recalculado.");
    }
  }

  async function updateOrder(order: WebsiteOrder, status: string) {
    const { error } = await supabase.from("website_orders").update({ status }).eq("id", order.id);
    if (error) notify("Não foi possível atualizar o pedido: " + error.message);
    else {
      await loadData();
      notify("Status do pedido atualizado.");
    }
  }

  if (authLoading) {
    return <main className="grid min-h-screen place-items-center bg-[#071426] text-white">Verificando acesso seguro...</main>;
  }

  if (userEmail !== EDM_ADMIN_EMAIL) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#071426] px-4 text-white">
        <form onSubmit={loginMode === "login" ? handleLogin : handleSignup} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d2038] p-8 shadow-2xl">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-sky-500/15 text-sky-300"><ShieldCheck size={28}/></div>
            <p className="text-xs uppercase tracking-[.25em] text-sky-300">EDM Piscinas</p>
            <h1 className="mt-2 text-2xl font-bold">Acesso administrativo</h1>
            <p className="mt-2 text-sm text-slate-400">{loginMode === "login" ? "Entre com o único e-mail autorizado para acessar a gestão." : "Crie o primeiro acesso do administrador."}</p>
          </div>
          <label className="mb-2 block text-sm text-slate-300">E-mail autorizado</label>
          <input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mb-4 w-full rounded-lg bg-[#071426] p-3 text-sm text-white outline-none focus:ring-1 focus:ring-sky-400" />
          <label className="mb-2 block text-sm text-slate-300">Senha</label>
          <input type="password" required autoComplete={loginMode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mb-4 w-full rounded-lg bg-[#071426] p-3 text-sm text-white outline-none focus:ring-1 focus:ring-sky-400" />
          {authError && <p role="alert" className="mb-4 text-sm text-red-300">{authError}</p>}
          {authMessage && <p role="status" className="mb-4 text-sm text-emerald-300">{authMessage}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-sky-500 p-3 font-bold text-white hover:bg-sky-400 disabled:opacity-50">{busy ? "Aguarde..." : loginMode === "login" ? "Entrar no painel" : "Criar primeiro acesso"}</button>
          <button type="button" onClick={() => { setLoginMode(loginMode === "login" ? "signup" : "login"); setAuthError(""); setAuthMessage(""); }} className="mt-4 w-full text-sm text-sky-300 hover:text-white">{loginMode === "login" ? "Primeiro acesso? Criar conta do administrador" : "Já tem acesso? Voltar para entrar"}</button>
          <a href="/" className="mt-5 block text-center text-sm text-slate-400 hover:text-white">← Voltar ao site</a>
          <p className="mt-5 text-center text-xs leading-5 text-slate-500">Apenas o e-mail administrativo autorizado tem permissão para abrir o painel e consultar os dados.</p>
        </form>
      </main>
    );
  }

  const navigation = [
    ["Visão geral", ChartNoAxesCombined],
    ["Produtos e estoque", Boxes],
    ["Vendas", ShoppingBag],
    ["Clientes", Users],
    ["Contas a receber", CalendarClock],
    ["Pedidos do site", ClipboardList],
  ] as const;

  return (
    <main className="min-h-screen bg-[#071426] text-white md:flex">
      <aside className="border-b border-white/10 bg-[#0b1b30] p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <a href="/" className="mb-7 flex items-center gap-3">
          <div className="rounded-lg bg-sky-500/15 p-2 text-sky-300"><ShieldCheck/></div>
          <div><strong>EDM Piscinas</strong><small className="block text-slate-400">Painel administrativo</small></div>
        </a>
        <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
          {navigation.map(([name, Icon]) => (
            <button key={name} onClick={() => setTab(name)} className={"flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm " + (tab === name ? "bg-sky-500/15 text-sky-200" : "text-slate-400 hover:bg-white/5")}>
              <Icon size={18}/>{name}
            </button>
          ))}
        </nav>
        <div className="mt-8 rounded-lg border border-emerald-300/20 bg-emerald-300/5 p-3 text-xs leading-5 text-emerald-200">Banco de dados conectado e sessão protegida pelo Supabase.</div>
        <button onClick={logout} className="mt-5 flex items-center gap-2 text-sm text-slate-400 hover:text-white"><LogOut size={16}/> Sair com segurança</button>
      </aside>

      <section className="min-w-0 flex-1 p-5 md:p-9">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[.2em] text-sky-300">EDM Piscinas · administração</p><h1 className="mt-1 text-3xl font-bold">{tab}</h1></div>
          <div className="text-right"><span className="block text-sm text-slate-300">{userEmail}</span><span className="text-xs text-emerald-300">Conectado ao Supabase</span></div>
        </header>
        {notice && <div role="status" className="mb-5 rounded-lg border border-sky-400/20 bg-sky-400/10 p-3 text-sm text-sky-100">{notice}</div>}
        {loadingData && <p className="mb-4 text-sm text-slate-400">Atualizando informações do banco...</p>}

        {tab === "Visão geral" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Produtos cadastrados", value: String(products.length), Icon: Boxes },
                { label: "Vendas registradas", value: String(sales.length), Icon: ShoppingBag },
                { label: "Recebido", value: money(received), Icon: CircleDollarSign },
                { label: "Em aberto", value: money(pending), Icon: CalendarClock }
              ].map((item) => <article key={item.label} className="rounded-xl border border-white/10 bg-[#0d2038] p-5"><item.Icon className="mb-4 text-sky-300"/><p className="text-sm text-slate-400">{item.label}</p><strong className="mt-1 block text-2xl">{item.value}</strong></article>)}
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-white/10 bg-[#0d2038] p-5"><h2 className="mb-4 font-semibold">Alertas de estoque</h2>{lowStock.map((item) => <div key={item.id} className="flex justify-between border-b border-white/5 py-3 text-sm"><span>{item.name}</span><strong className="text-amber-300">{item.stock} un.</strong></div>)}{!lowStock.length && <p className="text-sm text-slate-500">Nenhum produto com estoque baixo.</p>}</section>
              <section className="rounded-xl border border-white/10 bg-[#0d2038] p-5"><h2 className="mb-4 font-semibold">Pedidos recentes</h2>{orders.slice(0,5).map((order) => <div key={order.id} className="flex justify-between gap-3 border-b border-white/5 py-3 text-sm"><span>{order.customer_name}<small className="block text-slate-500">{date(order.created_at)}</small></span><strong>{money(Number(order.total))}</strong></div>)}{!orders.length && <p className="text-sm text-slate-500">Nenhum pedido recebido pelo site.</p>}</section>
            </div>
          </>
        )}

        {tab === "Produtos e estoque" && (
          <>
            <div className="mb-5 flex flex-wrap gap-3">
              <div className="relative min-w-[200px] flex-1"><Search className="absolute left-3 top-3 text-slate-500" size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto, referência ou categoria" className="w-full rounded-lg border border-white/10 bg-[#0d2038] py-3 pl-10 pr-3 text-sm outline-none focus:border-sky-400"/></div>
              <button onClick={() => { resetForm(); setModalOpen(true); }} className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold"><Plus size={17}/> Novo produto</button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0d2038]">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase text-slate-500"><tr>{["Produto","Categoria","Preço","Estoque","Status","Ações"].map((label) => <th className="p-4" key={label}>{label}</th>)}</tr></thead>
                <tbody>
                  {filteredProducts.map((item) => <tr key={item.id} className="border-b border-white/5">
                    <td className="p-4"><div className="flex items-center gap-3">{item.image_url ? <img src={item.image_url} alt="" className="h-11 w-11 rounded object-cover"/> : <div className="grid h-11 w-11 place-items-center rounded bg-white/5"><Boxes size={18}/></div>}<span><b>{item.name}</b><small className="block text-slate-500">{item.sku || "Sem referência"}</small></span></div></td>
                    <td className="p-4 text-slate-400">{item.categories?.name || "Sem categoria"}</td>
                    <td className="p-4">{money(Number(item.promo_price ?? item.price))}{item.promo_price != null && <small className="ml-2 text-slate-500 line-through">{money(Number(item.price))}</small>}</td>
                    <td className="p-4"><span className={item.stock <= 5 ? "text-amber-300" : "text-emerald-300"}>{item.stock}</span><div className="mt-1 flex gap-1"><button onClick={() => void changeStock(item,-1)} className="rounded bg-white/10 px-2" aria-label="Diminuir estoque">−</button><button onClick={() => void changeStock(item,1)} className="rounded bg-white/10 px-2" aria-label="Aumentar estoque">+</button></div></td>
                    <td className="p-4"><button onClick={() => { void supabase.from("products").update({active:!item.active}).eq("id",item.id).then(({error}) => error ? notify(error.message) : loadData()); }} className={item.active ? "text-emerald-300" : "text-slate-500"}>{item.active ? "Ativo" : "Oculto"}</button></td>
                    <td className="p-4"><button onClick={() => editProduct(item)} className="mr-3 text-sky-300" aria-label="Editar produto"><Pencil size={17}/></button><button onClick={() => void deleteProduct(item)} className="text-red-300" aria-label="Excluir produto"><Trash2 size={17}/></button></td>
                  </tr>)}
                  {!filteredProducts.length && <tr><td colSpan={6} className="p-10 text-center text-slate-500">Nenhum produto cadastrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "Pedidos do site" && (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0d2038]">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-slate-500"><tr>{["Data","Cliente","WhatsApp","Itens","Total","Status"].map((label) => <th className="p-4" key={label}>{label}</th>)}</tr></thead>
              <tbody>{orders.map((order) => <tr key={order.id} className="border-b border-white/5">
                <td className="p-4">{date(order.created_at)}</td><td className="p-4">{order.customer_name}</td><td className="p-4">{order.whatsapp}</td>
                <td className="p-4">{(order.items || []).map((item) => (item.quantity || 1) + "x " + (item.name || "Produto")).join(", ")}</td><td className="p-4">{money(Number(order.total))}</td>
                <td className="p-4"><select value={order.status} onChange={(event) => void updateOrder(order,event.target.value)} className="rounded bg-[#071426] p-2"><option value="new">Novo</option><option value="contacted">Em contato</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></select></td>
              </tr>)}{!orders.length && <tr><td colSpan={6} className="p-10 text-center text-slate-500">Ainda não há pedidos registrados.</td></tr>}</tbody>
            </table>
          </div>
        )}

        {tab === "Vendas" && (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-400">Registro de vendas da loja, com baixa automática do estoque e criação de conta a receber.</p>
              <button onClick={() => { setSaleDraft((draft) => ({...draft, productId: products[0]?.id || ""})); setShowSaleForm(!showSaleForm); }} className="rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold">+ Registrar venda</button>
            </div>
            {showSaleForm && <form onSubmit={saveSale} className="mb-6 grid gap-3 rounded-xl border border-white/10 bg-[#0d2038] p-5 sm:grid-cols-2">
              <label className="text-sm text-slate-300 sm:col-span-2">Cliente<select value={saleDraft.customerId} onChange={(event) => setSaleDraft({...saleDraft,customerId:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"><option value="">Cliente avulso</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="text-sm text-slate-300 sm:col-span-2">Produto<select required value={saleDraft.productId} onChange={(event) => setSaleDraft({...saleDraft,productId:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"><option value="">Selecione</option>{products.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name} · estoque {item.stock} · {money(Number(item.promo_price ?? item.price))}</option>)}</select></label>
              <label className="text-sm text-slate-300">Quantidade<input required type="number" min="1" step="1" value={saleDraft.quantity} onChange={(event) => setSaleDraft({...saleDraft,quantity:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <label className="text-sm text-slate-300">Data da venda<input type="date" required value={saleDraft.saleDate} onChange={(event) => setSaleDraft({...saleDraft,saleDate:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <label className="text-sm text-slate-300">Vencimento<input type="date" value={saleDraft.dueDate} onChange={(event) => setSaleDraft({...saleDraft,dueDate:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <label className="text-sm text-slate-300">Data prometida pelo cliente<input type="date" value={saleDraft.promisedDate} onChange={(event) => setSaleDraft({...saleDraft,promisedDate:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <label className="text-sm text-slate-300">Forma de pagamento<select value={saleDraft.method} onChange={(event) => setSaleDraft({...saleDraft,method:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3">{["Dinheiro","Pix","Cartão de débito","Cartão de crédito","Transferência","Outro"].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-sm text-slate-300">Valor recebido agora (R$)<input type="number" min="0" step="0.01" value={saleDraft.initialReceived} onChange={(event) => setSaleDraft({...saleDraft,initialReceived:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <label className="text-sm text-slate-300 sm:col-span-2">Observações<textarea value={saleDraft.notes} onChange={(event) => setSaleDraft({...saleDraft,notes:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <div className="flex gap-2 sm:col-span-2"><button disabled={busy} className="rounded-lg bg-sky-500 px-5 py-3 text-sm font-bold disabled:opacity-50">{busy ? "Salvando..." : "Salvar venda"}</button><button type="button" onClick={() => setShowSaleForm(false)} className="rounded-lg border border-white/10 px-5 py-3 text-sm">Cancelar</button></div>
            </form>}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0d2038]"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-slate-500"><tr>{["Venda","Data","Cliente","Produtos","Total","Situação"].map((label) => <th key={label} className="p-4">{label}</th>)}</tr></thead><tbody>{sales.map((item) => <tr key={item.id} className="border-b border-white/5"><td className="p-4">#{item.sale_number}</td><td className="p-4">{date(item.sale_date)}</td><td className="p-4">{item.customers?.name || "Cliente avulso"}</td><td className="p-4">{(item.sale_items || []).map((line) => line.quantity + "x " + line.product_name).join(", ")}</td><td className="p-4">{money(Number(item.total))}</td><td className="p-4">{item.status === "paid" ? "Paga" : item.status === "partially_paid" ? "Parcial" : item.status === "cancelled" ? "Cancelada" : "Pendente"}</td></tr>)}{!sales.length && <tr><td colSpan={6} className="p-10 text-center text-slate-500">Nenhuma venda registrada.</td></tr>}</tbody></table></div>
          </>
        )}

        {tab === "Clientes" && (
          <>
            <div className="mb-5 flex items-center justify-between gap-3"><p className="text-sm text-slate-400">Cadastro e consulta de clientes.</p><button onClick={() => setShowCustomerForm(!showCustomerForm)} className="rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold">+ Novo cliente</button></div>
            {showCustomerForm && <form onSubmit={saveCustomer} className="mb-6 grid gap-3 rounded-xl border border-white/10 bg-[#0d2038] p-5 sm:grid-cols-2">
              <label className="text-sm text-slate-300">Nome<input required value={customerDraft.name} onChange={(event) => setCustomerDraft({...customerDraft,name:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <label className="text-sm text-slate-300">WhatsApp<input value={customerDraft.whatsapp} onChange={(event) => setCustomerDraft({...customerDraft,whatsapp:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <label className="text-sm text-slate-300">CPF (opcional)<input value={customerDraft.cpf} onChange={(event) => setCustomerDraft({...customerDraft,cpf:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <label className="text-sm text-slate-300">Endereço<input value={customerDraft.address} onChange={(event) => setCustomerDraft({...customerDraft,address:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <label className="text-sm text-slate-300 sm:col-span-2">Observações<textarea value={customerDraft.notes} onChange={(event) => setCustomerDraft({...customerDraft,notes:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <div className="flex gap-2 sm:col-span-2"><button disabled={busy} className="rounded-lg bg-sky-500 px-5 py-3 text-sm font-bold">Salvar cliente</button><button type="button" onClick={() => setShowCustomerForm(false)} className="rounded-lg border border-white/10 px-5 py-3 text-sm">Cancelar</button></div>
            </form>}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0d2038]"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-slate-500"><tr>{["Cliente","WhatsApp","CPF","Endereço","Vendas"].map((label) => <th key={label} className="p-4">{label}</th>)}</tr></thead><tbody>{customers.map((item) => <tr key={item.id} className="border-b border-white/5"><td className="p-4">{item.name}</td><td className="p-4">{item.whatsapp || "—"}</td><td className="p-4">{item.cpf || "—"}</td><td className="p-4">{item.address || "—"}</td><td className="p-4">{sales.filter((sale) => sale.customer_id === item.id).length}</td></tr>)}{!customers.length && <tr><td colSpan={5} className="p-10 text-center text-slate-500">Nenhum cliente cadastrado.</td></tr>}</tbody></table></div>
          </>
        )}

        {tab === "Contas a receber" && (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-400">Cada recebimento é registrado separadamente. Promessas de pagamento não contam como dinheiro recebido.</p><button onClick={() => { setPaymentDraft({...paymentDraft,balanceId:balances.find((item) => Number(item.balance) > 0)?.id || ""}); setShowPaymentForm(!showPaymentForm); }} className="rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold">+ Lançar recebimento</button></div>
            {showPaymentForm && <form onSubmit={receivePayment} className="mb-6 grid gap-3 rounded-xl border border-white/10 bg-[#0d2038] p-5 sm:grid-cols-2">
              <label className="text-sm text-slate-300 sm:col-span-2">Venda / saldo pendente<select required value={paymentDraft.balanceId} onChange={(event) => setPaymentDraft({...paymentDraft,balanceId:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"><option value="">Selecione</option>{balances.filter((item) => Number(item.balance) > 0).map((item) => <option key={item.id} value={item.id}>Venda {item.sale_id.slice(0,8)} · saldo {money(Number(item.balance))}</option>)}</select></label>
              <label className="text-sm text-slate-300">Valor recebido (R$)<input required type="number" min="0.01" step="0.01" value={paymentDraft.amount} onChange={(event) => setPaymentDraft({...paymentDraft,amount:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <label className="text-sm text-slate-300">Data do recebimento<input required type="date" value={paymentDraft.paidDate} onChange={(event) => setPaymentDraft({...paymentDraft,paidDate:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <label className="text-sm text-slate-300">Forma de pagamento<select value={paymentDraft.method} onChange={(event) => setPaymentDraft({...paymentDraft,method:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3">{["Pix","Dinheiro","Cartão de débito","Cartão de crédito","Transferência","Outro"].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-sm text-slate-300">Observações<input value={paymentDraft.notes} onChange={(event) => setPaymentDraft({...paymentDraft,notes:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3"/></label>
              <div className="flex gap-2 sm:col-span-2"><button disabled={busy} className="rounded-lg bg-sky-500 px-5 py-3 text-sm font-bold">Salvar recebimento</button><button type="button" onClick={() => setShowPaymentForm(false)} className="rounded-lg border border-white/10 px-5 py-3 text-sm">Cancelar</button></div>
            </form>}
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-xl border border-white/10 bg-[#0d2038] p-5"><p className="text-sm text-slate-400">Total a receber</p><strong className="mt-2 block text-2xl">{money(revenue)}</strong></article>
              <article className="rounded-xl border border-white/10 bg-[#0d2038] p-5"><p className="text-sm text-slate-400">Já recebido</p><strong className="mt-2 block text-2xl text-emerald-300">{money(received)}</strong></article>
              <article className="rounded-xl border border-white/10 bg-[#0d2038] p-5"><p className="text-sm text-slate-400">Saldo pendente</p><strong className="mt-2 block text-2xl text-amber-300">{money(pending)}</strong></article>
            </div>
            <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-[#0d2038]"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-slate-500"><tr>{["Venda","Valor","Recebido","Saldo","Vencimento","Situação"].map((label) => <th key={label} className="p-4">{label}</th>)}</tr></thead><tbody>{balances.map((item) => <tr key={item.id} className="border-b border-white/5"><td className="p-4">{item.sale_id.slice(0,8).toUpperCase()}</td><td className="p-4">{money(Number(item.amount_due))}</td><td className="p-4 text-emerald-300">{money(Number(item.amount_received))}</td><td className="p-4 text-amber-300">{money(Number(item.balance))}</td><td className="p-4">{item.due_date ? date(item.due_date) : "Não informado"}</td><td className="p-4">{item.payment_status === "paid" ? "Pago" : item.payment_status === "partially_paid" ? "Parcial" : "Pendente"}</td></tr>)}{!balances.length && <tr><td colSpan={6} className="p-10 text-center text-slate-500">Nenhuma conta a receber cadastrada.</td></tr>}</tbody></table></div>
          </>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4">
          <form onSubmit={saveProduct} className="my-6 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0d2038] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{editingId ? "Editar produto" : "Novo produto"}</h2><button type="button" onClick={() => setModalOpen(false)} className="rounded bg-white/10 p-2" aria-label="Fechar">×</button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-300 sm:col-span-2">Nome do produto<input required value={form.name} onChange={(event) => setForm({...form,name:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3 text-white"/></label>
              <label className="text-sm text-slate-300">Categoria<input list="edm-categories" value={form.category} onChange={(event) => setForm({...form,category:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3 text-white"/><datalist id="edm-categories">{categories.map((item) => <option key={item.id} value={item.name}/>)}</datalist></label>
              <label className="text-sm text-slate-300">Código / SKU<input value={form.sku} onChange={(event) => setForm({...form,sku:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3 text-white"/></label>
              <label className="text-sm text-slate-300">Preço (R$)<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({...form,price:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3 text-white"/></label>
              <label className="text-sm text-slate-300">Preço promocional (R$)<input type="number" min="0" step="0.01" value={form.promoPrice} onChange={(event) => setForm({...form,promoPrice:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3 text-white"/></label>
              <label className="text-sm text-slate-300">Estoque<input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({...form,stock:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3 text-white"/></label>
              <label className="text-sm text-slate-300 sm:col-span-2">Descrição<textarea rows={3} value={form.description} onChange={(event) => setForm({...form,description:event.target.value})} className="mt-2 w-full rounded-lg bg-[#071426] p-3 text-white"/></label>
              <label className="text-sm text-slate-300 sm:col-span-2">Foto do produto<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setSelectedImage(event.target.files?.[0] || null)} className="mt-2 block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:font-semibold file:text-white"/></label>
              {(selectedImage || form.imageUrl) && <div className="sm:col-span-2">{selectedImage ? <span className="text-sm text-sky-300">Nova foto selecionada: {selectedImage.name}</span> : <img src={form.imageUrl} alt="Foto atual do produto" className="h-32 rounded-lg object-cover"/>}</div>}
              <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2"><input type="checkbox" checked={form.active} onChange={(event) => setForm({...form,active:event.target.checked})}/> Exibir no catálogo público</label>
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-white/10 px-4 py-3 text-sm">Cancelar</button><button disabled={busy} className="rounded-lg bg-sky-500 px-5 py-3 text-sm font-bold disabled:opacity-50">{busy ? "Salvando..." : "Salvar produto"}</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
