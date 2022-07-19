// Types
import type { NextPage } from 'next';
import type { ReactElement } from 'react';

// Libraries
import Head from 'next/head';

// Code
import Layout from '@components/layout';
import Navigation from '@features/navigation';
import Overview from '@features/overview';

/**
 * The home page.
 *
 * @returns {ReactElement} - The home page component.
 */
const HomePage: NextPage = (): ReactElement => {
    return (
        <div className="h-screen w-screen">
            <Head>
                <title>Material Governance</title>
                <meta name="description" content="Material Governance" />
                {/* Favicon here */}
                {/* <link rel="stylesheet" href="/translucent_logo.jpg" /> */}
            </Head>
            <Layout>
                <div className="h-full w-full flex flex-col items-center justify-center space-y-12">
                    <Navigation />
                    <Overview />
                </div>
            </Layout>
        </div>
    );
};

export default HomePage;
