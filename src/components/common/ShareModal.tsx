import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, QrCode, Clock, Share2, Loader2, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  listaId: string;
  listaNombre: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  listaId,
  listaNombre
}) => {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expirationHours, setExpirationHours] = useState(48);

  const handleGenerateShare = async () => {
    setLoading(true);
    try {
      // Obtener token de sesión
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Debes iniciar sesión para compartir listas');
        return;
      }

      console.log('🔐 Token obtenido, generando share...');

      const response = await fetch('/api/compartir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          lista_id: listaId,
          expiration_hours: expirationHours
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al crear enlace');
      }

      console.log('✅ Share generado:', data);

      setShareUrl(data.share_url);
      setExpiresAt(data.expires_at);
      toast.success('¡Enlace generado correctamente!');
    } catch (error: any) {
      console.error('❌ Error generando share:', error);
      toast.error(error.message || 'No se pudo generar el enlace');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Enlace copiado al portapapeles');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copiando enlace:', error);
        toast.error('No se pudo copiar el enlace');
      }
    }
  };

  const handleOpenLink = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const handleReset = () => {
    setShareUrl(null);
    setExpiresAt(null);
    setExpirationHours(48);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Compartir Lista
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Genera un enlace público con QR
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Nombre de la lista */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              📋 Lista a compartir:
            </p>
            <p className="font-semibold text-gray-900 dark:text-white text-lg">
              {listaNombre}
            </p>
          </div>

          {!shareUrl ? (
            <>
              {/* Configuración de expiración */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Tiempo de expiración del enlace
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 24, label: '24 horas' },
                    { value: 48, label: '48 horas' },
                    { value: 168, label: '7 días' },
                    { value: 0, label: 'Sin expiración' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setExpirationHours(option.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        expirationHours === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Información */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ℹ️ El enlace permitirá a cualquiera ver tu lista sin necesidad de registrarse.
                  {expirationHours > 0 && ` Expirará automáticamente después de ${expirationHours === 24 ? '24 horas' : expirationHours === 48 ? '48 horas' : '7 días'}.`}
                </p>
              </div>

              {/* Botón generar */}
              <button
                onClick={handleGenerateShare}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generando enlace...
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    Generar Enlace Público
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Código QR */}
              <div className="mb-6 flex flex-col items-center">
                <div className="p-6 bg-white rounded-2xl shadow-lg mb-4">
                  <QRCodeSVG 
                    value={shareUrl} 
                    size={220} 
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  <QrCode className="w-4 h-4 inline mr-1" />
                  Escanea este código para abrir la lista
                </p>
              </div>

              {/* Enlace generado */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔗 Enlace público:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-2 font-medium"
                    title="Copiar enlace"
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={handleOpenLink}
                    className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
                    title="Abrir en nueva pestaña"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Info de expiración */}
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                {expiresAt ? (
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    ⏱️ <strong>Expira:</strong> {new Date(expiresAt).toLocaleString('es-ES', {
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })}
                  </p>
                ) : (
                  <p className="text-sm text-green-800 dark:text-green-300">
                    ✅ <strong>Sin expiración</strong> - El enlace estará disponible indefinidamente
                  </p>
                )}
              </div>

              {/* Botón generar nuevo */}
              <button
                onClick={handleReset}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition"
              >
                Generar Nuevo Enlace
              </button>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

