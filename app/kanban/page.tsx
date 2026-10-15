"use client";

import { useState } from "react";
import { GitBranch, LayoutGrid } from "lucide-react";
import KanbanPosVenda from "@/components/KanbanPosVenda";
import LinhaTempoBoard from "@/components/fluxo/LinhaTempoBoard";

export default function TimelinePage() {
  const [visualizacao, setVisualizacao] = useState<"timeline" | "kanban">(
    "timeline"
  );

  return (
    <div className="space-y-5">
      <nav
        aria-label="Visualização da jornada"
        className="flex w-fit items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--white)] p-1 shadow-sm"
      >
        <button
          type="button"
          aria-pressed={visualizacao === "timeline"}
          onClick={() => setVisualizacao("timeline")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            visualizacao === "timeline"
              ? "bg-[var(--inset)] text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--inset)]"
          }`}
        >
          <GitBranch className="h-4 w-4" />
          Timeline
        </button>
        <button
          type="button"
          aria-pressed={visualizacao === "kanban"}
          onClick={() => setVisualizacao("kanban")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            visualizacao === "kanban"
              ? "bg-[var(--inset)] text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--inset)]"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Kanban legado
        </button>
      </nav>

      {visualizacao === "timeline" ? <LinhaTempoBoard /> : <KanbanPosVenda />}
    </div>
  );
}