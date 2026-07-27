// ============================================================
// TOAST EDUCATIVO PROACTIVO v1.0
// ============================================================

class ToastEducativo {
    constructor() {
        this._toastActivo = false;
        this._indiceActual = 0;
        this._ultimoMostrado = 0;
        this._intervaloMinimo = 120000; // 2 minutos entre toasters
        this._duracionToaster = 5000; // 5 segundos por defecto
        
        // Mensajes educativos (máximo 2 líneas, resumidos)
        this._mensajes = [
            // Módulo: Estudiar
            { 
                modulo: 'study',
                icono: '📖',
                mensaje: 'Usa el modo "Escritura" para practicar traducción activa',
                duracion: 5000
            },
            { 
                modulo: 'study',
                icono: '🔄',
                mensaje: 'Alterna el "Modo Inverso" para traducir desde tu idioma nativo',
                duracion: 5000
            },
            { 
                modulo: 'study',
                icono: '📝',
                mensaje: 'Las respuestas parciales suman RCN, ¡no tengas miedo de intentarlo!',
                duracion: 6000
            },
            { 
                modulo: 'study',
                icono: '🎯',
                mensaje: 'El modo "Opción Múltiple" te ayuda a reconocer la respuesta correcta',
                duracion: 5000
            },
            { 
                modulo: 'study',
                icono: '🔊',
                mensaje: 'El modo "Escucha" mejora tu comprensión auditiva del idioma',
                duracion: 5000
            },
            
            // Módulo: Gramática
            { 
                modulo: 'grammar',
                icono: '🏷️',
                mensaje: 'Las "Familias" agrupan palabras por tema semántico',
                duracion: 5000
            },
            { 
                modulo: 'grammar',
                icono: '🔍',
                mensaje: 'Usa el buscador para encontrar palabras por significado',
                duracion: 5000
            },
            { 
                modulo: 'grammar',
                icono: '⭐',
                mensaje: 'Guarda palabras importantes en "Mi Espacio" con un checkbox',
                duracion: 6000
            },
            
            // Módulo: Mi Espacio
            { 
                modulo: 'espacio',
                icono: '📚',
                mensaje: '"Mi Espacio" guarda tus frases y palabras favoritas',
                duracion: 5000
            },
            { 
                modulo: 'espacio',
                icono: '🤖',
                mensaje: 'Usa "Generar Grupos con IA" para organizar tu contenido',
                duracion: 6000
            },
            { 
                modulo: 'espacio',
                icono: '💬',
                mensaje: 'Escribe [frase] en el chat para guardar en Mi Espacio',
                duracion: 5500
            },
            { 
                modulo: 'espacio',
                icono: '📤',
                mensaje: 'Exporta "Mi Espacio" para tener tu vocabulario favorito siempre contigo',
                duracion: 5500
            },
            
            // Módulo: Temas
            { 
                modulo: 'temas',
                icono: '📂',
                mensaje: 'Los temas organizan historias por categorías de aprendizaje',
                duracion: 5000
            },
            { 
                modulo: 'temas',
                icono: '📤',
                mensaje: 'Exporta temas para compartir tu progreso con otros estudiantes',
                duracion: 5000
            },
            { 
                modulo: 'temas',
                icono: '📥',
                mensaje: 'Importa temas JSON para añadir contenido creado por otros usuarios',
                duracion: 5500
            },
            
            // Módulo: Vigía
            { 
                modulo: 'vigia',
                icono: '👁️',
                mensaje: 'Vigía detecta duplicados y sugiere palabras nuevas',
                duracion: 5500
            },
            { 
                modulo: 'vigia',
                icono: '📊',
                mensaje: 'Usa /analizar en el chat para ver tu progreso detallado',
                duracion: 5000
            },
            { 
                modulo: 'vigia',
                icono: '🎯',
                mensaje: 'Vigía recomienda nuevos temas si detecta que te falta vocabulario',
                duracion: 5500
            },
            { 
                modulo: 'vigia',
                icono: '💡',
                mensaje: 'Vigía te da pistas cuando no recuerdas una palabra',
                duracion: 5000
            },
            { 
                modulo: 'vigia',
                icono: '📝',
                mensaje: 'Pide a Vigía un examen de nivel con /examen en el chat',
                duracion: 5000
            },
            
            // Sistema / Niveles
            { 
                modulo: 'sistema',
                icono: '🏆',
                mensaje: 'Sube de nivel completando frases y ampliando vocabulario',
                duracion: 5000
            },
            { 
                modulo: 'sistema',
                icono: '🎁',
                mensaje: 'Aprobar exámenes te da bonus de experiencia x2',
                duracion: 5500
            },
            { 
                modulo: 'sistema',
                icono: '🧠',
                mensaje: 'El RCN mide tu retención, 4+ significa ¡palabra dominada!',
                duracion: 5000
            },
            { 
                modulo: 'sistema',
                icono: '📈',
                mensaje: 'La eficiencia sube si aciertas más de lo que fallas',
                duracion: 5000
            },
            { 
                modulo: 'sistema',
                icono: '🔄',
                mensaje: 'El SRS adapta los repasos según tu memoria',
                duracion: 5500
            },
            
            // Configuración
            { 
                modulo: 'config',
                icono: '🌍',
                mensaje: 'Añade varios idiomas y cambia entre ellos fácilmente',
                duracion: 5000
            },
            { 
                modulo: 'config',
                icono: '📝',
                mensaje: 'Haz exámenes de nivel desde Configuración',
                duracion: 5000
            },
            { 
                modulo: 'config',
                icono: '👤',
                mensaje: 'Personaliza tu perfil con tu nombre e idioma nativo',
                duracion: 5000
            },
            
            // Herramientas
            { 
                modulo: 'tools',
                icono: '💾',
                mensaje: 'Usa Checkpoints para guardar tu progreso manualmente',
                duracion: 5000
            },
            { 
                modulo: 'tools',
                icono: '🩺',
                mensaje: 'El Diagnóstico muestra el estado completo del sistema',
                duracion: 5000
            },
            { 
                modulo: 'tools',
                icono: '📦',
                mensaje: 'Exporta Backup para mantener tus datos seguros',
                duracion: 5000
            },
            { 
                modulo: 'tools',
                icono: '🔄',
                mensaje: 'Reinicia tu fase de estudio si te sientes estancado',
                duracion: 5000
            },
            { 
                modulo: 'tools',
                icono: '⚡',
                mensaje: 'El "Modo Simplificado" reduce la carga cognitiva',
                duracion: 5500
            },
            
            // Chat
            { 
                modulo: 'chat',
                icono: '💬',
                mensaje: 'Escribe /help en el chat para ver todos los comandos',
                duracion: 5000
            },
            { 
                modulo: 'chat',
                icono: '📄',
                mensaje: 'Usa /jsonnuevo [tema] para generar vocabulario nuevo',
                duracion: 5500
            },
            { 
                modulo: 'chat',
                icono: '🧠',
                mensaje: '¡Vigía también puede ayudarte a crear exámenes!',
                duracion: 5000
            },
            { 
                modulo: 'chat',
                icono: '📚',
                mensaje: 'Pide a Vigía palabras pendientes con /revisar',
                duracion: 5000
            },
            
            // JSON Generator
            { 
                modulo: 'json',
                icono: '🤖',
                mensaje: 'El Generador JSON crea plantillas para nuevas historias',
                duracion: 5000
            },
            { 
                modulo: 'json',
                icono: '📥',
                mensaje: 'Importa JSON completado para añadir contenido rápidamente',
                duracion: 5000
            },
            { 
                modulo: 'json',
                icono: '🀄',
                mensaje: 'Soporte para idiomas jeroglíficos con pinyin y segmentación',
                duracion: 6000
            },
            
            // General
            { 
                modulo: 'general',
                icono: '🎯',
                mensaje: 'Cada frase estudiada fortalece tus conexiones neuronales',
                duracion: 5000
            },
            { 
                modulo: 'general',
                icono: '⏰',
                mensaje: 'El SRS programa repasos en el momento óptimo para tu memoria',
                duracion: 5500
            },
            { 
                modulo: 'general',
                icono: '🧩',
                mensaje: 'Pipeline Neuro combina 7 fases de aprendizaje para máxima retención',
                duracion: 5500
            }
        ];
        
        // Control de mensajes mostrados
        this._mensajesMostrados = new Set();
        this._mensajesPendientes = [];
        this._totalMensajes = this._mensajes.length;
        
        // Inicializar
        this._inicializar();
    }
    
