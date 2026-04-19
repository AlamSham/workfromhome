export type SearchParamValue = string | string[] | undefined;

export interface JobFilterState {
  seniority: string;
  experience: string;
  minSalary: string;
}

export const DEFAULT_JOB_FILTERS: JobFilterState = {
  seniority: "",
  experience: "",
  minSalary: "",
};

export const JOB_FILTER_QUERY_KEYS = ["seniority", "experience", "minSalary"] as const;

export const SENIORITY_OPTIONS = [
  { value: "", label: "Any level" },
  { value: "internship", label: "Internship" },
  { value: "entry-level", label: "Entry level" },
  { value: "mid-level", label: "Mid level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "staff", label: "Staff" },
  { value: "principal", label: "Principal" },
  { value: "director", label: "Director+" },
] as const;

export const EXPERIENCE_OPTIONS = [
  { value: "", label: "Any experience" },
  { value: "0-2", label: "0-2 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "6-plus", label: "6+ years" },
] as const;

export const MIN_SALARY_OPTIONS = [
  { value: "", label: "Any salary" },
  { value: "50000", label: "$50k+" },
  { value: "75000", label: "$75k+" },
  { value: "100000", label: "$100k+" },
  { value: "150000", label: "$150k+" },
] as const;

export function getSearchParamValue(value: SearchParamValue): string {
  if (Array.isArray(value)) {
    return String(value[0] || "");
  }

  return String(value || "");
}

export function normalizeJobFilters(filters: Partial<JobFilterState> = {}): JobFilterState {
  return {
    seniority: String(filters.seniority || "").trim().toLowerCase(),
    experience: String(filters.experience || "").trim().toLowerCase(),
    minSalary: String(filters.minSalary || "").trim(),
  };
}

export function readJobFilters(searchParams: Record<string, SearchParamValue>): JobFilterState {
  return normalizeJobFilters({
    seniority: getSearchParamValue(searchParams?.seniority),
    experience: getSearchParamValue(searchParams?.experience),
    minSalary: getSearchParamValue(searchParams?.minSalary),
  });
}

export function applyJobFiltersToParams(params: URLSearchParams, filters: JobFilterState): URLSearchParams {
  const normalized = normalizeJobFilters(filters);

  if (normalized.seniority) {
    params.set("seniority", normalized.seniority);
  } else {
    params.delete("seniority");
  }

  if (normalized.experience) {
    params.set("experience", normalized.experience);
  } else {
    params.delete("experience");
  }

  if (normalized.minSalary) {
    params.set("minSalary", normalized.minSalary);
  } else {
    params.delete("minSalary");
  }

  return params;
}

export function clearJobFiltersFromParams(params: URLSearchParams): URLSearchParams {
  for (const key of JOB_FILTER_QUERY_KEYS) {
    params.delete(key);
  }

  return params;
}

export function hasActiveJobFilters(filters: Partial<JobFilterState> = {}): boolean {
  const normalized = normalizeJobFilters(filters);
  return Boolean(normalized.seniority || normalized.experience || normalized.minSalary);
}
