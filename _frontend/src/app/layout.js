import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './globals.css';

import ThemeRegistry from './ThemeRegistry';

// use the ThemeRegistry component inside the RootLayout component, so that the custom theme is shared between pages
export default function RootLayout(props) {
  const { children } = props;
  return (
    <html lang='ro'>
      <body>
        <ThemeRegistry options={{ key: 'mui' }}>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
