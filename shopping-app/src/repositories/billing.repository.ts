import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ShoppingAppDatabaseDataSource} from '../datasources';
import {Billing, BillingRelations} from '../models';

export class BillingRepository extends DefaultCrudRepository<
  Billing,
  typeof Billing.prototype.id,
  BillingRelations
> {
  async findBillingByCustomerIdAndProductId(customerId: string, productId: string): Promise<Billing[]> {
    return this.find({
      where: {
        and: [
          {customerId: customerId},
          {productId: productId}
        ]
      }
    });
  }
  async findBillingByCustomerId(customerId: string): Promise<Billing[]> {
    return this.find({
      where: {
        customerId: customerId
      }
    });
  }
  constructor(
    @inject('datasources.Shopping_app_database') dataSource: ShoppingAppDatabaseDataSource,
  ) {
    super(Billing, dataSource);
  }
}
