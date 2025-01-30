export interface Order {
  id: number;
  status: string;
  currency: string;
  date_created: string;
  date_modified: string;
  date_completed: string | null;
  date_paid: string | null;
  total: string;
  payment_method: string;
  payment_method_title: string;
  customer_note: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phone: string;
  };
  line_items: {
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: any[];
    sku: string;
    price: number;
    image: {
      id: string;
      src: string;
    };
    parent_name: string | null;
  }[];
  shipping_lines: {
    id: number;
    method_title: string;
    method_id: string;
    instance_id: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: {
      id: number;
      key: string;
      value: string;
      display_key: string;
      display_value: string;
    }[];
  }[];
  shipping_total: string;
  tax_lines: any[];
  fee_lines: any[];
  coupon_lines: any[];
  refunds: any[];
  meta_data: {
    id: number;
    key: string;
    value: string | object;
  }[];
  isPrinted: boolean;
}
