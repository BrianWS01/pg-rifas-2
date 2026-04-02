"use client";

import { useState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await loginAction(password);
      if (result.success) {
        window.location.reload(); // Reload to let server component check the cookie
      } else {
        setError(result.error || "Erro ao fazer login");
      }
    } catch (err) {
      setError("Erro de comunicação com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full glass p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-white uppercase tracking-tight mb-2">
            Acesso <span className="text-brand">Restrito</span>
          </h1>
          <p className="text-gray-400 font-sans text-sm">
            Área exclusiva para administração do sistema.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Senha de Acesso</label>
            <input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-brand transition"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand text-white font-heading tracking-widest uppercase text-sm py-4 rounded-lg hover:scale-105 transition-all box-glow-brand disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Acessando..." : "Entrar no Painel"}
          </button>
        </form>
      </div>
    </main>
  );
}
