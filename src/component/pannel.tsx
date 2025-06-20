    // PrivacyDialog.tsx
import React from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";

interface PrivacyDialogProps {
  open: boolean;
  onClose: () => void;
}

const PrivacyDialog: React.FC<PrivacyDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Privacy Policy</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Typography variant="body2" paragraph>
          By entering your phone number, you are opting in to receive promotional messages from sweepsTOUCH.
        </Typography>
        <Typography variant="body2">
          We respect your privacy. Your data will not be shared with third parties.
        </Typography>
        <Box>
          <Button variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyDialog;
