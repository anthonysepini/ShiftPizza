import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type { ToastItem } from "../../components/ui/Toast";
import { employeesService } from "../../services/employees.service";
import { schedulesService } from "../../services/schedules.service";
import type {
  CreateEmployeeDto,
  Employee,
  UpdateEmployeeDto,
} from "../../types";
import { getEmployeePhoto, WEEKDAYS } from "./employee-data";

type Toast = (message: string, type?: ToastItem["type"]) => void;

const createEmptyEmployeeForm = (): CreateEmployeeDto => ({
  fullName: "",
  cpf: "",
  phone: "",
  position: "",
  password: "",
  workDays: [],
});

const onlyDigits = (value: string) => value.replace(/\D/g, "");

function getApiErrorMessage(
  error: unknown,
  fallback = "Erro ao cadastrar funcionário.",
): string {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      response?: {
        data?: {
          message?: unknown;
        };
      };
      message?: unknown;
    };

    const apiMessage = maybeError.response?.data?.message;

    if (Array.isArray(apiMessage) && apiMessage.length > 0) {
      const firstMessage = apiMessage[0];
      if (typeof firstMessage === "string" && firstMessage.trim()) {
        return firstMessage;
      }
    }

    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return apiMessage;
    }

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
  }

  return fallback;
}

export function useEmployeesPage(toast: Toast) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState<Employee | null>(null);
  const [modalAbsence, setModalAbsence] = useState<Employee | null>(null);
  const [modalDelete, setModalDelete] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateEmployeeDto>(createEmptyEmployeeForm);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);

    try {
      const data = await employeesService.findAll();
      setEmployees(data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return employees;
    }

    return employees.filter(
      (employee) =>
        employee.fullName.toLowerCase().includes(normalizedSearch) ||
        employee.position.toLowerCase().includes(normalizedSearch),
    );
  }, [employees, search]);

  const metrics = useMemo(() => {
    const activeCount = employees.filter((employee) => employee.isActive).length;
    const inactiveCount = employees.length - activeCount;
    const photoCount = employees.filter((employee) =>
      Boolean(getEmployeePhoto(employee.id)),
    ).length;

    const weekdayLoad = WEEKDAYS.map((label, weekday) => ({
      label,
      count: employees.filter((employee) =>
        employee.weeklyRules.some(
          (rule) => rule.weekday === weekday && rule.shouldWork,
        ),
      ).length,
    }));

    const strongestDay = weekdayLoad.reduce(
      (best, current) => (current.count > best.count ? current : best),
      { label: WEEKDAYS[0], count: 0 },
    );

    return {
      activeCount,
      inactiveCount,
      photoCount,
      weekdayLoad,
      strongestDay,
    };
  }, [employees]);

  const resetForm = useCallback(() => {
    setForm(createEmptyEmployeeForm());
  }, []);

  const openCreateModal = useCallback(() => {
    setModalCreate(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setModalCreate(false);
    resetForm();
  }, [resetForm]);

  const autoGenerateSchedule = async () => {
    const now = new Date();
    await schedulesService.generateMonth({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
  };

  const handleCpfChange = (value: string) => {
    const cpfDigits = onlyDigits(value).slice(0, 11);

    setForm((previous) => ({
      ...previous,
      cpf: cpfDigits,
    }));
  };

  const toggleCreateWorkday = (day: number) => {
    setForm((current) => ({
      ...current,
      workDays: current.workDays.includes(day)
        ? current.workDays.filter((workday) => workday !== day)
        : [...current.workDays, day],
    }));
  };

  const toggleEditWorkday = (day: number) => {
    setModalEdit((employee) => {
      if (!employee) {
        return null;
      }

      const active = employee.weeklyRules.some(
        (rule) => rule.weekday === day && rule.shouldWork,
      );

      return {
        ...employee,
        weeklyRules: active
          ? employee.weeklyRules.filter((rule) => rule.weekday !== day)
          : [
              ...employee.weeklyRules,
              {
                id: "",
                employeeId: employee.id,
                weekday: day,
                shouldWork: true,
              },
            ],
      };
    });
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();

    const cpfDigits = onlyDigits(form.cpf);

    if (form.password.length < 6) {
      toast("A senha deve conter no mínimo 6 caracteres.", "error");
      return;
    }

    if (cpfDigits.length !== 11) {
      toast("O CPF deve conter exatamente 11 dígitos.", "error");
      return;
    }

    if (form.workDays.length === 0) {
      toast("Selecione ao menos um dia de trabalho.", "error");
      return;
    }

    setSaving(true);

    try {
      await employeesService.create({
        ...form,
        cpf: cpfDigits,
      });

      closeCreateModal();
      await load();

      try {
        await autoGenerateSchedule();
        toast("Funcionário cadastrado e escala do mês atualizada.", "success");
      } catch {
        toast(
          "Funcionário cadastrado, mas não foi possível sincronizar a escala do mês.",
          "error",
        );
      }
    } catch (error) {
      toast(getApiErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();

    if (!modalEdit) {
      return;
    }

    const dto: UpdateEmployeeDto = {
      fullName: modalEdit.fullName,
      phone: modalEdit.phone,
      position: modalEdit.position,
      workDays: modalEdit.weeklyRules
        .filter((rule) => rule.shouldWork)
        .map((rule) => rule.weekday),
    };

    setSaving(true);

    try {
      await employeesService.update(modalEdit.id, dto);
      setModalEdit(null);
      await load();

      try {
        await autoGenerateSchedule();
        toast("Dados atualizados e escala do mês sincronizada.", "success");
      } catch {
        toast(
          "Dados atualizados, mas não foi possível sincronizar a escala do mês.",
          "error",
        );
      }
    } catch (error) {
      toast(getApiErrorMessage(error, "Erro ao atualizar."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (employee: Employee) => {
    try {
      await employeesService.toggleActive(employee.id, !employee.isActive);
      toast(
        `${employee.fullName} ${employee.isActive ? "desativado" : "ativado"}.`,
        employee.isActive ? "info" : "success",
      );
      await load();
    } catch (error) {
      toast(getApiErrorMessage(error, "Erro ao alterar status."), "error");
    }
  };

  return {
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
  };
}
