"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { recoveryFor, type AssistantErrorCode } from "@/lib/ai/request-state";
import InventoryInspectionLinks from "./InventoryInspectionLinks";

export default function AssistantErrorPanel({ error, code, busy, canEdit, showInspectionLinks = true, showPrepare = true, onEdit, onPrepare, onRefresh }: {
  error: string; code: AssistantErrorCode; busy: boolean; canEdit: boolean;
  showInspectionLinks?: boolean;
  showPrepare?: boolean;
  onEdit: () => void; onPrepare: () => void; onRefresh: () => void;
}) {
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { errorRef.current?.focus(); }, [error, code]);
  const recovery = recoveryFor(code);
  return <div ref={errorRef} tabIndex={-1} role="alert" className={`space-y-3 rounded-2xl border p-4 text-sm focus-visible:outline-2 focus-visible:outline-ring ${code === "REFRESH_FAILED" ? "border-warning/30 bg-warning/5" : "border-destructive/25 bg-destructive/5"}`}>
        <p className="break-words font-medium leading-relaxed [overflow-wrap:anywhere]">{error}</p>
        {["prepare", "refresh", "inspect"].includes(recovery.action) && <p className="leading-relaxed text-muted-foreground">{recovery.hint}</p>}
        <div className="flex flex-wrap gap-2">
          {recovery.action === "edit" && canEdit && <Button type="button" variant="outline" disabled={busy} onClick={onEdit}>Редагувати запит</Button>}
          {recovery.action === "prepare" && canEdit && <>{showPrepare && <Button type="button" disabled={busy} onClick={onPrepare}>Підготувати новий перегляд</Button>}<Button type="button" variant="outline" disabled={busy} onClick={onEdit}>Редагувати запит</Button></>}
          {recovery.action === "refresh" && <Button type="button" variant="outline" disabled={busy} onClick={onRefresh}>Оновити дані</Button>}
          {recovery.action === "inspect" && showInspectionLinks && <InventoryInspectionLinks />}
        </div>
      </div>;
}
