import PageBreadcrumb from "@/components/bread/PageBreadcrumb";

import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";
import Stuff from "./_components/Stuff";
import { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stuffId = (await params).id;

  return {
    title: `Stuff ${stuffId}`,
    description: `Details for stuff item ${stuffId}`,
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

const StuffPage = async ({ params }: Props) => {
  const { id } = await params;
  const stuffId = +id;
  return (
    <main>
      <PageBreadcrumb items={BREADCRUMB_ITEMS.stuff.view(stuffId)} />
      <h1>Stuff page</h1>
      <Stuff id={stuffId} />
    </main>
  );
};

export default StuffPage;
