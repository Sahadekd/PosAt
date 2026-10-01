"use client";

import { useState, useEffect, useRef } from "react";
import Dynamic from "next/dynamic";
import { VendedorItem, ImovelItem, OportunidadeItem } from "@/lib/segmentacao/tipos";

const OportunidadesView = Dynamic(() => import("./OportunidadesView").then((m) => m.OportunidadesView), {
  ssr: false,
  loading: () => <div className="h-64" />,
});
const VendedoresView = Dynamic(() => import("./VendedoresView").then((m) => m.VendedoresView), {
  ssr: false,
  loading: () => <div className="h-64" />,
});
const OportunidadeDetailPanel = Dynamic(() => import("./oportunidade/OportunidadeDetailPanel").then((m) => m.default), {
  ssr: false,
  loading: () => <div className="h-64" />,
});
const VendedorDetailPanel = Dynamic(() => import("./VendedorDetailPanel").then((m) => m.VendedorDetailPanel), {
  ssr: false,
  loading: () => <div className="h-64" />,
});
const OportunidadeRemoverModal = Dynamic(() => import("./oportunidade/OportunidadeRemoverModal").then((m) => m.default), {
  ssr: false,
  loading: () => <div className="h-64" />,
});
const OportunidadeConverterModal = Dynamic(() => import("./oportunidade/OportunidadeConverterModal").then((m) => m.default), {
  ssr: false,
  loading: () => <div className="h-64" />,
});

type View = "oportunidades" | "vendedores";

interface OportunidadeDetailCallbacks {
  aoAvancar?: () => void;
  aoConverter?: () => void;
  aoRemover?: () => void;
  aoReabrir?: () => void;
}

export default function OportunidadesVendedoresSlider() {
  const [view, setView] = useState<View>("oportunidades");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [detalheOportunidade, setDetalheOportunidade] = useState<{ item: OportunidadeItem; callbacks: OportunidadeDetailCallbacks } | null>(null);
  const [detalheVendedor, setDetalheVendedor] = useState<{ vendedor: VendedorItem; imoveis: ImovelItem[]; oportunidades: OportunidadeItem[] } | null>(null);
  const [removerModal, setRemoverModal] = useState<OportunidadeItem | null>(null);
  const [converterModal, setConverterModal] = useState<OportunidadeItem | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view") as View | null;
      if (viewParam && viewParam !== view) {
        setView(viewParam);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [view]);

  const navigateTo = (newView: View) => {
    if (isTransitioning || newView === view) return;
    setIsTransitioning(true);
    setView(newView);
    const url = newView === "vendedores" ? "/oportunidades?view=vendedores" : "/oportunidades";
    window.history.pushState({}, "", url);
    setTimeout(() => setIsTransitioning(false), 350);
  };

  const goBack = () => navigateTo("oportunidades");

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Wrapper transformado - APENAS as views de lista */}
      <div
        ref={containerRef}
        className="flex w-[200%] min-h-screen transition-transform duration-300 ease-out"
        style={{
          transform: view === "vendedores" ? "translateX(-50%)" : "translateX(0)",
        }}
      >
        <div className="w-[50%] flex-shrink-0">
          <OportunidadesView
            onNavigateToVendedores={() => navigateTo("vendedores")}
            onOpenDetail={(item, callbacks) => setDetalheOportunidade({ item, callbacks })}
            onCloseDetail={() => setDetalheOportunidade(null)}
            onOpenRemoverModal={setRemoverModal}
            onOpenConverterModal={setConverterModal}
            onRemoverConfirm={() => setRemoverModal(null)}
            onConverterConfirm={() => setConverterModal(null)}
          />
        </div>
        <div className="w-[50%] flex-shrink-0">
          <VendedoresView onOpenDetail={setDetalheVendedor} onVoltar={goBack} />
        </div>
      </div>

      {/* Painéis de detalhe FORA do transform - fixos na viewport real */}
      {detalheOportunidade && (
        <OportunidadeDetailPanel
          key={detalheOportunidade.item.id}
          oportunidade={detalheOportunidade.item}
          aoFechar={() => setDetalheOportunidade(null)}
          aoAvancar={detalheOportunidade.callbacks.aoAvancar}
          aoConverter={detalheOportunidade.callbacks.aoConverter}
          aoRemover={detalheOportunidade.callbacks.aoRemover}
          aoReabrir={detalheOportunidade.callbacks.aoReabrir}
        />
      )}
      {detalheVendedor && (
        <VendedorDetailPanel
          key={detalheVendedor.vendedor.id}
          vendedor={detalheVendedor.vendedor}
          imoveis={detalheVendedor.imoveis}
          oportunidades={detalheVendedor.oportunidades}
          aoFechar={() => setDetalheVendedor(null)}
        />
      )}

      {/* Modais */}
      {removerModal && (
        <OportunidadeRemoverModal
          key={removerModal.id}
          aoFechar={() => setRemoverModal(null)}
          aoConfirmar={() => setRemoverModal(null)}
        />
      )}
      {converterModal && (
        <OportunidadeConverterModal
          key={converterModal.id}
          oportunidade={converterModal}
          aoFechar={() => setConverterModal(null)}
          aoConfirmar={() => setConverterModal(null)}
        />
      )}
    </div>
  );
}