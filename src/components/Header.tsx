import Link from "next/link";
import { LogIn } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b-[2px] border-brand">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="font-heading text-2xl md:text-3xl tracking-tight text-white">
          STREET <span className="text-brand">BARBERSHOP</span>
        </Link>
        <button className="gold-gradient text-black font-heading tracking-widest px-6 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-transform uppercase">
          <LogIn className="w-5 h-5" />
          <span>Login</span>
        </button>
      </div>
    </header>
  );
}