    _inicializar() {
        // Cargar estado desde localStorage
        try {
            const estado = localStorage.getItem('toast_educativo_estado');
            if (estado) {
                const parsed = JSON.parse(estado);
                this._indiceActual = parsed.indiceActual || 0;
                this._ultimoMostrado = parsed.ultimoMostrado || 0;
                this._mensajesMostrados = new Set(parsed.mostrados || []);
            }
        } catch (e) {}
        
        // Iniciar el ciclo de toasters
        this._iniciarCicloToasters();
        
        console.log(`📚 Toast Educativo: ${this._totalMensajes} mensajes disponibles`);
        console.log(`   Ya mostrados: ${this._mensajesMostrados.size}`);
    }
    
    _iniciarCicloToasters() {
        // Verificar cada 30 segundos si hay que mostrar un toaster
        setInterval(() => {
            this._verificarYMostrarToaster();
        }, 30000);
        
        // Mostrar el primero después de 10 segundos
        setTimeout(() => {
            this._verificarYMostrarToaster();
        }, 10000);
    }
    
    _verificarYMostrarToaster() {
        // No mostrar si ya hay uno activo
        if (this._toastActivo) return;
        
        // Verificar tiempo mínimo entre toasters
        const ahora = Date.now();
        if (ahora - this._ultimoMostrado < this._intervaloMinimo) return;
        
        // Obtener el siguiente mensaje
        const mensaje = this._obtenerSiguienteMensaje();
        if (!mensaje) return;
        
        // Mostrar el toaster
        this._mostrarToaster(mensaje);
    }
    
