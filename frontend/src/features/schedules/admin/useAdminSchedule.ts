import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { employeesService } from "../../../services/employees.service";
import { schedulesService } from "../../../services/schedules.service";
import type {
  Employee,
  ScheduleDay,
  ScheduleStatus,
} from "../../../types";
import {
  getCurrentPeriod,
  getMonthLabel,
  getNextPeriod,
  getPreviousPeriod,
  type CalendarPeriod,
} from "../calendar";

export function useAdminSchedule() {
  const [period, setPeriod] = useState<CalendarPeriod>(() =>
    getCurrentPeriod(),
  );

  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filterEmployeeId, setFilterEmployeeId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [selected, setSelected] =
    useState<ScheduleDay | null>(null);

  const [editStatus, setEditStatus] =
    useState<ScheduleStatus>("SCHEDULED");

  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);

  const requestIdRef = useRef(0);

  const { year, month } = period;

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(false);

    try {
      const [scheduleDays, employeeList] = await Promise.all([
        schedulesService.getMonthSchedule(
          year,
          month,
          filterEmployeeId || undefined,
        ),
        employeesService.findAll(),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setDays(scheduleDays);
      setEmployees(employeeList);
    } catch {
      if (requestId === requestIdRef.current) {
        setError(true);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [year, month, filterEmployeeId]);

  useEffect(() => {
    void load();

    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);

  const previousMonth = useCallback(() => {
    setSelected(null);
    setPeriod((current) => getPreviousPeriod(current));
  }, []);

  const nextMonth = useCallback(() => {
    setSelected(null);
    setPeriod((current) => getNextPeriod(current));
  }, []);

  const selectDay = useCallback((day: ScheduleDay) => {
    setSelected(day);
    setEditStatus(day.status);
    setEditNote(day.note ?? "");
  }, []);

  const closeSelectedDay = useCallback(() => {
    setSelected(null);
  }, []);

  const generateMonth = useCallback(async () => {
    setGenerating(true);

    try {
      const result = await schedulesService.generateMonth({
        year,
        month,
      });

      await load();

      return result;
    } finally {
      setGenerating(false);
    }
  }, [year, month, load]);

  const saveSelectedDay = useCallback(async () => {
    if (!selected) {
      return;
    }

    setSaving(true);

    try {
      await schedulesService.updateDay(selected.id, {
        status: editStatus,
        note: editNote,
      });

      setSelected(null);

      await load();
    } finally {
      setSaving(false);
    }
  }, [selected, editStatus, editNote, load]);

  const metrics = useMemo(() => {
    const totalScheduled = days.filter(
      (day) => day.status === "SCHEDULED",
    ).length;

    const totalChanges = days.filter(
      (day) => day.status !== "SCHEDULED",
    ).length;

    const visibleEmployees = filterEmployeeId
      ? employees.some(
            (employee) =>
              employee.id === filterEmployeeId,
          )
        ? 1
        : 0
      : employees.length;

    return {
      records: days.length,
      employees: visibleEmployees,
      scheduled: totalScheduled,
      changes: totalChanges,
    };
  }, [days, employees, filterEmployeeId]);

  return {
    year,
    month,
    monthLabel: getMonthLabel(year, month),

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
  };
}
