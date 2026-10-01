// ============================================================
// Scheduler do Fluxo de Leads
// Processa agendamentos vencidos (mensagens, atrasos, retries)
// a cada 15 segundos. Singleton via globalThis para sobreviver
// ao hot-reload do Next.js.
// ============================================================

const INTERVALO_MS = 15_000;

interface GlobalComScheduler {
  __fluxoSchedulerIniciado?: boolean;
  __fluxoSchedulerTimer?: ReturnType<typeof setInterval>;
}

export function iniciarSchedulerFluxos(): void {
  const g = globalThis as GlobalComScheduler;

  if (g.__fluxoSchedulerIniciado) return;
  g.__fluxoSchedulerIniciado = true;

  const tick = async () => {
    try {
      // Import dinâmico: evita circular dependency e só carrega no servidor
      const { processarAgendamentosUseCase } = await import("@/core/container");
      const resultado = await processarAgendamentosUseCase.execute();

      if (resultado.processadas > 0 || resultado.erros > 0) {
        console.log(
          `[fluxo-scheduler] processadas=${resultado.processadas} erros=${resultado.erros}`
        );
      }
    } catch (e) {
      console.error("[fluxo-scheduler] erro no tick:", e);
    }
  };

  g.__fluxoSchedulerTimer = setInterval(tick, INTERVALO_MS);

  // Não impede o processo de encerrar (ex.: testes)
  if (typeof g.__fluxoSchedulerTimer.unref === "function") {
    g.__fluxoSchedulerTimer.unref();
  }

  console.log(`[fluxo-scheduler] iniciado (intervalo ${INTERVALO_MS / 1000}s)`);
}

export function pararSchedulerFluxos(): void {
  const g = globalThis as GlobalComScheduler;
  if (g.__fluxoSchedulerTimer) {
    clearInterval(g.__fluxoSchedulerTimer);
    g.__fluxoSchedulerTimer = undefined;
  }
  g.__fluxoSchedulerIniciado = false;
}
