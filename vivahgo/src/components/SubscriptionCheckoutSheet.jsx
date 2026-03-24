import { useCallback, useEffect, useMemo, useRef, useState } from "react";

let razorpayScriptPromise;

const FALLBACK_PAYMENT_LINKS = {
  premium: "https://rzp.io/rzp/Uf9Z8wO",
  studio: "https://rzp.io/rzp/4hFyDIk",
};

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

function formatBillingCycle(billingCycle) {
  return billingCycle === "yearly" ? "Yearly" : "Monthly";
}

function formatAmount(amount, currency) {
  if (!amount) {
    return "";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default function SubscriptionCheckoutSheet({
  token,
  plan,
  planName,
  billingCycle,
  onLoadingStart,
  onReady,
  onClose,
  onError,
  onSuccess,
  createSession,
  confirmPayment,
}) {
  const completedRef = useRef(false);
  const [isPreparing, setIsPreparing] = useState(true);
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutData, setCheckoutData] = useState(null);
  const onLoadingStartRef = useRef(onLoadingStart);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onLoadingStartRef.current = onLoadingStart;
    onReadyRef.current = onReady;
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
  }, [onLoadingStart, onReady, onError, onSuccess]);

  const prepareCheckout = useCallback(async (active = () => true) => {
    setCheckoutError("");
    setIsPreparing(true);
    onLoadingStartRef.current?.();

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Could not load Razorpay checkout.");
      }

      const nextCheckoutData = await createSession(token, plan, billingCycle);
      if (!nextCheckoutData?.orderId || !nextCheckoutData?.keyId) {
        throw new Error("Razorpay checkout could not be prepared.");
      }

      if (!active()) {
        return;
      }

      setCheckoutData(nextCheckoutData);
    } catch (error) {
      const message = error?.message || "Could not start Razorpay checkout.";
      if (active()) {
        setCheckoutError(message);
        onErrorRef.current?.(message);
      }
    } finally {
      if (active()) {
        setIsPreparing(false);
        onReadyRef.current?.();
      }
    }
  }, [billingCycle, createSession, plan, token]);

  useEffect(() => {
    let active = true;
    prepareCheckout(() => active);

    return () => {
      active = false;
    };
  }, [prepareCheckout]);

  const handleOpenCheckout = useCallback(() => {
    if (!checkoutData || typeof window === "undefined" || !window.Razorpay) {
      setCheckoutError("Checkout is not ready yet. Please try again.");
      return;
    }

    setCheckoutError("");
    setIsOpeningCheckout(true);

    const checkoutInstance = new window.Razorpay({
      key: checkoutData.keyId,
      order_id: checkoutData.orderId,
      amount: checkoutData.amount,
      currency: checkoutData.currency,
      name: checkoutData.name || "VivahGo",
      description: checkoutData.description || `${planName} plan`,
      image: "/Thumbnail.png",
      prefill: checkoutData.prefill,
      notes: checkoutData.notes,
      theme: {
        color: "#bb4d28",
      },
      modal: {
        ondismiss: () => {
          setIsOpeningCheckout(false);
        },
      },
      handler: async (response) => {
        try {
          await confirmPayment(token, {
            plan,
            billingCycle,
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          completedRef.current = true;
          onSuccessRef.current?.();
        } catch (error) {
          const message = error?.message || "Payment verification failed.";
          setCheckoutError(message);
          onErrorRef.current?.(message);
        } finally {
          setIsOpeningCheckout(false);
        }
      },
    });

    checkoutInstance.open();
  }, [billingCycle, checkoutData, confirmPayment, plan, planName, token]);

  const amountLabel = useMemo(() => formatAmount(checkoutData?.amount, checkoutData?.currency), [checkoutData]);
  const fallbackPaymentUrl = useMemo(() => {
    if (billingCycle !== "monthly") {
      return "";
    }

    return FALLBACK_PAYMENT_LINKS[plan] || "";
  }, [billingCycle, plan]);

  return (
    <div className="marketing-checkout-overlay" role="presentation">
      <div className="marketing-checkout-sheet marketing-checkout-sheet-compact" role="dialog" aria-modal="true" aria-label="Preparing Razorpay checkout">
        <div className="marketing-checkout-sheet-handle" />
        <button type="button" className="marketing-checkout-close" aria-label="Close checkout" onClick={onClose}>
          x
        </button>

        <header className="marketing-checkout-header">
          <p className="marketing-checkout-kicker">Secure Checkout</p>
          <h2>Complete payment for {planName}</h2>
          <div className="marketing-checkout-meta">
            <span>{planName}</span>
            <span>{formatBillingCycle(billingCycle)}</span>
            <span>Secure checkout by Razorpay</span>
          </div>
        </header>

        {isPreparing ? (
          <div className="marketing-checkout-loading-block">
            <div className="marketing-checkout-spinner" aria-hidden="true" />
            <p>Preparing Razorpay checkout...</p>
          </div>
        ) : checkoutError ? (
          <div className="marketing-checkout-error-block">
            <p>{checkoutError}</p>
            {fallbackPaymentUrl && (
              <p>
                Gateway seems unavailable. You can complete a fallback payment here.
              </p>
            )}
            <div className="marketing-checkout-actions">
              <button type="button" className="marketing-price-action marketing-price-action-featured" onClick={() => prepareCheckout(() => true)}>
                Retry
              </button>
              {fallbackPaymentUrl && (
                <a
                  className="marketing-price-action marketing-price-action-ghost"
                  href={fallbackPaymentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pay via fallback link
                </a>
              )}
              <button type="button" className="marketing-price-action marketing-price-action-ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="marketing-checkout-loading-block">
            <p>{amountLabel ? `Amount due: ${amountLabel}` : "Amount will be shown in Razorpay."}</p>
            <p>Use the button below to open Razorpay Checkout in a secure popup.</p>
            <div className="marketing-checkout-actions">
              <button
                type="button"
                className="marketing-price-action marketing-price-action-featured"
                onClick={handleOpenCheckout}
                disabled={isOpeningCheckout}
                style={isOpeningCheckout ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
              >
                {isOpeningCheckout ? "Opening..." : "Open Razorpay Checkout"}
              </button>
              <button type="button" className="marketing-price-action marketing-price-action-ghost" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
