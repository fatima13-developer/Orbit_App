import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { formatChatTime } from '../../utils/date.js';
import { getMediaUrl } from '../../utils/helpers.js';

export const MessageBubble = ({ message, isMine, isSeen }) => {
  return (
    <div className={`flex flex-col mb-3 ${isMine ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[78%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words ${
          isMine
            ? 'bg-gradient-to-tr from-orbit-primaryDark to-orbit-primary text-white rounded-br-xs'
            : 'bg-white border border-orbit-border text-orbit-text rounded-bl-xs'
        }`}
      >
        {/* Attached image if present */}
        {message.image?.url && (
          <div className="mb-2 rounded-xl overflow-hidden max-h-60 bg-black/5">
            <img
              src={getMediaUrl(message.image.url)}
              alt="Sent attachment"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {message.text && (
          <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
        )}
      </div>

      {/* Meta Row: Time & Seen receipt */}
      <div className={`flex items-center gap-1 mt-1 text-[10px] text-orbit-textMuted px-1`}>
        <span>{formatChatTime(message.createdAt)}</span>
        {isMine && (
          <span>
            {isSeen ? (
              <CheckCheck className="w-3.5 h-3.5 text-orbit-primary" title="Seen" />
            ) : (
              <Check className="w-3 h-3 text-orbit-textMuted" title="Delivered" />
            )}
          </span>
        )}
      </div>
    </div>
  );
};
