import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { lineItems: true },
  });

  if (!invoice) {
    return Response.json({ error: "Invoice not found" }, { status: 404 });
  }

  return Response.json({ invoice });
}
