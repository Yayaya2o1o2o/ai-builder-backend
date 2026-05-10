import { api } from "encore.dev/api";
import { convertAll, generateNames, VALID_STYLES, type ConvertResult } from "./logic";

interface ConvertRequest {
  input: string;
}

interface GenerateRequest {
  style: string;
  count?: number;
}

interface GenerateResponse {
  style: string;
  suggestions: string[];
  availableStyles: string[];
}

export const convert = api(
  { expose: true, method: "POST", path: "/naming/convert" },
  async ({ input }: ConvertRequest): Promise<ConvertResult> => convertAll(input)
);

export const generate = api(
  { expose: true, method: "POST", path: "/naming/generate" },
  async ({ style, count }: GenerateRequest): Promise<GenerateResponse> => ({
    style: VALID_STYLES.includes(style) ? style : "startup",
    suggestions: generateNames(style, count ?? 5),
    availableStyles: VALID_STYLES,
  })
);
