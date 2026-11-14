import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Phone,
  Smartphone,
  ExternalLink,
  LifeBuoy,
  ShieldAlert,
  AlertCircle,
  Lightbulb,
  HelpCircle,
} from 'lucide-react';
import { musaConnector, SupportTicket } from '../conector';

interface VistaSoporteChatProps {
  selectedClientSlug: string;
}

export const VistaSoporteChat: React.FC<VistaSoporteChatProps> = ({ selectedClientSlug }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => musaConnector.getSupportTickets(selectedClientSlug));
  const [selectedTicketId, setSelectedTicketId] = useState<string>(() => tickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleSendReply = () => {
    if (!replyText.trim() || !activeTicket) return;
    setIsSending(true);

    const updated = musaConnector.replyTicket(activeTicket.id, replyText);
    if (updated) {
      setTickets(musaConnector.getSupportTickets(selectedClientSlug));
      setReplyText('');
    }
    setIsSending(false);
  };

  const handleStatusChange = (newStatus: SupportTicket['status']) => {
    if (!activeTicket) return;
    musaConnector.updateTicketStatus(activeTicket.id, newStatus);
    setTickets(musaConnector.getSupportTickets(selectedClientSlug));
  };

  const openWhatsAppReply = () => {
    if (!activeTicket?.clientPhone) return;
    const cleanPhone = activeTicket.clientPhone.replace(/[^0-9]/g, '');
    const prefilled = encodeURIComponent(
      `Hola ${activeTicket.clientContact}, soy Musa de NexTool sobre tu consulta: "${activeTicket.subject}". `
    );
    window.open(`https://wa.me/${cleanPhone}?text=${prefilled}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <span>Centro de Soporte & Chat</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {tickets.filter((t) => t.status !== 'resolved').length} PENDIENTES
            </span>
          </h2>
          <p className="text-xs text-stone-400 font-sans mt-1">
            Bandeja unificada de incidencias, dudas e ideas enviadas por los clientes desde sus paneles privados.
          </p>
        </div>
      </div>

      {/* Split-View Container (Mac & iPad optimized) */}
      <div className="grid grid-cols-12 gap-5 h-[calc(100vh-210px)] min-h-[580px]">
        {/* Left Column: Tickets List (4 cols) */}
        <div className="col-span-12 lg:col-span-4 bg-[#0F172A]/90 border border-white/10 rounded-3xl p-4 flex flex-col justify-between shadow-2xl overflow-hidden">
          <div className="space-y-3 overflow-y-auto pr-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 font-sans block px-1">
              Conversaciones ({tickets.length})
            </span>

            {tickets.map((t) => {
              const isSelected = t.id === activeTicket?.id;
              const lastMsg = t.messages[t.messages.length - 1];

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-200 cursor-pointer block border ${
                    isSelected
                      ? 'bg-gradient-to-br from-white/15 to-white/5 border-[#C5A059]/60 shadow-lg shadow-black/50'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[9.5px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                        t.category === 'bug'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : t.category === 'idea'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {t.category === 'bug' ? 'Incidencia' : t.category === 'idea' ? 'Sugerencia' : 'Duda'}
                    </span>

                    <span className="text-[10px] text-stone-400 font-sans font-medium">
                      {new Date(t.updatedAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white font-sans line-clamp-1 mb-1">{t.subject}</h4>
                  <p className="text-[11px] text-stone-400 font-sans line-clamp-2 leading-relaxed">
                    {lastMsg?.text || 'Sin mensajes'}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-[10.5px]">
                    <span className="text-stone-300 font-semibold">{t.clientContact}</span>
                    <span
                      className={`font-bold ${
                        t.status === 'open'
                          ? 'text-amber-400'
                          : t.status === 'in_progress'
                          ? 'text-sky-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {t.status === 'open' ? '• Abierto' : t.status === 'in_progress' ? '• En curso' : '✓ Resuelto'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat & Thread (8 cols) */}
        {activeTicket ? (
          <div className="col-span-12 lg:col-span-8 bg-[#0F172A]/90 border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-2xl overflow-hidden">
            {/* Thread Header */}
            <div className="pb-4 border-b border-white/10 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-display font-bold text-white">{activeTicket.subject}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-stone-400 font-sans">
                    <span className="text-[#F0CF85] font-semibold">{activeTicket.clientName}</span>
                    <span>•</span>
                    <span>{activeTicket.clientContact}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Smartphone className="w-3.5 h-3.5 text-stone-400" />
                      {activeTicket.deviceDetails}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openWhatsAppReply}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <select
                    value={activeTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-stone-200 cursor-pointer"
                  >
                    <option value="open">Abierto</option>
                    <option value="in_progress">En proceso</option>
                    <option value="resolved">Resuelto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {activeTicket.messages.map((m) => {
                const isMusa = m.sender === 'musa';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMusa ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 px-1">
                      <span className="font-bold text-stone-300">{m.senderName}</span>
                      <span>•</span>
                      <span>{m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg font-sans ${
                        isMusa
                          ? 'bg-gradient-to-r from-amber-500/20 to-[#C5A059]/20 border border-[#C5A059]/40 text-stone-100 rounded-tr-none'
                          : 'bg-black/50 border border-white/10 text-stone-200 rounded-tl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Composer */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="relative">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Escribe una respuesta para ${activeTicket.clientContact}...`}
                  rows={3}
                  className="w-full p-3.5 rounded-2xl bg-black/50 border border-white/10 text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#C5A059] resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-400 font-sans">
                  Tu respuesta quedará registrada en el historial y lista para consulta del cliente.
                </span>

                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isSending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#C5A059] hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-[#C5A059]/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Respuesta</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-8 bg-[#0F172A]/90 border border-white/10 rounded-3xl p-12 flex items-center justify-center text-center text-stone-400">
            No hay tickets seleccionados.
          </div>
        )}
      </div>
    </div>
  );
};

