"use client";

interface ConfirmPaymentButtonProps {
  ticketNumbers: number[];
  phone: string;
  userName: string;
  price: number;
}

export default function ConfirmPaymentButton({ ticketNumbers, phone, userName, price }: ConfirmPaymentButtonProps) {
  const handleConfirm = async () => {
    const total = (ticketNumbers.length * price).toFixed(2);
    if (confirm(`Confirmar pagamento de R$ ${total} para ${userName}?`)) {
      try {
        const res = await fetch('/api/admin/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketNumbers, phone })
        });
        if (res.ok) {
          alert("Pagamento confirmado!");
          window.location.reload();
        } else {
          const data = await res.json();
          alert("Erro ao confirmar: " + (data.error || "Erro desconhecido"));
        }
      } catch (err) {
        console.error(err);
        alert("Erro na requisição.");
      }
    }
  };

  return (
    <button 
      onClick={handleConfirm}
      className="inline-block bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white font-bold px-4 py-2 rounded transition-colors text-xs uppercase tracking-wider"
    >
      Confirmar Pago
    </button>
  );
}
