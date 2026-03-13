"use client";

export default function CleanupButton() {
  const handleCleanup = async () => {
    if (confirm("Deseja limpar reservas antigas ou sem pagamento?")) {
      try {
        const res = await fetch('/api/admin/cleanup', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          alert(`Limpeza concluída! ${data.expiredReset + data.orphanedReset} cotas liberadas.`);
          window.location.reload();
        } else {
          alert("Erro ao limpar: " + (data.error || "Erro desconhecido"));
        }
      } catch (err) {
        console.error(err);
        alert("Erro na requisição.");
      }
    }
  };

  return (
    <button 
      onClick={handleCleanup}
      className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-colors text-sm uppercase tracking-wider"
    >
      Limpar Reservas
    </button>
  );
}
