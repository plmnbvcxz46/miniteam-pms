import type { ComponentPropsWithRef } from "react";
import { Tabs as RadixTabs } from "radix-ui";
import styles from "./Tabs.module.css";

export type TabsProps = ComponentPropsWithRef<typeof RadixTabs.Root>;

export function Tabs({ className, ref, ...rest }: TabsProps) {
  return (
    <RadixTabs.Root
      ref={ref}
      className={className ? `${styles.root} ${className}` : styles.root}
      {...rest}
    />
  );
}

export type TabsListProps = ComponentPropsWithRef<typeof RadixTabs.List>;

export function TabsList({ className, ref, ...rest }: TabsListProps) {
  return (
    <RadixTabs.List
      ref={ref}
      className={className ? `${styles.list} ${className}` : styles.list}
      {...rest}
    />
  );
}

export type TabsTriggerProps = ComponentPropsWithRef<typeof RadixTabs.Trigger>;

export function TabsTrigger({ className, ref, ...rest }: TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      ref={ref}
      className={className ? `${styles.trigger} ${className}` : styles.trigger}
      {...rest}
    />
  );
}

export type TabsContentProps = ComponentPropsWithRef<typeof RadixTabs.Content>;

export function TabsContent({ className, ref, ...rest }: TabsContentProps) {
  return (
    <RadixTabs.Content
      ref={ref}
      className={className ? `${styles.content} ${className}` : styles.content}
      {...rest}
    />
  );
}
