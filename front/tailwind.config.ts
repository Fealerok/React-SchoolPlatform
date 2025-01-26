import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'main-bg': "var(--main-bg)",
        'additional-bg': "var(--additional-bg)",
        'dark-blue': "var(--dark-blue)"
      },
    },
  },
  plugins: [],
} satisfies Config;
