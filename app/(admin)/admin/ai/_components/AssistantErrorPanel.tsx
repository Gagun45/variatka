"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { recoveryFor, type AssistantErrorCode } from "@/lib/ai/request-state";
import InventoryInspectionLinks from "./InventoryInspectionLinks";

export default function AssistantErrorPanel({ error, code, busy, canEdit, showInspectionLinks = true, onEdit, onPrepare, onRefresh }: {
  error: string; code: AssistantErrorCode; busy: boolean; canEdit: boolean;
  showInspectionLinks?: boolean;
  onEdit: () => void; onPrepare: () => void; onRefresh: () => void;
}) {
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { errorRef.current?.focus(); }, [error, code]);
  const recovery = recoveryFor(code);
  return <div ref={errorRef} tabIndex={-1} role="alert" className={`space-y-3 rounded-xl border p-4 focus-visible:outline-2 focus-visible:outline-ring ${code === "REFRESH_FAILED" ? "" : "border-destructive"}`}>
        <p className="font-medium">{error}</p>
        <p className="text-sm text-muted-foreground">{recovery.hint}</p>
        <div className="flex flex-wrap gap-2">
          {recovery.action === "edit" && canEdit && <Button type="button" variant="outline" disabled={busy} onClick={onEdit}>Редагувати запит</Button>}
          {recovery.action === "prepare" && canEdit && <><Button type="button" disabled={busy} onClick={onPrepare}>Підготувати новий перегляд</Button><Button type="button" variant="outline" disabled={busy} onClick={onEdit}>Редагувати запит</Button></>}
          {recovery.action === "refresh" && <Button type="button" variant="outline" disabled={busy} onClick={onRefresh}>Оновити дані</Button>}
          {recovery.action === "inspect" && showInspectionLinks && <InventoryInspectionLinks />}
        </div>
      </div>;
}
