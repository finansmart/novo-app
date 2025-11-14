"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

const categorias = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Compras",
  "Outros"
];

const metodosPagamento = [
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de Débito",
  "PIX",
  "Transferência Bancária"
];

export default function RegistrarGasto() {
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    metodoPagamento: "",
    categoria: "",
    data: new Date().toISOString().split('T')[0]
  });

  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.descricao || !formData.valor || !formData.metodoPagamento || !formData.categoria) {
      return;
    }

    // Aqui você pode adicionar lógica para salvar o gasto
    console.log("Gasto salvo:", formData);

    // Mostrar animação de confirmação
    setMostrarConfirmacao(true);

    // Resetar formulário após 2 segundos
    setTimeout(() => {
      setFormData({
        descricao: "",
        valor: "",
        metodoPagamento: "",
        categoria: "",
        data: new Date().toISOString().split('T')[0]
      });
      setMostrarConfirmacao(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Registrar Gasto</h1>
              <p className="text-sm text-blue-100">Adicione um novo gasto ao seu controle financeiro</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 rounded-3xl border-0 shadow-xl bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-gray-700 font-semibold">
                Descrição
              </Label>
              <Input
                id="descricao"
                type="text"
                placeholder="Ex: Almoço no restaurante"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="rounded-xl border-gray-200 h-12 text-base"
                required
              />
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor" className="text-gray-700 font-semibold">
                Valor (R$)
              </Label>
              <Input
                id="valor"
                type="number"
                placeholder="0,00"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="rounded-xl border-gray-200 h-12 text-base"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Método de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="metodoPagamento" className="text-gray-700 font-semibold">
                Método de Pagamento
              </Label>
              <Select 
                value={formData.metodoPagamento} 
                onValueChange={(v) => setFormData({ ...formData, metodoPagamento: v })}
                required
              >
                <SelectTrigger className="rounded-xl border-gray-200 h-12">
                  <SelectValue placeholder="Selecione o método de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {metodosPagamento.map(metodo => (
                    <SelectItem key={metodo} value={metodo}>{metodo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-gray-700 font-semibold">
                Categoria
              </Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(v) => setFormData({ ...formData, categoria: v })}
                required
              >
                <SelectTrigger className="rounded-xl border-gray-200 h-12">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="data" className="text-gray-700 font-semibold">
                Data
              </Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="rounded-xl border-gray-200 h-12 text-base"
                required
              />
            </div>

            {/* Botão Salvar */}
            <Button 
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-6 text-base font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
              Salvar Gasto
            </Button>
          </form>
        </Card>

        {/* Mensagem de Confirmação */}
        {mostrarConfirmacao && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300">
            <Card className="p-8 rounded-3xl border-0 shadow-2xl bg-white max-w-sm mx-4 animate-in zoom-in duration-300">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Gasto Salvo!</h3>
                  <p className="text-sm text-gray-600">Seu gasto foi registrado com sucesso.</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
