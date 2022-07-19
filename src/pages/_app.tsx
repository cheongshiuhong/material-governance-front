// Types
import type { AppProps } from 'next/app';
import type { FC, ReactElement } from 'react';

// Contexts
import { Web3ContextProvider } from '@contexts/web3';

// Code
import Auth from '@features/auth';

// Styles
import '@styles/globals.css';

/**
 * The main app component.
 *
 * @param {AppProps} props - The app's props.
 * @returns {ReactElement} - The app component.
 */
const App: FC<AppProps> = ({ Component, pageProps }: AppProps): ReactElement => {
    return (
        <Web3ContextProvider>
            <Auth>
                <Component {...pageProps} />
            </Auth>
        </Web3ContextProvider>
    );
};

export default App;
