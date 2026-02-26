import React from 'react';
import Header from '@/components/Header';
import FAQ from '@/components/redas/FAQ';
import { auth } from '@/lib/auth';
import { FAQ_DATA } from '@/constants';

const FAQPage = async () => {
    const session = await auth();

    return (
        <div>
            <Header session={session} />
            <FAQ data={FAQ_DATA} />
        </div>
    );
};

export default FAQPage;
