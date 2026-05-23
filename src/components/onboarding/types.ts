export interface OnboardingData {
  personal: {
    legalName: string;
    preferredName: string;
    pronouns: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    homeAddress: string;
    city: string;
    state: string;
    zip: string;
  };
  tax: {
    filingStatus: string;
    multipleJobs: boolean;
    claimDependents: number;
    otherIncome: number;
    deductions: number;
    extraWithholding: number;
    exempt: boolean;
    stateFormCompleted: boolean;
    workState: string;
  };
  bank: {
    method: "plaid" | "manual" | "";
    routingNumber: string;
    accountNumber: string;
    bankName: string;
    accountMask: string;
    plaidAccessToken?: string;
  };
  i9: {
    citizenshipStatus: string;
    alienRegistrationNumber: string;
    attested: boolean;
  };
  docs: string[];
}

export interface OnboardingMetadata {
  employeeId: string | number;
  email: string;
  companyName: string;
  employeeName: string;
  firstName: string;
  startDate: string;
  managerName: string;
  managerPhotoUrl: string;
  officeLocation: string;
  workState: string;
}
