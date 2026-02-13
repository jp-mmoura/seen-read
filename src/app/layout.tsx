import "./globals.css";

export const metadata = {
  title: "Seen / Read by João Pedro Machado Moura",
  description: "Personal log of films, books, and media in general.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold">Seen / Read</h1>
            <p className="text-gray-600">João Pedro Machado Moura</p>
        </header>
        {children}
      </body>
    </html>
  );
}
