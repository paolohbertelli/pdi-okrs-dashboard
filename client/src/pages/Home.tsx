import { useState, useEffect, useCallback } from "react";
import { initialData, valueDescriptions, type PDIData, type Objective, type Realizacao, type Feedback } from "@/lib/pdi-data";
import { getValueIcon } from "@/components/ValueIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Target,
  ListChecks,
  BarChart3,
  MessageSquare,
  Printer,
  Download,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  ExternalLink,
  FileText,
} from "lucide-react";

const STORAGE_KEY = "pdi_paolo_fy26_v1";

type TabId = "resumo" | "pdi" | "realizacoes" | "dashboard" | "feedbacks";

const categoryColors: Record<string, string> = {
  Eminência: "bg-[#f4e9ea] text-[#8B1E24] border-[#e0c5c8]",
  Indústria: "bg-[#ececec] text-[#111] border-[#ccc]",
  GTM: "bg-[#eef2f7] text-[#24364c] border-[#c8d1de]",
  Prática: "bg-[#eef7f1] text-[#1E7F4E] border-[#c4e0d0]",
};

const statusColors: Record<string, string> = {
  "Não iniciado": "bg-gray-200 text-gray-700",
  "Em andamento": "bg-blue-100 text-blue-700",
  "Em risco": "bg-amber-100 text-amber-700",
  Concluído: "bg-green-100 text-green-700",
};

