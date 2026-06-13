/**
 * Gráficos Interactivos Básicos
 * Mejora sustancial: Visualización de tendencias EC/pH/temperatura
 * Versión: 1.0.0
 * Sin dependencias externas - usa Canvas API nativa
 */
(function () {
  'use strict';

  /**
   * Clase principal para gráficos
   */
  class HCGrafico {
    constructor(canvasId, options = {}) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      
      this.ctx = this.canvas.getContext('2d');
      this.options = {
        width: options.width || 600,
        height: options.height || 300,
        padding: options.padding || 40,
        showGrid: options.showGrid !== false,
        showTooltip: options.showTooltip !== false,
        animationDuration: options.animationDuration || 500,
        ...options
      };
      
      this.data = [];
      this.hoveredPoint = null;
      this.animationProgress = 0;
      
      this.setupCanvas();
      this.bindEvents();
    }

    setupCanvas() {
      // Ajustar tamaño del canvas para alta resolución
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = this.options.width * dpr;
      this.canvas.height = this.options.height * dpr;
      this.canvas.style.width = this.options.width + 'px';
      this.canvas.style.height = this.options.height + 'px';
      this.ctx.scale(dpr, dpr);
    }

    bindEvents() {
      if (!this.options.showTooltip) return;
      
      this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
      this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    handleMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.hoveredPoint = this.findNearestPoint(x, y);
      this.render();
    }

    handleMouseLeave() {
      this.hoveredPoint = null;
      this.render();
    }

    handleClick(e) {
      if (this.hoveredPoint && this.options.onPointClick) {
        this.options.onPointClick(this.hoveredPoint);
      }
    }

    findNearestPoint(x, y) {
      const { padding } = this.options;
      const chartWidth = this.options.width - padding * 2;
      const chartHeight = this.options.height - padding * 2;
      
      let nearest = null;
      let minDist = Infinity;
      
      this.data.forEach((point, index) => {
        const px = padding + (index / (this.data.length - 1)) * chartWidth;
        const py = padding + chartHeight - ((point.value - this.minValue) / (this.maxValue - this.minValue)) * chartHeight;
        
        const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (dist < 20 && dist < minDist) {
          minDist = dist;
          nearest = { ...point, x: px, y: py, index };
        }
      });
      
      return nearest;
    }

    setData(data) {
      this.data = data;
      this.minValue = Math.min(...data.map(d => d.value));
      this.maxValue = Math.max(...data.map(d => d.value));
      
      // Añadir margen a los valores
      const range = this.maxValue - this.minValue;
      this.minValue -= range * 0.1;
      this.maxValue += range * 0.1;
      
      this.animate();
    }

    animate() {
      this.animationProgress = 0;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        this.animationProgress = Math.min(elapsed / this.options.animationDuration, 1);
        
        this.render();
        
        if (this.animationProgress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }

    render() {
      const { width, height, padding, showGrid } = this.options;
      const ctx = this.ctx;
      
      // Limpiar canvas
      ctx.clearRect(0, 0, width, height);
      
      // Dibujar grid
      if (showGrid) {
        this.drawGrid();
      }
      
      // Dibujar línea de datos
      this.drawLine();
      
      // Dibujar puntos
      this.drawPoints();
      
      // Dibujar tooltip si hay punto hover
      if (this.hoveredPoint) {
        this.drawTooltip();
      }
    }

    drawGrid() {
      const { width, height, padding } = this.options;
      const ctx = this.ctx;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      
      ctx.strokeStyle = '#e5e0d8';
      ctx.lineWidth = 1;
      
      // Líneas horizontales
      for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // Etiquetas del eje Y
        const value = this.maxValue - (i / 5) * (this.maxValue - this.minValue);
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Plus Jakarta Sans';
        ctx.textAlign = 'right';
        ctx.fillText(value.toFixed(1), padding - 10, y + 4);
      }
      
      // Líneas verticales
      const numVerticalLines = Math.min(this.data.length - 1, 5);
      for (let i = 0; i <= numVerticalLines; i++) {
        const x = padding + (i / numVerticalLines) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }
    }

    drawLine() {
      const { width, height, padding } = this.options;
      const ctx = this.ctx;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      
      if (this.data.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = this.options.lineColor || '#10B981';
      ctx.lineWidth = 2;
      
      this.data.forEach((point, index) => {
        const x = padding + (index / (this.data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((point.value - this.minValue) / (this.maxValue - this.minValue)) * chartHeight;
        
        // Aplicar animación
        const animatedY = padding + chartHeight - ((point.value - this.minValue) / (this.maxValue - this.minValue)) * chartHeight * this.animationProgress;
        
        if (index === 0) {
          ctx.moveTo(x, animatedY);
        } else {
          ctx.lineTo(x, animatedY);
        }
      });
      
      ctx.stroke();
      
      // Relleno debajo de la línea
      ctx.lineTo(width - padding, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.closePath();
      ctx.fillStyle = this.options.fillColor || 'rgba(16, 185, 129, 0.1)';
      ctx.fill();
    }

    drawPoints() {
      const { width, height, padding } = this.options;
      const ctx = this.ctx;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      
      this.data.forEach((point, index) => {
        const x = padding + (index / (this.data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((point.value - this.minValue) / (this.maxValue - this.minValue)) * chartHeight * this.animationProgress;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.options.pointColor || '#10B981';
        ctx.fill();
        
        // Resaltar punto hover
        if (this.hoveredPoint && this.hoveredPoint.index === index) {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = this.options.pointHoverColor || '#059669';
          ctx.fill();
        }
      });
    }

    drawTooltip() {
      const ctx = this.ctx;
      const { x, y, label, value } = this.hoveredPoint;
      
      const text = `${label}: ${value}`;
      const textWidth = ctx.measureText(text).width;
      const tooltipWidth = textWidth + 20;
      const tooltipHeight = 30;
      
      let tooltipX = x - tooltipWidth / 2;
      let tooltipY = y - tooltipHeight - 10;
      
      // Ajustar si sale del canvas
      if (tooltipX < 0) tooltipX = 10;
      if (tooltipX + tooltipWidth > this.options.width) tooltipX = this.options.width - tooltipWidth - 10;
      if (tooltipY < 0) tooltipY = y + 20;
      
      // Fondo del tooltip
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
      ctx.fill();
      
      // Texto del tooltip
      ctx.fillStyle = '#f9fafb';
      ctx.font = '12px Plus Jakarta Sans';
      ctx.textAlign = 'center';
      ctx.fillText(text, tooltipX + tooltipWidth / 2, tooltipY + 20);
    }
  }

  /**
   * Genera datos de mediciones para el gráfico
   */
  function generarDatosGrafico(tipo, dias = 7) {
    // CRÍTICO: Sincronizar con instalación activa para evitar mezclar datos
    try {
      if (typeof sincronizarUltimaMedicionYRecargaDesdeTorreActiva === 'function') {
        sincronizarUltimaMedicionYRecargaDesdeTorreActiva();
      }
    } catch (_) {}

    const mediciones = state && state.mediciones ? state.mediciones : [];
    const datos = [];
    
    // Filtrar mediciones por tipo y ordenar por fecha
    const medicionesFiltradas = mediciones
      .filter(m => m && m[tipo] != null && m.fecha)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(-dias); // Últimos N días
    
    medicionesFiltradas.forEach(m => {
      const valor = parseFloat(m[tipo]);
      if (Number.isFinite(valor)) {
        datos.push({
          label: m.fecha,
          value: valor,
          fecha: m.fecha,
          hora: m.hora
        });
      }
    });
    
    return datos;
  }

  /**
   * Renderiza gráfico de EC
   */
  function renderGraficoEC(containerId, dias = 7) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Crear canvas si no existe
    let canvas = container.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = containerId + '-canvas';
      container.appendChild(canvas);
    }
    
    const datos = generarDatosGrafico('ec', dias);
    if (datos.length < 2) {
      container.innerHTML = '<p class="hc-text--tertiary hc-text--center">No hay suficientes datos de EC para mostrar el gráfico</p>';
      return;
    }
    
    const grafico = new HCGrafico(canvas.id, {
      width: container.offsetWidth || 600,
      height: 300,
      lineColor: '#10B981',
      fillColor: 'rgba(16, 185, 129, 0.1)',
      pointColor: '#10B981',
      pointHoverColor: '#059669',
      onPointClick: (point) => {
        console.log('EC punto:', point);
      }
    });
    
    grafico.setData(datos);
  }

  /**
   * Renderiza gráfico de pH
   */
  function renderGraficoPH(containerId, dias = 7) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Crear canvas si no existe
    let canvas = container.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = containerId + '-canvas';
      container.appendChild(canvas);
    }
    
    const datos = generarDatosGrafico('ph', dias);
    if (datos.length < 2) {
      container.innerHTML = '<p class="hc-text--tertiary hc-text--center">No hay suficientes datos de pH para mostrar el gráfico</p>';
      return;
    }
    
    const grafico = new HCGrafico(canvas.id, {
      width: container.offsetWidth || 600,
      height: 300,
      lineColor: '#3B82F6',
      fillColor: 'rgba(59, 130, 246, 0.1)',
      pointColor: '#3B82F6',
      pointHoverColor: '#2563EB',
      onPointClick: (point) => {
        console.log('pH punto:', point);
      }
    });
    
    grafico.setData(datos);
  }

  /**
   * Renderiza gráfico de temperatura
   */
  function renderGraficoTemp(containerId, dias = 7) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Crear canvas si no existe
    let canvas = container.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = containerId + '-canvas';
      container.appendChild(canvas);
    }
    
    const datos = generarDatosGrafico('temp', dias);
    if (datos.length < 2) {
      container.innerHTML = '<p class="hc-text--tertiary hc-text--center">No hay suficientes datos de temperatura para mostrar el gráfico</p>';
      return;
    }
    
    const grafico = new HCGrafico(canvas.id, {
      width: container.offsetWidth || 600,
      height: 300,
      lineColor: '#F59E0B',
      fillColor: 'rgba(245, 158, 11, 0.1)',
      pointColor: '#F59E0B',
      pointHoverColor: '#D97706',
      onPointClick: (point) => {
        console.log('Temp punto:', point);
      }
    });
    
    grafico.setData(datos);
  }

  /**
   * Renderiza todos los gráficos en el dashboard
   */
  function renderGraficosDashboard(dias = 7) {
    renderGraficoEC('graficoECContainer', dias);
    renderGraficoPH('graficoPHContainer', dias);
    renderGraficoTemp('graficoTempContainer', dias);
  }

  /**
   * Inicializa los gráficos cuando el DOM esté listo
   */
  function initGraficos() {
    // Esperar a que el dashboard esté cargado
    setTimeout(() => {
      renderGraficosDashboard(7);
    }, 1000);
    
    // Re-renderizar al cambiar de pestaña
    if (typeof currentTab !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const tab = document.querySelector('.tab.active');
            if (tab && tab.id === 'tab-inicio') {
              setTimeout(() => renderGraficosDashboard(7), 300);
            }
          }
        });
      });
      
      const tabsContainer = document.querySelector('.tabs');
      if (tabsContainer) {
        observer.observe(tabsContainer, { attributes: true, subtree: true });
      }
    }
  }

  // Exponer funciones globalmente
  window.HCGrafico = HCGrafico;
  window.renderGraficoEC = renderGraficoEC;
  window.renderGraficoPH = renderGraficoPH;
  window.renderGraficoTemp = renderGraficoTemp;
  window.renderGraficosDashboard = renderGraficosDashboard;
  window.initGraficos = initGraficos;

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGraficos);
  } else {
    initGraficos();
  }

})();
