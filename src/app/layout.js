import Script from 'next/script'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DataMoiton',
  description: 'General Video by your Datas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <div className="container">
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-98EHF8GGMM"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-98EHF8GGMM');
            `}
          </Script>
          <script async src="https://analytics.umami.is/script.js" data-website-id="745420a0-b78f-45be-b4ea-237a5585dfed"></script>
        </div>
      </body>
    </html>
  )
}
