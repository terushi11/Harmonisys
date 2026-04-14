import { HeroUIProvider } from '@heroui/react';
import Header from '@/components/Header';
import Footer from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';
import HowTo from '@/components/landing/HowTo';
import Feature from '@/components/landing/Feature';
import Carousel from '@/components/landing/carousel/Carousel';
import ChatWidget from '@/components/chatbot/ChatWidget';
import { auth } from '@/lib/auth';

const Home = async () => {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <HeroUIProvider>
      <Header session={session} />

      <main>
        <Hero session={session} />
        <HowTo />
        <Carousel isAuthenticated={isAuthenticated} />
        <Feature />
      </main>

      <Footer isAuthenticated={isAuthenticated} />

      {/* Floating chatbot */}
      <ChatWidget />
    </HeroUIProvider>
  );
};

export default Home;
