"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CART_STORAGE_KEY as STORAGE_KEY,
  EMPTY_CART as EMPTY,
  authoritativeAfterSync,
  cartSignature,
  mergeCarts,
  readStoredCart,
  reconcileAfterWrite,
  shouldPersist,
  summarise,
  writeStoredCart,
  type CartLine,
  type CartSummary,
} from "@/lib/cart-merge";

export type { CartLine, CartSummary } from "@/lib/cart-merge";

const SYNC_DELAY = 250;

type AddPayload = Omit<CartLine, "lineTotalCents" | "quantity"> & { quantity?: number };

type CartContextValue = {
  cart: CartSummary;
  hydrated: boolean;
  isOpen: boolean;
  busyProductId: number | null;
  notice: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (payload: AddPayload, options?: { openDrawer?: boolean }) => Promise<boolean>;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
  /** Pushes the current basket to the server and returns the authoritative cart. */
  sync: () => Promise<CartSummary>;
  dismissNotice: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartSummary>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [busyProductId, setBusyProductId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const cartRef = useRef(cart);
  const mutationSeq = useRef(0);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  /**
   * Single place where the basket is mirrored to the browser.
   *
   * CRITICAL: this must not run before hydration has read the stored basket.
   * Effects run in declaration order, and this one is declared *before* the
   * hydration effect — so on a fresh page load it would otherwise write the
   * empty initial cart over the saved basket and wipe it. Guarding on
   * `hydrated` closes that hole; a deliberate `clear()` still persists,
   * because by then hydration has long finished.
   */
  useEffect(() => {
    if (!shouldPersist(cart, hydrated)) return;
    writeStoredCart(window.localStorage, cart);
  }, [cart, hydrated]);

  useEffect(
    () => () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const flash = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3200);
  }, []);

  /**
   * Applies an updater and mirrors it into `cartRef` immediately, so any code
   * that runs before React re-renders (a server response landing in the same
   * tick) still sees the freshest basket and cannot merge against a stale one.
   * Assigning an idempotent value to a ref here is safe.
   */
  const apply = useCallback((updater: (current: CartSummary) => CartSummary) => {
    setCart((current) => {
      const next = updater(current);
      cartRef.current = next;
      return next;
    });
  }, []);

  const sync = useCallback(async (): Promise<CartSummary> => {
    const current = cartRef.current;
    const lines = current.lines
      .filter((line) => line.quantity > 0)
      .map((line) => ({ productId: line.productId, quantity: line.quantity }));

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const data = (await response.json()) as { ok: boolean; cart?: CartSummary };
      if (data.ok && data.cart) {
        // The server has just seen exactly these lines, so its answer is
        // authoritative: anything it dropped no longer exists or has sold out.
        // That is what stops a line saved before a catalogue change from
        // lingering in the basket forever and blocking checkout.
        const next = authoritativeAfterSync(data.cart, cartRef.current);
        cartRef.current = next;
        setCart(next);
        return next;
      }
    } catch {
      /* offline: the local basket survives and we will retry on the next change */
    }
    return current;
  }, []);

  const scheduleSync = useCallback(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      void sync();
    }, SYNC_DELAY);
  }, [sync]);

  /* ---------------- hydrate, then reconcile with the server ---------------- */
  useEffect(() => {
    let cancelled = false;
    const startedAt = mutationSeq.current;

    const local = readStoredCart(window.localStorage);
    // Commit to the ref before the state update so the merge below can never
    // run against the pre-hydration (empty) basket.
    if (local) {
      cartRef.current = local;
      setCart(local);
    }

    (async () => {
      try {
        const response = await fetch("/api/cart", { cache: "no-store" });
        const data = (await response.json()) as { ok: boolean; cart?: CartSummary };
        if (cancelled || !data.ok || !data.cart) return;
        // A mutation started while we were asking the server: this answer is stale.
        if (mutationSeq.current !== startedAt) return;

        const merged = mergeCarts(data.cart, cartRef.current);
        cartRef.current = merged;
        setCart(merged);

        if (cartSignature(data.cart) !== cartSignature(merged)) scheduleSync();
      } catch {
        /* offline: keep whatever we have locally */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scheduleSync]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    async (payload: AddPayload, options: { openDrawer?: boolean } = {}) => {
      const quantity = Math.max(1, payload.quantity ?? 1);
      const line: CartLine = {
        ...payload,
        quantity,
        lineTotalCents: payload.priceCents * quantity,
      };

      mutationSeq.current += 1;
      apply((current) => {
        const existing = current.lines.find((item) => item.productId === payload.productId);
        if (!existing) return summarise([...current.lines, line], current.id);
        const ceiling = Math.max(payload.stock, 1);
        const merged = {
          ...existing,
          quantity: Math.min(existing.quantity + quantity, ceiling),
        };
        merged.lineTotalCents = merged.priceCents * merged.quantity;
        return summarise(
          current.lines.map((item) => (item.productId === payload.productId ? merged : item)),
          current.id,
        );
      });

      setBusyProductId(payload.productId);
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: payload.productId, quantity }),
        });
        const data = (await response.json()) as {
          ok: boolean;
          cart?: CartSummary;
          error?: string;
        };

        if (data.ok && data.cart) {
          const { cart: next, diverged } = reconcileAfterWrite(data.cart, cartRef.current);
          apply(() => next);
          if (diverged) scheduleSync();
          if (options.openDrawer !== false) setIsOpen(true);
          return true;
        }

        flash(data.error ?? "We could not add that work to your cart.");
        return false;
      } catch {
        flash("Network hiccup — please try again.");
        return true; // keep the locally reserved line; it will sync when we reconnect
      } finally {
        setBusyProductId(null);
      }
    },
    [apply, flash, scheduleSync],
  );

  const setQuantity = useCallback(
    (productId: number, quantity: number) => {
      mutationSeq.current += 1;
      apply((current) => {
        if (quantity <= 0) {
          return summarise(
            current.lines.filter((line) => line.productId !== productId),
            current.id,
          );
        }
        return summarise(
          current.lines.map((line) =>
            line.productId === productId
              ? {
                  ...line,
                  quantity,
                  lineTotalCents: line.priceCents * quantity,
                }
              : line,
          ),
          current.id,
        );
      });
      scheduleSync();
    },
    [apply, scheduleSync],
  );

  const removeItem = useCallback(
    (productId: number) => {
      mutationSeq.current += 1;
      setBusyProductId(productId);
      apply((current) =>
        summarise(
          current.lines.filter((line) => line.productId !== productId),
          current.id,
        ),
      );
      scheduleSync();
      setBusyProductId(null);
    },
    [apply, scheduleSync],
  );

  const clear = useCallback(() => {
    mutationSeq.current += 1;
    apply(() => EMPTY);
    scheduleSync();
  }, [apply, scheduleSync]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      hydrated,
      isOpen,
      busyProductId,
      notice,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clear,
      sync,
      dismissNotice: () => setNotice(null),
    }),
    [
      cart,
      hydrated,
      isOpen,
      busyProductId,
      notice,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clear,
      sync,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
