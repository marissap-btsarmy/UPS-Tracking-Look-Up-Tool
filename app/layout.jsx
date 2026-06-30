import './globals.css'

export const metadata = {
  title: 'WorldShip Cost Lookup',
  description: 'Look up UPS shipping costs by tracking number',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
