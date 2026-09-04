import PageBreadcrumb from "@/components/bread/PageBreadcrumb";

import { getStuffTitle } from "@/lib/actions/stuff.actions";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";
import Stuff from "./_components/Stuff";
import { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stuffId = Number((await params).id);
  const result = await getStuffTitle(stuffId);

  if (!result.ok) {
    return {
      title: "Stuff",
      description: "Stuff item details",
    };
  }

  return {
    title: result.data,
    description: `Details for ${result.data}`,
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
      <Stuff id={stuffId} />
    </main>
  );
};

export default StuffPage;
