"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Settings, Target, Bell, Eye, DollarSign, History, BarChart3, Shield, Palette, Save, ChevronRight, Home, FileText, Calendar, TrendingUpIcon, Check, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

type Transaction = {
  id: string;
  type: "receita" | "despesa";
  category: string;
  description: string;
  amount: number;
  date: string;
};

const categories = {
  receita: ["Salário", "Freelance", "Investimentos", "Outros"],
  despesa: ["Alimentação", "Transporte", "Moradia", "Lazer", "Saúde", "Educação", "Compras", "Outros"]
};

const categoryColors: Record<string, string> = {
  "Alimentação": "#FF6B6B",
  "Transporte": "#4ECDC4",
  "Moradia": "#45B7D1",
  "Lazer": "#FFA07A",
  "Saúde": "#98D8C8",
  "Educação": "#F7DC6F",
  "Compras": "#BB8FCE",
  "Outros": "#95A5A6"
};

export default function FinanSmart() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<"dashboard" | "settings" | "graphs">("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "receita",
      category: "Salário",
      description: "Salário Mensal",
      amount: 5000,
      date: "2025-01-15"
    },
    {
      id: "2",
      type: "despesa",
      category: "Alimentação",
      description: "Supermercado",
      amount: 850,
      date: "2025-01-15"
    },
    {
      id: "3",
      type: "despesa",
      category: "Transporte",
      description: "Combustível",
      amount: 320,
      date: "2025-01-15"
    },
    {
      id: "4",
      type: "despesa",
      category: "Lazer",
      description: "Cinema",
      amount: 180,
      date: "2025-01-15"
    },
    {
      id: "5",
      type: "despesa",
      category: "Saúde",
      description: "Farmácia",
      amount: 150,
      date: "2025-01-15"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "despesa" as "receita" | "despesa",
    category: "",
    description: "",
    amount: ""
  });

  // Settings state
  const [savingsGoal, setSavingsGoal] = useState(1000);
  const [alerts, setAlerts] = useState(true);
  const [detailedView, setDetailedView] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [cloudBackup, setCloudBackup] = useState(false);

  // Simulação de anotações diárias (true = anotou, false = não anotou)
  const [dailyNotes, setDailyNotes] = useState([
    { day: "D", checked: true },
    { day: "S", checked: true },
    { day: "T", checked: false },
    { day: "Q", checked: true },
    { day: "Q", checked: false },
    { day: "S", checked: false },
    { day: "S", checked: false }
  ]);

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 mx-auto animate-pulse">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não renderizar nada se não estiver autenticado (vai redirecionar)
  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const totalReceitas = transactions
    .filter(t => t.type === "receita")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDespesas = transactions
    .filter(t => t.type === "despesa")
    .reduce((acc, t) => acc + t.amount, 0);

  const saldo = totalReceitas - totalDespesas;
  const economia = saldo > 0 ? saldo : 0;
  const progressoMeta = savingsGoal > 0 ? Math.min((economia / savingsGoal) * 100, 100) : 0;

  // Calcular gastos por categoria para o gráfico
  const gastosPorCategoria = transactions
    .filter(t => t.type === "despesa")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const handleAddTransaction = () => {
    if (!formData.category || !formData.description || !formData.amount) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions([newTransaction, ...transactions]);
    setFormData({ type: "despesa", category: "", description: "", amount: "" });
    setIsDialogOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Comparativo com mês anterior (simulado)
  const comparativoMesAnterior = -12.5; // -12.5% de redução nos gastos

  // Função para criar o path SVG de uma fatia de pizza
  const createPieSlice = (startAngle: number, endAngle: number, radius: number) => {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = 200 + radius * Math.cos(startRad);
    const y1 = 200 + radius * Math.sin(startRad);
    const x2 = 200 + radius * Math.cos(endRad);
    const y2 = 200 + radius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M 200 200 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Calcular ângulos para cada categoria
  const pieData = Object.entries(gastosPorCategoria).map(([category, amount]) => {
    const percentage = (amount / totalDespesas) * 100;
    const angle = (amount / totalDespesas) * 360;
    return { category, amount, percentage, angle };
  });

  let currentAngle = 0;
  const pieSlices = pieData.map((data) => {
    const startAngle = currentAngle;
    const endAngle = currentAngle + data.angle;
    currentAngle = endAngle;
    
    // Calcular posição do label
    const midAngle = (startAngle + endAngle) / 2;
    const midRad = (midAngle - 90) * Math.PI / 180;
    const labelRadius = 130;
    const labelX = 200 + labelRadius * Math.cos(midRad);
    const labelY = 200 + labelRadius * Math.sin(midRad);
    
    return {
      ...data,
      startAngle,
      endAngle,
      labelX,
      labelY
    };
  });

  // Dados simulados para relatórios semanais e mensais
  const relatorioSemanal = {
    semanaAtual: totalDespesas * 0.25,
    semanaAnterior: totalDespesas * 0.30,
    variacao: -16.7
  };

  const relatorioMensal = {
    mesAtual: totalDespesas,
    mesAnterior: totalDespesas * 1.125,
    variacao: -12.5
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 pb-20">
      {/* Header - Reduzido */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  FinanSmart
                </h1>
                <p className="text-[10px] text-blue-100">Controle Financeiro Inteligente</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {currentView === "dashboard" ? (
          <>
            {/* Seção de Bolinhas de Verificação - NOVA */}
            <div className="mb-4">
              <div className="flex justify-center gap-2">
                {dailyNotes.map((note, index) => (
                  <div key={index} className="flex flex-col items-center gap-0.5">
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        note.checked 
                          ? "bg-green-500 shadow-md shadow-green-500/30" 
                          : "bg-gray-200"
                      }`}
                    >
                      {note.checked && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-[9px] font-medium text-gray-600">{note.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cards de Resumo - Reduzidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Saldo Atual */}
              <Card className="p-3 rounded-2xl border-0 shadow-lg bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Saldo Atual</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(saldo)}</p>
                  </div>
                </div>
              </Card>

              {/* Total de Gastos */}
              <Card className="p-3 rounded-2xl border-0 shadow-lg bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Total de Gastos</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(totalDespesas)}</p>
                  </div>
                </div>
              </Card>

              {/* Total Economizado */}
              <Card className="p-3 rounded-2xl border-0 shadow-lg bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                    <PiggyBank className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Total Economizado</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(economia)}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Gráfico de Pizza e Info Cards - Reduzidos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Gráfico de Pizza */}
              <Card className="p-4 rounded-2xl border-0 shadow-lg bg-white">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Gastos por Categoria</h3>
                <div className="relative w-full max-w-xs mx-auto">
                  <svg viewBox="0 0 400 400" className="w-full h-auto drop-shadow-xl">
                    {/* Fatias do gráfico de pizza */}
                    {pieSlices.map((slice, index) => (
                      <g key={slice.category}>
                        {/* Fatia */}
                        <path
                          d={createPieSlice(slice.startAngle, slice.endAngle, 180)}
                          fill={categoryColors[slice.category]}
                          stroke="white"
                          strokeWidth="3"
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                          style={{
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                          }}
                        />
                        
                        {/* Label com categoria e porcentagem */}
                        <text
                          x={slice.labelX}
                          y={slice.labelY}
                          textAnchor="middle"
                          className="text-xs font-bold fill-white"
                          style={{ 
                            paintOrder: 'stroke',
                            stroke: categoryColors[slice.category],
                            strokeWidth: '3px',
                            strokeLinejoin: 'round'
                          }}
                        >
                          <tspan x={slice.labelX} dy="0">{slice.category}</tspan>
                          <tspan x={slice.labelX} dy="14" className="text-sm">{slice.percentage.toFixed(1)}%</tspan>
                        </text>
                      </g>
                    ))}
                    
                    {/* Círculo central com total */}
                    <circle
                      cx="200"
                      cy="200"
                      r="70"
                      fill="url(#gradient)"
                      className="drop-shadow-xl"
                    />
                    
                    {/* Gradiente para o círculo central */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#2563EB" />
                      </linearGradient>
                    </defs>
                    
                    {/* Texto do total no centro */}
                    <text x="200" y="190" textAnchor="middle" className="text-xs fill-white font-medium">
                      Total
                    </text>
                    <text x="200" y="215" textAnchor="middle" className="text-base fill-white font-bold">
                      {formatCurrency(totalDespesas)}
                    </text>
                  </svg>
                  
                  {/* Legenda abaixo do gráfico */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {pieData.map((data) => (
                      <div key={data.category} className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: categoryColors[data.category] }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-gray-700 truncate">{data.category}</p>
                          <p className="text-[10px] text-gray-500">{formatCurrency(data.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Info Cards */}
              <div className="space-y-3">
                {/* Gastos do Mês Atual */}
                <Card className="p-3 rounded-xl border-0 shadow-lg bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Gastos do Mês Atual</p>
                      <p className="text-lg font-bold text-gray-800">{formatCurrency(totalDespesas)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                </Card>

                {/* Economia Gerada */}
                <Card className="p-3 rounded-xl border-0 shadow-lg bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Economia Gerada</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(economia)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <PiggyBank className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>Meta: {formatCurrency(savingsGoal)}</span>
                      <span>{progressoMeta.toFixed(0)}%</span>
                    </div>
                    <Progress value={progressoMeta} className="h-1.5" />
                  </div>
                </Card>

                {/* Comparativo com Mês Anterior */}
                <Card className="p-3 rounded-xl border-0 shadow-lg bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Comparativo com Mês Anterior</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-lg font-bold ${comparativoMesAnterior < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {comparativoMesAnterior > 0 ? '+' : ''}{comparativoMesAnterior}%
                        </p>
                        {comparativoMesAnterior < 0 ? (
                          <ArrowDownRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {comparativoMesAnterior < 0 ? 'Você gastou menos este mês! 🎉' : 'Atenção aos gastos este mês'}
                  </p>
                </Card>
              </div>
            </div>
          </>
        ) : currentView === "graphs" ? (
          /* Tela de Gráficos com Relatórios */
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Relatórios e Análises</h2>

            {/* Relatório Semanal */}
            <Card className="p-4 rounded-2xl border-0 shadow-lg bg-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Relatório Semanal</h3>
                  <p className="text-[10px] text-gray-500">Últimos 7 dias</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
                  <p className="text-[10px] text-purple-600 font-medium mb-1">Semana Atual</p>
                  <p className="text-lg font-bold text-purple-700">{formatCurrency(relatorioSemanal.semanaAtual)}</p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl">
                  <p className="text-[10px] text-gray-600 font-medium mb-1">Semana Anterior</p>
                  <p className="text-lg font-bold text-gray-700">{formatCurrency(relatorioSemanal.semanaAnterior)}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
                  <p className="text-[10px] text-green-600 font-medium mb-1">Variação</p>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-bold text-green-700">{relatorioSemanal.variacao.toFixed(1)}%</p>
                    <ArrowDownRight className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-700 font-medium">
                  ✨ Parabéns! Você economizou {formatCurrency(relatorioSemanal.semanaAnterior - relatorioSemanal.semanaAtual)} esta semana!
                </p>
              </div>
            </Card>

            {/* Relatório Mensal */}
            <Card className="p-4 rounded-2xl border-0 shadow-lg bg-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <TrendingUpIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Relatório Mensal</h3>
                  <p className="text-[10px] text-gray-500">Últimos 30 dias</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
                  <p className="text-[10px] text-blue-600 font-medium mb-1">Mês Atual</p>
                  <p className="text-lg font-bold text-blue-700">{formatCurrency(relatorioMensal.mesAtual)}</p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl">
                  <p className="text-[10px] text-gray-600 font-medium mb-1">Mês Anterior</p>
                  <p className="text-lg font-bold text-gray-700">{formatCurrency(relatorioMensal.mesAnterior)}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
                  <p className="text-[10px] text-green-600 font-medium mb-1">Variação</p>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-bold text-green-700">{relatorioMensal.variacao.toFixed(1)}%</p>
                    <ArrowDownRight className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700 font-medium">
                  📊 Sua economia mensal está {formatCurrency(relatorioMensal.mesAnterior - relatorioMensal.mesAtual)} melhor que o mês passado!
                </p>
              </div>
            </Card>

            {/* Gráfico de Pizza */}
            <Card className="p-4 rounded-2xl border-0 shadow-lg bg-white">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Distribuição de Gastos</h3>
              <div className="relative w-full max-w-xs mx-auto">
                <svg viewBox="0 0 400 400" className="w-full h-auto drop-shadow-xl">
                  {/* Fatias do gráfico de pizza */}
                  {pieSlices.map((slice, index) => (
                    <g key={slice.category}>
                      {/* Fatia */}
                      <path
                        d={createPieSlice(slice.startAngle, slice.endAngle, 180)}
                        fill={categoryColors[slice.category]}
                        stroke="white"
                        strokeWidth="3"
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                        style={{
                          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                        }}
                      />
                      
                      {/* Label com categoria e porcentagem */}
                      <text
                        x={slice.labelX}
                        y={slice.labelY}
                        textAnchor="middle"
                        className="text-xs font-bold fill-white"
                        style={{ 
                          paintOrder: 'stroke',
                          stroke: categoryColors[slice.category],
                          strokeWidth: '3px',
                          strokeLinejoin: 'round'
                        }}
                      >
                        <tspan x={slice.labelX} dy="0">{slice.category}</tspan>
                        <tspan x={slice.labelX} dy="14" className="text-sm">{slice.percentage.toFixed(1)}%</tspan>
                      </text>
                    </g>
                  ))}
                  
                  {/* Círculo central com total */}
                  <circle
                    cx="200"
                    cy="200"
                    r="70"
                    fill="url(#gradient)"
                    className="drop-shadow-xl"
                  />
                  
                  {/* Gradiente para o círculo central */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                  </defs>
                  
                  {/* Texto do total no centro */}
                  <text x="200" y="190" textAnchor="middle" className="text-xs fill-white font-medium">
                    Total
                  </text>
                  <text x="200" y="215" textAnchor="middle" className="text-base fill-white font-bold">
                    {formatCurrency(totalDespesas)}
                  </text>
                </svg>
                
                {/* Legenda abaixo do gráfico */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {pieData.map((data) => (
                    <div key={data.category} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: categoryColors[data.category] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-gray-700 truncate">{data.category}</p>
                        <p className="text-[10px] text-gray-500">{formatCurrency(data.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Tela de Personalização Financeira */
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Personalização Financeira</h2>

            {/* Meta de Economia Mensal */}
            <Card className="p-3 rounded-xl border-0 shadow-lg bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-800 mb-1">Definir Meta de Economia Mensal</h3>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={savingsGoal}
                      onChange={(e) => setSavingsGoal(parseFloat(e.target.value) || 0)}
                      className="w-24 h-7 text-xs rounded-lg"
                      placeholder="R$ 0,00"
                    />
                    <div className="flex-1">
                      <Progress value={progressoMeta} className="h-1.5" />
                      <p className="text-[10px] text-gray-500 mt-0.5">{progressoMeta.toFixed(0)}% atingido</p>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Card>

            {/* Editar Categorias de Gasto */}
            <Card className="p-3 rounded-xl border-0 shadow-lg bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Editar Categorias de Gasto</h3>
                  <p className="text-[10px] text-gray-500">Personalize suas categorias de despesas</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Card>

            {/* Alertas e Lembretes */}
            <Card className="p-3 rounded-xl border-0 shadow-lg bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Ativar Alertas e Lembretes</h3>
                  <p className="text-[10px] text-gray-500">Receba notificações sobre seus gastos</p>
                </div>
                <Switch checked={alerts} onCheckedChange={setAlerts} />
              </div>
            </Card>

            {/* Modo de Visualização */}
            <Card className="p-3 rounded-xl border-0 shadow-lg bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Modo de Visualização</h3>
                  <p className="text-[10px] text-gray-500">{detailedView ? 'Detalhado' : 'Simples'}</p>
                </div>
                <Switch checked={detailedView} onCheckedChange={setDetailedView} />
              </div>
            </Card>

            {/* Cadastrar Fontes de Renda */}
            <Card className="p-3 rounded-xl border-0 shadow-lg bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Cadastrar Fontes de Renda</h3>
                  <p className="text-[10px] text-gray-500">Adicione rendas fixas e variáveis</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Card>

            {/* Histórico de Metas */}
            <Card className="p-3 rounded-xl border-0 shadow-lg bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <History className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Histórico de Metas Anteriores</h3>
                  <p className="text-[10px] text-gray-500">Consulte suas metas passadas</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Card>

            {/* Gráfico Detalhado de Gastos */}
            <Card className="p-3 rounded-xl border-0 shadow-lg bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Gráfico Detalhado de Gastos</h3>
                  <p className="text-[10px] text-gray-500">Visualize gráficos de barra, linha e pizza</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Card>

            {/* Backup e Segurança */}
            <Card className="p-3 rounded-xl border-0 shadow-lg bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Backup e Segurança</h3>
                  <p className="text-[10px] text-gray-500">Salvar dados na nuvem</p>
                </div>
                <Switch checked={cloudBackup} onCheckedChange={setCloudBackup} />
              </div>
            </Card>

            {/* Tema Visual */}
            <Card className="p-3 rounded-xl border-0 shadow-lg bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Tema Visual</h3>
                  <p className="text-[10px] text-gray-500">{darkMode ? 'Modo Escuro' : 'Modo Claro'}</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </Card>

            {/* Botão Salvar Preferências */}
            <div className="pt-4 pb-2">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-5 text-sm font-semibold shadow-lg">
                <Save className="w-4 h-4 mr-2" />
                Salvar Preferências
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé Fixo Estilo Instagram */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {/* Home */}
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                currentView === "dashboard"
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Home className={`w-6 h-6 ${currentView === "dashboard" ? "fill-blue-600" : ""}`} />
            </button>

            {/* Registrar Gasto */}
            <Link
              href="/registrar-gasto"
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all text-gray-400 hover:text-gray-600"
            >
              <FileText className="w-6 h-6" />
            </Link>

            {/* Botão Central "+" */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex flex-col items-center gap-0.5 -mt-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center transition-all hover:scale-110">
                    <Plus className="w-6 h-6" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-800">Adicionar Gasto</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-3">
                  <Tabs value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as "receita" | "despesa", category: "" })}>
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1">
                      <TabsTrigger value="despesa" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
                        <ArrowDownRight className="w-3 h-3 mr-1 text-red-500" />
                        Despesa
                      </TabsTrigger>
                      <TabsTrigger value="receita" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
                        <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                        Receita
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs text-gray-700">Categoria</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="rounded-lg border-gray-200 h-9 text-xs">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories[formData.type].map(cat => (
                          <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs text-gray-700">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Ex: Almoço no restaurante"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="rounded-lg border-gray-200 h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs text-gray-700">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="rounded-lg border-gray-200 h-9 text-xs"
                      step="0.01"
                    />
                  </div>

                  <Button 
                    onClick={handleAddTransaction}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg py-5 text-sm font-semibold shadow-lg shadow-blue-500/30"
                  >
                    Adicionar Transação
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Gráficos */}
            <button
              onClick={() => setCurrentView("graphs")}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                currentView === "graphs"
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <BarChart3 className={`w-6 h-6 ${currentView === "graphs" ? "fill-blue-600" : ""}`} />
            </button>

            {/* Configurações */}
            <button
              onClick={() => setCurrentView("settings")}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                currentView === "settings"
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Settings className={`w-6 h-6 ${currentView === "settings" ? "fill-blue-600" : ""}`} />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
