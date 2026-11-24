import { listarProdutos } from "@/lib/produtos";
import { obterDataComemorativaConfig } from "@/lib/data-comemorativa";
import AdminDataComemorativa from "@/app/admin/AdminDataComemorativa";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Data Comemorativa | Admin Ana Cake",
  robots: { index: false, follow: false },
};

export default async function DataComemorativaPage() {
  const [produtos, config] = await Promise.all([
    listarProdutos(),
    obterDataComemorativaConfig(),
  ]);

  return <AdminDataComemorativa produtos={produtos} initialConfig={config} />;
}
