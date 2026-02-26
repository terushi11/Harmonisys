import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import ChatWidget from '@/components/chatbot/ChatWidget';

const geistSans = localFont({
    src: './fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900',
});
const geistMono = localFont({
    src: './fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900',
});

export const metadata: Metadata = {
    title: 'Harmonisys',
    description:
        'An integrated web-based platform for Disaster Risk Reduction and Management (DRRM) that incorporates multiple DRRM tools.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
                <ChatWidget />
            </body>
        </html>
    );
}
