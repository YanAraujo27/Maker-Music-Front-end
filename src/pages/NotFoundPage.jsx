
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center text-white p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        className="glassmorphic p-10 md:p-16 rounded-2xl shadow-2xl max-w-lg w-full"
      >
        <AlertTriangle className="h-24 w-24 text-yellow-400 mx-auto mb-8 animate-pulse" />
        <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">Página Não Encontrada</h2>
        <p className="text-lg text-gray-300 mb-10">
          Oops! Parece que a página que você está procurando não existe ou foi movida.
        </p>
        <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold py-3 px-8 text-lg transform hover:scale-105 transition-transform duration-300">
          <Link to="/">
            <Home className="mr-2 h-5 w-5" />
            Voltar para a Página Inicial
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
  