import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAction, DataTable, PageHeader, StatusBadge, TableEmpty } from "@/components/admin/AdminUI";
import { deleteEvent } from "@/actions/content.actions";
import { listEventsAdmin } from "@/lib/data/dashboard";
import { formatDateTime } from "@/lib/utils/formatDate";

export const metadata = { title: "Events" };

export default async function EventsAdminPage() {
  const events = await listEventsAdmin();
  const now = Date.now();
  return (
    <>
      <PageHeader
        title="Events"
        description="Create and manage events shown on the website calendar."
        action={
          <Button asChild>
            <Link href="/college/events/new">
              <Plus className="size-4" /> New event
            </Link>
          </Button>
        }
      />
      <DataTable head={["Event", "Category", "Starts", "Location", "Status", ""]} empty={events.length ? null : <TableEmpty message="No events yet." />}>
        {events.map((e) => {
          const past = new Date(e.endDate).getTime() < now;
          return (
            <tr key={e.id} className="hover:bg-muted/40">
              <td className="px-4 py-3 font-medium">{e.title}</td>
              <td className="px-4 py-3">{e.category}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDateTime(e.startDate)}</td>
              <td className="px-4 py-3">{e.location}</td>
              <td className="px-4 py-3">
                <StatusBadge status={!e.published ? "draft" : past ? "inactive" : "published"} label={!e.published ? "Draft" : past ? "Past" : "Upcoming"} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon-sm" aria-label="Edit">
                    <Link href={`/college/events/${e.id}`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <ConfirmAction action={deleteEvent.bind(null, e.id)} title="Delete this event?" description={e.title} />
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
