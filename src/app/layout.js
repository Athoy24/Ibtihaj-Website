import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import CartSidebar from '@/components/Cart/CartSidebar';
import MetaPixel from '@/components/MetaPixel';

export const metadata = {
    title: 'Ibtihaj',
    description: 'Premium Tea from Bangladesh',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <MetaPixel />
                <CartProvider>
                    <Navbar />
                    <CartSidebar />
                    <main>
                        {children}
                    </main>
                    <Footer />
                </CartProvider>
            </body>
        </html>
    );
}
