
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, ShieldAlert } from 'lucide-react';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="glassmorphic p-10 md:p-16 rounded-2xl shadow-2xl max-w-md w-full"
      >
        <ShieldAlert className="h-24 w-24 text-red-500 mx-auto mb-8" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-6">
          Acesso Negado
        </h1>
        <p className="text-lg text-gray-300 mb-10">
          Você não tem permissão para acessar esta página.
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

export default UnauthorizedPage;
  