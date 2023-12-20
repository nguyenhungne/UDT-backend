import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ShoppingAppDatabaseDataSource} from '../datasources';
import {Transaction, TransactionRelations} from '../models';

export class TransactionRepository extends DefaultCrudRepository<
  Transaction,
  typeof Transaction.prototype.id,
  TransactionRelations
> {
  async findTransactionsByCustomerIdAndProductId(customerId: string, productId: string): Promise<Transaction[]> {
    return this.find({
      where: {
        and: [
          {customerId: customerId},
          {productId: productId}
        ]
      }
    });
  }

  async findTransactionsByCustomerId(customerId: string): Promise<Transaction[]> {
    return this.find({
      where: {
        and: [
          {customerId: customerId},
        ]
      }
    });
  }
  constructor(
    @inject('datasources.Shopping_app_database') dataSource: ShoppingAppDatabaseDataSource,
  ) {
    super(Transaction, dataSource);
  }
}
