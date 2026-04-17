import { redirect } from "next/navigation";

export default async function LegacyAdminProdutoEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/products/edit/${id}`);
}
