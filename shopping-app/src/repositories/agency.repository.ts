import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ShoppingAppDatabaseDataSource} from '../datasources';
import {Agency, AgencyRelations} from '../models';

export class AgencyRepository extends DefaultCrudRepository<
  Agency,
  typeof Agency.prototype.id,
  AgencyRelations
> {
  constructor(
    @inject('datasources.Shopping_app_database') dataSource: ShoppingAppDatabaseDataSource,
  ) {
    super(Agency, dataSource);
  }
}
