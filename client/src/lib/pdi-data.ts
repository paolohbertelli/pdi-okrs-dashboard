// PDI e OKRs FY26 - Data Model
// Based on the original dashboard HTML file

export interface Objective {
  id: string;
  objective: string;
  kr: string;
  metrics: string;
  status: "Não iniciado" | "Em andamento" | "Em risco" | "Concluído";
  progress: number;
  paolo: string;
  leader: string;
  evidence: string[];
}

export interface Realizacao {
  id: string;
  categoria: "Eminência" | "Indústria" | "GTM" | "Prática";
  contribuicao: string;
  data: string;
  objetivoId: string;
  objetivoRelacionado: string;
  evidencia: string;
  status: string;
  comentarios: string;
}

export interface Feedback {
  id: string;
  data: string;
  fonte: string;
  feedback: string;
}

export interface PDIData {
  values: string[];
  valueDescriptions: Record<string, string>;
  objectives: Objective[];
  realizacoes: Realizacao[];
  feedbacks: Feedback[];
}

export const valueDescriptions: Record<string, string> = {
  Integridade: "Agir com ética, transparência e responsabilidade nas decisões e relações.",
  Qualidade: "Entregar com consistência, rigor técnico e padrão executivo.",
  Objetividade: "Focar no que importa, com clareza, pragmatismo e orientação a resultados.",
  Diversão: "Construir um ambiente positivo, colaborativo e energizante.",
  "Recompensa pessoal": "Buscar desenvolvimento, impacto e realização no trabalho.",
  "Diversidade inclusiva": "Valorizar perspectivas diferentes e promover colaboração respeitosa.",
};

