import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./action-link.module.css";

type ActionLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  href: string;
  variant?: "primary" | "secondary";
};

export function ActionLink({
  className = "",
  variant = "secondary",
  children,
  ...props
}: ActionLinkProps) {
  return (
    <Link data-field-reactive className={`${styles.link} ${styles[variant]} ${className}`} {...props}>
      {children}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
