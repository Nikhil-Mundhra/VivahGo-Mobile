import { useEffect, useState } from "react";
import { FEEDBACK_APP_VERSION } from "../constants";
import { submitFeedback } from "../api";

function FeedbackModal({ onClose }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = setTimeout(() => {
      onClose();
    }, 900);

    return () => {
      clearTimeout(timer);
    };
  }, [successMessage, onClose]);

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) {
      setError("");
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.message.trim()) {
      setError("Please enter your feedback before submitting.");
      return;
    }

    const payload = {
      name: form.name.trim() || "Anonymous",
      email: form.email.trim() || "Not provided",
      message: form.message.trim(),
      source: "desktop-footer",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      appVersion: FEEDBACK_APP_VERSION,
    };

    setIsSubmitting(true);
    setError("");

    try {
      await submitFeedback(payload);

      setSuccessMessage("Thank you! Your feedback was submitted.");
      setForm({ name: "", email: "", message: "" });
    } catch (submitError) {
      console.error("Feedback submission failed:", submitError);
      setError("Could not submit feedback right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal legal-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Share Feedback</div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-label">Name (optional)</div>
            <input
              className="input-field"
              value={form.name}
              disabled={isSubmitting}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="input-group">
            <div className="input-label">Email (optional)</div>
            <input
              className="input-field"
              type="email"
              value={form.email}
              disabled={isSubmitting}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="input-group">
            <div className="input-label">Feedback</div>
            <textarea
              className="input-field feedback-textarea"
              value={form.message}
              disabled={isSubmitting}
              onChange={(event) => handleChange("message", event.target.value)}
              placeholder="Tell us what should be improved..."
            />
          </div>

          {successMessage && <div className="feedback-success">{successMessage}</div>}
          {error && <div className="feedback-error">{error}</div>}

          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Feedback"}
          </button>
          <button className="btn-secondary" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default FeedbackModal;
