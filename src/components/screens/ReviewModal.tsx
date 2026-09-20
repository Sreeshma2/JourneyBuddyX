import React, { useState } from 'react';
import { Destination } from '../../types';
import { PhoenixAvatar } from '../PhoenixAvatar';
import { X, Star, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination | null;
  onSubmitReview: (reviewData: any) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  destination,
  onSubmitReview,
}) => {
  const [overall, setOverall] = useState<number>(5);
  const [cleanliness, setCleanliness] = useState<number>(4);
  const [value, setValue] = useState<number>(5);
  const [accessibility, setAccessibility] = useState<number>(4);
  const [foodService, setFoodService] = useState<number>(5);
  const [location, setLocation] = useState<number>(5);
  const [easeOfReaching, setEaseOfReaching] = useState<number>(4);
  const [comments, setComments] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen || !destination) return null;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    onSubmitReview({
      destinationId: destination.id,
      overall,
      cleanliness,
      value,
      accessibility,
      foodService,
      location,
      easeOfReaching,
      comments,
    });
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  const renderStars = (valueState: number, setter: (val: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setter(star)}
          className={`p-1 transition-transform active:scale-125 min-h-[36px] min-w-[36px] flex items-center justify-center ${
            star <= valueState ? 'text-amber-400' : 'text-slate-200'
          }`}
          aria-label={`${star} Stars`}
        >
          <Star className="w-5 h-5 fill-current" />
        </button>
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Write a Review"
    >
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 max-h-[90vh]">
        {/* Header */}
        <div className="bg-blue-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <PhoenixAvatar size="sm" mood="happy" />
            <div>
              <h3 className="font-bold text-sm">How was your experience?</h3>
              <p className="text-xs text-blue-200">{destination.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center min-h-[44px] min-w-[44px]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-base text-slate-900">
              Thank you for sharing!
            </h4>
            <p className="text-xs text-slate-500">
              Your feedback helps fellow travellers discover genuine local experiences safely.
            </p>
          </div>
        ) : (
          <form onSubmit={handleFinish} className="p-4 space-y-4 overflow-y-auto">
            <div className="text-center space-y-1 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Overall Rating
              </span>
              <div className="flex justify-center">{renderStars(overall, setOverall)}</div>
            </div>

            {/* Criteria breakdown */}
            <div className="space-y-2 text-xs">
              {[
                { label: 'Cleanliness', val: cleanliness, set: setCleanliness },
                { label: 'Value for Money', val: value, set: setValue },
                { label: 'Accessibility', val: accessibility, set: setAccessibility },
                { label: 'Food & Service', val: foodService, set: setFoodService },
                { label: 'Location & Atmosphere', val: location, set: setLocation },
                { label: 'Ease of Reaching (Last-Mile)', val: easeOfReaching, set: setEaseOfReaching },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50"
                >
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  {renderStars(item.val, item.set)}
                </div>
              ))}
            </div>

            {/* Written thoughts (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Written Thoughts (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share helpful tips for future travellers..."
                rows={3}
                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors min-h-[44px]"
            >
              Submit Community Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
