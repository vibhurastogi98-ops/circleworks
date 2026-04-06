export interface OnboardingData {
  personal: {
    legalName: string;
    preferredName: string;
    pronouns: string;
    homeAddress: string;
    emergencyContact: string;
  };
  tax: {
    filingStatus: string;
    multipleJobs: boolean;
    exempt: boolean;
  };
  bank: {
    routingNumber: string;
    accountNumber: string;
    bankName: string;
  };
  i9: {
    citizenshipStatus: string;
    attested: boolean;
  };
  docs: string[];
}
