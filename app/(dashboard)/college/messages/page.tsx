import { Inbox } from "lucide-react";
import { FilterTabs, PageHeader, SearchBox, TablePagination } from "@/components/admin/AdminUI";
import { MessageInbox } from "@/components/admin/MessageInbox";
import { EmptyState } from "@/components/common/EmptyState";
import { listMessages } from "@/lib/data/dashboard";

export const metadata = { title: "Messages" };

type Props = { searchParams: Promise<{ filter?: string; q?: string; page?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const data = await listMessages(sp.filter, sp.q, sp.page);
  return (
    <>
      <PageHeader title="Messages" description={`${data.unread} unread message(s) from the contact form.`} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          param="filter"
          options={[
            { value: "", label: "All" },
            { value: "unread", label: "Unread", count: data.unread },
            { value: "read", label: "Read" },
          ]}
        />
        <SearchBox placeholder="Search messages" />
      </div>
      {data.items.length ? <MessageInbox messages={data.items} /> : <EmptyState icon={Inbox} title="No messages" description="Messages from the contact form will appear here." />}
      <TablePagination page={data.page} totalPages={data.totalPages} total={data.total} />
    </>
  );
}
