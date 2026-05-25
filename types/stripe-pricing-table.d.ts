import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          "pricing-table-id": string;
          "publishable-key": string;
          "customer-email"?: string;
          "client-reference-id"?: string;
        },
        HTMLElement
      >;
    }
  }
}
