import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seen / Read — João Pedro Machado Moura",
  description: "Personal log of films, books, series, plays and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="max-w-2xl mx-auto px-5 py-10">
        <div className="masthead">
          <p className="masthead-eyebrow">✦ personal record of ✦</p>
          <h1>Seen / Read</h1>
          <p className="masthead-byline">João Pedro Machado Moura</p>
          <div className="masthead-rule">
            <span className="masthead-rule-line" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--text-mute)" }}>
              {new Date().getFullYear()}
            </span>
            <span className="masthead-rule-line" />
          </div>
        </div>

        {children}

        <footer className="site-footer">✦ seen · read · watched ✦</footer>
      </body>
    </html>
  );
}