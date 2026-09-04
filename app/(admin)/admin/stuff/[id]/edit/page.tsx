import PageBreadcrumb from "@/components/bread/PageBreadcrumb";

import { getStuffTitle } from "@/lib/actions/stuff.actions";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";
import StuffEdit from "./_components/StuffEdit";
import { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stuffId = Number((await params).id);
  const result = await getStuffTitle(stuffId);

  if (!result.ok) {
    return {
      title: "Edit stuff",
      description: "Edit stuff item details",
    };
  }

  return {
    title: result.data,
    description: `Edit details for ${result.data}`,
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
