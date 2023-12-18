import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ShoppingAppDatabaseDataSource} from '../datasources';
import {CartItem, CartItemRelations} from '../models';

export class CartItemRepository extends DefaultCrudRepository<
  CartItem,
  typeof CartItem.prototype.id,
  CartItemRelations
> {
  constructor(
    @inject('datasources.Shopping_app_database') dataSource: ShoppingAppDatabaseDataSource,
  ) {
    super(CartItem, dataSource);
  }
}