    _obtenerSiguienteMensaje() {
        // Si ya mostramos todos, reiniciar
        if (this._mensajesMostrados.size >= this._totalMensajes) {
            this._mensajesMostrados.clear();
            this._indiceActual = 0;
            console.log('🔄 Todos los mensajes mostrados, reiniciando ciclo');
        }
        
        // Buscar el siguiente mensaje no mostrado
        let intentos = 0;
        let mensaje = null;
        
        while (intentos < this._mensajes.length) {
            const idx = this._indiceActual % this._mensajes.length;
            const candidato = this._mensajes[idx];
            
            if (!this._mensajesMostrados.has(idx)) {
                mensaje = candidato;
                this._indiceActual = (idx + 1) % this._mensajes.length;
                break;
            }
            
            this._indiceActual = (idx + 1) % this._mensajes.length;
            intentos++;
        }
        
        // Si no encontramos ninguno (todos mostrados), reiniciar
        if (!mensaje) {
            this._mensajesMostrados.clear();
            this._indiceActual = 0;
            // Reintentar con el primero
            const primero = this._mensajes[0];
            if (primero) {
                mensaje = primero;
                this._indiceActual = 1;
            }
        }
        
        return mensaje;
    }
    
    _mostrarToaster(mensaje) {
        if (!mensaje) return;
        this._toastActivo = true;
        
        // Encontrar el índice del mensaje
        const idx = this._mensajes.indexOf(mensaje);
        if (idx !== -1) {
            this._mensajesMostrados.add(idx);
        }
        
        // Guardar estado
        this._guardarEstado();
        
        // Mostrar toast con la UI existente
        const texto = `${mensaje.icono} ${mensaje.mensaje}`;
        
        if (window.uiCore && window.uiCore.mostrarToast) {
            window.uiCore.mostrarToast(texto, 'info');
        } else {
            // Fallback
            this._mostrarToastFallback(texto);
        }
        
        // Programar próximo
        this._ultimoMostrado = Date.now();
        
        // Desactivar después de la duración
        const duracion = mensaje.duracion || this._duracionToaster;
        setTimeout(() => {
            this._toastActivo = false;
        }, duracion);
    }
    
    _mostrarToastFallback(mensaje) {
        // Crear toast simple si UI Core no está disponible
        try {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--primary, #6C5CE7);
                color: white;
                padding: 12px 24px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 500;
                z-index: 99999;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                max-width: 90%;
                text-align: center;
                animation: slideUp 0.3s ease;
                font-family: var(--font, sans-serif);
            `;
            toast.textContent = mensaje;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    toast.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                        if (toast.parentNode) toast.remove();
                    }, 300);
                }
            }, 5000);
        } catch (e) {}
    }
    
    _guardarEstado() {
        try {
            localStorage.setItem('toast_educativo_estado', JSON.stringify({
                indiceActual: this._indiceActual,
                ultimoMostrado: this._ultimoMostrado,
                mostrados: Array.from(this._mensajesMostrados)
            }));
        } catch (e) {}
    }
    
    // Método para reiniciar el sistema (si el usuario quiere)
    reiniciar() {
        this._mensajesMostrados.clear();
        this._indiceActual = 0;
        this._ultimoMostrado = 0;
        this._guardarEstado();
        console.log('🔄 Toasters educativos reiniciados');
        if (window.uiCore) {
            window.uiCore.mostrarToast('📚 Consejos educativos reiniciados', 'info');
        }
    }
    
    // Método para obtener estadísticas
    getEstadisticas() {
        return {
            totalMensajes: this._totalMensajes,
            mostrados: this._mensajesMostrados.size,
            pendientes: this._totalMensajes - this._mensajesMostrados.size,
            ultimoMostrado: this._ultimoMostrado,
            intervaloMinimo: this._intervaloMinimo / 1000 + ' segundos'
        };
    }
    
    // Método para forzar un mensaje específico
    mostrarMensajePorModulo(modulo) {
        const mensajes = this._mensajes.filter(m => m.modulo === modulo);
        if (mensajes.length === 0) return;
        
        const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];
        this._mostrarToaster(mensaje);
        return mensaje;
    }
}

// Instancia global
const toastEducativo = new ToastEducativo();
window.toastEducativo = toastEducativo;

console.log('✅ Toast Educativo Proactivo v1.0 cargado');
console.log(`📚 ${toastEducativo._totalMensajes} mensajes educativos disponibles`);