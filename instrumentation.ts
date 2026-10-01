// Next.js instrumentation — roda uma vez quando o servidor inicia.
// Inicia o scheduler do Fluxo de Leads (disparos agendados + retry).

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { iniciarSchedulerFluxos } = await import("./lib/fluxo-scheduler");
    iniciarSchedulerFluxos();
  }
}
