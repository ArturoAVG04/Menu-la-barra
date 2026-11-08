"use client";

import { useEffect, useMemo, useState } from "react";

import type { Branch } from "@/types";

/** Sucursal que el admin está viendo. Si desaparece, elige la principal (o la primera). */
export function useAdminBranchSelection(branches: Branch[]) {
  const [adminBranchId, setAdminBranchId] = useState("");

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === adminBranchId) ?? null,
    [adminBranchId, branches]
  );

  useEffect(() => {
    if (!branches.length) {
      setAdminBranchId("");
      return;
    }

    setAdminBranchId((current) =>
      current && branches.some((branch) => branch.id === current)
        ? current
        : (branches.find((branch) => branch.isPrimary) ?? branches[0]).id
    );
  }, [branches]);

  return { adminBranchId, setAdminBranchId, selectedBranch };
}
