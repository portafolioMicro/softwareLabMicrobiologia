// import { Header } from "@/components/header";
// import { Hero } from "@/components/hero";
// import { QuienesSomos } from "@/components/quienes-somos";
// import { Especialidades } from "@/components/especialidades";
// import { Calidad } from "@/components/calidad";
// import { Sectores } from "@/components/sectores";
// import { ComoSolicitar } from "@/components/como-solicitar";
// import { Portafolio } from "@/components/portafolio";
// import { Contacto } from "@/components/contacto";
// import { Footer } from "@/components/footer";
// import { WhatsappFloat } from "@/components/whatsapp-float";

// export default function Home() {
//   return (
//     <>
//       <Header />
//       <main className="w-full pt-20 bg-surface min-h-screen">
//         <div className="flex flex-col w-full">
//           <Hero />
//           <QuienesSomos />
//           <Especialidades />
//           <Calidad />
//           <Sectores />
//           <ComoSolicitar />
//           <Portafolio />
//           <Contacto />
//         </div>
//       </main>
//       <WhatsappFloat />
//       <Footer />
//     </>
//   );
// }

"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="scroll-smooth bg-[#fcfdfd] font-sans text-clinical-900 antialiased selection:bg-[#bd181b] selection:text-white">
      
      {/* ========================================== */}
      {/* NAVBAR MINIMALISTA & PRECISO               */}
      {/* ========================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/88 backdrop-blur-md border-b border-slate-200/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Logo Institucional Refinado */}
          <a className="flex items-center gap-3.5 group" href="#inicio">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden p-1 shadow-sm border border-slate-200">
              <img 
                src="/logo-unilibre.png" 
                alt="Logo Universidad Libre Pereira" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold tracking-widest text-slate-900 uppercase">UNILIBRE</span>
                <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-semibold">Pereira</span>
              </div>
              <span className="text-[11px] text-slate-500 font-normal tracking-tight">Laboratorio de Microbiología</span>
            </div>
          </a>

          {/* Navegación Sobria */}
          <nav className="hidden lg:flex items-center gap-8">
            <a className="text-[13px] font-medium text-slate-600 hover:text-[#bd181b] transition-colors" href="#quienes-somos">Nosotros</a>
            <a className="text-[13px] font-medium text-slate-600 hover:text-[#bd181b] transition-colors" href="#especialidades">Áreas Analíticas</a>
            <a className="text-[13px] font-medium text-slate-600 hover:text-[#bd181b] transition-colors" href="#sectores">Sectores</a>
            <a className="text-[13px] font-medium text-slate-600 hover:text-[#bd181b] transition-colors" href="#proceso">Protocolo de Servicio</a>
            <a className="text-[13px] font-medium text-slate-600 hover:text-[#bd181b] transition-colors" href="#portafolio">Portafolio</a>
          </nav>

          {/* Acción Principal y Enlace al Panel */}
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-[13px] font-semibold tracking-wide text-slate-700 hover:text-[#bd181b] px-3 py-2 transition-colors border border-slate-200 rounded-lg hover:border-[#bd181b]/40"
            >
              Iniciar Sesión
            </Link>
            <a 
              className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-semibold tracking-wide uppercase text-white bg-[#bd181b] hover:bg-[#95000c] rounded-sm transition-all duration-200 shadow-sm" 
              href="https://wa.me/573042280489" 
              rel="noopener noreferrer" 
              target="_blank"
            >
              <span>Solicitar Cotización</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </a>
          </div>

        </div>
      </header>

      <main className="w-full">
        {/* ========================================== */}
        {/* HERO EDITORIAL & HIGHLIGHT                 */}
        {/* ========================================== */}
        <section className="relative pt-36 pb-20 lg:pt-44 lg:pb-32 overflow-hidden bg-white" id="inicio">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              <div className="lg:col-span-7 flex flex-col items-start">
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bd181b]"></span>
                  ISO/IEC 17025:2017 • Seccional Pereira
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-light leading-[1.12] tracking-tighter text-slate-900 mb-6">
                  Rigor analítico y certeza microbiológica para la <span className="font-semibold text-[#bd181b]">toma de decisiones</span>.
                </h1>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl font-normal mb-8">
                  Laboratorio especializado adscrito a la Facultad de Ciencias de la Salud, Exactas y Naturales. Ensayos con validación de métodos bajo estándares internacionales de calidad y bioseguridad.
                </p>
                <div className="flex flex-wrap items-center gap-4 mb-14">
                  <a className="inline-flex items-center gap-2 bg-slate-900 text-white text-[13px] font-medium px-6 py-3.5 rounded-sm hover:bg-[#bd181b] transition-colors duration-200" href="#especialidades">
                    <span>Explorar Especialidades</span>
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  </a>
                  <a className="inline-flex items-center gap-2 text-slate-700 hover:text-[#bd181b] border border-slate-200 hover:border-[#bd181b]/40 bg-white text-[13px] font-medium px-6 py-3.5 rounded-sm transition-all duration-200" href="#portafolio">
                    <span>Descargar Ficha Técnica PDF</span>
                  </a>
                </div>

                {/* Indicadores Clave */}
                <div className="w-full pt-8 border-t border-slate-200 grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-slate-900">17025</p>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">Norma de Gestión</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-slate-900">015865</p>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">Resolución MEN</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-slate-900">100%</p>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">Trazabilidad</p>
                  </div>
                </div>
              </div>

              {/* Imagen Heroica con Enmarcado Puro */}
              <div className="lg:col-span-5 relative">
                <div className="relative bg-slate-100 rounded-sm overflow-hidden border border-slate-200 shadow-lg">
                  <img 
                    alt="Análisis microbiológico bajo microscopio óptico en Universidad Libre" 
                    className="w-full h-[480px] lg:h-[520px] object-cover filter contrast-[1.03]" 
                    src="https://images.unsplash.com/photo-1579165466741-7f35e4755660?q=80&w=1000&auto=format&fit=crop" 
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm p-5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#bd181b]">Campus Belmonte</p>
                      <p className="text-[13px] font-semibold text-slate-900">Edificio de Ciencias de la Salud • Piso 1</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* QUIÉNES SOMOS & PILARES ESENCIALES         */}
        {/* ========================================== */}
        <section className="py-24 lg:py-32 bg-[#fafbfc] border-y border-slate-200" id="quienes-somos">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] uppercase tracking-widest text-[#bd181b] font-bold block mb-3">Identidad &amp; Enfoque</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 tracking-tight leading-snug">
                Garantizamos la competencia técnica y la reproducibilidad mediante metodologías normalizadas y ética institucional.
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mt-5">
                El Laboratorio de Microbiología de la Universidad Libre Seccional Pereira opera bajo lineamientos de la norma internacional ISO/IEC 17025:2017. Servimos al sector agroindustrial, comercial y de servicios de la región cafetera con ensayos precisos que blindan la inocuidad alimentaria y el bienestar comunitario.
              </p>
            </div>
            
            {/* 4 Pilares Despojados y Elegantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-7 rounded-sm border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bd181b]/30">
                <span className="material-symbols-outlined text-[#bd181b] text-2xl font-light mb-4 block">account_balance</span>
                <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase mb-2">Respaldo Unilibre</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Acreditación Institucional Multicampus de Alta Calidad por el Ministerio de Educación Nacional (Res. n.° 015865).
                </p>
              </div>
              <div className="bg-white p-7 rounded-sm border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bd181b]/30">
                <span className="material-symbols-outlined text-[#bd181b] text-2xl font-light mb-4 block">fact_check</span>
                <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase mb-2">Métodos Validados</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Protocolos armonizados con directrices internacionales (ISO, AOAC, Standard Methods y normativas sanitarias INVIMA).
                </p>
              </div>
              <div className="bg-white p-7 rounded-sm border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bd181b]/30">
                <span className="material-symbols-outlined text-[#bd181b] text-2xl font-light mb-4 block">group</span>
                <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase mb-2">Talento Calificado</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Especialistas y bacteriólogos con actualización técnica continua en aseguramiento analítico y bioseguridad.
                </p>
              </div>
              <div className="bg-white p-7 rounded-sm border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bd181b]/30">
                <span className="material-symbols-outlined text-[#bd181b] text-2xl font-light mb-4 block">lock</span>
                <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase mb-2">Custodia &amp; Trazabilidad</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Confidencialidad absoluta e informes técnicos estructurados listos para auditorías sanitarias y regulatorias.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* ÁREAS DE ANÁLISIS (ESPECIALIDADES 2x2)     */}
        {/* ========================================== */}
        <section className="py-24 lg:py-32 bg-white" id="especialidades">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div className="max-w-2xl">
                <span className="text-[11px] uppercase tracking-widest text-[#bd181b] font-bold block mb-3">Portafolio Analítico</span>
                <h2 className="text-3xl lg:text-4xl font-light text-slate-900 tracking-tight">
                  Especialidades de Laboratorio
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Evaluaciones analíticas adaptadas a materias primas, productos intermedios, producto terminado y control de ambientes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {/* Card 1: Alimentos */}
              <div className="group border border-slate-200 rounded-sm overflow-hidden bg-white hover:border-[#bd181b]/40 transition-colors duration-200 flex flex-col">
                <div className="h-60 overflow-hidden bg-slate-100 relative">
                  <img alt="Análisis microbiológico de alimentos" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95" src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-800">
                    01 • Inocuidad
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Microbiología de Alimentos</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6 font-normal">
                      Detección de patógenos e indicadores de higiene en productos terminados y materias primas: lácteos, cárnicos, panificación, granos y confitería.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Salmonella spp.</span> • <span>E. coli</span> • <span>Staph. aureus</span> • <span>Mohos y Levaduras</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Aguas */}
              <div className="group border border-slate-200 rounded-sm overflow-hidden bg-white hover:border-[#bd181b]/40 transition-colors duration-200 flex flex-col">
                <div className="h-60 overflow-hidden bg-slate-100 relative">
                  <img alt="Microbiología de aguas y fluidos" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95" src="https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=800&auto=format&fit=crop" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-800">
                    02 • Matrices Hídricas
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Microbiología de Aguas</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6 font-normal">
                      Control higiénico-sanitario para agua potable envasada, agua de red de distribución, aguas recreativas y aguas de proceso industrial.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Coliformes Totales</span> • <span>Coliformes Fecales</span> • <span>Pseudomonas</span> • <span>Mesófilos</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Higiene y Saneamiento */}
              <div className="group border border-slate-200 rounded-sm overflow-hidden bg-white hover:border-[#bd181b]/40 transition-colors duration-200 flex flex-col">
                <div className="h-60 overflow-hidden bg-slate-100 relative">
                  <img alt="Higiene y saneamiento industrial" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95" src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-800">
                    03 • Ambientes &amp; Contacto
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Higiene y Saneamiento</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6 font-normal">
                      Validación de limpieza en plantas de procesamiento: frotis de manos y garganta en manipuladores, superficies inertes y calidad ambiental.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Frotis Manos</span> • <span>Superficies Inertes</span> • <span>Placas de Sedimentación</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Asesoría Técnica */}
              <div className="group border border-slate-200 rounded-sm overflow-hidden bg-white hover:border-[#bd181b]/40 transition-colors duration-200 flex flex-col">
                <div className="h-60 overflow-hidden bg-slate-100 relative">
                  <img alt="Soluciones y planes para la industria" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95" src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-800">
                    04 • Consultoría Aplicada
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Soluciones para la Industria</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6 font-normal">
                      Diseño de planes de muestreo estadístico, monitoreo microbiológico periódico para BPM y HACCP, e interpretación pericial de resultados.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Planes de Muestreo</span> • <span>Acompañamiento BPM</span> • <span>Conceptos Técnicos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* SECTORES PRODUCTIVOS                       */}
        {/* ========================================== */}
        <section className="py-20 lg:py-28 bg-[#fafbfc] border-y border-slate-200" id="sectores">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-2xl mb-12">
              <span className="text-[11px] uppercase tracking-widest text-[#bd181b] font-bold block mb-3">Cobertura Sectorial</span>
              <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
                Respuestas específicas para cada cadena productiva.
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
              <div className="bg-white p-4 rounded-sm border border-slate-200 text-center">
                <span className="material-symbols-outlined text-slate-700 text-xl mb-1">water</span>
                <p className="text-xs font-semibold text-slate-900">Industria Láctea</p>
              </div>
              <div className="bg-white p-4 rounded-sm border border-slate-200 text-center">
                <span className="material-symbols-outlined text-slate-700 text-xl mb-1">nutrition</span>
                <p className="text-xs font-semibold text-slate-900">Cárnicos &amp; Aves</p>
              </div>
              <div className="bg-white p-4 rounded-sm border border-slate-200 text-center">
                <span className="material-symbols-outlined text-slate-700 text-xl mb-1">bakery_dining</span>
                <p className="text-xs font-semibold text-slate-900">Panadería &amp; Harinas</p>
              </div>
              <div className="bg-white p-4 rounded-sm border border-slate-200 text-center">
                <span className="material-symbols-outlined text-slate-700 text-xl mb-1">eco</span>
                <p className="text-xs font-semibold text-slate-900">Frutas &amp; Vegetales</p>
              </div>
              <div className="bg-white p-4 rounded-sm border border-slate-200 text-center">
                <span className="material-symbols-outlined text-slate-700 text-xl mb-1">local_cafe</span>
                <p className="text-xs font-semibold text-slate-900">Cafetería &amp; Bebidas</p>
              </div>
              <div className="bg-white p-4 rounded-sm border border-slate-200 text-center">
                <span className="material-symbols-outlined text-slate-700 text-xl mb-1">factory</span>
                <p className="text-xs font-semibold text-slate-900">Empaques &amp; Procesos</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <span className="material-symbols-outlined text-[#bd181b] text-2xl font-light">info</span>
                <p className="text-xs text-slate-600 leading-normal">
                  ¿Requiere ensayos para una matriz o parámetro no listado? Evaluamos su ficha técnica para establecer protocolos a la medida.
                </p>
              </div>
              <a className="text-[12px] font-semibold text-[#bd181b] hover:text-[#95000c] uppercase tracking-wider inline-flex items-center gap-1 flex-shrink-0" href="#contacto">
                <span>Consultar con Especialista</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </a>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* PROTOCOLO DE ATENCIÓN (4 PASOS)            */}
        {/* ========================================== */}
        <section className="py-24 lg:py-32 bg-white" id="proceso">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-xl mx-auto mb-20">
              <span className="text-[11px] uppercase tracking-widest text-[#bd181b] font-bold block mb-3">Flujo Operativo</span>
              <h2 className="text-3xl font-light text-slate-900 tracking-tight">
                Protocolo de Servicio en 4 Pasos
              </h2>
              <p className="text-xs text-slate-500 mt-3 font-normal">
                Garantía estricta de cadena de custodia desde la solicitud inicial hasta la emisión del certificado final.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold tracking-widest text-[#bd181b]">01</span>
                  <div className="h-[1px] flex-1 bg-slate-200"></div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Solicitud de Cotización</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Remita su requerimiento por correo o WhatsApp con la matriz a evaluar y datos de facturación (RUT / Cédula).
                </p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold tracking-widest text-[#bd181b]">02</span>
                  <div className="h-[1px] flex-1 bg-slate-200"></div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Aprobación &amp; Formalización</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Confirmación formal vía electrónica de la propuesta técnico-económica y recepción de soporte de pago.
                </p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold tracking-widest text-[#bd181b]">03</span>
                  <div className="h-[1px] flex-1 bg-slate-200"></div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Recepción de Muestra</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Entrega en laboratorio de lunes a viernes (07:30 a 17:00) bajo estricto control de cadena de frío y rotulado técnico.
                </p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold tracking-widest text-[#bd181b]">04</span>
                  <div className="h-[1px] flex-1 bg-slate-200"></div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Emisión de Resultados</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Certificado digital oficial firmado por el director técnico, entregado en los tiempos acordados.
                </p>
              </div>
            </div>
          </div>
        </section>

             
        {/* ========================================== */}
        {/* PORTAFOLIO DESCARGABLE & CALIDAD           */}
        {/* ========================================== */}
        <section className="py-20 bg-slate-900 text-white" id="portafolio">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-sm bg-white/10 text-[11px] font-medium tracking-widest text-red-200 uppercase">
                  Documentación Oficial 2026
                </div>

                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-3">
                  Portafolio Institucional de Ensayos y Alcance
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                  Consulte la descripción técnica completa de metodologías,
                  normativas aplicables y directrices de conservación de muestras
                  para envío al laboratorio.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Descargar el portafolio en PDF */}
                <a
                  href="/portafolio-servicios.pdf"
                  download="Portafolio-Servicios.pdf"
                  className="inline-flex items-center gap-2 bg-[#bd181b] hover:bg-[#95000c] text-white text-[12px] font-semibold tracking-wide uppercase px-6 py-3.5 rounded-sm transition-colors duration-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    download
                  </span>
                  <span>Descargar Portafolio PDF</span>
                </a>

                {/* Solicitar el portafolio por correo */}
                <a
                  className="inline-flex items-center gap-2 border border-slate-700 hover:border-white text-slate-200 hover:text-white text-[12px] font-semibold tracking-wide uppercase px-6 py-3.5 rounded-sm transition-colors duration-200"
                  href="mailto:portafoliomicrobiologia.pei@unilibre.edu.co?subject=Solicitud%20del%20portafolio%20institucional"
                >
                  <span className="material-symbols-outlined text-base">
                    mail
                  </span>
                  <span>Solicitar por Correo</span>
                </a>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================== */}
        {/* CONTACTO Y UBICACIÓN                       */}
        {/* ========================================== */}
        <section className="py-24 lg:py-32 bg-white" id="contacto">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-2xl mb-16">
              <span className="text-[11px] uppercase tracking-widest text-[#bd181b] font-bold block mb-3">Canales Directos</span>
              <h2 className="text-3xl font-light text-slate-900 tracking-tight">
                Contacto &amp; Recepción de Muestras
              </h2>
              <p className="text-xs text-slate-500 mt-2 font-normal">
                Estamos ubicados en el Campus Belmonte de la Universidad Libre Seccional Pereira.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 rounded-sm border border-slate-200 bg-[#fafbfc]">
                <span className="material-symbols-outlined text-slate-700 text-xl mb-3 block">location_on</span>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">Campus Belmonte</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Avenida Las Américas Carrera 28 n.° 96-102<br/>
                  Bloque C, Piso 1<br/>
                  Pereira, Risaralda
                </p>
              </div>
              <div className="p-6 rounded-sm border border-slate-200 bg-[#fafbfc]">
                <span className="material-symbols-outlined text-slate-700 text-xl mb-3 block">mail</span>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">Correo Electrónico</p>
                <p className="text-xs text-slate-600 mb-2">Para cotizaciones y trazabilidad:</p>
                <a className="text-xs font-medium text-[#bd181b] hover:underline break-all" href="mailto:portafoliomicrobiologia.pei@unilibre.edu.co">
                  portafoliomicrobiologia.pei@unilibre.edu.co
                </a>
              </div>
              <div className="p-6 rounded-sm border border-slate-200 bg-[#fafbfc]">
                <span className="material-symbols-outlined text-slate-700 text-xl mb-3 block">call</span>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">PBX Institucional</p>
                <p className="text-xs text-slate-600 mb-1">(606) 340 1043</p>
                <p className="text-xs text-slate-500">Extensión: <strong className="text-slate-900">6882</strong></p>
                <p className="text-[11px] text-slate-400 mt-2">Horario: L-V 07:30 a 17:00</p>
              </div>
              <div className="p-6 rounded-sm border border-slate-200 bg-[#fafbfc]">
                <span className="material-symbols-outlined text-slate-700 text-xl mb-3 block">chat</span>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">Líneas Móviles / WhatsApp</p>
                <div className="flex flex-col gap-1.5 mt-2">
                  <a className="text-xs font-medium text-slate-705 hover:text-[#bd181b] flex items-center gap-1.5" href="https://wa.me/573042280489" rel="noopener noreferrer" target="_blank">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> (+57) 304 228 04 89
                  </a>
                  <a className="text-xs font-medium text-slate-700 hover:text-[#bd181b] flex items-center gap-1.5" href="https://wa.me/573205748019" rel="noopener noreferrer" target="_blank">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> (+57) 320 574 80 19
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================== */}
      {/* FOOTER MINIMALISTA Y SOBRIO                */}
      {/* ========================================== */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-sm bg-[#bd181b] flex items-center justify-center text-white text-[14px]">
              <span className="material-symbols-outlined text-sm font-light">school</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 tracking-wider uppercase">Universidad Libre Seccional Pereira</span>
              <span className="text-[11px] text-slate-500">Facultad de Ciencias de la Salud, Exactas y Naturales • Vigilada Mineducación</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-xs font-semibold text-[#bd181b] hover:underline">
              Iniciar Sesión (Sistema Interno) →
            </Link>
            <div className="text-[11px] text-slate-500 text-center sm:text-right">
              <p>© 2026 Laboratorio de Microbiología. ISO/IEC 17025:2017.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================== */}
      {/* BOTÓN FLOTANTE WHATSAPP DISCRETO           */}
      {/* ========================================== */}
      <aside className="fixed bottom-6 right-6 z-40">
        <a className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-[#bd181b] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 group" href="https://wa.me/573042280489" rel="noopener noreferrer" target="_blank" title="Atención directa por WhatsApp">
          <span className="material-symbols-outlined text-[18px]">chat</span>
          <span className="text-[12px] font-medium tracking-wide">Asesor Técnico</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:bg-white animate-pulse"></span>
        </a>
      </aside>
    </div>
  );
}