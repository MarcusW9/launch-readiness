import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { DEMO_SESSION } from "../../auth/mock-provider";
import { SessionProvider } from "../../auth/session-context";
import type { Session } from "../../auth/types";
import { NotificationsProvider } from "../notifications";
import { LaunchProvider } from "../store";
import type { Product } from "../types";

/**
 * Renders a screen inside the real in-memory store, seeded with the given
 * products, signed in as the demo editor unless another session is given.
 */
export function renderWithStore(ui: ReactElement, products: Product[], session: Session | null = DEMO_SESSION) {
  return render(
    <SessionProvider session={session}>
      <LaunchProvider initialProducts={products}>
        <NotificationsProvider>{ui}</NotificationsProvider>
      </LaunchProvider>
    </SessionProvider>,
  );
}
