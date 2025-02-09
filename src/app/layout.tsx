// app/layout.tsx (or _app.js depending on your Next.js version)
import type { Metadata } from "next";
import { Poppins, Manrope } from "next/font/google"; 
import "./globals.css"; 

// Define the fonts
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"], 
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "600", "700"], 
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Add the Lufga CDN link here */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Lufga&display=swap"
        />
      </head>
      <body
        className={`${poppins.variable} ${manrope.variable} antialiased`}
        style={{
          fontFamily: "var(--font-poppins), var(--font-manrope), 'Lufga', sans-serif",
        }}
      >
   
          {children}
     
      </body>
    </html>
  );
}
