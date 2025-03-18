"use client";

import dynamic from "next/dynamic";
import { FullClientSpinner } from "./client-spinner";

export const DynamicOphEditor = dynamic(() => import("./oph-editor").then(e => e.OphEditor), {
  loading: () => <FullClientSpinner />,
  ssr: false,
});
