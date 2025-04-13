import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#e6f5ff" },
          100: { value: "#b3daff" },
          200: { value: "#80c0ff" },
          300: { value: "#4da6ff" },
          400: { value: "#1a8cff" },
          500: { value: "#0073e6" },
          600: { value: "#0059b3" },
          700: { value: "#004080" },
          800: { value: "#00264d" },
          900: { value: "#000d1a" },
        },
      },
      fonts: {
        heading: { value: "Poppins, sans-serif" },
        body: { value: "Inter, sans-serif" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);