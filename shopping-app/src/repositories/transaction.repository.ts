import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ShoppingAppDatabaseDataSource} from '../datasources';
import {Transaction, TransactionRelations} from '../models';

export class TransactionRepository extends DefaultCrudRepository<
  Transaction,
  typeof Transaction.prototype.id,
  TransactionRelations
> {
  constructor(
    @inject('datasources.Shopping_app_database') dataSource: ShoppingAppDatabaseDataSource,
  ) {
    super(Transaction, dataSource);
  }
}
