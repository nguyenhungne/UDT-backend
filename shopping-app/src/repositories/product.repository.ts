import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ShoppingAppDatabaseDataSource} from '../datasources';
import {Product, ProductRelations} from '../models';

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.id,
  ProductRelations
> {
  createProductOfAgency(id: string | undefined, product: Omit<Product, "id">): Product | PromiseLike<Product> {
    product.agencyId = id as string;
    return this.create(product);
  }
  constructor(
    @inject('datasources.Shopping_app_database') dataSource: ShoppingAppDatabaseDataSource,
  ) {
    super(Product, dataSource);
  }
}
