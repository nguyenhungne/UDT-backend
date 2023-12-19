import {Entity, model, property} from '@loopback/repository';

@model()
export class Billing extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  customerId: string;

  @property({
    type: 'number',
    required: true,
  })
  total: number;


  constructor(data?: Partial<Billing>) {
    super(data);
  }
}

export interface BillingRelations {
  // describe navigational properties here
}

export type BillingWithRelations = Billing & BillingRelations;
