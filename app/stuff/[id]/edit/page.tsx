import PageBreadcrumb from "@/components/bread/PageBreadcrumb";

import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";
import StuffEdit from "./_components/StuffEdit";

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
