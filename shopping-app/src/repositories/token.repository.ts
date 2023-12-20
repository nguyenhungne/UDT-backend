import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ShoppingAppDatabaseDataSource} from '../datasources';
import {Token, TokenRelations} from '../models';

export class TokenRepository extends DefaultCrudRepository<
  Token,
  typeof Token.prototype.id,
  TokenRelations
> {
  constructor(
    @inject('datasources.Shopping_app_database') dataSource: ShoppingAppDatabaseDataSource,
  ) {
    super(Token, dataSource);
  }
}
