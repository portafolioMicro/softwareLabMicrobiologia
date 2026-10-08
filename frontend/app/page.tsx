import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { QuienesSomos } from "@/components/quienes-somos";
import { Especialidades } from "@/components/especialidades";
import { Calidad } from "@/components/calidad";
import { Sectores } from "@/components/sectores";
import { ComoSolicitar } from "@/components/como-solicitar";
import { Portafolio } from "@/components/portafolio";
import { Contacto } from "@/components/contacto";
import { Footer } from "@/components/footer";
import { WhatsappFloat } from "@/components/whatsapp-float";

export default function Home() {
  return (
    <>
      <Header />
      <main className="w-full pt-20 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <Hero />
          <QuienesSomos />
          <Especialidades />
          <Calidad />
          <Sectores />
          <ComoSolicitar />
          <Portafolio />
          <Contacto />
        </div>
      </main>
      <WhatsappFloat />
      <Footer />
    </>
  );
}