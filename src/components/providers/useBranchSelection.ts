"use client";

import { useEffect, useState } from "react";

import { hasStringId, readStoredJson, useMountLayoutEffect, writeStoredJson } from "@/components/providers/storage";
import { BranchDirectory } from "@/domain/branch/BranchDirectory";
import { branchRepository } from "@/infrastructure";
import type { Branch } from "@/types";

const ACTIVE_BRANCH_KEY = "la-barra-branch";
const BRANCHES_KEY = "la-barra-branches";

const readBranches = () => {
  const stored = readStoredJson<unknown>(BRANCHES_KEY, []);
  return Array.isArray(stored) ? (stored.filter(hasStringId) as Branch[]) : [];
};

/**
 * Sucursales (en tiempo real, con copia local) y la sucursal elegida.
 * La copia local se lee después de montar para no romper la hidratación.
 */
export function useBranchSelection() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [branchesLive, setBranchesLive] = useState(false);

  useMountLayoutEffect(() => {
    setBranches(readBranches());
    setActiveBranch(readStoredJson<Branch | null>(ACTIVE_BRANCH_KEY, null, hasStringId));
  }, []);

  useEffect(
    () =>
      branchRepository.subscribeAll((next) => {
        setBranches(next);
        setBranchesLive(true);
        writeStoredJson(BRANCHES_KEY, next);
      }),
    []
  );

  useEffect(() => {
    if (activeBranch) writeStoredJson(ACTIVE_BRANCH_KEY, activeBranch);
  }, [activeBranch?.id]);

  // Mantiene la sucursal al día; si ya no existe, usa la preferida.
  useEffect(() => {
    if (!branches.length) return;
    const fresh = activeBranch ? branches.find((branch) => branch.id === activeBranch.id) : null;
    if (fresh) {
      if (JSON.stringify(fresh) !== JSON.stringify(activeBranch)) setActiveBranch(fresh);
      return;
    }
    if (!activeBranch || branchesLive) setActiveBranch(BranchDirectory.preferred(branches));
  }, [activeBranch, branches, branchesLive]);

  return { branches, activeBranch, setBranches, setActiveBranch };
}
