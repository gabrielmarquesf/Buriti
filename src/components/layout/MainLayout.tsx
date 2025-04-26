import Navbar from './Navbar';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
            <footer className="bg-white border-t border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Casa Buriti - Todos os direitos reservados
                    </p>
                </div>
            </footer>
        </div>
    );
} 