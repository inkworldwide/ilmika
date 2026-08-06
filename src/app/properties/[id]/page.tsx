import { redirect } from "next/navigation";

export default async function PropertyDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/colleges/${id}`);
}