export default function Home() {
  const [data, setData] = useState<PDIData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return structuredClone(initialData);
        }
      }
    }
    return structuredClone(initialData);
  });

  const [activeTab, setActiveTab] = useState<TabId>("resumo");
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [searchReal, setSearchReal] = useState("");
  const [filterCat, setFilterCat] = useState<string>("");
  const [filterObj, setFilterObj] = useState<string>("");
  const [realizacaoModalOpen, setRealizacaoModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [editingRealizacao, setEditingRealizacao] = useState<Realizacao | null>(null);
  const [highlightedObjective, setHighlightedObjective] = useState<string | null>(null);

  // Realizacao form state
  const [realForm, setRealForm] = useState({
    id: "",
    categoria: "GTM" as Realizacao["categoria"],
    contribuicao: "",
    data: "",
    objetivoId: "",
    evidencia: "",
    status: "Registrado",
    comentarios: "",
  });

  // Feedback form state
  const [fbForm, setFbForm] = useState({
    data: "",
    fonte: "Liderança",
    feedback: "",
  });

  // Persist to localStorage
  const persist = useCallback((newData: PDIData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }, []);

  // Initialize from hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as TabId;
    if (hash && ["resumo", "pdi", "realizacoes", "dashboard", "feedbacks"].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const showTab = (tabId: TabId) => {
    setActiveTab(tabId);
    if (window.location.hash !== "#" + tabId) {
      history.replaceState(null, "", "#" + tabId);
    }
  };

  const goToObjective = (id: string) => {
    showTab("pdi");
    setExpandedObjectives((prev) => new Set(Array.from(prev).concat(id)));
    setTimeout(() => {
      const el = document.getElementById("objective_card_" + id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedObjective(id);
        setTimeout(() => setHighlightedObjective(null), 1800);
      }
    }, 100);
  };

  const updateObjective = (id: string, field: keyof Objective, value: string | number) => {
    const newData = { ...data, objectives: data.objectives.map((o) => (o.id === id ? { ...o, [field]: value } : o)) };
    persist(newData);
  };

  const toggleObjective = (id: string) => {
    setExpandedObjectives((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addObjective = () => {
    const objective = prompt("Novo objetivo:");
    if (!objective) return;
    const newObj: Objective = {
      id: crypto.randomUUID(),
      objective,
      kr: "",
      metrics: "",
      status: "Não iniciado",
      progress: 0,
      paolo: "",
      leader: "",
      evidence: [],
    };
    persist({ ...data, objectives: [...data.objectives, newObj] });
    toast.success("Objetivo adicionado");
  };

  const addEvidence = (id: string) => {
    const txt = prompt("Descreva a evidência ou realização vinculada ao objetivo:");
    if (!txt) return;
    const newData = {
      ...data,
      objectives: data.objectives.map((o) => (o.id === id ? { ...o, evidence: [...o.evidence, txt] } : o)),
    };
    persist(newData);
    toast.success("Evidência adicionada");
  };

  const removeEvidence = (id: string, idx: number) => {
    const newData = {
      ...data,
      objectives: data.objectives.map((o) =>
        o.id === id ? { ...o, evidence: o.evidence.filter((_, i) => i !== idx) } : o
      ),
    };
    persist(newData);
    toast.success("Evidência removida");
  };

  // Realizacao CRUD
  const openRealizacaoModal = (id?: string) => {
    if (id) {
      const r = data.realizacoes.find((x) => x.id === id);
      if (r) {
        setEditingRealizacao(r);
        setRealForm({
          id: r.id,
          categoria: r.categoria,
          contribuicao: r.contribuicao,
          data: r.data,
          objetivoId: r.objetivoId,
          evidencia: r.evidencia,
          status: r.status,
          comentarios: r.comentarios,
        });
      }
    } else {
      setEditingRealizacao(null);
      setRealForm({
        id: "",
        categoria: "GTM",
        contribuicao: "",
        data: "",
        objetivoId: data.objectives[0]?.id || "",
        evidencia: "",
        status: "Registrado",
        comentarios: "",
      });
    }
    setRealizacaoModalOpen(true);
  };

  const saveRealizacao = () => {
    const obj = data.objectives.find((o) => o.id === realForm.objetivoId);
    const item: Realizacao = {
      id: realForm.id || crypto.randomUUID(),
      categoria: realForm.categoria,
      contribuicao: realForm.contribuicao,
      data: realForm.data,
      objetivoId: obj ? obj.id : "",
      objetivoRelacionado: obj ? obj.objective : "",
      evidencia: realForm.evidencia,
      status: realForm.status,
      comentarios: realForm.comentarios,
    };
    const idx = data.realizacoes.findIndex((r) => r.id === item.id);
    const newRealizacoes = [...data.realizacoes];
    if (idx >= 0) newRealizacoes[idx] = item;
    else newRealizacoes.push(item);
    persist({ ...data, realizacoes: newRealizacoes });
    setRealizacaoModalOpen(false);
    toast.success(idx >= 0 ? "Realização atualizada" : "Realização adicionada");
  };

  const deleteRealizacao = (id: string) => {
    if (!confirm("Excluir esta realização?")) return;
    persist({ ...data, realizacoes: data.realizacoes.filter((r) => r.id !== id) });
    toast.success("Realização excluída");
  };

  // Feedback CRUD
  const saveFeedback = () => {
    const fb: Feedback = {
      id: crypto.randomUUID(),
      data: fbForm.data,
      fonte: fbForm.fonte,
      feedback: fbForm.feedback,
    };
    persist({ ...data, feedbacks: [...data.feedbacks, fb] });
    setFeedbackModalOpen(false);
    setFbForm({ data: "", fonte: "Liderança", feedback: "" });
    toast.success("Feedback adicionado");
  };

  const deleteFeedback = (id: string) => {
    if (!confirm("Excluir este feedback?")) return;
    persist({ ...data, feedbacks: data.feedbacks.filter((f) => f.id !== id) });
    toast.success("Feedback excluído");
  };

  // Export functions
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pdi_paolo_fy26_dados.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exportado");
  };

  const exportCSV = () => {
    const headers = ["Categoria", "Contribuição", "Data", "Objetivo relacionado", "Evidência/Link", "Status", "Comentários"];
    const rows = data.realizacoes.map((r) => [
      r.categoria,
      r.contribuicao,
      r.data,
      data.objectives.find((o) => o.id === r.objetivoId)?.objective || r.objetivoRelacionado || "",
      r.evidencia,
      r.status,
      r.comentarios,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => '"' + String(v || "").replace(/"/g, '""') + '"').join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "realizacoes_pdi_paolo_fy26.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  const resetLocalData = () => {
    if (!confirm("Isso apagará comentários e alterações salvas localmente. Continuar?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setData(structuredClone(initialData));
    toast.success("Dados locais resetados");
  };

  // Computed values
  const total = data.objectives.length;
  const concluidos = data.objectives.filter((o) => o.status === "Concluído").length;
  const andamento = data.objectives.filter((o) => o.status === "Em andamento").length;
  const avg = total ? Math.round(data.objectives.reduce((s, o) => s + Number(o.progress || 0), 0) / total) : 0;

  const kpis = [
    { label: "Total de objetivos", value: total, hint: "OKRs pessoais do FY26" },
    { label: "Objetivos concluídos", value: concluidos, hint: "Status marcado como concluído" },
    { label: "Objetivos em andamento", value: andamento, hint: "Itens em execução" },
    { label: "Realizações registradas", value: data.realizacoes.length, hint: "Contribuições cadastradas" },
    { label: "Feedbacks registrados", value: data.feedbacks.length, hint: "Feedbacks estruturados" },
    { label: "Progresso médio", value: avg + "%", hint: "Média dos objetivos" },
  ];

  const cats = ["Eminência", "Indústria", "GTM", "Prática"];
  const catCounts = cats.map((c) => data.realizacoes.filter((r) => r.categoria === c).length);
  const maxCat = Math.max(1, ...catCounts);

  // Filtered realizacoes
  const filteredRealizacoes = data.realizacoes.filter((r) => {
    const linkedObj = data.objectives.find((o) => o.id === r.objetivoId || o.objective === r.objetivoRelacionado);
    const linkedId = linkedObj ? linkedObj.id : r.objetivoId || r.objetivoRelacionado || "";
    return (
      (!filterCat || r.categoria === filterCat) &&
      (!filterObj || linkedId === filterObj) &&
      (!searchReal ||
        [r.contribuicao, r.categoria, linkedObj?.objective || r.objetivoRelacionado || "", r.comentarios]
          .join(" ")
          .toLowerCase()
          .includes(searchReal.toLowerCase()))
    );
  });

  const getObjectiveEvidence = (o: Objective): { text: string; cat: string; id: number; auto: boolean }[] => {
    const items = data.realizacoes
      .filter((r) => r.objetivoId === o.id || r.objetivoRelacionado === o.objective)
      .map((r) => ({ text: r.contribuicao, cat: r.categoria, id: 0, auto: true }));
    const manual = o.evidence.map((e, idx) => ({ text: e, cat: "Manual", id: idx, auto: false }));
    return [...items, ...manual];
  };

  const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "resumo", label: "Resumo Executivo", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "pdi", label: "PDI e OKRs", icon: <Target className="w-4 h-4" /> },
    { id: "realizacoes", label: "Realizações", icon: <ListChecks className="w-4 h-4" /> },
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "feedbacks", label: "Feedbacks", icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#fafafa] to-[#f0f0f0]">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen overflow-y-auto bg-[#111111] text-white p-[30px_22px] border-r-[6px] border-[#8B1E24] hidden lg:block w-[280px] shrink-0">
        <div className="mb-7">
          <div className="mb-4 flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B1E24] to-[#B82E34] flex items-center justify-center">
              <span className="text-white font-black text-lg">A&amp;M</span>
            </div>
          </div>
          <h1 className="text-[22px] font-extrabold leading-tight mb-2.5">PDI FY26</h1>
          <p className="text-[13px] text-[#c8c8c8] leading-relaxed">
            Ferramenta local para revisão executiva, comentários da liderança e acompanhamento das realizações ao longo do ano.
          </p>
        </div>
        <nav className="grid gap-1.5 mt-[18px]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => showTab(item.id)}
              className={`w-full text-left text-[13px] px-3 py-[11px] rounded-xl border font-bold transition-all duration-200 flex items-center gap-2.5 ${
                activeTab === item.id
                  ? "bg-[#8B1E24] text-white border-white/20 shadow-[inset_4px_0_0_#fff]"
                  : "text-[#e8e8e8] border-white/10 hover:bg-[rgba(139,30,36,0.45)] hover:translate-x-0.5"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-7 pt-[18px] border-t border-white/10">
          <h3 className="text-[13px] font-bold text-white/60 uppercase tracking-wider mb-3">Ações gerais</h3>
          <div className="grid gap-2">
            <Button variant="secondary" size="sm" className="bg-[#333] text-white border border-[#555] hover:bg-[#444] justify-start" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Imprimir / PDF
            </Button>
            <Button variant="secondary" size="sm" className="bg-[#333] text-white border border-[#555] hover:bg-[#444] justify-start" onClick={exportJSON}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar JSON
            </Button>
            <Button variant="secondary" size="sm" className="bg-[#333] text-white border border-[#555] hover:bg-[#444] justify-start" onClick={exportCSV}>
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Exportar CSV
            </Button>
            <Button variant="destructive" size="sm" className="bg-[#7a171c] hover:bg-[#6a0f14] justify-start" onClick={resetLocalData}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Resetar dados
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#111111] text-white border-b-[4px] border-[#8B1E24]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B1E24] to-[#B82E34] flex items-center justify-center">
              <span className="text-white font-black text-sm">A&amp;M</span>
            </div>
            <span className="font-extrabold text-sm">PDI FY26</span>
          </div>
          <Select value={activeTab} onValueChange={(v) => showTab(v as TabId)}>
            <SelectTrigger className="w-[180px] h-9 text-xs bg-[#222] border-[#444] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {navItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-[34px] max-w-[1500px] w-full pt-20 lg:pt-[34px]">
        {/* Hero */}
        <header
          className="relative overflow-hidden rounded-[26px] p-6 lg:p-9 text-white shadow-lg"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, rgba(184,46,52,0.22), transparent 30%), linear-gradient(135deg, #101010 0%, #2a2a2a 65%, #4a1115 100%)",
          }}
        >
          <div className="absolute right-[-90px] top-[-120px] w-[280px] h-[280px] border-[40px] border-white/[0.06] rounded-full pointer-events-none" />

          {/* Profile card */}
          <div className="absolute top-[26px] left-[30px] w-[178px] p-4 rounded-[18px] bg-gradient-to-b from-white/10 to-white/[0.06] border border-white/15 shadow-lg z-10 text-center backdrop-blur-sm hidden md:block">
            <div className="w-[112px] h-[112px] rounded-full overflow-hidden border-4 border-white/20 shadow-lg bg-[#222] mx-auto mb-3.5">
              <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#555] flex items-center justify-center">
                <span className="text-3xl font-black text-white/80">PB</span>
              </div>
            </div>
            <div className="text-[20px] font-extrabold uppercase tracking-wide leading-tight mb-1.5">Paolo Bertelli</div>
            <div className="text-[14px] italic text-[#f1f1f1] mb-1">Director</div>
            <div className="text-[14px] font-bold text-[#E39A2D]">Healthcare</div>
          </div>

          <div className="relative z-10 md:pl-[245px]">
            <h2 className="text-[28px] md:text-[clamp(28px,4vw,48px)] font-black leading-[1.04] max-w-[900px]">
              PDI e OKRs Pessoais FY26
            </h2>
            <p className="text-[#e3e3e3] max-w-[850px] leading-relaxed mt-3.5 text-[15px]">
              Plano de desenvolvimento, contribuições para a prática de Health e acompanhamento de realizações. Criado para
              validar alinhamento com a liderança e manter o histórico de evolução ao longo do FY26.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {["FY26", "Health Practice", "Business Development", "Delivery Excellence", "Industry Eminence"].map((b) => (
                <span
                  key={b}
                  className="px-3 py-2 rounded-full bg-white/10 border border-white/20 text-[12px] font-bold tracking-wide"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Tab: Resumo Executivo */}
        {activeTab === "resumo" && (
          <section className="mt-6 lg:mt-[26px] animate-in fade-in duration-200">
            <div className="flex justify-between items-end gap-4 mb-3.5">
              <div>
                <h3 className="text-[22px] font-bold text-[#191919]">Resumo Executivo</h3>
                <p className="text-[13px] text-[#4A4A4A] mt-1">Leitura rápida do racional do plano e espaço para validação da liderança.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-5 shadow-sm border-[#ECECEC] min-h-[150px]">
                <h4 className="text-[#8B1E24] uppercase tracking-wide text-[13px] font-bold mb-2.5">Objetivo do documento</h4>
                <p className="text-[#333] leading-relaxed text-[14px]">
                  Validar se o PDI está coerente com as expectativas da liderança, conectando desenvolvimento individual, geração
                  comercial, entrega de projetos, exposição interna e fortalecimento da prática de Health.
                </p>
              </Card>
              <Card className="p-5 shadow-sm border-[#ECECEC] min-h-[150px]">
                <h4 className="text-[#8B1E24] uppercase tracking-wide text-[13px] font-bold mb-2.5">Papel esperado</h4>
                <p className="text-[#333] leading-relaxed text-[14px]">
                  Atuar como representante da indústria de saúde e como executivo responsável por entregar projetos, apoiar o
                  comercial, desenvolver times e transformar relacionamentos, produtos e cases em crescimento recorrente.
                </p>
              </Card>
            </div>

            {/* Values */}
            <div className="mt-[18px]">
              <div className="flex justify-between items-end gap-4 mb-2.5">
                <div>
                  <h3 className="text-[22px] font-bold text-[#191919]">Valores A&amp;M</h3>
                  <p className="text-[13px] text-[#4A4A4A] mt-1">Referência informativa dos valores da firma.</p>
                </div>
              </div>
              <div className="grid gap-2.5 md:grid-cols-2">
                {data.values.map((v) => (
                  <Card key={v} className="p-3.5 shadow-sm border-[#ECECEC] flex flex-col gap-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-[34px] h-[34px] border-2 border-[#111] rounded-[10px] flex items-center justify-center text-[#111]">
                        {getValueIcon(v, "w-[18px] h-[18px]")}
                      </span>
                      <h4 className="text-[11px] font-bold uppercase tracking-wide text-[#8B1E24]">{v}</h4>
                    </div>
                    <p className="text-[13px] text-[#333] leading-relaxed">{valueDescriptions[v] || ""}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tab: PDI e OKRs */}
        {activeTab === "pdi" && (
          <section className="mt-6 lg:mt-[26px] animate-in fade-in duration-200">
            <div className="flex justify-between items-end gap-4 mb-3.5">
              <div>
                <h3 className="text-[22px] font-bold text-[#191919]">PDI e OKRs</h3>
                <p className="text-[13px] text-[#4A4A4A] mt-1">Objetivos, resultados-chave, métricas, comentários e evidências vinculadas.</p>
              </div>
              <Button onClick={addObjective} className="bg-[#8B1E24] hover:bg-[#B82E34] text-white">
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar objetivo
              </Button>
            </div>
            <div className="grid gap-4">
              {data.objectives.map((o, i) => {
                const isExpanded = expandedObjectives.has(o.id);
                const isHighlighted = highlightedObjective === o.id;
                const evidence = getObjectiveEvidence(o);
                return (
                  <Card
                    key={o.id}
                    id={`objective_card_${o.id}`}
                    className={`p-0 overflow-hidden border-l-[5px] border-[#8B1E24] transition-all duration-300 ${
                      isHighlighted ? "shadow-[0_0_0_3px_rgba(139,30,36,0.22),0_14px_34px_rgba(0,0,0,0.14)]" : "shadow-sm"
                    }`}
                  >
                    <div className="p-[18px_20px] grid grid-cols-[1fr_auto] gap-3 items-start bg-gradient-to-r from-white to-[#fbfbfb]">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[12px] bg-[#f2f2f2] border border-[#e1e1e1] px-2.5 py-1.5 rounded-full font-bold text-[#4a4a4a] mb-2">
                          Objetivo {i + 1}
                        </span>
                        <h4 className="text-[17px] font-bold leading-snug mb-2">{o.objective}</h4>
                        <p className="text-[13px] text-[#4A4A4A] leading-relaxed">
                          <strong>KR:</strong> {o.kr}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border border-[#ddd] text-[#111] hover:bg-[#f5f5f5]"
                        onClick={() => toggleObjective(o.id)}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isExpanded ? "Recolher" : "Expandir"}
                      </Button>
                    </div>
                    {isExpanded && (
                      <div className="p-[18px_20px_22px] border-t border-[#eee] grid gap-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="text-[13px] text-[#2b2b2b] leading-relaxed bg-[#fafafa] border border-[#ededed] rounded-[14px] p-3 whitespace-pre-line">
                          <strong>Métricas até outubro</strong>
                          {"\n"}
                          {o.metrics}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">Status</label>
                            <Select value={o.status} onValueChange={(v) => updateObjective(o.id, "status", v)}>
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Não iniciado">Não iniciado</SelectItem>
                                <SelectItem value="Em andamento">Em andamento</SelectItem>
                                <SelectItem value="Em risco">Em risco</SelectItem>
                                <SelectItem value="Concluído">Concluído</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">
                              Progresso: {Number(o.progress || 0)}%
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={Number(o.progress || 0)}
                              onChange={(e) => updateObjective(o.id, "progress", Number(e.target.value))}
                              className="w-full accent-[#8B1E24]"
                            />
                            <Progress value={Number(o.progress || 0)} className="mt-1.5 h-2.5 bg-[#e7e7e7]" />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">
                              Comentários do Paolo
                            </label>
                            <Textarea
                              value={o.paolo || ""}
                              onChange={(e) => updateObjective(o.id, "paolo", e.target.value)}
                              className="min-h-[74px] resize-y text-[13px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">
                              Comentários do líder
                            </label>
                            <Textarea
                              value={o.leader || ""}
                              onChange={(e) => updateObjective(o.id, "leader", e.target.value)}
                              className="min-h-[74px] resize-y text-[13px]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">
                            Evidências / realizações vinculadas
                          </label>
                          {evidence.length === 0 ? (
                            <div className="p-6 text-[#777] text-center border border-dashed border-[#ccc] rounded-[18px] bg-[#fafafa] text-[13px]">
                              Nenhuma evidência vinculada ainda.
                            </div>
                          ) : (
                            <div className="rounded-xl overflow-hidden border border-[#eee]">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-[#171717] hover:bg-[#171717]">
                                    <TableHead className="text-white text-[12px] uppercase tracking-wide">Tipo</TableHead>
                                    <TableHead className="text-white text-[12px] uppercase tracking-wide">Evidência</TableHead>
                                    <TableHead className="text-white text-[12px] uppercase tracking-wide">Ação</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {evidence.map((e, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>
                                        <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-bold ${categoryColors[e.cat] || categoryColors["Manual"] || "bg-gray-100 text-gray-700"}`}>
                                          {e.cat}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-[13px]">{e.text}</TableCell>
                                      <TableCell>
                                        {e.auto ? (
                                          <span className="text-[12px] text-[#777]">Automática via Realizações</span>
                                        ) : (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs bg-white border-[#ddd]"
                                            onClick={() => removeEvidence(o.id, Number(e.id))}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2.5 bg-transparent border-[#8B1E24] text-[#8B1E24] hover:bg-[#f4e9ea]"
                            onClick={() => addEvidence(o.id)}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar evidência
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Tab: Realizações */}
        {activeTab === "realizacoes" && (
          <section className="mt-6 lg:mt-[26px] animate-in fade-in duration-200">
            <div className="flex justify-between items-end gap-4 mb-3.5">
              <div>
                <h3 className="text-[22px] font-bold text-[#191919]">Realizações gerais FY26</h3>
                <p className="text-[13px] text-[#4A4A4A] mt-1">Histórico editável de contribuições em Eminência, Indústria, GTM e Prática.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
              <div className="flex flex-wrap gap-2 flex-1">
                <Input
                  placeholder="Buscar contribuição..."
                  value={searchReal}
                  onChange={(e) => setSearchReal(e.target.value)}
                  className="max-w-[260px] h-9 text-[13px]"
                />
                <Select value={filterCat} onValueChange={setFilterCat}>
                  <SelectTrigger className="w-[180px] h-9 text-[13px]">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="Eminência">Eminência</SelectItem>
                    <SelectItem value="Indústria">Indústria</SelectItem>
                    <SelectItem value="GTM">GTM</SelectItem>
                    <SelectItem value="Prática">Prática</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterObj} onValueChange={setFilterObj}>
                  <SelectTrigger className="w-[200px] h-9 text-[13px]">
                    <SelectValue placeholder="Todos os objetivos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os objetivos</SelectItem>
                    {data.objectives.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.objective.length > 40 ? o.objective.substring(0, 40) + "..." : o.objective}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => openRealizacaoModal()} className="bg-[#8B1E24] hover:bg-[#B82E34] text-white">
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar realização
              </Button>
            </div>

            {filteredRealizacoes.length === 0 ? (
              <div className="p-6 text-[#777] text-center border border-dashed border-[#ccc] rounded-[18px] bg-[#fafafa] text-[13px]">
                Nenhuma realização encontrada.
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-[#eee] shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#171717] hover:bg-[#171717]">
                      <TableHead className="text-white text-[12px] uppercase tracking-wide">Categoria</TableHead>
                      <TableHead className="text-white text-[12px] uppercase tracking-wide">Contribuição</TableHead>
                      <TableHead className="text-white text-[12px] uppercase tracking-wide">Data</TableHead>
                      <TableHead className="text-white text-[12px] uppercase tracking-wide">Objetivo vinculado</TableHead>
                      <TableHead className="text-white text-[12px] uppercase tracking-wide">Status</TableHead>
                      <TableHead className="text-white text-[12px] uppercase tracking-wide">Comentários</TableHead>
                      <TableHead className="text-white text-[12px] uppercase tracking-wide">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRealizacoes.map((r) => {
                      const linkedObj = data.objectives.find((o) => o.id === r.objetivoId || o.objective === r.objetivoRelacionado);
                      return (
                        <TableRow key={r.id} className="hover:bg-[#fbfbfb]">
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-bold ${categoryColors[r.categoria] || "bg-gray-100 text-gray-700"}`}>
                              {r.categoria}
                            </span>
                          </TableCell>
                          <TableCell className="text-[13px]">{r.contribuicao}</TableCell>
                          <TableCell className="text-[13px]">{r.data || ""}</TableCell>
                          <TableCell className="text-[13px]">
                            <button
                              onClick={() => linkedObj && goToObjective(linkedObj.id)}
                              className="text-[#8B1E24] font-bold border-b border-dotted border-current hover:text-[#5F1419] cursor-pointer"
                            >
                              {linkedObj?.objective || r.objetivoRelacionado || ""}
                            </button>
                          </TableCell>
                          <TableCell className="text-[13px]">{r.status || ""}</TableCell>
                          <TableCell className="text-[13px]">{r.comentarios || ""}</TableCell>
                          <TableCell>
                            <div className="flex gap-1.5">
                              <Button variant="outline" size="sm" className="h-7 text-xs bg-white border-[#ddd]" onClick={() => openRealizacaoModal(r.id)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button variant="destructive" size="sm" className="h-7 text-xs bg-[#7a171c]" onClick={() => deleteRealizacao(r.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        )}

        {/* Tab: Dashboard */}
        {activeTab === "dashboard" && (
          <section className="mt-6 lg:mt-[26px] animate-in fade-in duration-200">
            <div className="flex justify-between items-end gap-4 mb-3.5">
              <div>
                <h3 className="text-[22px] font-bold text-[#191919]">Dashboard de acompanhamento</h3>
                <p className="text-[13px] text-[#4A4A4A] mt-1">Indicadores automáticos atualizados com base nos objetivos, realizações e feedbacks registrados.</p>
              </div>
            </div>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {kpis.map((k) => (
                <Card key={k.label} className="p-5 shadow-sm border-[#ECECEC] flex flex-col gap-1.5 min-h-[116px]">
                  <span className="text-[#777] text-[12px] uppercase tracking-wider font-extrabold">{k.label}</span>
                  <span className="text-[32px] font-black text-[#111]">{k.value}</span>
                  <span className="text-[12px] text-[#4A4A4A]">{k.hint}</span>
                </Card>
              ))}
            </div>
            <div className="grid gap-4 mt-4 md:grid-cols-2">
              <Card className="p-5 shadow-sm border-[#ECECEC]">
                <h4 className="mt-0 font-bold text-[#191919] mb-3">Progresso geral do PDI</h4>
                <div className="h-2.5 bg-[#e7e7e7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B1E24] to-[#B82E34] rounded-full transition-all duration-300"
                    style={{ width: `${avg}%` }}
                  />
                </div>
                <p className="font-extrabold mt-2 text-[14px]">{avg}% de progresso médio</p>
              </Card>
              <Card className="p-5 shadow-sm border-[#ECECEC]">
                <h4 className="mt-0 font-bold text-[#191919] mb-3">Realizações por categoria</h4>
                <div className="flex flex-col gap-2.5">
                  {cats.map((c, idx) => (
                    <div key={c} className="grid grid-cols-[120px_1fr_46px] gap-2.5 items-center text-[13px]">
                      <strong>{c}</strong>
                      <div className="h-3 bg-[#eee] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#8B1E24] rounded-full transition-all duration-300"
                          style={{ width: `${(catCounts[idx] / maxCat) * 100}%` }}
                        />
                      </div>
                      <span>{catCounts[idx]}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Tab: Feedbacks */}
        {activeTab === "feedbacks" && (
          <section className="mt-6 lg:mt-[26px] animate-in fade-in duration-200">
            <div className="flex justify-between items-end gap-4 mb-3.5">
              <div>
                <h3 className="text-[22px] font-bold text-[#191919]">Feedbacks estruturados</h3>
                <p className="text-[13px] text-[#4A4A4A] mt-1">Registro simples de feedbacks recebidos, com data e origem do feedback.</p>
              </div>
              <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#8B1E24] hover:bg-[#B82E34] text-white">
                    <Plus className="w-4 h-4 mr-1.5" /> Adicionar feedback
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[760px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar feedback</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">Data</label>
                        <Input type="date" value={fbForm.data} onChange={(e) => setFbForm({ ...fbForm, data: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">Quem deu o feedback</label>
                        <Select value={fbForm.fonte} onValueChange={(v) => setFbForm({ ...fbForm, fonte: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Liderança">Liderança</SelectItem>
                            <SelectItem value="Cliente">Cliente</SelectItem>
                            <SelectItem value="Time">Time</SelectItem>
                            <SelectItem value="Parceiro">Parceiro</SelectItem>
                            <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                            <SelectItem value="Par">Par</SelectItem>
                            <SelectItem value="Sócio/Minor">Sócio/Minor</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">Feedback recebido</label>
                      <Textarea
                        placeholder="Registre o feedback recebido de forma objetiva..."
                        value={fbForm.feedback}
                        onChange={(e) => setFbForm({ ...fbForm, feedback: e.target.value })}
                        className="min-h-[100px]"
                      />
                    </div>
                    <Button onClick={saveFeedback} className="bg-[#8B1E24] hover:bg-[#B82E34] text-white">
                      Salvar feedback
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {data.feedbacks.length === 0 ? (
              <div className="p-6 text-[#777] text-center border border-dashed border-[#ccc] rounded-[18px] bg-[#fafafa] text-[13px]">
                Nenhum feedback registrado ainda. Clique em "Adicionar feedback" para incluir data, feedback recebido e quem deu o feedback.
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-[#eee] shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#171717] hover:bg-[#171717]">
                      <TableHead className="text-white text-[12px] uppercase tracking-wide">Data</TableHead>
                      <TableHead className="text-white text-[12px] uppercase tracking-wide">Quem deu o feedback</TableHead>
                      <TableHead className="text-white text-[12px] uppercase tracking-wide">Feedback recebido</TableHead>
                      <TableHead className="text-white text-[12px] uppercase tracking-wide">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.feedbacks.map((f) => (
                      <TableRow key={f.id} className="hover:bg-[#fbfbfb]">
                        <TableCell className="text-[13px]">{f.data}</TableCell>
                        <TableCell className="text-[13px]">{f.fonte}</TableCell>
                        <TableCell className="text-[13px]">{f.feedback}</TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" className="h-7 text-xs bg-[#7a171c]" onClick={() => deleteFeedback(f.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        )}

        {/* Page Actions */}
        <section className="mt-7 pt-[18px] border-t border-[#eee]" aria-label="Ações gerais do PDI">
          <div className="flex justify-between items-end gap-4 mb-3.5">
            <div>
              <h3 className="text-[22px] font-bold text-[#191919]">Ações gerais</h3>
              <p className="text-[13px] text-[#4A4A4A] mt-1">Use ao final da revisão para exportar, imprimir ou resetar os dados salvos localmente.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => window.print()} className="bg-[#8B1E24] hover:bg-[#B82E34] text-white">
              <Printer className="w-4 h-4 mr-1.5" /> Imprimir / Salvar PDF
            </Button>
            <Button variant="secondary" className="bg-[#333] text-white border border-[#555] hover:bg-[#444]" onClick={exportJSON}>
              <Download className="w-4 h-4 mr-1.5" /> Exportar JSON
            </Button>
            <Button variant="secondary" className="bg-[#333] text-white border border-[#555] hover:bg-[#444]" onClick={exportCSV}>
              <FileText className="w-4 h-4 mr-1.5" /> Exportar CSV
            </Button>
            <Button variant="destructive" className="bg-[#7a171c] hover:bg-[#6a0f14]" onClick={resetLocalData}>
              <RotateCcw className="w-4 h-4 mr-1.5" /> Resetar dados locais
            </Button>
          </div>
        </section>
      </main>

      {/* Realizacao Modal */}
      <Dialog open={realizacaoModalOpen} onOpenChange={setRealizacaoModalOpen}>
        <DialogContent className="max-w-[760px]">
          <DialogHeader>
            <DialogTitle>{editingRealizacao ? "Editar realização" : "Adicionar realização"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">Categoria</label>
                <Select
                  value={realForm.categoria}
                  onValueChange={(v) => setRealForm({ ...realForm, categoria: v as Realizacao["categoria"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eminência">Eminência</SelectItem>
                    <SelectItem value="Indústria">Indústria</SelectItem>
                    <SelectItem value="GTM">GTM</SelectItem>
                    <SelectItem value="Prática">Prática</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">Data</label>
                <Input type="date" value={realForm.data} onChange={(e) => setRealForm({ ...realForm, data: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">Contribuição</label>
              <Textarea
                value={realForm.contribuicao}
                onChange={(e) => setRealForm({ ...realForm, contribuicao: e.target.value })}
                className="min-h-[74px]"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">Objetivo vinculado ao PDI/OKR</label>
                <Select value={realForm.objetivoId} onValueChange={(v) => setRealForm({ ...realForm, objetivoId: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {data.objectives.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.objective.length > 50 ? o.objective.substring(0, 50) + "..." : o.objective}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">Status</label>
                <Select value={realForm.status} onValueChange={(v) => setRealForm({ ...realForm, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Registrado">Registrado</SelectItem>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Em validação">Em validação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">Evidência / Link</label>
              <Input
                placeholder="URL, arquivo, proposta, evento, e-mail etc."
                value={realForm.evidencia}
                onChange={(e) => setRealForm({ ...realForm, evidencia: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[12px] text-[#4A4A4A] font-bold mb-1.5 uppercase tracking-wide">Comentários</label>
              <Textarea
                value={realForm.comentarios}
                onChange={(e) => setRealForm({ ...realForm, comentarios: e.target.value })}
                className="min-h-[74px]"
              />
            </div>
            <Button onClick={saveRealizacao} className="bg-[#8B1E24] hover:bg-[#B82E34] text-white">
              Salvar realização
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
