import React from 'react';
import Hero from '../../components/home/Hero';
import Brands from '../../components/home/Brands';
import Experience from '../../components/home/Experience';
import VehicleCatalog from '../../components/catalog/VehicleCatalog';
import PublicidadSAVS from '../../components/PublicidadSAVS/PublicidadSAVS';
import FacebookPromo from '../../components/FacebookPromo/FacebookPromo';
import { useHomeLogica } from './HomeLogica';

const Home = () => {
  const { motorCatalogo, kilometrajeCatalogo, tipoCatalogo, anioCatalogo } = useHomeLogica();

  return (
    <main className="home-main">
      <Hero />
      
      <Brands />
      
      <section className="section-spacing">
        <Experience />
      </section>
      
      <section className="section-spacing">
        <PublicidadSAVS />
      </section>

      <div className="container" style={{ paddingBottom: '5rem', marginTop: '4rem' }}>
        <section className="home-ad-section">
          <FacebookPromo type="banner" className="home-large-ad" reverse={true} />
        </section>
      </div>
    </main>
  );
};

export default Home;
