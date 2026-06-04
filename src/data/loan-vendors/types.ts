export type LoanVendor = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type CreateLoanVendorInput = {
  name: string;
};

export type UpdateLoanVendorInput = {
  name?: string;
};
