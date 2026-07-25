import MensagensCrm from "@/app/admin/MensagensCrm";
import { listarConversasDemo } from "@/lib/mensagens";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mensagens | Admin Ana Cake",
  robots: { index: false, follow: false },
};

export default function MensagensPage() {
  const conversas = listarConversasDemo();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-chocolate">Mensagens</h2>
        <p className="text-sm text-chocolate-muted">
          Mini CRM para acompanhar conversas do WhatsApp em filas simples.
        </p>
      </div>

      <MensagensCrm conversasIniciais={conversas} />
    </div>
  );
}
