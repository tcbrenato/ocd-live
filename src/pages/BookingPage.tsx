import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  BusinessInfo,
  LiveFormat,
  ReservationState,
  StepId,
} from '@/data/types';
import StepIndicator from '@/components/StepIndicator';
import FormatStep from '@/components/FormatStep';
import CalendarStep from '@/components/CalendarStep';
import PackagesStep from '@/components/PackagesStep';
import BusinessForm from '@/components/BusinessForm';
import Summary from '@/components/Summary';
import BookingSummary from '@/components/BookingSummary';

const STEPS: Array<{ id: StepId; label: string }> = [
  { id: 'format', label: 'Format' },
  { id: 'datetime', label: 'Jour & heure' },
  { id: 'package', label: 'Package' },
  { id: 'business', label: 'Ton business' },
  { id: 'confirm', label: 'Confirmation' },
];

const EMPTY_BUSINESS: BusinessInfo = {
  name: '',
  whatsapp: '',
  activity: '',
  product: '',
};

const INITIAL_RESERVATION: ReservationState = {
  format: null,
  countryIso: null,
  day: null,
  slotIndex: null,
  packageId: null,
  business: EMPTY_BUSINESS,
};

interface BookingPageProps {
  formatChoice: { format: LiveFormat; id: number } | null;
}

export default function BookingPage({ formatChoice }: BookingPageProps) {
  const [reservation, setReservation] =
    useState<ReservationState>(INITIAL_RESERVATION);
  const [currentStep, setCurrentStep] = useState<StepId>('format');
  const [maxReached, setMaxReached] = useState(0);
  const [businessValid, setBusinessValid] = useState(false);
  const reservationRef = useRef<HTMLDivElement>(null);

  const updateReservation = useCallback((patch: Partial<ReservationState>) => {
    setReservation((previous) => ({ ...previous, ...patch }));
  }, []);

  const goToStep = useCallback((step: StepId) => {
    setCurrentStep(step);
    const index = STEPS.findIndex((item) => item.id === step);
    setMaxReached((previous) => Math.max(previous, index));
    requestAnimationFrame(() => {
      reservationRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, []);

  useEffect(() => {
    if (!formatChoice) return;
    updateReservation({ format: formatChoice.format });
    goToStep('format');
  }, [formatChoice, goToStep, updateReservation]);

  const currentIndex = STEPS.findIndex((step) => step.id === currentStep);
  const stepValid = useMemo(() => {
    switch (currentStep) {
      case 'format':
        return (
          reservation.format !== null &&
          (reservation.format === 'onplace' || reservation.countryIso !== null)
        );
      case 'datetime':
        return reservation.day !== null && reservation.slotIndex !== null;
      case 'package':
        return reservation.packageId !== null;
      case 'business':
        return businessValid;
      case 'confirm':
        return true;
    }
  }, [currentStep, reservation, businessValid]);

  const canGoBack = currentIndex > 0;
  const canGoNext = currentIndex < STEPS.length - 1 && stepValid;

  const handleNext = useCallback(() => {
    if (!stepValid || currentStep === 'confirm') return;
    goToStep(STEPS[currentIndex + 1].id);
  }, [stepValid, currentStep, currentIndex, goToStep]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) goToStep(STEPS[currentIndex - 1].id);
  }, [currentIndex, goToStep]);

  const handleSelectFormat = useCallback(
    (format: LiveFormat) => {
      if (format === 'onplace') {
        updateReservation({ format, countryIso: null });
      } else {
        updateReservation({ format });
      }
    },
    [updateReservation],
  );

  return (
    <main
      id="reservation"
      ref={reservationRef}
      className="mx-auto max-w-6xl scroll-mt-6 px-5 py-12 sm:px-8 lg:py-16"
    >
      <div className="mb-10">
        <StepIndicator
          steps={STEPS}
          current={currentStep}
          onGoTo={goToStep}
          maxReached={maxReached}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {currentStep === 'format' && (
            <FormatStep
              format={reservation.format}
              countryIso={reservation.countryIso}
              onSelectFormat={handleSelectFormat}
              onSelectCountry={(iso) => updateReservation({ countryIso: iso })}
            />
          )}

          {currentStep === 'datetime' && (
            <CalendarStep
              day={reservation.day}
              slotIndex={reservation.slotIndex}
              format={reservation.format}
              countryIso={reservation.countryIso}
              onSelectDay={(day) => updateReservation({ day, slotIndex: null })}
              onSelectSlot={(index) => updateReservation({ slotIndex: index })}
            />
          )}

          {currentStep === 'package' && (
            <PackagesStep
              selectedId={reservation.packageId}
              onSelect={(id) => updateReservation({ packageId: id })}
            />
          )}

          {currentStep === 'business' && (
            <BusinessForm
              business={reservation.business}
              onChange={(business) => updateReservation({ business })}
              onValidityChange={setBusinessValid}
            />
          )}

          {currentStep === 'confirm' && (
            <Summary
              reservation={reservation}
              onEdit={() => goToStep('business')}
            />
          )}

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-ocd-line pt-6">
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              className="btn-touch rounded-16 px-6 py-3 font-semibold text-ocd-anthracite transition-colors enabled:hover:bg-ocd-paper disabled:opacity-30"
            >
              Retour
            </button>
            {currentStep !== 'confirm' && (
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className="btn-touch rounded-16 bg-ocd-orange px-8 py-3 font-extrabold text-ocd-anthracite transition-colors enabled:hover:bg-ocd-orange-light disabled:cursor-not-allowed disabled:bg-ocd-line disabled:text-ocd-anthracite/40"
              >
                Continuer
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <BookingSummary reservation={reservation} />
        </div>
      </div>
    </main>
  );
}
