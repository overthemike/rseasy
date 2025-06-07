import { ReactNode } from 'react';

export default function RootLayout({ children }: { children?: ReactNode }) {
  return (
    <html>
      <head>
        <title>RSEasy Example</title>
      </head>
      <body>
        <div id="root">
          <header>
            <h1>RSEasy Protocol Demo</h1>
            <nav>
              <a href="/">Home</a> | <a href="/products">Products</a> | <a href="/users">Users</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}