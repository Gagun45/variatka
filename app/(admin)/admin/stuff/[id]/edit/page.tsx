import PageBreadcrumb from "@/components/bread/PageBreadcrumb";

import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";
import StuffEdit from "./_components/StuffEdit";
import { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  return {
    title: `Edit Stuff ${id}`,
    description: `Edit details for stuff item ${id}`,
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

const StuffEditPage = async ({ params }: Props) => {
  const { id } = await params;
  const stuffId = +id;
  return (
    <main>
      <PageBreadcrumb items={BREADCRUMB_ITEMS.stuff.edit(stuffId)} />
      <h1>Stuff page</h1>
      <StuffEdit id={stuffId} />
    </main>
  );
};

export default StuffEditPage;
