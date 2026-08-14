import { UserPlus } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";
import RequestError from "../../components/ui/RequestError";
import Spinner from "../../components/ui/Spinner";
import ToastContainer from "../../components/ui/Toast";
import {
  DeleteConfirmModal,
  MarkAbsenceModal,
} from "../../features/employees/EmployeeDialogs";
import EmployeeFormModals from "../../features/employees/EmployeeFormModals";
import EmployeeInsights from "../../features/employees/EmployeeInsights";
import EmployeeOverviewCards from "../../features/employees/EmployeeOverviewCards";
import EmployeeTeamPanel from "../../features/employees/EmployeeTeamPanel";
import { useEmployeesPage } from "../../features/employees/useEmployeesPage";
import { useToast } from "../../hooks/useToast";

export default function EmployeesPage() {
  const { toasts, toast, remove } = useToast();
  const {
    employees,
    filtered,
    loading,
    loadError,
    search,
    setSearch,
    metrics,
    form,
    setForm,
    saving,
    modalCreate,
    modalEdit,
    modalAbsence,
    modalDelete,
    setModalEdit,
    setModalAbsence,
    setModalDelete,
    load,
    openCreateModal,
    closeCreateModal,
    handleCpfChange,
    toggleCreateWorkday,
    toggleEditWorkday,
    handleCreate,
    handleUpdate,
    handleToggle,
  } = useEmployeesPage(toast);

  if (loading) {
    return (
      <div className="animate-in w-full space-y-6">
        <PageHeader
          title="Funcionários"
          subtitle="Gerencie a equipe e as escalas semanais"
        />
        <div className="flex min-h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="animate-in w-full space-y-6">
        <PageHeader
          title="Funcionários"
          subtitle="Gerencie a equipe e as escalas semanais"
        />
        <RequestError
          title="Não foi possível carregar os funcionários"
          onRetry={() => void load()}
        />
      </div>
    );
  }

  return (
    <div className="animate-in mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-385 flex-col space-y-6 2xl:max-w-420">
      <PageHeader
        title="Funcionários"
        subtitle="Gerencie a equipe e as escalas semanais"
        action={
          <Button
            leftIcon={<UserPlus size={14} />}
            size="sm"
            onClick={openCreateModal}
          >
            Novo funcionário
          </Button>
        }
      />

      <EmployeeOverviewCards
        total={employees.length}
        active={metrics.activeCount}
        inactive={metrics.inactiveCount}
        withPhoto={metrics.photoCount}
      />

      <section className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:items-stretch">
        <EmployeeTeamPanel
          employees={filtered}
          search={search}
          onSearchChange={setSearch}
          onCreate={openCreateModal}
          onMarkAbsence={setModalAbsence}
          onEdit={setModalEdit}
          onToggle={(employee) => void handleToggle(employee)}
          onDelete={setModalDelete}
          onPhotoError={(message) => toast(message, "error")}
        />

        <EmployeeInsights
          total={employees.length}
          active={metrics.activeCount}
          inactive={metrics.inactiveCount}
          weekdayLoad={metrics.weekdayLoad}
          strongestDay={metrics.strongestDay}
        />
      </section>

      <EmployeeFormModals
        createOpen={modalCreate}
        editEmployee={modalEdit}
        form={form}
        saving={saving}
        setForm={setForm}
        setEditEmployee={setModalEdit}
        onCloseCreate={closeCreateModal}
        onCpfChange={handleCpfChange}
        onToggleCreateWorkday={toggleCreateWorkday}
        onToggleEditWorkday={toggleEditWorkday}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <MarkAbsenceModal
        employee={modalAbsence}
        open={!!modalAbsence}
        onClose={() => setModalAbsence(null)}
        onSuccess={() => void load()}
        toast={toast}
      />

      <DeleteConfirmModal
        employee={modalDelete}
        open={!!modalDelete}
        onClose={() => setModalDelete(null)}
        onSuccess={() => void load()}
        toast={toast}
      />

      <ToastContainer toasts={toasts} remove={remove} />
    </div>
  );
}
