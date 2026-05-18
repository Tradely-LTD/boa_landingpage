import { useNavigate } from 'react-router-dom';

const RegistrationCTA = () => {
  const navigate = useNavigate();

  return (
    <section id="registration-cta" className="py-20 px-6">
      <div className="cta-inner max-w-7xl mx-auto rounded-3xl overflow-hidden relative">
        <img
          className="cta-parallax-img absolute w-full object-cover"
          style={{ height: 'calc(100% + 140px)', top: '-70px' }}
          src="https://images.pexels.com/photos/11025894/pexels-photo-11025894.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Golden wheat field at sunset in Africa"
        />
        <div className="absolute inset-0 bg-emerald-950/85 mix-blend-multiply" />
        <div className="relative z-10 px-8 py-20 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white font-headline mb-6">
            Ready to scale your production?
          </h2>
          <p className="text-emerald-100/80 text-lg mb-10 max-w-2xl mx-auto font-body">
            Join thousands of operators already using BOA AgriHub to secure their stock and connect to national premium markets.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="bg-harvest-gold text-emerald-950 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-500 shadow-xl transition-all active:scale-95"
            >
              Register Your Centre
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
              View Warehouse Locations
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationCTA;