export const initialData: PDIData = {
  values: ["Integridade", "Qualidade", "Objetividade", "Diversão", "Recompensa pessoal", "Diversidade inclusiva"],
  valueDescriptions,
  objectives: [
    {
      id: "obj-1",
      objective: "Transformar o conhecimento de fontes pagadoras em um GTM estruturado para Health",
      kr: "Construir e executar um plano de GTM focado em operadoras, Unimeds, autogestões e fontes pagadoras, conectando tendências de mercado com ofertas da A&M.",
      metrics:
        "Plano de GTM validado com liderança; 2 a 3 teses comerciais priorizadas; lista de 15–20 contas-alvo; pelo menos 6 reuniões qualificadas com decisores; pipeline gerado a partir dessas teses.",
      status: "Não iniciado",
      progress: 0,
      paolo: "",
      leader: "",
      evidence: [],
    },
    {
      id: "obj-2",
      objective: "Elevar a qualidade da gestão dos projetos e times",
      kr: "Melhorar comunicação, clareza de papéis, alinhamento de expectativas e previsibilidade das entregas nos projetos sob sua liderança.",
      metrics:
        "Modelo de papéis definido em 100% dos projetos relevantes; rituais de gestão implantados; upward feedback com evolução perceptível.",
      status: "Não iniciado",
      progress: 0,
      paolo: "",
      leader: "",
      evidence: [],
    },
    {
      id: "obj-3",
      objective: "Fortalecer a eminência e a plataforma de crescimento da prática de Health",
      kr: "Atuar como um dos líderes de desenvolvimento da indústria de Health, contribuindo para transformar o conhecimento, os relacionamentos, os produtos e os cases existentes da prática em uma agenda estruturada de mercado, com maior visibilidade externa, melhor coordenação interna e geração recorrente de oportunidades comerciais.",
      metrics:
        "- Publicação de 2 a 3 artigos, POVs ou materiais executivos sobre temas estratégicos de saúde;\n- Participação ou organização de 2 eventos com clientes ou mercado;\n- Definição de 2 a 4 temas prioritários de posicionamento, com envolvimento de sócios, minors e especialistas;\n- Participação em pelo menos 2 eventos externos;\n- Mapa de ofertas de Health estruturado por tipo de cliente;\n- Manutenção/atualização dos one-pagers comerciais;\n- Definição de teses por segmento;\n- Inventário de cases e credenciais da prática.",
      status: "Não iniciado",
      progress: 0,
      paolo: "",
      leader: "",
      evidence: [],
    },
    {
      id: "obj-4",
      objective: "Ampliar exposição interna e colaboração com sócios e especializações",
      kr: "Fortalecer relacionamento interno, aumentando visibilidade junto a MDs, minors e outras práticas para gerar sinergias comerciais e de entrega.",
      metrics:
        "Participação em iniciativa cross-practice; pelo menos 1 oportunidade comercial criada em parceria com outra prática; feedback positivo da liderança sobre colaboração interna.",
      status: "Não iniciado",
      progress: 0,
      paolo: "",
      leader: "",
      evidence: [],
    },
    {
      id: "obj-5",
      objective: "Acompanhar evolução de forma estruturada",
      kr: "Receber 2 feedbacks estruturados até outubro",
      metrics: "2 feedbacks registrados após mid year round table",
      status: "Não iniciado",
      progress: 0,
      paolo: "",
      leader: "",
      evidence: [],
    },
  ],
  realizacoes: [
    { id: "r-1", categoria: "Eminência", contribuicao: "Participação do CONAHP em outubro/25", data: "2024-10-01", objetivoId: "obj-3", objetivoRelacionado: "Fortalecer a eminência e a plataforma de crescimento da prática de Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-2", categoria: "Eminência", contribuicao: "Convidado para participar do evento da BD 75 anos Brasil", data: "2024-11-01", objetivoId: "obj-3", objetivoRelacionado: "Fortalecer a eminência e a plataforma de crescimento da prática de Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-3", categoria: "Eminência", contribuicao: "Participação na feira hospitalar em maio/26", data: "2026-05-01", objetivoId: "obj-3", objetivoRelacionado: "Fortalecer a eminência e a plataforma de crescimento da prática de Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-4", categoria: "Indústria", contribuicao: "Elaboração plano de indústria", data: "", objetivoId: "obj-3", objetivoRelacionado: "Fortalecer a eminência e a plataforma de crescimento da prática de Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-5", categoria: "Indústria", contribuicao: "Elaboração/apresentação All Hands", data: "", objetivoId: "obj-3", objetivoRelacionado: "Fortalecer a eminência e a plataforma de crescimento da prática de Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-6", categoria: "GTM", contribuicao: "Geração de lead - Unimed Fortaleza - Depósitos Judiciais", data: "", objetivoId: "obj-1", objetivoRelacionado: "Transformar o conhecimento de fontes pagadoras em um GTM estruturado para Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-7", categoria: "GTM", contribuicao: "Geração de lead - Unimed Campinas - Depósitos Judiciais", data: "", objetivoId: "obj-1", objetivoRelacionado: "Transformar o conhecimento de fontes pagadoras em um GTM estruturado para Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-8", categoria: "GTM", contribuicao: "Geração de lead/condução da proposta multidisciplinar - Amoveri Farma", data: "", objetivoId: "obj-1", objetivoRelacionado: "Transformar o conhecimento de fontes pagadoras em um GTM estruturado para Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-9", categoria: "GTM", contribuicao: "Geração de lead - Health Imaging", data: "", objetivoId: "obj-1", objetivoRelacionado: "Transformar o conhecimento de fontes pagadoras em um GTM estruturado para Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-10", categoria: "GTM", contribuicao: "Geração de lead/condução da proposta - Grupo Conduzir - PE", data: "", objetivoId: "obj-1", objetivoRelacionado: "Transformar o conhecimento de fontes pagadoras em um GTM estruturado para Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-11", categoria: "GTM", contribuicao: "Geração de lead/condução da proposta - Grupo Conduzir - org design", data: "", objetivoId: "obj-1", objetivoRelacionado: "Transformar o conhecimento de fontes pagadoras em um GTM estruturado para Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-12", categoria: "GTM", contribuicao: "Geração de lead/condução da proposta - SSI Saúde - Diagnóstico de Sinistralidade", data: "", objetivoId: "obj-1", objetivoRelacionado: "Transformar o conhecimento de fontes pagadoras em um GTM estruturado para Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-13", categoria: "GTM", contribuicao: "Apoio em elaboração e liderança de proposta - Unidas", data: "", objetivoId: "obj-1", objetivoRelacionado: "Transformar o conhecimento de fontes pagadoras em um GTM estruturado para Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-14", categoria: "Prática", contribuicao: "Apoio/desenvolvimento de produtos (IA para Strategic Sourcing Hospitais)", data: "", objetivoId: "obj-3", objetivoRelacionado: "Fortalecer a eminência e a plataforma de crescimento da prática de Health", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-15", categoria: "Prática", contribuicao: "Ponto focal para squad de staffing Health", data: "", objetivoId: "obj-2", objetivoRelacionado: "Elevar a qualidade da gestão dos projetos e times", evidencia: "", status: "Registrado", comentarios: "" },
    { id: "r-16", categoria: "Prática", contribuicao: "Pílula de conhecimento - Strategic Sourcing para hospitais (média de avaliação XXX)", data: "2025-09-01", objetivoId: "obj-3", objetivoRelacionado: "Fortalecer a eminência e a plataforma de crescimento da prática de Health", evidencia: "", status: "Registrado", comentarios: "" },
  ],
  feedbacks: [],
};
