import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";

export function Section({
  className,
  containerClassName,
  ...props
}: React.HTMLAttributes<HTMLElement> & { containerClassName?: string }) {
  return (
    <section className={cn("py-14 md:py-20", className)} {...props}>
      <Container className={containerClassName}>{props.children}</Container>
    </section>
  );
}

