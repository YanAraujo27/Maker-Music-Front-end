import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-black text-muted-foreground py-8 mt-auto border-t border-primary/50"
    >
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {currentYear} Portal Escolar Integrado. Todos os direitos reservados.
        </p>
        <p className="text-xs mt-2">
          Uma solução <span className="text-primary font-semibold">Hostinger Horizons</span>
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;