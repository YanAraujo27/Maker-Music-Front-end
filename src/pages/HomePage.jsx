import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Music, Users, ShieldCheck, Zap } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const smallLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/50471f55-a4f0-420c-88c5-9ed9c934e78e/85fad80f75746bc80f597d83786c3f62.png";


  const FeatureCard = ({ icon, title, description, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glassmorphic p-8 rounded-xl shadow-2xl flex flex-col items-center text-center border border-primary/30 hover:border-primary/70 transition-all"
    >
      <div className="bg-gradient-to-br from-primary to-yellow-600 p-4 rounded-full mb-6 inline-block shadow-lg">
        {React.cloneElement(icon, { className: "h-10 w-10 text-black" })}
      </div>
      <h2 className="text-3xl font-bold text-primary mb-4">{title}</h2>
      <p className="text-foreground leading-relaxed">{description}</p>
    </motion.div>
  );

  const dashboardPath = isAuthenticated ? `/${user.role}-dashboard` : '/login';

  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-foreground py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
        className="text-center mb-16"
      >
        <img src={smallLogoUrl} alt="Maker Music Logo" className="h-28 w-28 mx-auto mb-6 object-contain" />
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
          Portal <span className="text-primary">Maker Music</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Sua jornada musical começa aqui! Aulas, acompanhamento e comunidade em um só lugar.
        </p>
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-yellow-400 transform hover:scale-105 transition-transform duration-300 shadow-lg text-lg py-3 px-8" asChild>
          <Link to={dashboardPath}>
            {isAuthenticated ? 'Acessar Meu Painel' : 'Fazer Login'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-10 max-w-6xl w-full">
        <FeatureCard
          icon={<Music />}
          title="Alunos"
          description="Acesse suas aulas, partituras, materiais e converse com seu professor de música."
          delay={0.2}
        />
        <FeatureCard
          icon={<Users />}
          title="Professores"
          description="Gerencie alunos, agende aulas, envie materiais e acompanhe o progresso musical."
          delay={0.4}
        />
        <FeatureCard
          icon={<ShieldCheck />}
          title="Responsáveis"
          description="Acompanhe a evolução do aluno, pagamentos e comunique-se com a escola."
          delay={0.6}
        />
      </div>
       <div className="mt-20 text-center w-full max-w-4xl">
         <img 
            alt="Palco vibrante com instrumentos musicais e luzes coloridas, simbolizando a energia da escola de música." 
            className="w-full rounded-lg shadow-xl border-2 border-primary/50" src="https://images.unsplash.com/photo-1631903234610-c25aed8d104c" />
      </div>
    </div>
  );
};

export default HomePage;