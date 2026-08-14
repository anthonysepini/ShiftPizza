import { CalendarPlus } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import RequestError from "../../components/ui/RequestError";
import Spinner from "../../components/ui/Spinner";
import ToastContainer from "../../components/ui/Toast";
import ScheduleCalendarGrid from "../../features/schedules/admin/ScheduleCalendarGrid";
import ScheduleDayModal from "../../features/schedules/admin/ScheduleDayModal";
import ScheduleToolbar from "../../features/schedules/admin/ScheduleToolbar";
import { useAdminSchedule } from "../../features/schedules/admin/useAdminSchedule";
import { useToast } from "../../hooks/useToast";

export default function SchedulePage() {
  const {
    year,
    month,
    monthLabel,
    days,
    employees,

    filterEmployeeId,
    setFilterEmployeeId,

    loading,
    error,
    generating,
    saving,

    selected,
    editStatus,
    editNote,

    setEditStatus,
    setEditNote,

    metrics,

    load,
    previousMonth,
    nextMonth,
    selectDay,
    closeSelectedDay,
    generateMonth,
    saveSelectedDay,
  } = useAdminSchedule();

  const {
    toasts,
    toast,
    remove,
  } = useToast();

  const handleGenerate = async () => {
    try {
      const result =
        await generateMonth();

      toast(
        `✅ ${result.created} dias criados para ${monthLabel}`,
        "success",
      );
    } catch {
      toast(
        "Não foi possível gerar a escala. Tente novamente.",
        "error",
      );
    }
  };

  const handleSave = async () => {
    try {
      await saveSelectedDay();

      toast(
        "Dia atualizado com sucesso!",
        "success",
      );
    } catch {
      toast(
        "Erro ao atualizar dia.",
        "error",
      );
    }
  };

  return (
    <div className="animate-in flex h-[calc(100vh-1rem)] flex-col gap-0.5">
      <PageHeader
        title="Escala mensal"
        subtitle="Visualize e edite a agenda da equipe."
      />

      <ScheduleToolbar
        monthLabel={monthLabel}
        employees={employees}
        filterEmployeeId={
          filterEmployeeId
        }
        onFilterChange={
          setFilterEmployeeId
        }
        loading={loading}
        error={error}
        generating={generating}
        metrics={metrics}
        onPreviousMonth={
          previousMonth
        }
        onNextMonth={nextMonth}
        onRefresh={() =>
          void load()
        }
        onGenerate={() =>
          void handleGenerate()
        }
      />

      {loading ? (
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[26px] border border-white/10 bg-[#070707]/90 shadow-[0_18px_70px_rgba(0,0,0,0.38)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

          <Spinner size="lg" />
        </div>
      ) : error ? (
        <RequestError
          title="Não foi possível carregar a escala"
          description="Não foi possível confirmar se existe uma escala para este período. Tente novamente antes de gerar ou editar dados."
          onRetry={() =>
            void load()
          }
        />
      ) : days.length === 0 ? (
        <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-[26px] border border-white/10 bg-[#070707]/90 shadow-[0_18px_70px_rgba(0,0,0,0.38)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

          <div className="pointer-events-none absolute -right-20 top-0 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative flex w-full items-center justify-center p-6">
            <EmptyState
              icon="📅"
              title="Escala não gerada para este período"
              description={`Clique em "Gerar escala" para criar automaticamente os dias de ${monthLabel} com base nas regras semanais de cada funcionário.`}
              action={
                <Button
                  type="button"
                  leftIcon={
                    <CalendarPlus
                      size={14}
                    />
                  }
                  onClick={() =>
                    void handleGenerate()
                  }
                  loading={
                    generating
                  }
                >
                  Gerar escala de{" "}
                  {monthLabel}
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <ScheduleCalendarGrid
          year={year}
          month={month}
          monthLabel={monthLabel}
          days={days}
          onSelectDay={
            selectDay
          }
        />
      )}

      <ScheduleDayModal
        selected={selected}
        status={editStatus}
        note={editNote}
        saving={saving}
        onStatusChange={
          setEditStatus
        }
        onNoteChange={
          setEditNote
        }
        onClose={
          closeSelectedDay
        }
        onSave={() =>
          void handleSave()
        }
      />

      <ToastContainer
        toasts={toasts}
        remove={remove}
      />
    </div>
  );
}
