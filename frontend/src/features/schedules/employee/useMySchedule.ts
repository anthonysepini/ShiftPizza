import {
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { schedulesService } from "../../../services/schedules.service";
import type { ScheduleDay } from "../../../types";
import {
  getCivilDateKey,
  getLocalDateInputValue,
} from "../../../utils/civil-date";
import {
  getCurrentPeriod,
  getMonthLabel,
  getNextPeriod,
  getPreviousPeriod,
  type CalendarPeriod,
} from "../calendar";

interface State {
  loading: boolean;
  days: ScheduleDay[];
  error: boolean;
}

type Action =
  | { type: "loading" }
  | {
      type: "success";
      payload: ScheduleDay[];
    }
  | { type: "error" };

function reducer(
  state: State,
  action: Action,
): State {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        loading: true,
        error: false,
      };

    case "success":
      return {
        loading: false,
        days: action.payload,
        error: false,
      };

    case "error":
      return {
        loading: false,
        days: [],
        error: true,
      };

    default:
      return state;
  }
}

export function useMySchedule() {
  const [period, setPeriod] =
    useState<CalendarPeriod>(() =>
      getCurrentPeriod(),
    );

  const [reloadKey, setReloadKey] =
    useState(0);

  const [
    { loading, days, error },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    days: [],
    error: false,
  });

  const { year, month } = period;

  const todayKey =
    getLocalDateInputValue();

  useEffect(() => {
    let cancelled = false;

    dispatch({
      type: "loading",
    });

    schedulesService
      .getMySchedule(
        year,
        month,
      )
      .then((data) => {
        if (!cancelled) {
          dispatch({
            type: "success",
            payload: data,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          dispatch({
            type: "error",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    year,
    month,
    reloadKey,
  ]);

  const sortedDays =
    useMemo(() => {
      return [...days].sort(
        (first, second) =>
          getCivilDateKey(
            first.date,
          ).localeCompare(
            getCivilDateKey(
              second.date,
            ),
          ),
      );
    }, [days]);

  const dayMap = useMemo(() => {
    return new Map<
      string,
      ScheduleDay
    >(
      sortedDays.map((day) => [
        getCivilDateKey(
          day.date,
        ),
        day,
      ]),
    );
  }, [sortedDays]);

  const summary =
    useMemo(() => {
      return sortedDays.reduce(
        (accumulator, day) => {
          if (
            day.status ===
            "SCHEDULED"
          ) {
            accumulator.scheduled +=
              1;
          }

          if (
            day.status ===
            "ABSENT"
          ) {
            accumulator.absent += 1;
          }

          if (
            getCivilDateKey(
              day.date,
            ) >= todayKey &&
            (day.status ===
              "SCHEDULED" ||
              day.status ===
                "EXTRA_SHIFT")
          ) {
            accumulator.upcoming +=
              1;
          }

          return accumulator;
        },
        {
          scheduled: 0,
          absent: 0,
          upcoming: 0,
        },
      );
    }, [
      sortedDays,
      todayKey,
    ]);

  const previousMonth = () => {
    setPeriod((current) =>
      getPreviousPeriod(current),
    );
  };

  const nextMonth = () => {
    setPeriod((current) =>
      getNextPeriod(current),
    );
  };

  const reload = () => {
    setReloadKey(
      (current) => current + 1,
    );
  };

  return {
    year,
    month,

    monthLabel:
      getMonthLabel(
        year,
        month,
      ),

    todayKey,

    loading,
    error,

    days,
    sortedDays,
    dayMap,
    summary,

    previousMonth,
    nextMonth,
    reload,
  };
}
