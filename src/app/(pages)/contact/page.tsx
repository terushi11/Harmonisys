import Header from '@/components/Header';
import { auth } from '@/lib/auth';
import ContactCard from '@/components/ContactCard';

const ContactPage = async () => {
    const session = await auth();

    return (
        <div className="min-h-screen flex flex-col">
            <Header session={session} />
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
                <ContactCard />
            </div>
        </div>
    );
};

export default ContactPage;
