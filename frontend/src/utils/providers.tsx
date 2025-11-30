"use client";
import { store } from "@/src/store";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "@/components/ui/theme-provider";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </Provider>
  );
}
