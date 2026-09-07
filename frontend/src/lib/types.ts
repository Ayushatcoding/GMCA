export interface EnquiryCreate {
  name: string;
  phone: string;
  program: string;
  message: string;
}

export interface Enquiry extends EnquiryCreate {
  id: string;
  created_at: string;
}