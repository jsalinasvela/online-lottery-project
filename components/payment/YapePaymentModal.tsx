'use client';

import { useState } from 'react';
import { PurchaseTransaction } from '@/types/lottery';
import { formatCurrency } from '@/lib/utils/currency';
import { translations as t } from '@/lib/translations/es';

interface YapePaymentModalProps {
  transaction: PurchaseTransaction;
  onClose: () => void;
}

export default function YapePaymentModal({ transaction, onClose }: YapePaymentModalProps) {
  const [copied, setCopied] = useState(false);

  const yapeNumber = process.env.NEXT_PUBLIC_YAPE_NUMBER!;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!;
  const paymentEmail = process.env.NEXT_PUBLIC_PAYMENT_EMAIL!;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(yapeNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate reference code (last 8 characters of transaction ID, uppercase)
  const referenceCode = transaction.id.slice(-8).toUpperCase();

  // WhatsApp message with reference code
  const whatsappMessage = encodeURIComponent(
    `Hola, acabo de realizar un pago por Yape.\nCódigo de referencia: ${referenceCode}\nMonto: ${formatCurrency(transaction.totalAmount)}`
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Completa tu pago con Yape
        </h2>

        {/* Amount Display */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">{t.payment.totalToPay}</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(transaction.totalAmount)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {transaction.quantity} {transaction.quantity === 1 ? t.payment.ticket : t.payment.tickets}
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-6">
          {/* Step 1: Make Payment */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 dark:text-purple-400 font-bold">1</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                Realiza el pago por Yape
              </p>
              <button
                onClick={copyToClipboard}
                className="mt-1 flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                <span className="font-mono font-bold text-lg">{yapeNumber}</span>
                <span className="text-sm">
                  {copied ? '✓ Copiado' : '📋 Copiar'}
                </span>
              </button>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                <strong>Importante:</strong> Incluye el código <span className="font-mono font-semibold">{referenceCode}</span> en el mensaje de Yape
              </p>
            </div>
          </div>

          {/* Step 2: Take Screenshot */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 dark:text-purple-400 font-bold">2</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Toma captura de tu pago
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Asegúrate que se vea el monto y la fecha
              </p>
            </div>
          </div>

          {/* Step 3: Send Proof */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white mb-2">
                Envía tu comprobante
              </p>
              <div className="space-y-2">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  <span>💬</span>
                  <span>Enviar por WhatsApp</span>
                </a>
                <p className="text-xs text-center text-slate-500 dark:text-slate-400">o</p>
                <a
                  href={`mailto:${paymentEmail}?subject=Comprobante%20de%20pago`}
                  className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <span>✉️</span>
                  <span>Enviar por Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Reference Code */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-800 dark:text-yellow-200 font-semibold">
            TU CÓDIGO DE REFERENCIA
          </p>
          <p className="text-lg font-mono font-bold text-yellow-900 dark:text-yellow-100 mt-1">
            {referenceCode}
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
            Inclúyelo en el mensaje de Yape y al enviar tu comprobante
          </p>
        </div>

        {/* Privacy Note */}
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            🔒 Tu pago será verificado por nuestro equipo. Recibirás tus boletos una vez confirmado.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
