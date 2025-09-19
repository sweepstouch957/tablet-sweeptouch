/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useEffect, useRef, useState } from "react";
import { validatePhone, formatPhone } from "@/libs/utils/formatPhone";
import { useMutation } from "@tanstack/react-query";
import { createSweepstake } from "@/services/sweepstake.service";
import { ThankYouModal } from "./success-dialog";
import {
  printTicketWithImage,
  printTicketWithQRCodeOnly,
} from "@/libs/utils/rawBt";

interface PhoneInputModalProps {
  open: boolean;
  onClose: () => void;
  sweepstakeId: string;
  storeId?: string;
  storeName?: string;
  createdBy?: string;
  method: "cashier" | "tablet";
  sweepstakeName: string;
  type?: string;
  hasQR?: boolean;
  onSuccessRegister: () => void;
  userId?: string;
}

const keypad = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "Delete",
  "0",
  "Send",
];

export const PhoneInputModal: React.FC<PhoneInputModalProps> = ({
  open,
  onClose,
  sweepstakeId,
  storeId = "",
  storeName = "",
  createdBy = "",
  method,
  onSuccessRegister,
  sweepstakeName,
  type = "",
  hasQR,
  userId,
}) => {
  const [phone, setPhone] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [nameError, setNameError] = useState("");

  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [showThanks, setShowThanks] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onClose();
    }, 20000); // 20 seconds
  }, [onClose]);
  useEffect(() => {
    if (open) {
      resetTimer();
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [open, resetTimer]);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ customerName }: { customerName: string }) => {
      const resp = await createSweepstake({
        sweepstakeId,
        storeId,
        customerPhone: phone.replace(/\D/g, ""),
        customerName,
        method,
        createdBy: userId ?? createdBy,
      });
      return resp;
    },
    onSuccess: (resp) => {
      setShowThanks(true);

      if (type !== "generic") {
        if (hasQR) {
          printTicketWithQRCodeOnly({
            storeName: storeName,
            phone: phone.replace(/\D/g, ""),
            couponCode: resp.coupon || "XXXXXX",
            sweepstakeName,
            name: customerName || "",
          });
        }
        printTicketWithImage(
          "https://res.cloudinary.com/dg9gzic4s/image/upload/v1751982268/chiquitoy_ioyhpp.jpg",
          {
            storeName: storeName,
            phone: phone,
            couponCode: resp.coupon || "XXXXXX",
            sweepstakeName,
          }
        );
      }

      setShowNameModal(false);
      onClose();
      setPhone("");
      setCustomerName("");
      onSuccessRegister();
      setTimeout(() => {
        setShowThanks(false);
      }, 7000);
    },
    onError: (error: any) => {
      setError(error || "An error occurred while registering.");
      setTimeout(() => {
        setError("");
      }, 5000);
    },
  });

  const handleKeyPress = (key: string) => {
    resetTimer();
    if (key === "Delete") {
      setPhone(formatPhone(phone.slice(0, -1)));
    } else if (key === "Send") {
      if (!acceptedTerms) {
        setError("You must accept the terms to participate.");
        return;
      }
      if (validatePhone(phone)) {
        setError("");
        if (hasQR) {
          setShowNameModal(true); // 👉 Mostrar modal de nombre si hay QR
          return;
        }
        mutateWithName("");
      } else {
        setError("Please enter a valid phone number");
      }
    } else {
      if (phone.replace(/\D/g, "").length < 10)
        setPhone(formatPhone(phone + key));
    }
  };

  const mutateWithName = (name: string) => {
    mutate({
      customerName: name,
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        BackdropProps={{
          onClick: onClose,
        }}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            minHeight: "560px",
            background: "transparent",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            bgcolor: "#c79b34",
            p: 3,
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <Box
            sx={{
              bgcolor: "#c79b34",
              borderRadius: "16px",
              boxShadow: 6,
            }}
          >
            <DialogTitle
              sx={{
                color: "white",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "1.1rem",
                pb: 1,
              }}
            >
              ENTER YOUR PHONE NUMBER
              <IconButton
                onClick={onClose}
                sx={{
                  position: "absolute",
                  right: 24,
                  top: 24,
                  color: "white",
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent>
              <Stack spacing={2} alignItems="center">
                <TextField
                  value={phone}
                  variant="outlined"
                  sx={{
                    input: {
                      textAlign: "center",
                      fontSize: "1.8rem",
                      color: "black",
                      backgroundColor: "white",
                      borderRadius: 2,
                    },
                  }}
                  inputProps={{ maxLength: 14, inputMode: "numeric" }}
                  fullWidth
                />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 1.5,
                    width: "100%",
                  }}
                >
                  {keypad.map((key) => (
                    <Button
                      key={key}
                      variant="contained"
                      disabled={key === "Send" && isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleKeyPress(key);
                      }}
                      sx={{
                        backgroundColor:
                          key === "Send"
                            ? "#4CAF50"
                            : key === "Delete"
                            ? "#E53935"
                            : "linear-gradient(#a46c0f, #d49b34)",
                        background:
                          key === "Send"
                            ? "#4CAF50"
                            : key === "Delete"
                            ? "#E53935"
                            : "linear-gradient(#a46c0f, #d49b34)",
                        color: "white",
                        fontSize: "1.4rem",
                        width: "100%",
                        height: "65px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        boxShadow: 3,
                        "&:hover": {
                          backgroundColor:
                            key === "Send"
                              ? "#45a049"
                              : key === "Delete"
                              ? "#d32f2f"
                              : undefined,
                          opacity: key === "Send" || key === "Delete" ? 1 : 0.9,
                        },
                      }}
                    >
                      {key}
                    </Button>
                  ))}
                </Box>

                {error && (
                  <Typography
                    color="white"
                    fontSize="1rem"
                    sx={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                  >
                    {error}
                  </Typography>
                )}
              </Stack>
            </DialogContent>
          </Box>

          <FormControlLabel
            sx={{
              mt: 1,
            }}
            control={
              <Checkbox
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                sx={{
                  color: "#fff",
                  "&.Mui-checked": {
                    color: "#fff",
                  },
                }}
              />
            }
            label={
              <Typography
                color="white"
                fontSize={"0.8rem"}
                sx={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
              >
                By providing your phone number, you are consenting to receive
                messages about sales/coupons/promotors/etc. Text HELP for info.
                Text STOP to opt out. MSG&Data rates may apply.
              </Typography>
            }
          />
        </Box>
      </Dialog>
      <ThankYouModal
        open={showThanks}
        onClose={() => setShowThanks(false)}
        isGeneric={type === "generic"}
      />

      <Dialog
        open={showNameModal}
        onClose={() => setShowNameModal(false)}
        BackdropProps={{
          onClick: () => setShowNameModal(false),
        }}
        maxWidth="xs"
        fullWidth
      >
        <Box
          sx={{
            bgcolor: "#fefefe",
            p: 4,
            borderRadius: "16px",
            boxShadow: 10,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={2}
            sx={{ color: "#333", letterSpacing: 1 }}
          >
            ENTER YOUR FULL NAME
          </Typography>

          <TextField
            fullWidth
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="FullName"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#fafafa",
                "& fieldset": {
                  borderColor: "#ccc",
                },
                "&:hover fieldset": {
                  borderColor: "#fc0680",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#fc0680",
                },
              },
            }}
            inputProps={{
              maxLength: 40,
              pattern: "[A-Za-z ]*",
              style: { textAlign: "center", fontSize: "1.2rem" },
            }}
          />

          {nameError && (
            <Typography color="error" fontSize="0.9rem" mb={2}>
              {nameError}
            </Typography>
          )}

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => setShowNameModal(false)}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                px: 4,
                fontWeight: "bold",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                const isValid = /^[A-Za-z\s]+$/.test(customerName.trim());
                if (!isValid || customerName.trim().length < 2) {
                  setNameError("Name must contain only letters and spaces.");
                  return;
                }
                setNameError("");
                mutateWithName(customerName.trim());
              }}
              sx={{
                backgroundColor: "#fc0680",
                textTransform: "none",
                borderRadius: "10px",
                px: 4,
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#e00572",
                },
              }}
            >
              Submit
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </>
  );
};
