import Card from "../../components/ui/Card";
import type { AuditLog } from "../../types";
import {
  formatShortDate,
  formatTime,
  getAuditActionConfig,
} from "./audit-presentation";

interface Props {
  logs: AuditLog[];
}

export default function AuditTimeline({
  logs,
}: Props) {
  return (
    <Card className="relative overflow-hidden border border-white/10 bg-[#070707] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_80px_rgba(0,0,0,0.42)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />

      <div className="border-b border-white/8 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Timeline do sistema
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
              Últimas ações
              registradas
            </h2>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.45)]" />

            {logs.length} evento
            {logs.length === 1
              ? ""
              : "s"}{" "}
            carregado
            {logs.length === 1
              ? ""
              : "s"}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        {logs.map((log) => {
          const config =
            getAuditActionConfig(
              log,
            );

          return (
            <div
              key={log.id}
              className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-[#000000] px-4 py-4 transition-all duration-200 hover:border-orange-500/20"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-200 group-hover:via-orange-500/30" />

              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-lg ${config.iconClass}`}
                >
                  {config.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${config.pillClass}`}
                        >
                          {
                            config.label
                          }
                        </span>

                        <span className="hidden text-slate-600 sm:inline">
                          •
                        </span>

                        <p className="truncate text-sm font-medium text-slate-200">
                          {log.actor
                            ?.employee
                            ?.fullName ??
                            "Usuário removido"}
                        </p>
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        {config.description(
                          log,
                        )}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {formatShortDate(
                            log.createdAt,
                          )}
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-300">
                          {formatTime(
                            log.createdAt,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
