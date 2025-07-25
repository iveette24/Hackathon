export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface MunicipalForm {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  chatMapping: { [chatKey: string]: string }; // maps chat answers to form field ids
}

export interface ChatAnswer {
  key: string;
  question: string;
  answer: string;
}
