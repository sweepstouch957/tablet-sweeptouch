"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Box, Button, Dialog, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { isAxiosError } from "axios";
import { SurveyFace } from "./SurveyFace";
import styles from "./ExperienceSurveyModal.module.css";

const OPTIONS = ["Very Poor", "Poor", "Okay", "Good", "Excellent"];

export function ExperienceSurveyModal({ onComplete, onSubmit }: {
  onComplete: (rating: number | null) => void;
  onSubmit: (rating: number) => Promise<void>;
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const submitting = useRef(false);
  const completed = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Give the selected face time to animate; reset an unattended kiosk as well.
  useEffect(() => {
    if (status === "saving") return;
    const timer = window.setTimeout(() => {
      if (completed.current || submitting.current) return;
      completed.current = true;
      onCompleteRef.current(status === "saved" ? rating : null);
    }, status === "saved" ? 1600 : 10000);
    return () => window.clearTimeout(timer);
  }, [rating, status]);

  const submit = async (value: number) => {
    if (submitting.current || completed.current || status === "saved") return;
    submitting.current = true;
    setRating(value);
    setSaveError("");
    setStatus("saving");
    try {
      await onSubmit(value);
      setStatus("saved");
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const code = error.response?.status;
        setSaveError(code === 401 || code === 403
          ? "The session could not authorize this survey. Please contact staff."
          : code
            ? `We couldn't save your feedback (HTTP ${code}). Please try again.`
            : "Could not connect to the server. Please try again.");
        // Do not log the Axios config: it contains credentials and customer data.
        console.error("Survey request failed", { status: code, code: error.code });
      } else {
        setSaveError(error instanceof Error ? error.message : "We couldn't save your feedback. Please try again.");
      }
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  };

  const close = () => {
    if (completed.current || submitting.current) return;
    completed.current = true;
    onCompleteRef.current(status === "saved" ? rating : null);
  };

  return (
    <Dialog
      open
      onClose={(_, reason) => { if (reason !== "backdropClick") close(); }}
      aria-labelledby="experience-survey-title"
      aria-describedby="experience-survey-description"
      maxWidth={false}
      transitionDuration={200}
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(0,0,0,.82)" } },
        paper: { sx: { width: "min(1000px, calc(100vw - 32px))", m: 2, maxHeight: "calc(100dvh - 32px)", bgcolor: "transparent", boxShadow: "none" } },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <IconButton autoFocus disabled={status === "saving"} onClick={close} aria-label="Close survey and continue" sx={{ position: "absolute", right: 0, top: 0, width: 44, height: 44, zIndex: 1, color: "#ed1c80", bgcolor: "white", "&:hover": { bgcolor: "#fdecf0" } }}>
          <CloseIcon />
        </IconButton>
        <Box sx={{ bgcolor: "white", color: "#17182e", borderRadius: "clamp(20px, 4vw, 42px)", px: "clamp(12px, 2.5vw, 30px)", pt: 6, pb: 3, textAlign: "center" }}>
          <Box component="h2" id="experience-survey-title" sx={{ m: 0, fontSize: "clamp(18px, 2.6vw, 32px)", fontWeight: 900, lineHeight: 1.15 }}>
            HOW WAS YOUR EXPERIENCE?
          </Box>
          <Box id="experience-survey-description" aria-live="polite" sx={{ mb: 2, fontSize: "clamp(13px, 1.8vw, 21px)" }}>
            {status === "saving" ? "Saving your feedback…" : status === "saved" ? "Thank you for your feedback!" : status === "error" ? saveError : "Rate your experience"}
          </Box>
          {status === "error" && rating !== null && (
            <Button onClick={() => void submit(rating)} sx={{ color: "#ed1c80", mb: 2 }}>Try again</Button>
          )}
          <div className={[styles.faces, rating !== null ? styles["has-choice"] : ""].join(" ")}>
            {OPTIONS.map((label, index) => (
              <button key={label} type="button" className={[styles["face-btn"], rating === index + 1 ? styles.selected : ""].join(" ")} style={{ "--i": index } as CSSProperties} data-value={index + 1} aria-label={`${index + 1} out of 5: ${label}`} aria-pressed={rating === index + 1} disabled={status === "saving" || status === "saved"} onClick={() => void submit(index + 1)}>
                <SurveyFace rating={index + 1} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </Box>
      </Box>
    </Dialog>
  );
}
