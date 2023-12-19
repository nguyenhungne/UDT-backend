import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ShoppingAppDatabaseDataSource} from '../datasources';
import {Customer, CustomerRelations} from '../models';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id,
  CustomerRelations
> {
  transactions(customerId: number | undefined): import("@loopback/repository").Transaction[] | PromiseLike<import("@loopback/repository").Transaction[]> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @inject('datasources.Shopping_app_database') dataSource: ShoppingAppDatabaseDataSource,
  ) {
    super(Customer, dataSource);
  }
}
