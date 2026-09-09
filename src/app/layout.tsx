import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { site } from "@/config/site";
import "@/styles/globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: { default: site.title, template: "%s | Ladimus" },
  description: site.description,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={styles.body}>
        <a className={styles.skipLink} href="#main-content">Skip to main content</a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className={styles.main}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
