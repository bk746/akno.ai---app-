import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./akno.css";

export const metadata: Metadata = {
  title: "Akno",
  description:
    "Assistante téléphonique IA pour artisans — appels, agenda et assistant.",
  applicationName: "Akno",
};

export const viewport: Viewport = {
  themeColor: "#0B1426",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export default function RootLayout({ children }: LayoutProps<"/">) {
  const aknoEnv = JSON.stringify({
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  });

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@300,400,500,600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__AKNO_ENV=${aknoEnv}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
