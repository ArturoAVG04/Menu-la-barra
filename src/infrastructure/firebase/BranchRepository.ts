import { collection, doc, onSnapshot, setDoc, type Firestore } from "firebase/firestore";

import { FirestoreRepository, logListenError, type ListenError, type Unsubscribe } from "@/infrastructure/firebase/FirestoreRepository";
import type { Branch, BrandingSettings } from "@/types";

/** Sucursales y su configuración visual (branding). */
export class BranchRepository extends FirestoreRepository {
  constructor(private readonly db: Firestore) {
    super();
  }

  subscribeAll(callback: (branches: Branch[]) => void, onError: ListenError = logListenError): Unsubscribe {
    return onSnapshot(collection(this.db, "sucursales"), (snapshot) => {
      callback(snapshot.docs.map((item) => this.toEntity<Branch>(item)));
    }, onError);
  }

  save(branch: Branch) {
    return setDoc(doc(this.db, "sucursales", branch.id), { ...branch }, { merge: true });
  }


  subscribeBranding(branchId: string, callback: (settings: BrandingSettings | null) => void): Unsubscribe {
    return onSnapshot(doc(this.db, "branding", branchId), (snapshot) => {
      callback(snapshot.exists() ? (snapshot.data() as BrandingSettings) : null);
    });
  }

  saveBranding(branchId: string, settings: BrandingSettings) {
    return setDoc(doc(this.db, "branding", branchId), settings, { merge: true });
  }
}
