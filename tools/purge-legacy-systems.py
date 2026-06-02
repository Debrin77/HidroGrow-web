#!/usr/bin/env python3
"""Remove dead NFT/SRF/torre-vertical code blocks from wizard JS files."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def purge_wizard_pages():
    path = ROOT / "js/hc-setup-wizard-pages.js"
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    start = next(i for i, ln in enumerate(lines) if ln.startswith("function renderSetupPage"))
    stub = (
        "/** Páginas del asistente DWC/RDWC (preview, grid nutrientes). */\n\n"
        "function updateNftSetupPreview() {}\n"
        "function buildNftDraftConfigFromSetupUi() { return { tipoInstalacion: 'dwc' }; }\n"
        "function refrescarNftCanalesSliderEtiqueta() {}\n\n"
    )
    text = stub + "".join(lines[start:])
    # Remove torre vertical preview dead code after DWC return in updateTorreBuilder
    marker = "    try {\n      refreshDwcTapHintSetup();\n    } catch (eHint) {}\n    return;\n  }\n"
    idx = text.find("function updateTorreBuilder()")
    if idx >= 0:
        mstart = text.find(marker, idx)
        if mstart >= 0:
            mend = text.find("\n}\n\nfunction toggleUbic", mstart)
            if mend >= 0:
                text = text[: mstart + len(marker)] + text[mend:]
    path.write_text(text, encoding="utf-8")
    print(f"wizard-pages: {len(text.splitlines())} lines")


def remove_function_block(text, func_name):
    """Remove function func_name(...) { ... } including nested braces."""
    pat = rf"function {re.escape(func_name)}\s*\("
    m = re.search(pat, text)
    if not m:
        return text, False
    start = m.start()
    # find opening brace
    i = text.find("{", m.end())
    if i < 0:
        return text, False
    depth = 0
    j = i
    while j < len(text):
        c = text[j]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                j += 1
                # swallow trailing newline
                while j < len(text) and text[j] in "\r\n":
                    j += 1
                return text[:start] + text[j:], True
        j += 1
    return text, False


def purge_wizard_core():
    path = ROOT / "js/hc-setup-wizard-core.js"
    text = path.read_text(encoding="utf-8")

    # Functions to remove entirely (NFT/SRF/torre-vertical only)
    remove_funcs = [
        "hcNftMontajeOrigenNormalizado",
        "hcTorreMontajeOrigenNormalizado",
        "readTorreMontajeOrigenDesdeSetupUi",
        "readTorreMontajeOrigenDesdeSistemaUi",
        "hcComputeTorreBombaOrientativa",
        "validarBombaUsuarioTorreVsCalculo",
        "seleccionarSetupTorreMontajeOrigen",
        "seleccionarSistemaTorreMontajeOrigen",
        "refrescarUIMensajeBombaUsuarioTorreSistema",
        "refrescarUIMensajeBombaUsuarioTorre",
        "onSetupTorreBombaUsuarioBlur",
        "onSistemaTorreBombaUsuarioBlur",
        "readNftMontajeOrigenDesdeSetupUi",
        "readNftMontajeOrigenDesdeSistemaUi",
        "seleccionarSetupNftMontajeOrigen",
        "seleccionarSistemaNftMontajeOrigen",
        "nftEnsureDifusorEnDeposito",
        "torreAplicarObjetivoEcRango",
        "nftNormalizeObjetivoCultivo",
        "nftGetObjetivoCultivo",
        "nftAplicarObjetivoEcRango",
        "nftGetObjetivoSpec",
        "nftTuboRiegoElegidoEnSetup",
        "hcResetNftTuboRiegoSeleccion",
        "readNftCanalGeomFromSetupUi",
        "onSliderNftLaminaInput",
        "seleccionarNftCanalForma",
        "seleccionarNftCanalDiam",
        "nftCanalGeomDesdeConfig",
        "nftAreaFlujoLaminaMm2",
        "nftDisposicionNormalizada",
        "nftMesaRecorridoNormalizada",
        "nftColectoresParaleloDesdeConfig",
        "nftMesaUsaDiagramaCenital",
        "nftFlowTopologyFromConfig",
        "nftMesaTubosPorNivelUniforme",
        "nftMesaTubosUniformLabel",
        "nftResumenCantidadesBreve",
        "getNftMesaHuecosPorNivelStrFromGrid",
        "getNftMesaTubosPorNivelStrFromGrid",
        "rebuildNftMesaMultinivelTierSliders",
        "rebuildNftMesaMultinivelGrid",
        "onNftMesaTubosTodosChange",
        "onNftWizardMesaNumNivelesChange",
        "nftEscaleraCarasNormalizada",
        "nftEscaleraCarasParaDiagrama",
        "nftEscaleraCarasDesdeCfgYUi",
        "nftEscaleraNvDesdeCfgYUi",
        "nftInstalacionYaConfigurada",
        "nftHuecosDesdeCfg",
        "nftCanalesRawDesdeCfg",
        "getNftHidraulicaDesdeConfig",
        "hcResetNftSetupSlidersZero",
        "getNftAlturaBombeoEfectivaCm",
        "readNftMontajeFromSetupUi",
        "readNftMesaRecorridoFromUi",
        "syncNftMesaRecorridoUiFromCfg",
        "onNftMesaRecorridoChange",
        "refrescarNftMontajeSubpanels",
        "refrescarNftMesaRecorridoMultinivelUi",
        "refrescarNftMesaMultinivelCantidadesUi",
        "onNftMesaMultinivelToggle",
        "seleccionarNftEscaleraCaras",
        "seleccionarNftDisposicion",
        "onSistemaNftMesaMultinivelToggle",
        "seleccionarSistemaNftEscaleraCaras",
        "seleccionarSistemaNftDisposicion",
        "refrescarSistemaNftMontajeSubpanels",
        "refrescarSistemaNftMesaRecorridoMultinivelUi",
        "syncSistemaNftPotRimChipsFromInput",
        "seleccionarSistemaNftPotRimPreset",
        "aplicarSistemaNftMontajeDesdeFormulario",
        "abrirReconfigurarMontajeNft",
        "refrescarUIMensajeBombaUsuarioNft",
        "actualizarMensajeNftCanalChecklist",
        "refrescarNftLayoutResumenChecklist",
        "refrescarNftDepositoRecomendadoChecklistUI",
        "redimensionarMatrizTorreNftPreservando",
        "getNftBombaDesdeConfig",
        "nftTextoResumenInstalacion",
        "nftRecomendacionCultivoDesdeConfig",
        "nftVolumenDosificacionLitrosDesdeConfig",
        "nftSnapCapacidadFisicaDepositoL",
        "nftSetupFormularioCompleto",
        "nftDepositoVeredictoBloqueHtml",
        "nftWrapDetalleTecnicoSummary",
        "nftBombaDetalleTecnicoHtml",
        "nftTuberiaReferenciaDocHtml",
    ]
    for fn in remove_funcs:
        text, ok = remove_function_block(text, fn)
        if ok:
            print(f"  removed {fn}")

    # Remove NFT setup vars between setupEquipamiento and setupUbicacion
    text = re.sub(
        r"(let setupEquipamiento = new Set\(\['difusor'\]\);\n)"
        r"(?:let setupNft[^\n]*\n|/\*\*[^\n]*\n)?"
        r"(?:function [^\n]+\n(?:.*?\n)*?)*?"
        r"(?=let setupUbicacion)",
        r"\1",
        text,
        count=1,
        flags=re.DOTALL,
    )

    # Simplify _hcExposeMontajeDiyBlocks
    text = text.replace(
        """function _hcExposeMontajeDiyBlocks() {
  [
    'setupNftMontajeDiyBlock',
    'sysNftMontajeDiyBlock',
    'setupRdwcMontajeDiyExtra',
    'setupRdwcBombasWrap',
    'sysRdwcMontajeDiyExtra',
    'setupTorreBombaUsuarioBlock',
    'sysTorreBombaUsuarioBlock',
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('setup-hidden');
  });
}""",
        """function _hcExposeMontajeDiyBlocks() {
  ['setupRdwcMontajeDiyExtra', 'setupRdwcBombasWrap', 'sysRdwcMontajeDiyExtra'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('setup-hidden');
  });
}""",
    )

    # Fix restaurarSetupTorreBuilderControls torre branch
    text = text.replace(
        """  try {
    if (
      typeof setupTipoInstalacion !== 'undefined' &&
      setupTipoInstalacion === 'torre' &&
      typeof updateTorreBuilder === 'function'
    ) {
      updateTorreBuilder();
    }
  } catch (_) {}""",
        """  try {
    if (typeof updateTorreBuilder === 'function') updateTorreBuilder();
  } catch (_) {}""",
    )

    # Simplify torreGetObjetivoCultivo - no legacy field
    text = re.sub(
        r"function torreGetObjetivoCultivo\(cfg\) \{[^}]+\}",
        """function torreGetObjetivoCultivo(cfg) {
  const mk = typeof normalizeTorreModoActual === 'function' ? normalizeTorreModoActual(modoActual) : modoActual;
  return mk === 'mini' ? 'baby' : 'final';
}""",
        text,
        count=1,
        flags=re.DOTALL,
    )

    # torreGetPhRangoObjetivo / torreGetDiasCosechaObjetivo - always use base for dwc/rdwc
    text = text.replace(
        "  if (tipoInstalacionNormalizado(c) !== 'torre') return [base[0], base[1]];",
        "  return [base[0], base[1]];",
    )
    text = text.replace(
        "  if (tipoInstalacionNormalizado(c) !== 'torre') return Math.max(18, Math.round(d));",
        "  return Math.max(18, Math.round(d));",
    )

    path.write_text(text, encoding="utf-8")
    print(f"wizard-core: {len(text.splitlines())} lines")


def purge_consejos():
    path = ROOT / "js/hc-setup-consejos.js"
    text = path.read_text(encoding="utf-8")
    for fn in ["buildConsejoObjetivoTorreCultivo", "buildConsejosNftHidraulica", "buildConsejosSrf"]:
        text, ok = remove_function_block(text, fn)
        if ok:
            print(f"  removed {fn}")
    # Fix torre reference in string
    text = text.replace(
        "(t === 'torre' || t === 'dwc' ?",
        "(t === 'dwc' ?",
    )
    path.write_text(text, encoding="utf-8")
    print(f"consejos: {len(text.splitlines())} lines")


def purge_torre_render_build():
    path = ROOT / "js/torre-render-build.js"
    text = path.read_text(encoding="utf-8")
    for fn in ["generarSVGSrf", "refrescarNftQuickAssignUI", "onNftQuickAssignChange", "aplicarNftQuickAssign", "syncNftQuickAssignFromTorre"]:
        text, ok = remove_function_block(text, fn)
        if ok:
            print(f"  removed {fn}")
    path.write_text(text, encoding="utf-8")
    print(f"torre-render-build: {len(text.splitlines())} lines")


def purge_calc_core():
    path = ROOT / "js/hc-setup-calc-core.js"
    text = path.read_text(encoding="utf-8")
    # Remove isNft block in guardar (lines with if (isNft))
    text = re.sub(r"\n  if \(isNft\) \{[\s\S]*?\n  \}\n", "\n", text)
    text = re.sub(r"\n  if \(isSrf && typeof buildSrfConfigFromForm[\s\S]*?\n  \}\n", "\n", text)
    text = re.sub(r"\n  if \(isSrf\) \{[\s\S]*?\n  \}\n", "\n", text)
    text = re.sub(r"\n  if \(!isNft && !isDwc && !isRdwc && !isSrf\) \{[\s\S]*?\n  \}\n", "\n", text)
    text = re.sub(r"\n  const isNft = false;\n  const isDwc", "\n  const isDwc", text)
    text = re.sub(r"\n  const isSrf = false;\n", "\n", text)
    text = re.sub(r"\n  const nftPend = isNft[^\n]*\n", "\n", text)
    text = re.sub(r"\n  if \(isNft \|\| isDwc \|\| isRdwc\) \{[\s\S]*?\n  \}\n", "\n", text)
    path.write_text(text, encoding="utf-8")
    print(f"calc-core purged")


def stub_onboarding_bomba():
    path = ROOT / "js/app-hc-setup-onboarding.js"
    text = path.read_text(encoding="utf-8")
    for fn in ["calcularBombaRecomendada", "calcularBombaRecomendadaSistema", "seleccionarAntiRaices"]:
        text, ok = remove_function_block(text, fn)
        if ok:
            print(f"  removed {fn}")
    # Replace calcularBombaRecomendada() calls with no-op stubs at end
    stub = "\nfunction calcularBombaRecomendada() {}\nfunction calcularBombaRecomendadaSistema() {}\nfunction seleccionarAntiRaices(_tipo) {}\n"
    if "function calcularBombaRecomendada()" not in text:
        text += stub
    path.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    print("=== purge wizard-pages ===")
    purge_wizard_pages()
    print("=== purge wizard-core ===")
    purge_wizard_core()
    print("=== purge consejos ===")
    purge_consejos()
    print("=== purge torre-render-build ===")
    purge_torre_render_build()
    print("=== purge calc-core ===")
    purge_calc_core()
    print("=== stub onboarding bomba ===")
    stub_onboarding_bomba()
    print("done")
