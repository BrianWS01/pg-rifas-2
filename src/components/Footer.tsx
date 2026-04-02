import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-brand/30 pt-16 pb-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-8">
        <div className="text-center">
          <Link href="/" className="font-heading text-3xl tracking-tight text-white uppercase inline-block mb-4">
            STREET <span className="text-brand">BARBERSHOP</span>
          </Link>
          <p className="text-[#D1D5DB] font-sans text-sm max-w-md mx-auto">
            A plataforma de rifas exclusiva da Street Barber Shop. Concorra a prêmios incríveis com total transparência e segurança.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <a href="https://www.instagram.com/street_barbershop10/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-brand hover:text-brand transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://wa.me/5511955506042" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-[#25D366] hover:text-[#25D366] transition-colors">
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>

        <div className="w-full h-px bg-white/5 my-4"></div>

        <div className="flex flex-col md:flex-row items-center justify-between w-full text-xs text-gray-500 font-sans gap-4">
          <p>© {new Date().getFullYear()} Street Barber Shop Rifas. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-white transition-colors">Políticas de Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}