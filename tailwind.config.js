/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Figma palette
        bg: "#222222",
        surface: "#2E2E31",
        "surface-elevated": "#2E2E31",

        primary: "#FF2C55",
        "primary-strong": "#FF2C55",

        "text-primary": "#EFF0F4",
        "text-secondary": "#9E9FA6",
        muted: "#6B7280",

        border: "rgba(255,255,255,0.10)",

        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      borderRadius: {
        sm: "10px",
        md: "14px",
        lg: "18px",
        pill: "9999px",
      },
      spacing: {
        18: "72px",
        22: "88px",
      },
      fontSize: {
        display: ["40px", { lineHeight: "48px", fontWeight: "700" }],
        title: ["24px", { lineHeight: "30px", fontWeight: "700" }],
        body: ["16px", { lineHeight: "22px" }],
        label: ["14px", { lineHeight: "18px", fontWeight: "600" }],
        caption: ["12px", { lineHeight: "16px" }],
      },
      boxShadow: {
        // Web-only; native uses `shadow-*` presets. Keep these for parity in Expo web.
        card: "0 8px 20px rgba(0,0,0,0.35)",
        float: "0 16px 40px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};
