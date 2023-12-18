import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ShoppingAppDatabaseDataSource} from '../datasources';
import {Billing, BillingRelations} from '../models';

export class BillingRepository extends DefaultCrudRepository<
  Billing,
  typeof Billing.prototype.id,
  BillingRelations
> {
  constructor(
    @inject('datasources.Shopping_app_database') dataSource: ShoppingAppDatabaseDataSource,
  ) {
    super(Billing, dataSource);
  }
}
