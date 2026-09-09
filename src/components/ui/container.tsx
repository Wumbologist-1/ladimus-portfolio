import type { ComponentPropsWithoutRef } from "react";
import styles from "./container.module.css";

export function Container({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={`${styles.container} ${className}`} {...props} />;
}
