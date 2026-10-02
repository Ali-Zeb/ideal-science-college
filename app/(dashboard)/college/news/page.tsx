import Link from "next/link";
import { Eye, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAction, DataTable, PageHeader, SearchBox, StatusBadge, TableEmpty, TablePagination } from "@/components/admin/AdminUI";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { deleteNews } from "@/actions/content.actions";
import { listNewsAdmin } from "@/lib/data/dashboard";
import { formatDate } from "@/lib/utils/formatDate";

export const metadata = { title: "News" };

export default async function NewsAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const data = await listNewsAdmin(sp.q, sp.page);
  return (
    <>
      <PageHeader
        title="News & announcements"
        description="Write, publish and manage news posts."
        action={
          <Button asChild>
            <Link href="/college/news/new">
              <Plus className="size-4" /> New post
            </Link>
          </Button>
        }
      />
      <div className="mb-5">
        <SearchBox placeholder="Search by title" />
      </div>
      <DataTable head={["Title", "Category", "Status", "Views", "Date", ""]} empty={data.items.length ? null : <TableEmpty message="No news posts yet." />}>
        {data.items.map((n) => (
          <tr key={n.id} className="hover:bg-muted/40">
            <td className="max-w-md px-4 py-3">
              <p className="truncate font-medium">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.author?.name ?? "—"}</p>
            </td>
            <td className="px-4 py-3">{n.category}</td>
            <td className="px-4 py-3">
              <StatusBadge status={n.published ? "published" : "draft"} />
            </td>
            <td className="px-4 py-3 tabular-nums">{n.views}</td>
            <td className="px-4 py-3 text-muted-foreground">{formatDate(n.publishedAt ?? n.createdAt)}</td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <PublishToggle id={n.id} published={n.published} />
                {n.published ? (
                  <Button asChild variant="ghost" size="icon-sm" aria-label="View on website">
                    <Link href={`/news/${n.slug}`} target="_blank">
                      <Eye className="size-4" />
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="ghost" size="icon-sm" aria-label="Edit">
                  <Link href={`/college/news/${n.id}`}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
                <ConfirmAction action={deleteNews.bind(null, n.id)} title="Delete this post?" description={n.title} />
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
      <TablePagination page={data.page} totalPages={data.totalPages} total={data.total} />
    </>
  );
}
