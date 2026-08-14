import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import RequestError from "../../components/ui/RequestError";
import Spinner from "../../components/ui/Spinner";
import AuditMetrics from "../../features/audit/AuditMetrics";
import AuditTimeline from "../../features/audit/AuditTimeline";
import {
  ACTION_CONFIG,
  formatFullDateTime,
  getAuditActionConfig,
  isAuditToday,
} from "../../features/audit/audit-presentation";
import { auditService } from "../../services/audit.service";
import type { AuditLog } from "../../types";

export default function AuditPage() {
  const [logs, setLogs] =
    useState<AuditLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const load =
    useCallback(async () => {
      setLoading(true);
      setError(false);

      try {
        const data =
          await auditService.findAll(
            100,
          );

        setLogs(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const metrics =
    useMemo(() => {
      const total =
        logs.length;

      const today =
        logs.filter((log) =>
          isAuditToday(
            log.createdAt,
          ),
        ).length;

      const generatedMonths =
        logs.filter(
          (log) =>
            log.action ===
            "GENERATE_MONTH",
        ).length;

      const latest =
        logs.reduce<
          AuditLog | null
        >(
          (
            latestLog,
            currentLog,
          ) => {
            if (!latestLog) {
              return currentLog;
            }

            return new Date(
              currentLog.createdAt,
            ).getTime() >
              new Date(
                latestLog.createdAt,
              ).getTime()
              ? currentLog
              : latestLog;
          },
          null,
        );

      return {
        total,
        today,
        generatedMonths,
        latest,
      };
    }, [logs]);

  const latestConfig =
    metrics.latest
      ? getAuditActionConfig(
          metrics.latest,
        )
      : null;

  return (
    <div className="animate-in min-h-full w-full bg-[#000000] text-white">
      <div className="space-y-6 rounded-[28px] border border-white/6 bg-[#000000] p-0">
        <PageHeader
          title="Histórico"
          subtitle="Todas as ações realizadas no sistema"
        />

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <RequestError
            title="Não foi possível carregar o histórico"
            onRetry={() =>
              void load()
            }
          />
        ) : logs.length ===
          0 ? (
          <Card>
            <div className="flex min-h-[260px] items-center justify-center">
              <EmptyState
                icon="📋"
                title="Nenhuma ação registrada"
                description="As ações do admin aparecem aqui."
              />
            </div>
          </Card>
        ) : (
          <>
            <AuditMetrics
              total={
                metrics.total
              }
              today={
                metrics.today
              }
              generatedMonths={
                metrics.generatedMonths
              }
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <AuditTimeline
                logs={logs}
              />

              <div className="space-y-4">
                <Card className="relative overflow-hidden border border-white/10 bg-[#000000] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_55px_rgba(0,0,0,0.34)]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />

                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Última movimentação
                    </p>

                    {metrics.latest &&
                    latestConfig ? (
                      <div className="mt-3 space-y-3">
                        <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-sm font-medium text-white">
                            {
                              latestConfig.label
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {formatFullDateTime(
                              metrics
                                .latest
                                .createdAt,
                            )}
                          </p>

                          <p className="mt-3 text-xs leading-relaxed text-slate-500">
                            {latestConfig.description(
                              metrics.latest,
                            )}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-400">
                        Nenhuma
                        movimentação
                        recente.
                      </p>
                    )}
                  </div>
                </Card>

                <Card className="relative overflow-hidden border border-white/10 bg-[#000000] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_55px_rgba(0,0,0,0.34)]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />

                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Tipos de ação
                    </p>

                    <div className="mt-4 space-y-3">
                      {Object.entries(
                        ACTION_CONFIG,
                      ).map(
                        ([
                          key,
                          config,
                        ]) => (
                          <div
                            key={
                              key
                            }
                            className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] p-3"
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-base ${config.iconClass}`}
                            >
                              {
                                config.icon
                              }
                            </div>

                            <div className="min-w-0">
                              <p
                                className={`text-sm font-medium ${config.color}`}
                              >
                                {
                                  config.label
                                }
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
