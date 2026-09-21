import type { ComponentPropsWithoutRef } from "react";
import { Container } from "./container";
import styles from "./section.module.css";
import { LivingInterface } from "@/features/living-interface/living-interface";
import type { VisualIdentity } from "@/features/living-interface/presets";

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  "aria-labelledby": string;
  visual?: VisualIdentity;
};

export function Section({ children, className = "", visual, ...props }: SectionProps) {
  return (
    <section className={`${styles.section} ${className}`} data-living-region={visual} {...props}>
      <Container>{visual && <LivingInterface identity={visual} />}{children}</Container>
    </section>
  );
}
